/// Horus content script — injected into known ATS pages.
///
/// Ma'at's Judgment: scans form fields, classifies them, fills them with
/// profile data. Bes's Panel: injects the floating quick-fill sidebar.

import type { Profile, ResumeVariant, DetectedField, FieldCategory } from './types';
import { detectAts } from './ats/detect';

// ── Field classification ──────────────────────────────────────────────────────

// Priority: exact input[name/id] match → label text → aria-label → placeholder
const FIELD_PATTERNS: Array<{ category: FieldCategory; patterns: RegExp[] }> = [
  {
    category: 'first_name',
    patterns: [/first.?name|fname|given.?name/i],
  },
  {
    category: 'last_name',
    patterns: [/last.?name|lname|family.?name|surname/i],
  },
  {
    category: 'full_name',
    patterns: [/^name$|full.?name|your.?name/i],
  },
  {
    category: 'email',
    patterns: [/e.?mail/i],
  },
  {
    category: 'phone',
    patterns: [/phone|mobile|cell|tel/i],
  },
  {
    category: 'address_line1',
    patterns: [/address.?line.?1|address.?1|street.?address|^address$|^street$|addr1|addressline1/i],
  },
  {
    category: 'address_line2',
    patterns: [/address.?line.?2|address.?2|apt|suite|unit|floor|addr2|addressline2/i],
  },
  {
    category: 'city',
    patterns: [/^city$|city.?town/i],
  },
  {
    category: 'state',
    patterns: [/\bstate\b|province|region/i],
  },
  {
    category: 'zip',
    patterns: [/zip|postal/i],
  },
  {
    category: 'country',
    patterns: [/country/i],
  },
  {
    category: 'linkedin',
    patterns: [/linkedin/i],
  },
  {
    category: 'website',
    patterns: [/website|portfolio|url|github/i],
  },
  {
    category: 'cover_letter',
    patterns: [/cover.?letter|covering.?letter/i],
  },
  {
    category: 'resume_text',
    patterns: [/resume.?text|paste.?resume|cv.?text/i],
  },
];

function getFieldLabel(el: HTMLElement): string {
  // 1. Explicit <label for="...">
  if (el.id) {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${el.id}"]`);
    if (label) return label.innerText.trim();
  }
  // 2. aria-label / aria-labelledby
  if (el.getAttribute('aria-label')) return el.getAttribute('aria-label')!;
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) return labelEl.innerText.trim();
  }
  // 3. placeholder
  const placeholder = (el as HTMLInputElement).placeholder;
  if (placeholder) return placeholder;
  // 4. name / id attributes
  return el.getAttribute('name') ?? el.id ?? '';
}

function classifyField(el: HTMLElement): {
  category: FieldCategory;
  confidence: 'high' | 'medium' | 'low';
} {
  const label = getFieldLabel(el).toLowerCase();
  const name = (el.getAttribute('name') ?? '').toLowerCase();
  const id = el.id.toLowerCase();

  for (const { category, patterns } of FIELD_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(label)) return { category, confidence: 'high' };
      if (pattern.test(name) || pattern.test(id)) return { category, confidence: 'medium' };
    }
  }

  // Type-based fallback
  if (el instanceof HTMLInputElement) {
    if (el.type === 'email') return { category: 'email', confidence: 'medium' };
    if (el.type === 'tel') return { category: 'phone', confidence: 'medium' };
  }
  if (el instanceof HTMLTextAreaElement) {
    return { category: 'cover_letter', confidence: 'low' };
  }
  // ARIA listbox buttons with no other matches are unknown
  if (el instanceof HTMLButtonElement && el.getAttribute('aria-haspopup') === 'listbox') {
    return { category: 'unknown', confidence: 'low' };
  }

  return { category: 'unknown', confidence: 'low' };
}

function scanFields(): DetectedField[] {
  // Also capture ARIA listbox buttons (Workday-style custom dropdowns)
  const selectors = [
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"])',
    'textarea',
    'select',
    'button[aria-haspopup="listbox"]',
  ].join(', ');
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));

  return elements
    .filter((el) => el.offsetParent !== null) // visible only
    .map((el) => {
      const { category, confidence } = classifyField(el);
      return { element: el, label: getFieldLabel(el), category, confidence };
    })
    .filter((f) => f.category !== 'unknown');
}

// ── Field filling ─────────────────────────────────────────────────────────────

function profileValueFor(category: FieldCategory, profile: Profile, variant?: ResumeVariant): string {
  switch (category) {
    case 'first_name': return profile.name.split(' ')[0] ?? '';
    case 'last_name': return profile.name.split(' ').slice(1).join(' ');
    case 'full_name': return profile.name;
    case 'email': return profile.email;
    case 'phone': return profile.phone;
    case 'address_line1': return profile.address_line1;
    case 'address_line2': return profile.address_line2;
    case 'city': return profile.city;
    case 'state': return profile.state;
    case 'zip': return profile.zip_code;
    case 'country': return profile.country;
    case 'linkedin': return profile.linkedin_url ?? '';
    case 'website': return profile.website ?? '';
    case 'resume_text': return variant?.content ?? '';
    case 'cover_letter': return ''; // Thoth will handle this later
    default: return '';
  }
}

function nativeInputSetter(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  // For React controlled inputs, we must go through the React fiber.
  // This triggers onChange so React's state updates correctly.
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype,
    'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(el, value);
  } else {
    el.value = value;
  }

  // Dispatch events React / Vue / Angular all listen to
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
}

// US state abbreviation → full name (used when ATS dropdowns show full names)
const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
};

function expandStateValue(category: FieldCategory, value: string): string {
  if (category === 'state') {
    return US_STATES[value.toUpperCase()] ?? value;
  }
  return value;
}

/** Click open an ARIA listbox button and pick the matching option. */
async function fillAriaListbox(el: HTMLElement, value: string): Promise<boolean> {
  el.click();
  // Wait for the listbox / options to render
  await new Promise((r) => setTimeout(r, 350));

  const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
  const match = options.find(
    (o) => o.textContent?.trim().toLowerCase() === value.toLowerCase()
  );
  if (match) {
    match.click();
    return true;
  }
  // No match — close without selecting
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return false;
}

async function fillField(field: DetectedField, value: string): Promise<boolean> {
  if (!value) return false;

  const el = field.element;

  if (el instanceof HTMLButtonElement && el.getAttribute('aria-haspopup') === 'listbox') {
    const ok = await fillAriaListbox(el, expandStateValue(field.category, value));
    if (ok) {
      el.style.outline = '2px solid #f5a623';
      el.style.outlineOffset = '2px';
    }
    return ok;
  }

  if (el instanceof HTMLSelectElement) {
    const option = Array.from(el.options).find(
      (o) => o.value.toLowerCase() === value.toLowerCase() || o.text.toLowerCase() === value.toLowerCase()
    );
    if (option) {
      el.value = option.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      return false;
    }
  } else {
    nativeInputSetter(el as HTMLInputElement | HTMLTextAreaElement, value);
  }

  el.style.outline = '2px solid #f5a623';
  el.style.outlineOffset = '2px';
  return true;
}

async function fillAll(profile: Profile, variant?: ResumeVariant): Promise<number> {
  const fields = scanFields();
  let filled = 0;
  for (const field of fields) {
    const value = profileValueFor(field.category, profile, variant);
    if (value && await fillField(field, value)) {
      filled++;
    }
  }
  return filled;
}

// ── Bes Panel — floating quick-fill sidebar ───────────────────────────────────

let besPanel: HTMLElement | null = null;

function createBesPanel(ats: string): HTMLElement {
  const panel = document.createElement('div');
  panel.id = 'horus-bes-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    z-index: 2147483647;
    width: 220px;
    background: #1a1a2e;
    border: 1px solid #f5a623;
    border-radius: 10px;
    padding: 12px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    color: #fff;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    cursor: move;
    user-select: none;
  `;

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <span style="font-weight:600;color:#f5a623;">☀️ Horus</span>
      <span style="font-size:11px;color:#888;">${ats}</span>
      <button id="horus-close" style="background:none;border:none;color:#888;cursor:pointer;font-size:16px;padding:0;line-height:1;">×</button>
    </div>
    <div id="horus-status" style="font-size:11px;color:#888;margin-bottom:8px;">Connecting to Ra…</div>
    <button id="horus-fill-btn" style="
      width:100%;padding:8px;background:#f5a623;color:#000;border:none;
      border-radius:6px;font-weight:600;cursor:pointer;margin-bottom:6px;
      font-size:12px;
    " disabled>Fill All Fields</button>
    <button id="horus-undo-btn" style="
      width:100%;padding:6px;background:transparent;color:#888;border:1px solid #333;
      border-radius:6px;cursor:pointer;font-size:12px;
    ">Undo Fill</button>
    <div id="horus-filled-count" style="text-align:center;font-size:11px;color:#888;margin-top:6px;"></div>
  `;

  // Draggable
  let dragging = false, startY = 0, startTop = 0;
  panel.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    dragging = true;
    startY = e.clientY;
    startTop = parseInt(panel.style.top ?? '50%');
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const delta = e.clientY - startY;
    const newTop = startTop + delta;
    const maxTop = window.innerHeight - panel.offsetHeight;
    panel.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
    panel.style.transform = 'none';
  });
  document.addEventListener('mouseup', () => { dragging = false; });

  return panel;
}

function updateBesPanel(
  profile: Profile | null,
  variant: ResumeVariant | null,
): void {
  if (!besPanel) return;

  const statusEl = besPanel.querySelector<HTMLElement>('#horus-status');
  const fillBtn = besPanel.querySelector<HTMLButtonElement>('#horus-fill-btn');
  const undoBtn = besPanel.querySelector<HTMLButtonElement>('#horus-undo-btn');
  const countEl = besPanel.querySelector<HTMLElement>('#horus-filled-count');

  if (!profile) {
    if (statusEl) statusEl.textContent = 'Ra not connected';
    if (fillBtn) fillBtn.disabled = true;
    return;
  }

  if (statusEl) statusEl.textContent = `${profile.name} · ${variant?.name ?? 'No variant'}`;
  if (fillBtn) fillBtn.disabled = false;

  // Store previous values for undo
  let savedValues: Array<{ el: HTMLElement; style: string; value: string }> = [];

  fillBtn?.addEventListener('click', async () => {
    if (fillBtn) fillBtn.disabled = true;
    // Save current state for undo
    savedValues = scanFields().map((f) => ({
      el: f.element,
      style: f.element.style.outline,
      value: (f.element as HTMLInputElement).value ?? '',
    }));

    const n = await fillAll(profile, variant ?? undefined);
    if (fillBtn) fillBtn.disabled = false;
    if (countEl) countEl.textContent = `${n} field${n !== 1 ? 's' : ''} filled`;
    if (undoBtn) undoBtn.style.color = '#fff';
  });

  undoBtn?.addEventListener('click', () => {
    for (const { el, style, value } of savedValues) {
      nativeInputSetter(el as HTMLInputElement | HTMLTextAreaElement, value);
      el.style.outline = style;
    }
    if (countEl) countEl.textContent = 'Fill undone';
    savedValues = [];
  });
}

// ── Initialisation ────────────────────────────────────────────────────────────

async function init(): Promise<void> {
  const ats = detectAts(window.location.href);
  if (!ats) return;

  // Inject Bes panel
  besPanel = createBesPanel(ats.name);
  document.body.appendChild(besPanel);

  // Close button
  besPanel.querySelector('#horus-close')?.addEventListener('click', () => {
    besPanel?.remove();
    besPanel = null;
  });

  // Ask background for Ra status + active profile
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (status) => {
    if (!status?.raConnected) {
      updateBesPanel(null, null);
      return;
    }

    // Load profile + default variant from storage (set by popup)
    chrome.storage.local.get(['activeProfileId', 'activeVariantId'], async (stored) => {
      const { activeProfileId, activeVariantId } = stored;
      if (!activeProfileId) {
        updateBesPanel(null, null);
        const statusEl = besPanel?.querySelector<HTMLElement>('#horus-status');
        if (statusEl) statusEl.textContent = 'Select a profile in the extension popup';
        return;
      }

      try {
        const [profiles, variants] = await Promise.all([
          fetch(`http://127.0.0.1:9741/profiles`).then((r) => r.json()) as Promise<Profile[]>,
          fetch(`http://127.0.0.1:9741/profiles/${activeProfileId}/variants`).then((r) =>
            r.json()
          ) as Promise<ResumeVariant[]>,
        ]);

        const profile = profiles.find((p) => p.id === activeProfileId) ?? null;
        const variant =
          variants.find((v) => v.id === activeVariantId) ??
          variants.find((v) => v.is_default) ??
          variants[0] ??
          null;

        updateBesPanel(profile, variant);
      } catch {
        updateBesPanel(null, null);
      }
    });
  });
}

// Wait for document body before injecting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for fill commands from popup/background
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === 'FILL_FIELDS') {
    const { profile, variant } = msg;
    fillAll(profile, variant).then((n) => reply({ filled: n }));
    return true; // keep message channel open for async reply
  }
});
