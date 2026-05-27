// AI Sentinel - Popup Controller

document.addEventListener("DOMContentLoaded", async () => {
  // Seleccionar Elementos del DOM
  const powerToggle = document.getElementById("power-toggle");
  const statusBar = document.getElementById("status-bar");
  const statusText = document.getElementById("status-text");
  const statAudits = document.getElementById("stat-audits");
  const statInfluencers = document.getElementById("stat-influencers");
  
  // Botones de Navegación por Pestañas
  const tabBtnInfluencers = document.getElementById("tab-btn-influencers");
  const tabBtnReport = document.getElementById("tab-btn-report");
  const tabBtnSettings = document.getElementById("tab-btn-settings");
  
  // Contenedores de Pestañas
  const tabInfluencers = document.getElementById("tab-influencers");
  const tabReport = document.getElementById("tab-report");
  const tabSettings = document.getElementById("tab-settings");
  
  const influencerSearch = document.getElementById("influencer-search");
  const influencerList = document.getElementById("influencer-list");
  
  // Elementos de la pestaña Reportar Mito
  const reportForm = document.getElementById("report-form");
  const reportCreatorSelect = document.getElementById("report-creator");

  // Elementos de la pestaña Ajustes
  const creatorTogglesContainer = document.getElementById("creator-toggles-container");
  const btnExportDb = document.getElementById("btn-export-db");
  const importFileInput = document.getElementById("import-file-input");
  const btnResetDb = document.getElementById("btn-reset-db");

  let influencersData = [];

  // Inicializar Estado de la UI
  await loadState();

  // Cargar estado y datos desde chrome.storage.local
  async function loadState() {
    try {
      const data = await chrome.storage.local.get(["extensionEnabled", "auditCount", "influencers", "audioAlertsEnabled", "influencerStats"]);
      
      // 1. Interruptor Global
      const enabled = data.extensionEnabled !== false; // Por defecto true
      powerToggle.checked = enabled;
      updateStatusUI(enabled);

      // 2. Métrica de Auditorías
      statAudits.textContent = data.auditCount || 0;
      
      // 3. Métrica y listado de Creadores
      influencersData = data.influencers || [];
      statInfluencers.textContent = influencersData.length;

      // 4. Renderizados y Formularios
      renderInfluencersList(influencersData, data.influencerStats || {});
      populateCreatorDropdown(influencersData);
      
      // 5. Ajustes
      await renderCreatorToggles(influencersData);

      // 6. Alertas de Audio
      const audioAlertsToggle = document.getElementById("audio-alerts-toggle");
      audioAlertsToggle.checked = data.audioAlertsEnabled !== false;
    } catch (error) {
      console.error("Error al cargar la configuración local:", error);
    }
  }

  // Actualizar el estilo de la barra de estado
  function updateStatusUI(enabled) {
    if (enabled) {
      statusBar.className = "status-bar active";
      statusText.textContent = "SISTEMA ACTIVO Y VIGILANDO";
    } else {
      statusBar.className = "status-bar inactive";
      statusText.textContent = "SISTEMA APAGADO / MONITOREO PAUSADO";
    }
  }

  // Evento del Interruptor General
  powerToggle.addEventListener("change", async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.local.set({ extensionEnabled: enabled });
    updateStatusUI(enabled);
    await reloadActiveTabs();
  });

  // Evento del Interruptor de Alertas de Audio
  const audioAlertsToggle = document.getElementById("audio-alerts-toggle");
  audioAlertsToggle.addEventListener("change", async (e) => {
    await chrome.storage.local.set({ audioAlertsEnabled: e.target.checked });
  });

  // Recargar pestañas de redes sociales para aplicar cambios
  async function reloadActiveTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.url && (
          tab.url.includes("twitter.com") || 
          tab.url.includes("x.com") || 
          tab.url.includes("youtube.com") || 
          tab.url.includes("linkedin.com")
        )) {
          chrome.tabs.reload(tab.id);
        }
      }
    } catch (err) {
      console.log("No se pudieron recargar las pestañas:", err);
    }
  }

  // Navegación por pestañas (Estilo clásico)
  const navTabs = [
    { btn: tabBtnInfluencers, content: tabInfluencers },
    { btn: tabBtnReport, content: tabReport },
    { btn: tabBtnSettings, content: tabSettings }
  ];

  navTabs.forEach(tabObj => {
    tabObj.btn.addEventListener("click", () => {
      // Desactivar todas
      navTabs.forEach(t => {
        t.btn.classList.remove("active");
        t.content.classList.remove("active");
      });
      // Activar la seleccionada
      tabObj.btn.classList.add("active");
      tabObj.content.classList.add("active");
    });
  });

  // Llenar el desplegable del formulario de reporte
  function populateCreatorDropdown(influencers) {
    reportCreatorSelect.innerHTML = "";
    influencers.forEach(inf => {
      const option = document.createElement("option");
      option.value = inf.id;
      option.textContent = inf.name;
      reportCreatorSelect.appendChild(option);
    });
  }

  // Renderizar tarjetas de creadores (Tab 1)
  function renderInfluencersList(influencers, stats = {}) {
    influencerList.innerHTML = "";

    if (influencers.length === 0) {
      influencerList.innerHTML = `<div class="empty-state">No hay creadores registrados.</div>`;
      return;
    }

    influencers.forEach(inf => {
      const card = document.createElement("div");
      card.className = "influencer-card";
      card.id = `creator-card-${inf.id}`;

      // Obtener conteo de auditorías para este creador
      const count = stats[inf.id] || 0;

      // Cabecera de la tarjeta con badge dinámico
      const header = document.createElement("div");
      header.className = "influencer-header";
      header.innerHTML = `
        <img class="influencer-avatar" src="${inf.avatar}" alt="${inf.name}">
        <div class="influencer-info">
          <div class="influencer-name">${escapeHTML(inf.name)}</div>
          <div class="influencer-handle">@${escapeHTML(inf.handles.twitter || inf.id)}</div>
        </div>
        <span class="influencer-stat-badge ${count > 0 ? 'active' : ''}">${count}</span>
        <span class="collapse-indicator">▶</span>
      `;

      // Detalles desplegables
      const details = document.createElement("div");
      details.className = "influencer-details";

      const desc = document.createElement("div");
      desc.className = "influencer-desc";
      desc.textContent = inf.description;
      details.appendChild(desc);

      const errorTitle = document.createElement("div");
      errorTitle.className = "errors-section-title";
      errorTitle.textContent = "Mitos Auditados:";
      details.appendChild(errorTitle);

      const errorsContainer = document.createElement("div");
      errorsContainer.className = "errors-container";

      if (!inf.errors || inf.errors.length === 0) {
        errorsContainer.innerHTML = `<div class="empty-state" style="font-size: 10px; color: var(--text-secondary);">Sin mitos registrados.</div>`;
      } else {
        inf.errors.forEach(err => {
          const errorItem = document.createElement("div");
          errorItem.className = "error-item";
          errorItem.innerHTML = `
            <div class="error-item-header">
              <span class="error-keywords-label">Keywords: ${escapeHTML(err.keywords.join(", "))}</span>
              <span class="severity-tag severity-${err.severity}">${err.severity}</span>
            </div>
            <div class="error-claim">"${escapeHTML(err.claim)}"</div>
            <div class="error-correction"><strong>Realidad:</strong> ${escapeHTML(err.correction)}</div>
            <div class="error-ref"><strong>Ref:</strong> ${escapeHTML(err.reference)}</div>
          `;
          errorsContainer.appendChild(errorItem);
        });
      }

      details.appendChild(errorsContainer);
      card.appendChild(header);
      card.appendChild(details);

      // Evento de Acordeón
      header.addEventListener("click", () => {
        const isExpanded = card.classList.contains("expanded");
        document.querySelectorAll(".influencer-card").forEach(c => c.classList.remove("expanded"));
        
        if (!isExpanded) {
          card.classList.add("expanded");
        }
      });

      influencerList.appendChild(card);
    });
  }

  // Filtrado de búsquedas en tiempo real
  influencerSearch.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const cards = influencerList.querySelectorAll(".influencer-card");

    cards.forEach(card => {
      const influencerId = card.id.replace("creator-card-", "");
      const inf = influencersData.find(i => i.id === influencerId);
      if (!inf) return;

      const nameMatch = inf.name.toLowerCase().includes(query);
      const descriptionMatch = inf.description.toLowerCase().includes(query);
      const handleMatch = Object.values(inf.handles).some(h => h.toLowerCase().includes(query));
      
      const errorMatch = inf.errors && inf.errors.some(err => 
        err.claim.toLowerCase().includes(query) || 
        err.correction.toLowerCase().includes(query) ||
        err.keywords.some(kw => kw.toLowerCase().includes(query))
      );

      if (nameMatch || descriptionMatch || handleMatch || errorMatch) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });

  // Enviar formulario para registrar un nuevo mito
  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedCreatorId = reportCreatorSelect.value;
    const claim = document.getElementById("report-claim").value.trim();
    const correction = document.getElementById("report-correction").value.trim();
    const keywordsRaw = document.getElementById("report-keywords").value;
    const severity = document.getElementById("report-severity").value;
    const reference = document.getElementById("report-reference").value.trim();

    const keywords = keywordsRaw.split(",").map(k => k.trim().toLowerCase()).filter(k => k.length > 0);

    if (!selectedCreatorId || !claim || !correction || keywords.length === 0 || !reference) {
      alert("Por favor, rellene todos los campos requeridos.");
      return;
    }

    const newError = {
      id: "custom_" + Date.now(),
      keywords: keywords,
      claim: claim,
      correction: correction,
      severity: severity,
      reference: reference
    };

    try {
      const data = await chrome.storage.local.get("influencers");
      const currentInfluencers = data.influencers || [];
      
      const updatedInfluencers = currentInfluencers.map(inf => {
        if (inf.id === selectedCreatorId) {
          const errors = inf.errors || [];
          return {
            ...inf,
            errors: [...errors, newError]
          };
        }
        return inf;
      });

      await chrome.storage.local.set({ influencers: updatedInfluencers });
      
      // Actualizar estado local
      influencersData = updatedInfluencers;
      renderInfluencersList(influencersData);
      populateCreatorDropdown(influencersData);

      // Limpiar formulario y redirigir
      reportForm.reset();
      tabBtnInfluencers.click();

      // Desplegar la tarjeta del creador modificado
      const targetCard = document.getElementById(`creator-card-${selectedCreatorId}`);
      if (targetCard) {
        targetCard.classList.add("expanded");
        targetCard.scrollIntoView({ behavior: "smooth" });
      }

      await reloadActiveTabs();
    } catch (err) {
      console.error("Error al guardar auditoría:", err);
      alert("Error al guardar la auditoría en la base local.");
    }
  });

  // --- Módulo de Ajustes Avanzados ---

  // Renderizar interruptores de creadores específicos
  async function renderCreatorToggles(influencers) {
    creatorTogglesContainer.innerHTML = "";
    
    // Obtener estados actuales de habilitación por creador
    const keys = influencers.map(inf => `creatorEnabled_${inf.id}`);
    const currentToggles = await chrome.storage.local.get(keys);

    influencers.forEach(inf => {
      const toggleKey = `creatorEnabled_${inf.id}`;
      const isEnabled = currentToggles[toggleKey] !== false; // true por defecto

      const row = document.createElement("div");
      row.className = "settings-row";

      row.innerHTML = `
        <div class="settings-creator-info">
          <img class="settings-creator-avatar" src="${inf.avatar}">
          <span class="settings-creator-name">${escapeHTML(inf.name)}</span>
        </div>
        <label class="switch">
          <input type="checkbox" id="toggle-${inf.id}" ${isEnabled ? "checked" : ""}>
          <span class="slider"></span>
        </label>
      `;

      // Evento de cambio para cada interruptor
      const checkbox = row.querySelector("input");
      checkbox.addEventListener("change", async (e) => {
        await chrome.storage.local.set({ [toggleKey]: e.target.checked });
        await reloadActiveTabs();
      });

      creatorTogglesContainer.appendChild(row);
    });
  }

  // Exportar base de datos a JSON
  btnExportDb.addEventListener("click", () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(influencersData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "ai_sentinel_database.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Error al exportar:", err);
      alert("Error al exportar la base de datos.");
    }
  });

  // Importar base de datos desde un archivo JSON local
  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // Validación de estructura básica
        if (!Array.isArray(importedData)) {
          throw new Error("El archivo JSON debe contener un arreglo de creadores.");
        }

        const isValid = importedData.every(inf => 
          inf.id && 
          inf.name && 
          inf.handles && 
          Array.isArray(inf.errors)
        );

        if (!isValid) {
          throw new Error("Estructura de datos incorrecta. Falta campo 'id', 'name', 'handles' o 'errors'.");
        }

        // Guardar base de datos
        await chrome.storage.local.set({ influencers: importedData });
        
        // Limpiar interruptores antiguos
        const oldKeys = influencersData.map(inf => `creatorEnabled_${inf.id}`);
        await chrome.storage.local.remove(oldKeys);

        alert("Base de datos importada con éxito.");
        await loadState();
        await reloadActiveTabs();
      } catch (err) {
        console.error("Error al importar base de datos:", err);
        alert(`Error al importar: ${err.message}`);
      }
    };
    reader.readAsText(file);
  });

  // Restablecer base de datos a los valores predeterminados
  btnResetDb.addEventListener("click", async () => {
    if (!confirm("¿Está seguro de que desea restablecer la base de datos a los valores de fábrica? Perderá todos los reportes personalizados.")) {
      return;
    }

    try {
      const dbUrl = chrome.runtime.getURL("database/influencers.json");
      const response = await fetch(dbUrl);
      const defaultInfluencers = await response.json();
      
      // Limpiar interruptores de almacenamiento
      const keysToRemove = influencersData.map(inf => `creatorEnabled_${inf.id}`);
      keysToRemove.push("auditCount", "influencerStats", "ignoredElements");
      await chrome.storage.local.remove(keysToRemove);
      
      // Restablecer configuraciones
      await chrome.storage.local.set({
        influencers: defaultInfluencers,
        extensionEnabled: true,
        audioAlertsEnabled: true,
        auditCount: 0
      });

      alert("Restablecimiento completado.");
      await loadState();
      await reloadActiveTabs();
    } catch (err) {
      console.error("Error al restablecer base de datos:", err);
      alert("Error al restablecer los datos predeterminados.");
    }
  });

  // Función para escapar salida HTML
  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});
