(function() {
  "use strict";
  const ATS_PATTERNS = [
    {
      pattern: /myworkdayjobs\.com|wd\d+\.myworkdayjobs\.com/,
      platform: { id: "workday", name: "Workday", difficulty: "hard" }
    },
    {
      pattern: /boards\.greenhouse\.io|job-boards\.greenhouse\.io/,
      platform: { id: "greenhouse", name: "Greenhouse", difficulty: "medium" }
    },
    {
      pattern: /jobs\.lever\.co/,
      platform: { id: "lever", name: "Lever", difficulty: "medium" }
    },
    {
      pattern: /icims\.com/,
      platform: { id: "icims", name: "iCIMS", difficulty: "hard" }
    },
    {
      pattern: /taleo\.net/,
      platform: { id: "taleo", name: "Taleo", difficulty: "hard" }
    },
    {
      pattern: /workforcenow\.adp\.com/,
      platform: { id: "adp", name: "ADP Workforce", difficulty: "medium" }
    },
    {
      pattern: /bamboohr\.com/,
      platform: { id: "bamboohr", name: "BambooHR", difficulty: "easy" }
    },
    {
      pattern: /ashbyhq\.com/,
      platform: { id: "ashby", name: "Ashby", difficulty: "easy" }
    },
    {
      pattern: /smartrecruiters\.com/,
      platform: { id: "smartrecruiters", name: "SmartRecruiters", difficulty: "medium" }
    },
    {
      pattern: /recruiting\.paylocity\.com/,
      platform: { id: "paylocity", name: "Paylocity", difficulty: "medium" }
    },
    {
      pattern: /jobvite\.com/,
      platform: { id: "jobvite", name: "Jobvite", difficulty: "medium" }
    },
    {
      pattern: /applytojob\.com/,
      platform: { id: "jazzhr", name: "JazzHR", difficulty: "easy" }
    }
  ];
  ATS_PATTERNS.map((e) => e.platform);
  function detectAts(url) {
    for (const { pattern, platform } of ATS_PATTERNS) {
      if (pattern.test(url)) return platform;
    }
    return null;
  }
  const SKIP_LABEL = new RegExp(
    [
      "phone\\s*(device\\s*)?type",
      // "Phone Device Type" dropdown
      "country\\s*(phone|dialing)\\s*code",
      // phone country prefix select
      "dialing\\s*code",
      "legally\\s*authorized",
      // "Are you legally authorized to work…"
      "require\\s*sponsorship",
      // "Will you require visa sponsorship…"
      "will\\s+you\\s+now\\s+or",
      // "Will you now or in the future…"
      "visa\\s*sponsorship",
      "pronouns?",
      // "Preferred Pronoun"
      "\\bgender\\b",
      "ethnicity",
      "\\brace\\b",
      "veteran",
      "disability",
      "individual\\s+with\\s+a\\s+disability",
      "self.?identif",
      "how\\s+(did|do)\\s+you\\s+(hear|find|know|learn)",
      // "How did you hear…"
      "source\\s+of\\s+hire",
      "referral\\s+source"
    ].join("|"),
    "i"
  );
  const STEP_NAV = /save\s+and\s+continue|next\s+step|\bnext\b|\bback\b|previous|cancel|save\s+for\s+later/i;
  const FINAL_SUBMIT = /\bapply\b|^submit$|apply\s+now|review\s+application|complete\s+application|submit\s+application|finish\s+application/i;
  const workdayAdapter = {
    id: "workday",
    shouldSkip(_el, label) {
      return SKIP_LABEL.test(label);
    },
    isSubmitButton(el) {
      const text = el.textContent?.trim() ?? el.value?.trim() ?? "";
      if (STEP_NAV.test(text)) return false;
      if (FINAL_SUBMIT.test(text)) return true;
      return false;
    }
  };
  const EEO_PATTERN = /race|ethnicity|gender|veteran|disability|self.?identif|demographic|pronouns/i;
  const greenhouseAdapter = {
    id: "greenhouse",
    shouldSkip(el, label) {
      const name = el.getAttribute("name") ?? "";
      return EEO_PATTERN.test(label) || EEO_PATTERN.test(name) || EEO_PATTERN.test(el.id);
    },
    isSubmitButton(el) {
      const text = el.textContent?.trim() ?? el.value?.trim() ?? "";
      return /submit application/i.test(text);
    }
  };
  const SKIP_PATTERN = /how (did you|do you).*(hear|find|learn)|referral source|desired salary/i;
  const bamboohrAdapter = {
    id: "bamboohr",
    shouldSkip(_el, label) {
      return SKIP_PATTERN.test(label);
    },
    isSubmitButton(el) {
      const text = el.textContent?.trim() ?? "";
      return /^apply$|submit application/i.test(text);
    }
  };
  const leverAdapter = {
    id: "lever",
    extraPatterns: [
      {
        category: "linkedin",
        patterns: [/urls\[LinkedIn\]/i]
      },
      {
        category: "website",
        patterns: [/urls\[Portfolio\]/i, /urls\[GitHub\]/i]
      }
    ],
    shouldSkip(el, label) {
      const name = el.getAttribute("name") ?? "";
      if (/urls\[Twitter\]/i.test(name) || /urls\[Other\]/i.test(name)) return true;
      if (/how.*(hear|find|learn|know)|referral/i.test(label)) return true;
      return false;
    },
    async afterFill() {
      const locationInput = document.querySelector(
        'input[name="location"], input[placeholder*="City" i], input[id*="location" i]'
      );
      if (locationInput) {
        locationInput.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true, keyCode: 27 })
        );
        await new Promise((r) => setTimeout(r, 100));
        locationInput.blur();
      }
    },
    isSubmitButton(el) {
      const text = el.textContent?.trim() ?? "";
      return /submit application/i.test(text);
    }
  };
  const ATS_ADAPTERS = {
    workday: workdayAdapter,
    greenhouse: greenhouseAdapter,
    bamboohr: bamboohrAdapter,
    lever: leverAdapter
  };
  let currentAdapter = null;
  let adapterExtraPatterns = [];
  const FIELD_PATTERNS = [
    {
      category: "first_name",
      patterns: [/first.?name|fname|given.?name/i]
    },
    {
      category: "last_name",
      patterns: [/last.?name|\blname\b|family.?name|surname/i]
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
      category: "address_line1",
      patterns: [/address.?line.?1|address.?1|street.?address|^address$|^street$|addr1|addressline1/i]
    },
    {
      category: "address_line2",
      patterns: [/address.?line.?2|address.?2|apt|suite|unit|floor|addr2|addressline2/i]
    },
    {
      category: "city",
      patterns: [/^city$|city.?town/i]
    },
    {
      category: "state",
      patterns: [/\bstate\b|province|region/i]
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
    if (/extension/.test(name) || /extension/.test(id)) {
      return { category: "unknown", confidence: "low" };
    }
    if (/middle.?name|middlename/i.test(name) || /middle.?name|middlename/i.test(id) || /middle.?name/i.test(label)) {
      return { category: "unknown", confidence: "low" };
    }
    for (const { category, patterns } of FIELD_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(label)) return { category, confidence: "high" };
        if (pattern.test(name) || pattern.test(id)) return { category, confidence: "medium" };
      }
    }
    for (const { category, patterns } of adapterExtraPatterns) {
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
    if (el instanceof HTMLButtonElement && el.getAttribute("aria-haspopup") === "listbox") {
      return { category: "unknown", confidence: "low" };
    }
    return { category: "unknown", confidence: "low" };
  }
  function scanFields() {
    const selectors = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"])',
      "textarea",
      "select",
      'button[aria-haspopup="listbox"]'
    ].join(", ");
    const elements = Array.from(document.querySelectorAll(selectors));
    return elements.filter((el) => el.offsetParent !== null).map((el) => {
      const { category, confidence } = classifyField(el);
      return { element: el, label: getFieldLabel(el), category, confidence };
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
      case "address_line1":
        return profile.address_line1;
      case "address_line2":
        return profile.address_line2;
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
  const US_STATES = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
    DC: "District of Columbia"
  };
  const COUNTRIES = {
    US: "United States of America",
    USA: "United States of America",
    "UNITED STATES": "United States of America",
    UK: "United Kingdom",
    "UNITED KINGDOM": "United Kingdom",
    GB: "United Kingdom",
    CA: "Canada",
    CANADA: "Canada",
    AU: "Australia",
    AUSTRALIA: "Australia",
    NZ: "New Zealand",
    DE: "Germany",
    GERMANY: "Germany",
    FR: "France",
    FRANCE: "France",
    IN: "India",
    INDIA: "India",
    MX: "Mexico",
    MEXICO: "Mexico",
    BR: "Brazil",
    BRAZIL: "Brazil",
    JP: "Japan",
    JAPAN: "Japan",
    CN: "China",
    SG: "Singapore",
    IE: "Ireland",
    NL: "Netherlands",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    FI: "Finland",
    CH: "Switzerland",
    ES: "Spain",
    IT: "Italy",
    PL: "Poland",
    PT: "Portugal",
    ZA: "South Africa",
    NG: "Nigeria",
    KE: "Kenya",
    PH: "Philippines",
    IL: "Israel"
  };
  function expandValue(category, value) {
    if (category === "state") {
      return US_STATES[value.toUpperCase()] ?? value;
    }
    if (category === "country") {
      return COUNTRIES[value.toUpperCase()] ?? value;
    }
    return value;
  }
  async function fillAriaListbox(el, value) {
    el.click();
    await new Promise((r) => setTimeout(r, 350));
    const options = Array.from(document.querySelectorAll('[role="option"]'));
    const match = options.find(
      (o) => o.textContent?.trim().toLowerCase() === value.toLowerCase()
    );
    if (match) {
      match.click();
      return true;
    }
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    return false;
  }
  async function fillField(field, value) {
    if (!value) return false;
    const el = field.element;
    if (el instanceof HTMLButtonElement && el.getAttribute("aria-haspopup") === "listbox") {
      const ok = await fillAriaListbox(el, expandValue(field.category, value));
      if (ok) {
        el.style.outline = "2px solid #f5a623";
        el.style.outlineOffset = "2px";
      }
      return ok;
    }
    if (el instanceof HTMLSelectElement) {
      const option = Array.from(el.options).find(
        (o) => o.value.toLowerCase() === value.toLowerCase() || o.text.toLowerCase() === value.toLowerCase()
      );
      if (option) {
        el.value = option.value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        return false;
      }
    } else {
      nativeInputSetter(el, value);
    }
    el.style.outline = "2px solid #f5a623";
    el.style.outlineOffset = "2px";
    return true;
  }
  async function fillAll(profile, variant) {
    const fields = scanFields();
    let filled = 0;
    for (const field of fields) {
      if (currentAdapter?.shouldSkip?.(field.element, field.label)) continue;
      const value = profileValueFor(field.category, profile, variant);
      if (value && await fillField(field, value)) {
        filled++;
      }
    }
    if (currentAdapter?.afterFill) {
      await currentAdapter.afterFill(profile, variant);
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
      const newTop = startTop + delta;
      const maxTop = window.innerHeight - panel.offsetHeight;
      panel.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
      panel.style.transform = "none";
    });
    document.addEventListener("mouseup", () => {
      dragging = false;
    });
    return panel;
  }
  async function openSnippetModal() {
    document.getElementById("horus-snippet-modal")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "horus-snippet-modal";
    overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 2147483646;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    font-family: system-ui, sans-serif;
  `;
    const modal = document.createElement("div");
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
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    modal.querySelector("#horus-snippet-close")?.addEventListener("click", () => overlay.remove());
    const listEl = modal.querySelector("#horus-snippet-list");
    try {
      const snippets = await fetch("http://127.0.0.1:9741/snippets").then((r) => r.json());
      if (snippets.length === 0) {
        listEl.innerHTML = `<div style="color:#888;font-size:12px;text-align:center;padding:24px;">No snippets yet — create some in Ra.</div>`;
        return;
      }
      listEl.innerHTML = "";
      for (const snippet of snippets) {
        const row = document.createElement("div");
        row.style.cssText = `
        display:flex; align-items:flex-start; gap:10px; padding:10px;
        border-radius:8px; margin-bottom:6px; background:#0d0d1a;
        border:1px solid #222;
      `;
        const tags = snippet.tags.length ? snippet.tags.map((t) => `<span style="background:#f5a62322;color:#f5a623;border-radius:4px;padding:1px 6px;font-size:10px;">${t}</span>`).join(" ") : "";
        row.innerHTML = `
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:12px;margin-bottom:2px;">${snippet.title}</div>
          ${tags ? `<div style="margin-bottom:4px;">${tags}</div>` : ""}
          <div style="font-size:11px;color:#888;white-space:pre-wrap;max-height:60px;overflow:hidden;">${snippet.content.slice(0, 120)}${snippet.content.length > 120 ? "…" : ""}</div>
        </div>
        <button data-id="${snippet.id}" data-content="${encodeURIComponent(snippet.content)}" style="
          flex-shrink:0;padding:6px 10px;background:#f5a623;color:#000;border:none;
          border-radius:6px;font-weight:600;cursor:pointer;font-size:11px;white-space:nowrap;
        ">Copy</button>
      `;
        const copyBtn = row.querySelector("button[data-content]");
        copyBtn.addEventListener("click", async () => {
          const text = decodeURIComponent(copyBtn.dataset.content);
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = "Copied!";
          copyBtn.style.background = "#4caf50";
          setTimeout(() => {
            copyBtn.textContent = "Copy";
            copyBtn.style.background = "#f5a623";
          }, 1500);
          fetch(`http://127.0.0.1:9741/snippets/${copyBtn.dataset.id}/use`, { method: "POST" }).catch(() => {
          });
        });
        listEl.appendChild(row);
      }
    } catch {
      listEl.innerHTML = `<div style="color:#e57373;font-size:12px;text-align:center;padding:24px;">Could not reach Ra. Is it running?</div>`;
    }
  }
  function updateBesPanel(profile, variant) {
    if (!besPanel) return;
    const statusEl = besPanel.querySelector("#horus-status");
    const fillBtn = besPanel.querySelector("#horus-fill-btn");
    const undoBtn = besPanel.querySelector("#horus-undo-btn");
    const snippetBtn = besPanel.querySelector("#horus-snippet-btn");
    const countEl = besPanel.querySelector("#horus-filled-count");
    if (!profile) {
      if (statusEl) statusEl.textContent = "Ra not connected";
      if (fillBtn) fillBtn.disabled = true;
      return;
    }
    if (statusEl) statusEl.textContent = `${profile.name} · ${variant?.name ?? "No variant"}`;
    if (fillBtn) fillBtn.disabled = false;
    let savedValues = [];
    fillBtn?.addEventListener("click", async () => {
      if (fillBtn) fillBtn.disabled = true;
      savedValues = scanFields().map((f) => ({
        el: f.element,
        style: f.element.style.outline,
        value: f.element.value ?? ""
      }));
      const n = await fillAll(profile, variant ?? void 0);
      if (fillBtn) fillBtn.disabled = false;
      if (countEl) countEl.textContent = `${n} field${n !== 1 ? "s" : ""} filled`;
      if (undoBtn) undoBtn.style.color = "#fff";
    });
    snippetBtn?.addEventListener("click", () => {
      openSnippetModal();
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
  function extractJobInfo() {
    const hostname = window.location.hostname;
    const subdomains = hostname.split(".");
    const company = subdomains[0].replace(/^wd\d+$/, "") || subdomains[1] || "";
    const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";
    const h2 = document.querySelector("h2")?.textContent?.trim() ?? "";
    const fromTitle = document.title.split(/[|\-–]/)[0].trim();
    const title = h1 || h2 || fromTitle;
    const locInput = document.querySelector(
      'input[name*="location" i], input[name*="city" i], input[id*="location" i]'
    );
    const location = locInput?.value.trim() ?? "";
    return { company, title, location };
  }
  function openLogModal(ats, profileId, variantId) {
    if (document.getElementById("horus-log-modal")) return;
    const { company, title, location } = extractJobInfo();
    const overlay = document.createElement("div");
    overlay.id = "horus-log-modal";
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
    overlay.querySelector("#horus-log-close")?.addEventListener("click", close);
    overlay.querySelector("#horus-log-skip")?.addEventListener("click", close);
    overlay.querySelector("#horus-log-confirm")?.addEventListener("click", async () => {
      const companyVal = overlay.querySelector("#horus-log-company").value.trim();
      const titleVal = overlay.querySelector("#horus-log-title").value.trim();
      const locationVal = overlay.querySelector("#horus-log-location").value.trim();
      const notesVal = overlay.querySelector("#horus-log-notes").value.trim();
      const errEl = overlay.querySelector("#horus-log-error");
      const confirmBtn = overlay.querySelector("#horus-log-confirm");
      if (!companyVal || !titleVal) {
        errEl.textContent = "Company and Job Title are required.";
        errEl.style.display = "block";
        return;
      }
      confirmBtn.textContent = "Saving…";
      confirmBtn.disabled = true;
      try {
        await fetch("http://127.0.0.1:9741/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile_id: profileId,
            company: companyVal,
            title: titleVal,
            location: locationVal,
            status: "applied",
            salary_min: null,
            salary_max: null,
            ats_platform: ats,
            job_url: window.location.href,
            resume_variant_id: variantId,
            notes: notesVal,
            applied_at: (/* @__PURE__ */ new Date()).toISOString()
          })
        });
        close();
        const countEl = besPanel?.querySelector("#horus-filled-count");
        if (countEl) {
          countEl.textContent = "✓ Application logged";
          countEl.style.color = "#4caf50";
        }
      } catch {
        errEl.textContent = "Could not reach Ra. Is it running?";
        errEl.style.display = "block";
        confirmBtn.textContent = "Log It";
        confirmBtn.disabled = false;
      }
    });
  }
  function watchForSubmission(ats, profileId, variantId) {
    let submitArmed = false;
    document.addEventListener("click", (e) => {
      const btn = e.target.closest('button, [role="button"], input[type="submit"]');
      if (!btn) return;
      const text = btn.textContent?.trim() ?? btn.value?.trim() ?? "";
      const isSubmit = currentAdapter?.isSubmitButton?.(btn) ?? /^(submit|apply now|complete application|submit application)$/i.test(text);
      if (isSubmit) {
        submitArmed = true;
        setTimeout(() => {
          submitArmed = false;
        }, 3e4);
      }
    }, true);
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href === lastUrl) return;
      lastUrl = window.location.href;
      const isConfirmation = /thank|applied|confirm|success|complete/i.test(window.location.pathname) || /thank|applied|confirm|success|complete/i.test(document.title);
      if (submitArmed && isConfirmation) {
        submitArmed = false;
        setTimeout(() => openLogModal(ats, profileId, variantId), 800);
        return;
      }
      if (!isConfirmation && besPanel) {
        const statusEl = besPanel.querySelector("#horus-status");
        const countEl = besPanel.querySelector("#horus-filled-count");
        const fillBtn = besPanel.querySelector("#horus-fill-btn");
        if (statusEl) statusEl.style.color = "#f5a623";
        if (countEl) {
          countEl.textContent = "↑ New step — click Fill All";
          countEl.style.color = "#f5a623";
        }
        if (fillBtn) fillBtn.disabled = false;
        fillBtn?.addEventListener("click", () => {
          if (statusEl) statusEl.style.color = "";
          if (countEl) countEl.style.color = "#888";
        }, { once: true });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  async function init() {
    const ats = detectAts(window.location.href);
    if (!ats) return;
    currentAdapter = ATS_ADAPTERS[ats.id] ?? null;
    adapterExtraPatterns = currentAdapter?.extraPatterns ?? [];
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
          if (profile) {
            watchForSubmission(ats.name, profile.id, variant?.id ?? null);
          }
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
      fillAll(profile, variant).then((n) => reply({ filled: n }));
      return true;
    }
  });
})();
//# sourceMappingURL=content.js.map
