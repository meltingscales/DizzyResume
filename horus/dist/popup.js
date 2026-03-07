import { r as raApi } from "./assets/api-DnzFSuXz.js";
import { S as SUPPORTED_PLATFORMS, d as detectAts } from "./assets/detect-C29rGrdD.js";
const raDot = document.getElementById("ra-dot");
const raStatus = document.getElementById("ra-status");
const atsInfo = document.getElementById("ats-info");
const profileSelect = document.getElementById("profile-select");
const variantSelect = document.getElementById("variant-select");
const fillBtn = document.getElementById("fill-btn");
const undoBtn = document.getElementById("undo-btn");
const fillResult = document.getElementById("fill-result");
const atsHelpBtn = document.getElementById("ats-help-btn");
const supportPanel = document.getElementById("support-panel");
const supportList = document.getElementById("support-list");
let profiles = [];
let variants = [];
let raConnected = false;
let currentAts = null;
async function connectToRa() {
  try {
    await raApi.health();
    raConnected = true;
    raDot.className = "dot dot-green";
    raStatus.textContent = "Ra connected";
    await loadProfiles();
  } catch {
    raConnected = false;
    raDot.className = "dot dot-red";
    raStatus.textContent = "Ra not running — launch the desktop app";
    fillBtn.disabled = true;
  }
}
async function loadProfiles() {
  profiles = await raApi.profiles.list();
  profileSelect.innerHTML = '<option value="">— select profile —</option>';
  for (const p of profiles) {
    const opt = new Option(p.name, p.id);
    profileSelect.appendChild(opt);
  }
  const { activeProfileId } = await chrome.storage.local.get("activeProfileId");
  if (activeProfileId && profiles.find((p) => p.id === activeProfileId)) {
    profileSelect.value = activeProfileId;
    await loadVariants(activeProfileId);
  }
  profileSelect.disabled = profiles.length === 0;
}
async function loadVariants(profileId) {
  variants = await raApi.profiles.variants(profileId);
  variantSelect.innerHTML = '<option value="">— select variant —</option>';
  for (const v of variants) {
    const label = v.is_default ? `${v.name} (default)` : v.name;
    const opt = new Option(label, v.id);
    variantSelect.appendChild(opt);
  }
  const { activeVariantId } = await chrome.storage.local.get("activeVariantId");
  const defaultVariant = variants.find((v) => v.id === activeVariantId) ?? variants.find((v) => v.is_default) ?? variants[0];
  if (defaultVariant) variantSelect.value = defaultVariant.id;
  variantSelect.disabled = variants.length === 0;
  updateFillButton();
}
async function detectCurrentAts() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  const ats = detectAts(tab.url);
  if (ats) {
    currentAts = ats.name;
    atsInfo.className = "";
    atsInfo.innerHTML = `<span class="ats-badge">${ats.name}</span> <span style="color:#666;font-size:11px;">${ats.difficulty}</span>`;
    setAtsHelpVisibility(true);
  } else {
    currentAts = null;
    atsInfo.className = "no-ats";
    atsInfo.textContent = "Not a recognised ATS page";
    setAtsHelpVisibility(false);
  }
}
function updateFillButton() {
  const hasProfile = profileSelect.value !== "";
  variantSelect.value !== "";
  fillBtn.disabled = !raConnected || !hasProfile || !currentAts;
}
fillBtn.addEventListener("click", async () => {
  const profileId = profileSelect.value;
  const variantId = variantSelect.value;
  if (!profileId) return;
  const profile = profiles.find((p) => p.id === profileId);
  const variant = variants.find((v) => v.id === variantId);
  if (!profile) return;
  await chrome.storage.local.set({ activeProfileId: profileId, activeVariantId: variantId });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  fillBtn.textContent = "Filling…";
  fillBtn.disabled = true;
  chrome.tabs.sendMessage(
    tab.id,
    { type: "FILL_FIELDS", profile, variant: variant ?? null },
    (response) => {
      fillBtn.textContent = "Fill All Fields";
      fillBtn.disabled = false;
      undoBtn.disabled = false;
      if (response?.filled !== void 0) {
        fillResult.textContent = `${response.filled} field${response.filled !== 1 ? "s" : ""} filled ✓`;
        setTimeout(() => {
          fillResult.textContent = "";
        }, 3e3);
      } else {
        fillResult.textContent = "No fields detected — try reloading the page.";
        fillResult.style.color = "#f87171";
      }
    }
  );
});
undoBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "UNDO_FILL" });
  undoBtn.disabled = true;
  fillResult.textContent = "Fill undone";
  setTimeout(() => {
    fillResult.textContent = "";
  }, 2e3);
});
profileSelect.addEventListener("change", async () => {
  const id = profileSelect.value;
  await chrome.storage.local.set({ activeProfileId: id });
  if (id) {
    await loadVariants(id);
  } else {
    variantSelect.innerHTML = '<option value="">— select variant —</option>';
    variantSelect.disabled = true;
  }
  updateFillButton();
});
variantSelect.addEventListener("change", async () => {
  await chrome.storage.local.set({ activeVariantId: variantSelect.value });
  updateFillButton();
});
for (const platform of SUPPORTED_PLATFORMS) {
  const item = document.createElement("div");
  item.className = "support-item";
  item.innerHTML = `
    <span>${platform.name}</span>
    <span class="diff-badge diff-${platform.difficulty}">${platform.difficulty}</span>
  `;
  supportList.appendChild(item);
}
atsHelpBtn.addEventListener("click", () => {
  const isOpen = supportPanel.classList.toggle("open");
  atsHelpBtn.style.color = isOpen ? "#f5a623" : "";
  atsHelpBtn.style.borderColor = isOpen ? "#f5a623" : "";
});
function setAtsHelpVisibility(atsDetected) {
  atsHelpBtn.style.display = atsDetected ? "none" : "";
  if (atsDetected) supportPanel.classList.remove("open");
}
await Promise.all([connectToRa(), detectCurrentAts()]);
updateFillButton();
//# sourceMappingURL=popup.js.map
