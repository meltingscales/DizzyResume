import { d as detectAts, r as raApi } from "./assets/api-CG9irCF4.js";
let raConnected = false;
async function checkRa() {
  try {
    await raApi.health();
    raConnected = true;
  } catch {
    raConnected = false;
  }
  updateBadge();
  await chrome.storage.session.set({ raConnected });
}
checkRa();
setInterval(checkRa, 3e4);
function updateBadge(tabAts) {
  if (!raConnected) {
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    return;
  }
  if (tabAts) {
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  const ats = detectAts(tab.url);
  if (ats) {
    chrome.storage.session.set({ [`tab_ats_${tabId}`]: ats });
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      if (activeTab?.id === tabId) updateBadge(ats.name);
    });
  } else {
    chrome.storage.session.remove(`tab_ats_${tabId}`);
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      if (activeTab?.id === tabId) updateBadge(null);
    });
  }
});
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`tab_ats_${tabId}`);
});
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.storage.session.get(`tab_ats_${tabId}`, (result) => {
    const ats = result[`tab_ats_${tabId}`];
    updateBadge(ats?.name ?? null);
  });
});
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  switch (msg.type) {
    case "GET_STATUS":
      reply({ raConnected });
      break;
    case "CHECK_RA":
      checkRa().then(() => reply({ raConnected }));
      return true;
    // async reply
    case "GET_ATS": {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab?.url) return reply({ ats: null });
        reply({ ats: detectAts(tab.url) });
      });
      return true;
    }
    case "FILL_FIELDS":
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab?.id) return;
        chrome.tabs.sendMessage(tab.id, msg, reply);
      });
      return true;
    case "LOG_APPLICATION":
      raApi.applications.create(msg.payload).then((app) => reply({ ok: true, app })).catch((e) => reply({ ok: false, error: e.message }));
      return true;
  }
});
//# sourceMappingURL=background.js.map
