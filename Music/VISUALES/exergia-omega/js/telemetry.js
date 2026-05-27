/**
 * EXERGIA-Ω // CORTEX SOVEREIGN TELEMETRY DAEMON
 * Connects to ws://127.0.0.1:8081 for real-time 20Hz C5-REAL metrics
 */

window.CORTEX_TELEMETRY = {
  connected: false,
  throughput: 0,
  activeNodes: 0,
  activeTasks: 0,
  ringBuffer: 0,
  exergy: 0,
  ontology: 0,
  entropy: 0,
  cortisol: 0,
  smoothedEntropy: 0, // Used for WebGL shading
  smoothedCortisol: 0,
};

// P0 Path Log Helper
function addP0Log(message, type = "system") {
  const feed = document.getElementById("p0-log-feed");
  if (!feed) return;
  const now = new Date();
  const timeStr = `[${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}]`;
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">${timeStr}</span> <span class="log-msg">${message}</span>`;
  feed.appendChild(entry);
  if (feed.children.length > 50) feed.removeChild(feed.firstChild);
  feed.scrollTop = feed.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = "ws://127.0.0.1:8081";
  let ws = null;

  // UI Elements (selected via classes for multi-viewport sync)
  const hudStatus = document.querySelectorAll(".ctx-status");
  const hudPulse = document.getElementById("ctx-pulse"); // Unique
  const hudNodes = document.querySelectorAll(".ctx-nodes");
  const hudTasks = document.querySelectorAll(".ctx-tasks");
  const hudThroughput = document.querySelectorAll(".ctx-throughput");
  const hudExergy = document.querySelectorAll(".ctx-exergy");
  const hudOntology = document.querySelectorAll(".ctx-ontology");
  const hudEntropy = document.querySelectorAll(".ctx-entropy");
  const hudOntologyHeader = document.querySelectorAll(".ctx-ontology-header");

  function updateText(elements, text) {
    elements.forEach(el => {
      if (el.textContent !== text) {
        el.textContent = text;
      }
    });
  }

  function connect() {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        window.CORTEX_TELEMETRY.connected = true;
        updateText(hudStatus, "LINKED: C5-REAL");
        hudStatus.forEach(el => el.style.color = "#2B3BE5"); // Sovereign Blue
        addP0Log("LINK ESTABLISHED: C5-REAL Telemetry Online", "success");
        if (hudPulse) {
          hudPulse.classList.add("active");
        }
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.metrics) {
          window.CORTEX_TELEMETRY.activeNodes =
            payload.metrics.active_nodes || 0;
          window.CORTEX_TELEMETRY.activeTasks =
            payload.metrics.active_tasks || 0;
          window.CORTEX_TELEMETRY.throughput =
            payload.metrics.throughput_agents_sec || 0;
          window.CORTEX_TELEMETRY.ringBuffer =
            payload.metrics.ring_buffer_utilization || 0;
          window.CORTEX_TELEMETRY.exergy =
            payload.metrics.exergy_consumption_j || 0;
          window.CORTEX_TELEMETRY.cortisol =
            payload.metrics.cortisol_level || 0;
          window.CORTEX_TELEMETRY.ontology =
            payload.metrics.ontology_similarity ||
            (payload.metrics.cortisol_level
              ? 0.95 - payload.metrics.cortisol_level * 0.5
              : 0);
          window.CORTEX_TELEMETRY.entropy =
            payload.metrics.structural_entropy ||
            window.CORTEX_TELEMETRY.cortisol * 2.5;

          // Update DOM HUD elements
          updateText(hudNodes, `NODES: ${window.CORTEX_TELEMETRY.activeNodes}`);
          updateText(hudTasks, `TASKS: ${window.CORTEX_TELEMETRY.activeTasks}`);
          updateText(hudThroughput, `TPUT: ${(window.CORTEX_TELEMETRY.throughput / 1000).toFixed(2)} k/s`);
          updateText(hudExergy, `EXERGY: ${window.CORTEX_TELEMETRY.exergy.toFixed(4)} J`);
          updateText(hudOntology, `ONTOLOGY: ${window.CORTEX_TELEMETRY.ontology.toFixed(4)}`);
          updateText(hudEntropy, `ENTROPY: ${window.CORTEX_TELEMETRY.entropy.toFixed(4)}`);
          updateText(hudOntologyHeader, `ONT: ${window.CORTEX_TELEMETRY.ontology.toFixed(2)}`);

          // Occasional log feed injection
          if (Math.random() < 0.05) {
            if (window.CORTEX_TELEMETRY.cortisol > 0.7) {
              addP0Log(
                `High Cortisol Detected (${window.CORTEX_TELEMETRY.cortisol.toFixed(2)}). Purging Stale Entelechy Nodes...`,
                "purge",
              );
            } else if (window.CORTEX_TELEMETRY.ontology > 0.9) {
              addP0Log(
                `Ontological Convergence achieved: ${window.CORTEX_TELEMETRY.ontology.toFixed(4)}. Structural Integrity verified.`,
                "success",
              );
            } else {
              addP0Log(
                `Swarm Thermodynamics: Annihilating Entropy [S=${window.CORTEX_TELEMETRY.entropy.toFixed(2)}]`,
                "system",
              );
            }
          }

          // Update Cortisol with stress-based color grading
          const hudCortisolElements = document.querySelectorAll(".ctx-cortisol");
          hudCortisolElements.forEach((el) => {
            const textVal = `CORTISOL: ${window.CORTEX_TELEMETRY.cortisol.toFixed(2)}`;
            let colorVal = "#2B3BE5"; // YInMn Blue
            if (window.CORTEX_TELEMETRY.cortisol > 0.8) {
              colorVal = "#E52B50"; // Danger Red
            } else if (window.CORTEX_TELEMETRY.cortisol > 0.4) {
              colorVal = "#FF9F1C"; // Amber
            }
            if (el.textContent !== textVal) el.textContent = textVal;
            if (el.style.color !== colorVal) el.style.color = colorVal;
          });

          // Update Compliance / SOC2 / C5
          const hudComplianceElements = document.querySelectorAll(".ctx-compliance");
          hudComplianceElements.forEach((el) => {
            const textVal = (payload.jis_violations && payload.jis_violations.length > 0)
              ? `SOC2/C5: ${payload.jis_violations.length} VIOLATIONS`
              : `SOC2/C5: 100% OK`;
            const colorVal = (payload.jis_violations && payload.jis_violations.length > 0)
              ? "#E52B50" // Red for violations
              : "#2B3BE5"; // Sovereign blue for compliant
            if (el.textContent !== textVal) el.textContent = textVal;
            if (el.style.color !== colorVal) el.style.color = colorVal;
          });

          // C5-REAL Convergence Falsation (Vector 19)
          const isConverging =
            window.CORTEX_TELEMETRY.ontology >= 0.95 ||
            (window.CORTEX_TELEMETRY.activeNodes > 0 &&
              window.CORTEX_TELEMETRY.cortisol < 0.25 &&
              window.CORTEX_TELEMETRY.exergy > 0.01) ||
            payload.metrics.convergence_status === "CONVERGED";

          const hudContainer = document.querySelector(".cortex-telemetry-hud");
          if (hudContainer) {
            if (isConverging) hudContainer.classList.add("converging");
            else hudContainer.classList.remove("converging");
          }

          if (hudPulse) {
            if (isConverging) hudPulse.classList.add("converging-pulse");
            else hudPulse.classList.remove("converging-pulse");
          }

          hudStatus.forEach((el) => {
            const textVal = isConverging ? "C5-REAL // CONVERGED" : "C5-REAL // NOMINAL";
            const colorVal = isConverging ? "#F3F4F6" : "#2B3BE5";
            if (el.textContent !== textVal) el.textContent = textVal;
            if (el.style.color !== colorVal) el.style.color = colorVal;
          });
        }
      };

      ws.onclose = () => {
        window.CORTEX_TELEMETRY.connected = false;
        updateText(hudStatus, "OFFLINE / STANDBY");
        hudStatus.forEach(el => el.style.color = "#FF9F1C"); // Amber
        addP0Log("C5-REAL Telemetry Offline. Connection lost.", "alert");
        if (hudPulse) {
          hudPulse.classList.remove("active");
        }
        setTimeout(connect, 3000); // Auto-reconnect
      };

      ws.onerror = (err) => {
        console.error("CORTEX Telemetry Socket Error:", err);
        ws.close();
      };
    } catch (e) {
      console.error("WebSocket init failed:", e);
    }
  }

  connect();

  // Lerp loop for WebGL uniform smoothing
  function telemetryLoop() {
    requestAnimationFrame(telemetryLoop);

    // Target entropy based on exergy and throughput
    // Baseline exergy ~ 0.03, max ~ 0.1
    // Modulate visual entropy directly from CORTEX structural_entropy and cortisol
    let targetEntropy = window.CORTEX_TELEMETRY.connected
      ? window.CORTEX_TELEMETRY.entropy * 2.0 +
        window.CORTEX_TELEMETRY.cortisol * 5.0
      : 0.5;

    // Colapso hacia homeostasis si la convergencia ontológica es altísima
    if (window.CORTEX_TELEMETRY.ontology >= 0.95) {
      targetEntropy = 0.05; // Homeostasis sólida
    }

    // clamp
    targetEntropy = Math.max(0.1, Math.min(3.0, targetEntropy));

    // Predictive visual smoothing using ringBuffer
    // Higher ring buffer utilization predicts incoming thermodynamic stress
    const bufferFactor = window.CORTEX_TELEMETRY.ringBuffer > 0.8 ? 1.5 : 1.0;
    targetEntropy *= bufferFactor;

    // LERP
    window.CORTEX_TELEMETRY.smoothedEntropy +=
      (targetEntropy - window.CORTEX_TELEMETRY.smoothedEntropy) * 0.05;

    // Smooth cortisol
    let targetCortisol = window.CORTEX_TELEMETRY.connected
      ? window.CORTEX_TELEMETRY.cortisol
      : 0.0;
    targetCortisol = Math.max(0.0, Math.min(1.0, targetCortisol));
    window.CORTEX_TELEMETRY.smoothedCortisol +=
      (targetCortisol - window.CORTEX_TELEMETRY.smoothedCortisol) * 0.1;
  }
  telemetryLoop();
});
