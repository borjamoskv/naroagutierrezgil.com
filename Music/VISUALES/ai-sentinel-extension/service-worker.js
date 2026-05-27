// AI Sentinel - Background Service Worker

chrome.runtime.onInstalled.addListener(async () => {
  console.log("AI Sentinel Extension instalado.");
  
  // Configurar ajustes por defecto
  const settings = await chrome.storage.local.get(["extensionEnabled", "auditCount", "influencers", "audioAlertsEnabled", "influencerStats", "ignoredElements"]);
  
  if (settings.extensionEnabled === undefined) {
    await chrome.storage.local.set({ extensionEnabled: true });
  }
  
  if (settings.audioAlertsEnabled === undefined) {
    await chrome.storage.local.set({ audioAlertsEnabled: true });
  }
  
  if (settings.auditCount === undefined) {
    await chrome.storage.local.set({ auditCount: 0 });
  }

  if (settings.influencerStats === undefined) {
    await chrome.storage.local.set({ influencerStats: {} });
  }

  if (settings.ignoredElements === undefined) {
    await chrome.storage.local.set({ ignoredElements: [] });
  }
  
  // Cargar base de datos predeterminada si no existe
  if (!settings.influencers) {
    try {
      const dbUrl = chrome.runtime.getURL("database/influencers.json");
      const response = await fetch(dbUrl);
      const defaultInfluencers = await response.json();
      await chrome.storage.local.set({ influencers: defaultInfluencers });
      console.log("Base de datos de influencers por defecto cargada.");
    } catch (error) {
      console.error("Error al cargar la base de datos por defecto:", error);
    }
  }
});

// Listener de mensajes procedentes de los content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "incrementAuditCount") {
    (async () => {
      const data = await chrome.storage.local.get(["auditCount", "influencerStats"]);
      const currentCount = data.auditCount || 0;
      const newCount = currentCount + 1;
      
      const influencerStats = data.influencerStats || {};
      if (message.influencerId) {
        influencerStats[message.influencerId] = (influencerStats[message.influencerId] || 0) + 1;
      }
      
      await chrome.storage.local.set({ 
        auditCount: newCount, 
        influencerStats: influencerStats 
      });
      
      sendResponse({ status: "success", auditCount: newCount, influencerStats });
    })();
    return true; // Mantener canal abierto para respuesta asíncrona
  }
});
