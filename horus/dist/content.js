import { d as detectAts } from "./assets/detect-CZ1xkSc2.js";
const FIELD_PATTERNS = [
  {
    category: "first_name",
    patterns: [/first.?name|fname|given.?name/i]
  },
  {
    category: "last_name",
    patterns: [/last.?name|lname|family.?name|surname/i]
  },
  {
    category: "full_name",
    patterns: [/^name$|full.?name|your.?name/i]
  },
  {
    category: "email",
    patterns: [/e.?mail/i]
  },
  {
    category: "phone",
    patterns: [/phone|mobile|cell|tel/i]
  },
  {
    category: "city",
    patterns: [/^city$|city.?town/i]
  },
  {
    category: "state",
    patterns: [/^state$|province|region/i]
  },
  {
    category: "zip",
    patterns: [/zip|postal/i]
  },
  {
    category: "country",
    patterns: [/country/i]
  },
  {
    category: "linkedin",
    patterns: [/linkedin/i]
  },
  {
    category: "website",
    patterns: [/website|portfolio|url|github/i]
  },
  {
    category: "cover_letter",
    patterns: [/cover.?letter|covering.?letter/i]
  },
  {
    category: "resume_text",
    patterns: [/resume.?text|paste.?resume|cv.?text/i]
  }
];
function getFieldLabel(el) {
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label) return label.innerText.trim();
  }
  if (el.getAttribute("aria-label")) return el.getAttribute("aria-label");
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) return labelEl.innerText.trim();
  }
  const placeholder = el.placeholder;
  if (placeholder) return placeholder;
  return el.getAttribute("name") ?? el.id ?? "";
}
function classifyField(el) {
  const label = getFieldLabel(el).toLowerCase();
  const name = (el.getAttribute("name") ?? "").toLowerCase();
  const id = el.id.toLowerCase();
  for (const { category, patterns } of FIELD_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(label)) return { category, confidence: "high" };
      if (pattern.test(name) || pattern.test(id)) return { category, confidence: "medium" };
    }
  }
  if (el instanceof HTMLInputElement) {
    if (el.type === "email") return { category: "email", confidence: "medium" };
    if (el.type === "tel") return { category: "phone", confidence: "medium" };
  }
  if (el instanceof HTMLTextAreaElement) {
    return { category: "cover_letter", confidence: "low" };
  }
  return { category: "unknown", confidence: "low" };
}
function scanFields() {
  const selectors = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]), textarea, select';
  const elements = Array.from(document.querySelectorAll(selectors));
  return elements.filter((el) => el.offsetParent !== null).map((el) => {
    const { category, confidence } = classifyField(el);
    return {
      element: el,
      label: getFieldLabel(el),
      category,
      confidence
    };
  }).filter((f) => f.category !== "unknown");
}
function profileValueFor(category, profile, variant) {
  switch (category) {
    case "first_name":
      return profile.name.split(" ")[0] ?? "";
    case "last_name":
      return profile.name.split(" ").slice(1).join(" ");
    case "full_name":
      return profile.name;
    case "email":
      return profile.email;
    case "phone":
      return profile.phone;
    case "city":
      return profile.city;
    case "state":
      return profile.state;
    case "zip":
      return profile.zip_code;
    case "country":
      return profile.country;
    case "linkedin":
      return profile.linkedin_url ?? "";
    case "website":
      return profile.website ?? "";
    case "resume_text":
      return variant?.content ?? "";
    case "cover_letter":
      return "";
    // Thoth will handle this later
    default:
      return "";
  }
}
function nativeInputSetter(el, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
    "value"
  )?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
}
function fillField(field, value) {
  if (!value) return;
  const el = field.element;
  if (el instanceof HTMLSelectElement) {
    const option = Array.from(el.options).find(
      (o) => o.value.toLowerCase() === value.toLowerCase() || o.text.toLowerCase() === value.toLowerCase()
    );
    if (option) {
      el.value = option.value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } else {
    nativeInputSetter(el, value);
  }
  el.style.outline = "2px solid #f5a623";
  el.style.outlineOffset = "2px";
}
function fillAll(profile, variant) {
  const fields = scanFields();
  let filled = 0;
  for (const field of fields) {
    const value = profileValueFor(field.category, profile, variant);
    if (value) {
      fillField(field, value);
      filled++;
    }
  }
  return filled;
}
let besPanel = null;
function createBesPanel(ats) {
  const panel = document.createElement("div");
  panel.id = "horus-bes-panel";
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
  let dragging = false, startY = 0, startTop = 0;
  panel.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return;
    dragging = true;
    startY = e.clientY;
    startTop = parseInt(panel.style.top ?? "50%");
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const delta = e.clientY - startY;
    panel.style.top = `${startTop + delta}px`;
    panel.style.transform = "none";
  });
  document.addEventListener("mouseup", () => {
    dragging = false;
  });
  return panel;
}
function updateBesPanel(profile, variant) {
  if (!besPanel) return;
  const statusEl = besPanel.querySelector("#horus-status");
  const fillBtn = besPanel.querySelector("#horus-fill-btn");
  const undoBtn = besPanel.querySelector("#horus-undo-btn");
  const countEl = besPanel.querySelector("#horus-filled-count");
  if (!profile) {
    if (statusEl) statusEl.textContent = "Ra not connected";
    if (fillBtn) fillBtn.disabled = true;
    return;
  }
  if (statusEl) statusEl.textContent = `${profile.name} · ${variant?.name ?? "No variant"}`;
  if (fillBtn) fillBtn.disabled = false;
  let savedValues = [];
  fillBtn?.addEventListener("click", () => {
    savedValues = scanFields().map((f) => ({
      el: f.element,
      style: f.element.style.outline,
      value: f.element.value
    }));
    const n = fillAll(profile, variant ?? void 0);
    if (countEl) countEl.textContent = `${n} field${n !== 1 ? "s" : ""} filled`;
    if (undoBtn) undoBtn.style.color = "#fff";
  });
  undoBtn?.addEventListener("click", () => {
    for (const { el, style, value } of savedValues) {
      nativeInputSetter(el, value);
      el.style.outline = style;
    }
    if (countEl) countEl.textContent = "Fill undone";
    savedValues = [];
  });
}
async function init() {
  const ats = detectAts(window.location.href);
  if (!ats) return;
  besPanel = createBesPanel(ats.name);
  document.body.appendChild(besPanel);
  besPanel.querySelector("#horus-close")?.addEventListener("click", () => {
    besPanel?.remove();
    besPanel = null;
  });
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (status) => {
    if (!status?.raConnected) {
      updateBesPanel(null, null);
      return;
    }
    chrome.storage.local.get(["activeProfileId", "activeVariantId"], async (stored) => {
      const { activeProfileId, activeVariantId } = stored;
      if (!activeProfileId) {
        updateBesPanel(null, null);
        const statusEl = besPanel?.querySelector("#horus-status");
        if (statusEl) statusEl.textContent = "Select a profile in the extension popup";
        return;
      }
      try {
        const [profiles, variants] = await Promise.all([
          fetch(`http://127.0.0.1:9741/profiles`).then((r) => r.json()),
          fetch(`http://127.0.0.1:9741/profiles/${activeProfileId}/variants`).then(
            (r) => r.json()
          )
        ]);
        const profile = profiles.find((p) => p.id === activeProfileId) ?? null;
        const variant = variants.find((v) => v.id === activeVariantId) ?? variants.find((v) => v.is_default) ?? variants[0] ?? null;
        updateBesPanel(profile, variant);
      } catch {
        updateBesPanel(null, null);
      }
    });
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === "FILL_FIELDS") {
    const { profile, variant } = msg;
    const n = fillAll(profile, variant);
    reply({ filled: n });
  }
});
//# sourceMappingURL=content.js.map
