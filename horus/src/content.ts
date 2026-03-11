/// Horus content script — injected into known ATS pages.
///
/// Ma'at's Judgment: scans form fields, classifies them, fills them with
/// profile data. Bes's Panel: injects the floating quick-fill sidebar.

import type { Profile, ResumeVariant, Snippet, DetectedField, FieldCategory } from './types';
import { detectAts } from './ats/detect';
import type { AtsAdapter } from './ats/adapter';
import { greenhouseAdapter } from './ats/greenhouse';
import { bamboohrAdapter } from './ats/bamboohr';
import { leverAdapter } from './ats/lever';

// ── Adapter registry ──────────────────────────────────────────────────────────

const ATS_ADAPTERS: Record<string, AtsAdapter> = {
  greenhouse: greenhouseAdapter,
  bamboohr:   bamboohrAdapter,
  lever:      leverAdapter,
};

/** Active adapter for the current ATS page. Set in init(). */
let currentAdapter: AtsAdapter | null = null;

/** Extra patterns contributed by the active adapter. Merged into classifyField. */
let adapterExtraPatterns: Array<{ category: FieldCategory; patterns: RegExp[] }> = [];

// ── Field classification ──────────────────────────────────────────────────────

// Priority: exact input[name/id] match → label text → aria-label → placeholder
const FIELD_PATTERNS: Array<{ category: FieldCategory; patterns: RegExp[] }> = [
  {
    category: 'first_name',
    patterns: [/first.?name|fname|given.?name/i],
  },
  {
    category: 'last_name',
    patterns: [/last.?name|\blname\b|family.?name|surname/i],
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

  // Fields we never fill — bail out early
  if (/extension/.test(name) || /extension/.test(id)) {
    return { category: 'unknown', confidence: 'low' };
  }
  if (/middle.?name|middlename/i.test(name) || /middle.?name|middlename/i.test(id) || /middle.?name/i.test(label)) {
    return { category: 'unknown', confidence: 'low' };
  }

  for (const { category, patterns } of FIELD_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(label)) return { category, confidence: 'high' };
      if (pattern.test(name) || pattern.test(id)) return { category, confidence: 'medium' };
    }
  }

  // Adapter-supplied extra patterns (checked after generic ones)
  for (const { category, patterns } of adapterExtraPatterns) {
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

// Common country code / abbreviation → full name as ATS dropdowns show it
const COUNTRIES: Record<string, string> = {
  US: 'United States of America',
  USA: 'United States of America',
  'UNITED STATES': 'United States of America',
  UK: 'United Kingdom',
  'UNITED KINGDOM': 'United Kingdom',
  GB: 'United Kingdom',
  CA: 'Canada',
  CANADA: 'Canada',
  AU: 'Australia',
  AUSTRALIA: 'Australia',
  NZ: 'New Zealand',
  DE: 'Germany',
  GERMANY: 'Germany',
  FR: 'France',
  FRANCE: 'France',
  IN: 'India',
  INDIA: 'India',
  MX: 'Mexico',
  MEXICO: 'Mexico',
  BR: 'Brazil',
  BRAZIL: 'Brazil',
  JP: 'Japan',
  JAPAN: 'Japan',
  CN: 'China',
  SG: 'Singapore',
  IE: 'Ireland',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  CH: 'Switzerland',
  ES: 'Spain',
  IT: 'Italy',
  PL: 'Poland',
  PT: 'Portugal',
  ZA: 'South Africa',
  NG: 'Nigeria',
  KE: 'Kenya',
  PH: 'Philippines',
  IL: 'Israel',
};

function expandValue(category: FieldCategory, value: string): string {
  if (category === 'state') {
    return US_STATES[value.toUpperCase()] ?? value;
  }
  if (category === 'country') {
    return COUNTRIES[value.toUpperCase()] ?? value;
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
    const ok = await fillAriaListbox(el, expandValue(field.category, value));
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
    // Let the adapter veto fields it wants to skip (e.g. EEO demographics)
    if (currentAdapter?.shouldSkip?.(field.element, field.label)) continue;
    const value = profileValueFor(field.category, profile, variant);
    if (value && await fillField(field, value)) {
      filled++;
    }
  }
  // Platform-specific post-fill cleanup (e.g. close autocomplete dropdowns)
  if (currentAdapter?.afterFill) {
    await currentAdapter.afterFill(profile, variant);
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
      <span style="font-weight:600;color:#f5a623;">☀️ Horus (Bes Panel)</span>
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
      border-radius:6px;cursor:pointer;font-size:12px;margin-bottom:6px;
    ">Undo Fill</button>
    <button id="horus-snippet-btn" style="
      width:100%;padding:6px;background:transparent;color:#f5a623;border:1px solid #f5a623;
      border-radius:6px;cursor:pointer;font-size:12px;
    ">Choose Snippet</button>
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

// ── Snippet modal ─────────────────────────────────────────────────────────────

async function openSnippetModal(): Promise<void> {
  // Remove any existing modal
  document.getElementById('horus-snippet-modal')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'horus-snippet-modal';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 2147483646;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    font-family: system-ui, sans-serif;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #1a1a2e; border: 1px solid #f5a623; border-radius: 12px;
    width: 480px; max-height: 70vh; display: flex; flex-direction: column;
    box-shadow: 0 16px 48px rgba(0,0,0,0.6); color: #fff;
  `;

  modal.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #333;flex-shrink:0;">
      <span style="font-weight:600;color:#f5a623;font-size:14px;">☀️ Choose Snippet</span>
      <button id="horus-snippet-close" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px;line-height:1;padding:0;">×</button>
    </div>
    <div id="horus-snippet-list" style="overflow-y:auto;padding:12px;flex:1;">
      <div style="color:#888;font-size:12px;text-align:center;padding:24px;">Loading…</div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  modal.querySelector('#horus-snippet-close')?.addEventListener('click', () => overlay.remove());

  // Fetch snippets from Ra
  const listEl = modal.querySelector<HTMLElement>('#horus-snippet-list')!;
  try {
    const snippets: Snippet[] = await fetch('http://127.0.0.1:9741/snippets').then((r) => r.json());

    if (snippets.length === 0) {
      listEl.innerHTML = `<div style="color:#888;font-size:12px;text-align:center;padding:24px;">No snippets yet — create some in Ra.</div>`;
      return;
    }

    listEl.innerHTML = '';
    for (const snippet of snippets) {
      const row = document.createElement('div');
      row.style.cssText = `
        display:flex; align-items:flex-start; gap:10px; padding:10px;
        border-radius:8px; margin-bottom:6px; background:#0d0d1a;
        border:1px solid #222;
      `;

      const tags = snippet.tags.length
        ? snippet.tags.map((t: string) => `<span style="background:#f5a62322;color:#f5a623;border-radius:4px;padding:1px 6px;font-size:10px;">${t}</span>`).join(' ')
        : '';

      row.innerHTML = `
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:12px;margin-bottom:2px;">${snippet.title}</div>
          ${tags ? `<div style="margin-bottom:4px;">${tags}</div>` : ''}
          <div style="font-size:11px;color:#888;white-space:pre-wrap;max-height:60px;overflow:hidden;">${snippet.content.slice(0, 120)}${snippet.content.length > 120 ? '…' : ''}</div>
        </div>
        <button data-id="${snippet.id}" data-content="${encodeURIComponent(snippet.content)}" style="
          flex-shrink:0;padding:6px 10px;background:#f5a623;color:#000;border:none;
          border-radius:6px;font-weight:600;cursor:pointer;font-size:11px;white-space:nowrap;
        ">Copy</button>
      `;

      const copyBtn = row.querySelector<HTMLButtonElement>('button[data-content]')!;
      copyBtn.addEventListener('click', async () => {
        const text = decodeURIComponent(copyBtn.dataset.content!);
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#4caf50';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.background = '#f5a623';
        }, 1500);
        // Record use in Ra
        fetch(`http://127.0.0.1:9741/snippets/${copyBtn.dataset.id}/use`, { method: 'POST' }).catch(() => {});
      });

      listEl.appendChild(row);
    }
  } catch {
    listEl.innerHTML = `<div style="color:#e57373;font-size:12px;text-align:center;padding:24px;">Could not reach Ra. Is it running?</div>`;
  }
}

function updateBesPanel(
  profile: Profile | null,
  variant: ResumeVariant | null,
): void {
  if (!besPanel) return;

  const statusEl = besPanel.querySelector<HTMLElement>('#horus-status');
  const fillBtn = besPanel.querySelector<HTMLButtonElement>('#horus-fill-btn');
  const undoBtn = besPanel.querySelector<HTMLButtonElement>('#horus-undo-btn');
  const snippetBtn = besPanel.querySelector<HTMLButtonElement>('#horus-snippet-btn');
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

  snippetBtn?.addEventListener('click', () => { openSnippetModal(); });

  undoBtn?.addEventListener('click', () => {
    for (const { el, style, value } of savedValues) {
      nativeInputSetter(el as HTMLInputElement | HTMLTextAreaElement, value);
      el.style.outline = style;
    }
    if (countEl) countEl.textContent = 'Fill undone';
    savedValues = [];
  });
}

// ── Application auto-logging ──────────────────────────────────────────────────

function extractJobInfo(): { company: string; title: string; location: string } {
  const hostname = window.location.hostname;

  // Company: use first subdomain segment, strip Workday suffixes like "wd5"
  const subdomains = hostname.split('.');
  const company = subdomains[0].replace(/^wd\d+$/, '') || subdomains[1] || '';

  // Job title: try h1, then h2, then page title
  const h1 = document.querySelector('h1')?.textContent?.trim() ?? '';
  const h2 = document.querySelector('h2')?.textContent?.trim() ?? '';
  const fromTitle = document.title.split(/[|\-–]/)[0].trim();
  const title = h1 || h2 || fromTitle;

  // Location: look for a filled location input, or a visible element mentioning location
  const locInput = document.querySelector<HTMLInputElement>(
    'input[name*="location" i], input[name*="city" i], input[id*="location" i]'
  );
  const location = locInput?.value.trim() ?? '';

  return { company, title, location };
}

function openLogModal(
  ats: string,
  profileId: string,
  variantId: string | null,
): void {
  // Don't open twice
  if (document.getElementById('horus-log-modal')) return;

  const { company, title, location } = extractJobInfo();

  const overlay = document.createElement('div');
  overlay.id = 'horus-log-modal';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 2147483646;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    font-family: system-ui, sans-serif;
  `;

  const inputStyle = `
    width: 100%; box-sizing: border-box;
    padding: 7px 10px; background: #0d0d1a; border: 1px solid #333;
    border-radius: 6px; color: #fff; font-size: 12px; outline: none;
    margin-top: 3px;
  `;
  const labelStyle = `display:block; font-size:11px; color:#888; margin-bottom:10px;`;

  overlay.innerHTML = `
    <div style="
      background:#1a1a2e; border:1px solid #f5a623; border-radius:12px;
      width:400px; box-shadow:0 16px 48px rgba(0,0,0,0.6); color:#fff;
      font-family:system-ui,sans-serif;
    ">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #333;">
        <span style="font-weight:600;color:#f5a623;font-size:14px;">📜 Log Application</span>
        <button id="horus-log-close" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px;line-height:1;padding:0;">×</button>
      </div>
      <div style="padding:16px;">
        <p style="font-size:11px;color:#888;margin:0 0 12px;">Horus detected a submission. Review and confirm to save to Ra.</p>
        <label style="${labelStyle}">
          Company
          <input id="horus-log-company" style="${inputStyle}" value="${company}" />
        </label>
        <label style="${labelStyle}">
          Job Title
          <input id="horus-log-title" style="${inputStyle}" value="${title}" />
        </label>
        <label style="${labelStyle}">
          Location
          <input id="horus-log-location" style="${inputStyle}" value="${location}" />
        </label>
        <label style="${labelStyle}">
          Notes
          <input id="horus-log-notes" style="${inputStyle}" placeholder="Optional notes…" />
        </label>
        <div id="horus-log-error" style="font-size:11px;color:#e57373;margin-bottom:8px;display:none;"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="horus-log-skip" style="
            padding:7px 14px;background:transparent;color:#888;border:1px solid #333;
            border-radius:6px;cursor:pointer;font-size:12px;
          ">Skip</button>
          <button id="horus-log-confirm" style="
            padding:7px 14px;background:#f5a623;color:#000;border:none;
            border-radius:6px;font-weight:600;cursor:pointer;font-size:12px;
          ">Log It</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#horus-log-close')?.addEventListener('click', close);
  overlay.querySelector('#horus-log-skip')?.addEventListener('click', close);

  overlay.querySelector('#horus-log-confirm')?.addEventListener('click', async () => {
    const companyVal = (overlay.querySelector<HTMLInputElement>('#horus-log-company')!).value.trim();
    const titleVal   = (overlay.querySelector<HTMLInputElement>('#horus-log-title')!).value.trim();
    const locationVal= (overlay.querySelector<HTMLInputElement>('#horus-log-location')!).value.trim();
    const notesVal   = (overlay.querySelector<HTMLInputElement>('#horus-log-notes')!).value.trim();
    const errEl      = overlay.querySelector<HTMLElement>('#horus-log-error')!;
    const confirmBtn = overlay.querySelector<HTMLButtonElement>('#horus-log-confirm')!;

    if (!companyVal || !titleVal) {
      errEl.textContent = 'Company and Job Title are required.';
      errEl.style.display = 'block';
      return;
    }

    confirmBtn.textContent = 'Saving…';
    confirmBtn.disabled = true;

    try {
      await fetch('http://127.0.0.1:9741/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          company: companyVal,
          title: titleVal,
          location: locationVal,
          status: 'applied',
          salary_min: null,
          salary_max: null,
          ats_platform: ats,
          job_url: window.location.href,
          resume_variant_id: variantId,
          notes: notesVal,
          applied_at: new Date().toISOString(),
        }),
      });
      close();
      // Show brief success in Bes panel
      const countEl = besPanel?.querySelector<HTMLElement>('#horus-filled-count');
      if (countEl) {
        countEl.textContent = '✓ Application logged';
        countEl.style.color = '#4caf50';
      }
    } catch {
      errEl.textContent = 'Could not reach Ra. Is it running?';
      errEl.style.display = 'block';
      confirmBtn.textContent = 'Log It';
      confirmBtn.disabled = false;
    }
  });
}

function watchForSubmission(ats: string, profileId: string, variantId: string | null): void {
  let submitArmed = false;

  // Arm when a submit-like button is clicked
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button, [role="button"], input[type="submit"]');
    if (!btn) return;
    const text =
      btn.textContent?.trim() ??
      (btn as HTMLInputElement).value?.trim() ??
      '';
    const isSubmit =
      currentAdapter?.isSubmitButton?.(btn) ??
      /^(submit|apply now|complete application|submit application)$/i.test(text);
    if (isSubmit) {
      submitArmed = true;
      setTimeout(() => { submitArmed = false; }, 30_000);
    }
  }, true);

  // Watch for SPA navigation (Workday React Router between steps)
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href === lastUrl) return;
    lastUrl = window.location.href;

    const isConfirmation =
      /thank|applied|confirm|success|complete/i.test(window.location.pathname) ||
      /thank|applied|confirm|success|complete/i.test(document.title);

    if (submitArmed && isConfirmation) {
      submitArmed = false;
      setTimeout(() => openLogModal(ats, profileId, variantId), 800);
      return;
    }

    // Not a confirmation — must be a step transition. Prompt user to refill.
    if (!isConfirmation && besPanel) {
      const statusEl = besPanel.querySelector<HTMLElement>('#horus-status');
      const countEl  = besPanel.querySelector<HTMLElement>('#horus-filled-count');
      const fillBtn  = besPanel.querySelector<HTMLButtonElement>('#horus-fill-btn');
      if (statusEl) statusEl.style.color = '#f5a623';
      if (countEl) {
        countEl.textContent = '↑ New step — click Fill All';
        countEl.style.color = '#f5a623';
      }
      if (fillBtn) fillBtn.disabled = false;

      // Reset count styling once user fills
      fillBtn?.addEventListener('click', () => {
        if (statusEl) statusEl.style.color = '';
        if (countEl) countEl.style.color = '#888';
      }, { once: true });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// ── Initialisation ────────────────────────────────────────────────────────────

async function init(): Promise<void> {
  const ats = detectAts(window.location.href);
  if (!ats) return;

  // Load the platform-specific adapter (or null for generic-only behaviour)
  currentAdapter = ATS_ADAPTERS[ats.id] ?? null;
  adapterExtraPatterns = currentAdapter?.extraPatterns ?? [];

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
        if (profile) {
          watchForSubmission(ats.name, profile.id, variant?.id ?? null);
        }
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
