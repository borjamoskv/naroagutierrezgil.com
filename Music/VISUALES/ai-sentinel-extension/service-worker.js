// AI Sentinel - Background Service Worker

chrome.runtime.onInstalled.addListener(async () => {
  console.log("AI Sentinel Extension installed.");
  
  // Set default settings
  const settings = await chrome.storage.local.get(["extensionEnabled", "auditCount", "influencers"]);
  
  if (settings.extensionEnabled === undefined) {
    await chrome.storage.local.set({ extensionEnabled: true });
  }
  
  if (settings.auditCount === undefined) {
    await chrome.storage.local.set({ auditCount: 0 });
  }
  
  // Load default influencers JSON if not already present
  if (!settings.influencers) {
    try {
      const dbUrl = chrome.runtime.getURL("database/influencers.json");
      const response = await fetch(dbUrl);
      const defaultInfluencers = await response.json();
      await chrome.storage.local.set({ influencers: defaultInfluencers });
      console.log("Default influencers database loaded successfully into storage.");
    } catch (error) {
      console.error("Error loading default influencers database:", error);
    }
  }
});

// Listener for content script notifications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "incrementAuditCount") {
    (async () => {
      const data = await chrome.storage.local.get("auditCount");
      const currentCount = data.auditCount || 0;
      const newCount = currentCount + 1;
      await chrome.storage.local.set({ auditCount: newCount });
      sendResponse({ status: "success", auditCount: newCount });
    })();
    return true; // Keep message channel open for async response
  }
});
