/// Horus background service worker.
///
/// Responsibilities:
/// - Poll Ra's /health endpoint and cache connection status
/// - Track which tabs are on known ATS pages
/// - Relay messages between popup and content scripts
/// - Badge the extension icon to show Ra status + ATS detection

import { detectAts } from './ats/detect';
import { raApi } from './api';

// ── Ra connectivity ───────────────────────────────────────────────────────────

let raConnected = false;

async function checkRa(): Promise<void> {
  try {
    await raApi.health();
    raConnected = true;
  } catch {
    raConnected = false;
  }
  updateBadge();
  await chrome.storage.session.set({ raConnected });
}

// Check Ra on startup and every 30 seconds
checkRa();
setInterval(checkRa, 30_000);

// ── Badge ─────────────────────────────────────────────────────────────────────

function updateBadge(tabAts?: string | null): void {
  if (!raConnected) {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // red
    return;
  }
  if (tabAts) {
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' }); // green
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// ── Tab tracking ──────────────────────────────────────────────────────────────

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  const ats = detectAts(tab.url);
  if (ats) {
    chrome.storage.session.set({ [`tab_ats_${tabId}`]: ats });
    // Update badge for the active tab
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

// ── Message relay ─────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  switch (msg.type) {
    case 'GET_STATUS':
      reply({ raConnected });
      break;

    case 'CHECK_RA':
      checkRa().then(() => reply({ raConnected }));
      return true; // async reply

    case 'GET_ATS': {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab?.url) return reply({ ats: null });
        reply({ ats: detectAts(tab.url!) });
      });
      return true;
    }

    case 'FILL_FIELDS':
      // Forward fill command to the active tab's content script
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab?.id) return;
        chrome.tabs.sendMessage(tab.id, msg, reply);
      });
      return true;

    case 'LOG_APPLICATION':
      raApi.applications
        .create(msg.payload)
        .then((app) => reply({ ok: true, app }))
        .catch((e: Error) => reply({ ok: false, error: e.message }));
      return true;
  }
});
