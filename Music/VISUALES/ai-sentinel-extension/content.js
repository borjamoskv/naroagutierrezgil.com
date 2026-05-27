// AI Sentinel - Content Script (Monitoreo e Interacciones)

(async () => {
  // Cargar toda la configuración desde el almacenamiento local
  let allSettings = await chrome.storage.local.get(null);
  
  if (allSettings.extensionEnabled === false) {
    console.log("AI Sentinel está desactivado globalmente.");
    return;
  }

  const influencers = allSettings.influencers || [];
  if (influencers.length === 0) {
    console.log("AI Sentinel: Base de datos de influencers vacía.");
    return;
  }

  // Lista de hashes de publicaciones ignoradas (lista blanca local)
  let ignoredElements = new Set(allSettings.ignoredElements || []);

  console.log("AI Sentinel v1.2 activo. Vigilando divulgadores de IA en español...");

  // Inicializar elemento de Tooltip compartido en el Body
  let tooltipEl = document.getElementById("ai-sentinel-tooltip-root");
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "ai-sentinel-tooltip-root";
    document.body.appendChild(tooltipEl);
  }

  let tooltipTimeout = null;
  let activeElementForTooltip = null;
  let activeTextHashForTooltip = "";

  // Mostrar tooltip flotante
  function showTooltip(event, influencerName, errorObj, badgeEl, textHash, targetElement) {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    
    activeElementForTooltip = targetElement;
    activeTextHashForTooltip = textHash;

    tooltipEl.innerHTML = `
      <div class="ai-sentinel-tooltip-header">
        <span class="ai-sentinel-tooltip-title">${escapeHTML(influencerName)}</span>
        <span class="ai-sentinel-tooltip-severity ai-sentinel-severity-${errorObj.severity}">${errorObj.severity}</span>
      </div>
      <div class="ai-sentinel-tooltip-claim">
        <strong>Afirmación:</strong> "${escapeHTML(errorObj.claim)}"
      </div>
      <div class="ai-sentinel-tooltip-correction">
        <strong>Auditoría:</strong> ${escapeHTML(errorObj.correction)}
      </div>
      <div class="ai-sentinel-tooltip-ref">
        <strong>Ref:</strong> ${escapeHTML(errorObj.reference)}
      </div>
      <div class="ai-sentinel-tooltip-footer">
        <button id="ai-sentinel-ignore-btn" class="ai-sentinel-ignore-btn">Omitir marca</button>
      </div>
    `;

    // Vincular evento de ignorar / lista blanca
    tooltipEl.querySelector("#ai-sentinel-ignore-btn").addEventListener("click", async () => {
      if (activeElementForTooltip && activeTextHashForTooltip) {
        // Guardar en la lista blanca de almacenamiento local
        ignoredElements.add(activeTextHashForTooltip);
        const currentIgnored = await chrome.storage.local.get("ignoredElements");
        const list = currentIgnored.ignoredElements || [];
        if (!list.includes(activeTextHashForTooltip)) {
          list.push(activeTextHashForTooltip);
          await chrome.storage.local.set({ ignoredElements: list });
        }

        // Eliminar marca visual del elemento
        activeElementForTooltip.classList.remove("ai-sentinel-highlighted");
        const badge = activeElementForTooltip.querySelector(".ai-sentinel-badge");
        if (badge) badge.remove();
        
        // Ocultar tooltip
        tooltipEl.classList.remove("visible");
      }
    });

    const rect = badgeEl.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    let top = rect.top + scrollTop - tooltipEl.offsetHeight - 10;
    let left = rect.left + scrollLeft + (rect.width / 2) - (tooltipEl.offsetWidth / 2);

    if (top < scrollTop) {
      top = rect.bottom + scrollTop + 10;
    }
    if (left < 10) {
      left = 10;
    } else if (left + tooltipEl.offsetWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipEl.offsetWidth - 10;
    }

    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.left = `${left}px`;
    tooltipEl.classList.add("visible");
  }

  function hideTooltip() {
    tooltipTimeout = setTimeout(() => {
      tooltipEl.classList.remove("visible");
    }, 500);
  }

  tooltipEl.addEventListener("mouseenter", () => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
  });
  tooltipEl.addEventListener("mouseleave", hideTooltip);

  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Generar un hash determinista a partir del texto de la publicación para identificarlo de forma única
  function generateTextHash(text) {
    if (!text) return "";
    // Limpiar texto para evitar fallos de formato y tomar los primeros 100 caracteres
    const cleanStr = text.trim().substring(0, 120).replace(/[^a-zA-Z0-9íóúáéñ]/g, "").toLowerCase();
    // Simular base64 seguro offline
    try {
      return btoa(unescape(encodeURIComponent(cleanStr)));
    } catch (e) {
      return cleanStr;
    }
  }

  // Comprobar si el creador específico está habilitado en Ajustes
  function isCreatorEnabled(creatorId) {
    const toggleKey = `creatorEnabled_${creatorId}`;
    return allSettings[toggleKey] !== false; // true por defecto
  }

  // Generar tono de audio sintético (Web Audio API)
  function playAuditBeep() {
    if (allSettings.audioAlertsEnabled === false) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      // Tono A3 (220 Hz) suave y de baja frecuencia para evitar molestias
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime); // Volumen suave
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35); // Apagado en 350ms

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn("No se pudo reproducir la alerta sonora de auditoría:", e);
    }
  }

  // Detección de Plataformas
  const hostname = window.location.hostname;
  const isTwitter = hostname.includes("twitter.com") || hostname.includes("x.com");
  const isYouTube = hostname.includes("youtube.com");
  const isLinkedIn = hostname.includes("linkedin.com");
  const isSubstack = hostname.includes("substack.com");

  // Motor Core de Marcado en Páginas
  async function auditElement(element, textContent, influencer, errorObj, badgeParentSelector, placementFn) {
    if (!isCreatorEnabled(influencer.id)) return;

    // Calcular hash del contenido para omitir si el usuario lo marcó en lista blanca
    const textHash = generateTextHash(textContent);
    if (ignoredElements.has(textHash)) return;

    const auditId = `${influencer.id}-${errorObj.id}`;
    const alreadyAudited = element.getAttribute("data-ai-sentinel-flagged") || "";
    if (alreadyAudited.includes(auditId)) return;

    element.setAttribute("data-ai-sentinel-flagged", alreadyAudited ? `${alreadyAudited},${auditId}` : auditId);
    element.classList.add("ai-sentinel-highlighted");

    // Incrementar estadísticas en background con ID del creador
    try {
      await chrome.runtime.sendMessage({ 
        action: "incrementAuditCount", 
        influencerId: influencer.id 
      });
    } catch (err) {}

    await new Promise(resolve => requestAnimationFrame(() => {
      const badgeParent = badgeParentSelector ? element.querySelector(badgeParentSelector) : element;
      if (!badgeParent) {
        resolve();
        return;
      }

      if (badgeParent.querySelector(`.ai-sentinel-badge[data-error-id="${errorObj.id}"]`)) {
        resolve();
        return;
      }

      const badge = document.createElement("span");
      badge.className = "ai-sentinel-badge";
      badge.setAttribute("data-error-id", errorObj.id);
      badge.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        AI Sentinel Audit
      `;

      badge.addEventListener("mouseenter", (e) => showTooltip(e, influencer.name, errorObj, badge, textHash, element));
      badge.addEventListener("mouseleave", hideTooltip);

      if (placementFn) {
        placementFn(badgeParent, badge);
      } else {
        badgeParent.appendChild(badge);
      }
      
      resolve();
    }));
  }

  // Procesamiento por lotes asíncrono
  async function processBatch(elements, processFn) {
    const BATCH_SIZE = 8;
    for (let i = 0; i < elements.length; i += BATCH_SIZE) {
      const batch = Array.from(elements).slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(el => processFn(el)));
      if (globalThis.scheduler?.yield) {
        await scheduler.yield();
      } else {
        await new Promise(r => setTimeout(r, 0));
      }
    }
  }

  // --- Twitter / X ---
  async function scanTwitter() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]:not([data-ai-sentinel-processed])');
    if (tweets.length === 0) return;

    await processBatch(tweets, async (tweet) => {
      tweet.setAttribute("data-ai-sentinel-processed", "true");

      const userNameContainer = tweet.querySelector('div[data-testid="User-Name"]');
      if (!userNameContainer) return;

      const spans = userNameContainer.querySelectorAll('span');
      let handle = "";
      for (const span of spans) {
        const text = span.textContent.trim();
        if (text.startsWith("@")) {
          handle = text.substring(1);
          break;
        }
      }

      if (!handle) return;

      const match = influencers.find(inf => inf.handles.twitter?.toLowerCase() === handle.toLowerCase());
      if (!match || !isCreatorEnabled(match.id)) return;

      const tweetTextEl = tweet.querySelector('div[data-testid="tweetText"]');
      if (!tweetTextEl) return;

      const tweetText = tweetTextEl.textContent.toLowerCase();

      for (const err of match.errors) {
        const matchedKeyword = err.keywords.find(kw => tweetText.includes(kw.toLowerCase()));
        if (matchedKeyword) {
          await auditElement(
            tweet,
            tweetText,
            match,
            err,
            'div[data-testid="User-Name"]',
            (parent, badge) => {
              const firstLink = parent.querySelector('a');
              if (firstLink) {
                firstLink.parentNode.insertBefore(badge, firstLink.nextSibling);
              } else {
                parent.appendChild(badge);
              }
            }
          );
        }
      }
    });
  }

  // --- LinkedIn ---
  async function scanLinkedIn() {
    const posts = document.querySelectorAll('div.feed-shared-update-v2:not([data-ai-sentinel-processed]), div[data-urn]:not([data-ai-sentinel-processed])');
    if (posts.length === 0) return;

    await processBatch(posts, async (post) => {
      post.setAttribute("data-ai-sentinel-processed", "true");

      const actorNameEl = post.querySelector('.update-components-actor__title, .update-components-actor__name, span[class*="actor__name"]');
      if (!actorNameEl) return;

      const actorName = actorNameEl.textContent.trim().toLowerCase();
      if (!actorName) return;

      const match = influencers.find(inf => actorName.includes(inf.name.toLowerCase().split(" (")[0]));
      if (!match || !isCreatorEnabled(match.id)) return;

      const textEl = post.querySelector('.feed-shared-update-v2__description-wrapper, .update-components-text, span[class*="update-v2__description"]');
      if (!textEl) return;

      const postText = textEl.textContent.toLowerCase();

      for (const err of match.errors) {
        const matchedKeyword = err.keywords.find(kw => postText.includes(kw.toLowerCase()));
        if (matchedKeyword) {
          await auditElement(
            post,
            postText,
            match,
            err,
            '.update-components-actor__title, .update-components-actor__name',
            (parent, badge) => {
              parent.appendChild(badge);
            }
          );
        }
      }
    });
  }

  // --- Substack ---
  async function scanSubstack() {
    // Buscar contenedores de artículos o cuerpo del post
    const posts = document.querySelectorAll('.post:not([data-ai-sentinel-processed]), article:not([data-ai-sentinel-processed]), .post-page:not([data-ai-sentinel-processed])');
    if (posts.length === 0) return;

    // Obtener identificador del sitio desde el subdominio
    const subdomain = window.location.hostname.split('.')[0].toLowerCase();
    
    // Buscar creador relacionado
    const match = influencers.find(inf => 
      inf.id === subdomain || 
      inf.handles.twitter?.toLowerCase() === subdomain ||
      (inf.id === "mafiaia" && subdomain.includes("mafiaia"))
    );

    if (!match || !isCreatorEnabled(match.id)) return;

    await processBatch(posts, async (post) => {
      post.setAttribute("data-ai-sentinel-processed", "true");

      // Buscar texto del post (título + cuerpo)
      const titleEl = post.querySelector('.post-title, h1');
      const bodyEl = post.querySelector('.post-content, .markup, .body');
      
      const titleText = titleEl ? titleEl.textContent : "";
      const bodyText = bodyEl ? bodyEl.textContent : "";
      const combinedText = `${titleText} ${bodyText}`.toLowerCase();

      for (const err of match.errors) {
        const matchedKeyword = err.keywords.find(kw => combinedText.includes(kw.toLowerCase()));
        if (matchedKeyword) {
          // Flag el título o cabecera del artículo
          await auditElement(
            post,
            combinedText,
            match,
            err,
            '.post-header, h1',
            (parent, badge) => {
              parent.appendChild(badge);
            }
          );
        }
      }
    });
  }

  // --- YouTube Real-Time Caption & DOM ---
  let activeYouTubeInfluencer = null;
  let youtubeCaptionsObserver = null;
  let recentAlertsMemory = new Set();
  let alertTimeout = null;

  async function scanYouTube() {
    if (!window.location.pathname.includes("/watch")) {
      activeYouTubeInfluencer = null;
      if (youtubeCaptionsObserver) {
        youtubeCaptionsObserver.disconnect();
        youtubeCaptionsObserver = null;
      }
      return;
    }

    const channelLinkEl = document.querySelector("#upload-info ytd-channel-name a, ytd-video-owner-renderer a.yt-formatted-string, .ytd-channel-name a");
    if (!channelLinkEl) return;

    const channelHref = channelLinkEl.getAttribute("href") || "";
    let handle = "";
    if (channelHref.includes("/@")) {
      handle = channelHref.split("/@")[1].split("?")[0].split("/")[0];
    }

    if (!handle) return;

    const match = influencers.find(inf => 
      inf.handles.youtube?.toLowerCase() === handle.toLowerCase() ||
      inf.handles.twitter?.toLowerCase() === handle.toLowerCase()
    );

    if (!match || !isCreatorEnabled(match.id)) {
      activeYouTubeInfluencer = null;
      return;
    }

    activeYouTubeInfluencer = match;

    // 1. Auditar Título y Descripción estática
    const titleEl = document.querySelector("ytd-watch-metadata #title h1, h1.ytd-watch-metadata, #container > h1.title");
    const descEl = document.querySelector("#description-inline-expander, ytd-text-inline-expander, #description-wrapper");
    if (titleEl) {
      const titleText = titleEl.textContent.toLowerCase();
      const descText = descEl ? descEl.textContent.toLowerCase() : "";
      const combinedText = `${titleText} ${descText}`;

      for (const err of match.errors) {
        const matchedKeyword = err.keywords.find(kw => combinedText.includes(kw.toLowerCase()));
        if (matchedKeyword) {
          await auditElement(
            titleEl,
            combinedText,
            match,
            err,
            null,
            (parent, badge) => parent.appendChild(badge)
          );
        }
      }
    }

    // 2. Escuchar y Auditar Subtítulos (Captions) en tiempo real
    setupYouTubeCaptionsObserver();
  }

  // Observer de subtítulos de YouTube
  function setupYouTubeCaptionsObserver() {
    if (youtubeCaptionsObserver) return;

    const captionsContainer = document.querySelector(".ytp-caption-window-container");
    if (!captionsContainer) {
      setTimeout(setupYouTubeCaptionsObserver, 1500);
      return;
    }

    youtubeCaptionsObserver = new MutationObserver(() => {
      if (!activeYouTubeInfluencer) return;

      const segments = document.querySelectorAll(".ytp-caption-segment");
      if (segments.length === 0) return;

      const captionText = Array.from(segments).map(s => s.textContent).join(" ").toLowerCase();

      for (const err of activeYouTubeInfluencer.errors) {
        const matchedKeyword = err.keywords.find(kw => captionText.includes(kw.toLowerCase()));
        if (matchedKeyword) {
          const uniqueKey = `${activeYouTubeInfluencer.id}-${err.id}-${matchedKeyword}`;
          
          if (recentAlertsMemory.has(uniqueKey)) continue;
          
          recentAlertsMemory.add(uniqueKey);
          setTimeout(() => recentAlertsMemory.delete(uniqueKey), 60000);

          showRealTimeCaptionAlert(activeYouTubeInfluencer, err);
        }
      }
    });

    youtubeCaptionsObserver.observe(captionsContainer, {
      childList: true,
      subtree: true
    });
    
    console.log("AI Sentinel: Escáner de subtítulos en tiempo real activado para YouTube.");
  }

  // Mostrar alerta interactiva en el reproductor de YouTube
  function showRealTimeCaptionAlert(influencer, errorObj) {
    const playerEl = document.querySelector("#movie_player, .html5-video-player, #ytd-player");
    if (!playerEl) return;

    let alertEl = document.getElementById("ai-sentinel-caption-alert");
    if (!alertEl) {
      alertEl = document.createElement("div");
      alertEl.id = "ai-sentinel-caption-alert";
      playerEl.appendChild(alertEl);
    }

    if (alertTimeout) clearTimeout(alertTimeout);

    alertEl.innerHTML = `
      <div class="ai-sentinel-alert-header">
        <span class="ai-sentinel-alert-tag">⚠️ AI Sentinel Audit (Audio)</span>
        <button class="ai-sentinel-alert-close" id="ai-sentinel-alert-close-btn">&times;</button>
      </div>
      <div class="ai-sentinel-alert-text">Mito en audio: "${escapeHTML(errorObj.claim)}"</div>
      <div class="ai-sentinel-alert-correction">
        <strong>Realidad:</strong> ${escapeHTML(errorObj.correction)}
      </div>
      <div class="ai-sentinel-alert-ref">Ref: ${escapeHTML(errorObj.reference)}</div>
    `;

    alertEl.querySelector("#ai-sentinel-alert-close-btn").addEventListener("click", () => {
      alertEl.classList.remove("slide-in");
    });

    // Deslizar alerta
    alertEl.classList.add("slide-in");

    // Reproducir pitido de alerta sonora
    playAuditBeep();

    // Incrementar estadísticas locales con ID
    try {
      chrome.runtime.sendMessage({ 
        action: "incrementAuditCount", 
        influencerId: influencer.id 
      });
    } catch (e) {}

    // Ocultar a los 8 segundos
    alertTimeout = setTimeout(() => {
      alertEl.classList.remove("slide-in");
    }, 8000);
  }

  // Lanzador Unificado
  async function performScan() {
    try {
      if (isTwitter) {
        await scanTwitter();
      } else if (isYouTube) {
        await scanYouTube();
      } else if (isLinkedIn) {
        await scanLinkedIn();
      } else if (isSubstack) {
        await scanSubstack();
      }
    } catch (error) {
      console.error("AI Sentinel scan error:", error);
    }
  }

  // Ejecutar escaneo inicial
  await performScan();

  // Escucha reactiva a cambios del DOM (Debounced)
  let debounceTimeout = null;
  const observer = new MutationObserver(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(performScan, 300);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
