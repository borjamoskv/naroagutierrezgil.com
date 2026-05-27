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
    cortisol: 0,
    smoothedEntropy: 0 // Used for WebGL shading
};

document.addEventListener('DOMContentLoaded', () => {
    const wsUrl = "ws://127.0.0.1:8081";
    let ws = null;
    
    // UI Elements
    const hudStatus = document.getElementById('ctx-status');
    const hudPulse = document.getElementById('ctx-pulse');
    const hudNodes = document.getElementById('ctx-nodes');
    const hudTasks = document.getElementById('ctx-tasks');
    const hudThroughput = document.getElementById('ctx-throughput');
    const hudExergy = document.getElementById('ctx-exergy');

    function connect() {
        try {
            ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                window.CORTEX_TELEMETRY.connected = true;
                if(hudStatus) {
                    hudStatus.innerText = "LINKED: C5-REAL";
                    hudStatus.style.color = "#2B3BE5"; // Sovereign Blue
                }
                if(hudPulse) {
                    hudPulse.classList.add('active');
                }
            };
            
            ws.onmessage = (event) => {
                const payload = JSON.parse(event.data);
                if (payload.metrics) {
                    window.CORTEX_TELEMETRY.activeNodes = payload.metrics.active_nodes || 0;
                    window.CORTEX_TELEMETRY.activeTasks = payload.metrics.active_tasks || 0;
                    window.CORTEX_TELEMETRY.throughput = payload.metrics.throughput_agents_sec || 0;
                    window.CORTEX_TELEMETRY.ringBuffer = payload.metrics.ring_buffer_utilization || 0;
                    window.CORTEX_TELEMETRY.exergy = payload.metrics.exergy_consumption_j || 0;
                    window.CORTEX_TELEMETRY.cortisol = payload.metrics.cortisol_level || 0;
                    
                    // Update DOM HUD
                    if(hudNodes) hudNodes.innerText = `NODES: ${window.CORTEX_TELEMETRY.activeNodes}`;
                    if(hudTasks) hudTasks.innerText = `TASKS: ${window.CORTEX_TELEMETRY.activeTasks}`;
                    if(hudThroughput) hudThroughput.innerText = `TPUT: ${(window.CORTEX_TELEMETRY.throughput / 1000).toFixed(2)} k/s`;
                    if(hudExergy) hudExergy.innerText = `EXERGY: ${window.CORTEX_TELEMETRY.exergy.toFixed(4)} J`;
                    
                    // Update Cortisol with stress-based color grading
                    const hudCortisolElements = document.querySelectorAll('#ctx-cortisol');
                    hudCortisolElements.forEach(el => {
                        el.innerText = `CORTISOL: ${window.CORTEX_TELEMETRY.cortisol.toFixed(2)}`;
                        if(window.CORTEX_TELEMETRY.cortisol > 0.8) el.style.color = "#E52B50"; // Danger Red
                        else if(window.CORTEX_TELEMETRY.cortisol > 0.4) el.style.color = "#FF9F1C"; // Amber
                        else el.style.color = "#2B3BE5"; // YInMn Blue
                    });

                    // C5-REAL Convergence Falsation
                    const isConverging = (window.CORTEX_TELEMETRY.activeNodes > 0 && window.CORTEX_TELEMETRY.cortisol < 0.25 && window.CORTEX_TELEMETRY.exergy > 0.01) || (payload.metrics.convergence_status === "CONVERGED");
                    
                    const hudContainer = document.querySelector('.cortex-telemetry-hud');
                    if (hudContainer) {
                        if (isConverging) hudContainer.classList.add('converging');
                        else hudContainer.classList.remove('converging');
                    }
                    
                    if (hudPulse) {
                        if (isConverging) hudPulse.classList.add('converging-pulse');
                        else hudPulse.classList.remove('converging-pulse');
                    }
                    
                    const statusElements = document.querySelectorAll('#ctx-status');
                    statusElements.forEach(el => {
                        if (isConverging) {
                            el.innerText = "C5-REAL // CONVERGED";
                            el.style.color = "#F3F4F6";
                        } else {
                            el.innerText = "C5-REAL // NOMINAL";
                            el.style.color = "#2B3BE5";
                        }
                    });
                }
            };
            
            ws.onclose = () => {
                window.CORTEX_TELEMETRY.connected = false;
                if(hudStatus) {
                    hudStatus.innerText = "OFFLINE / STANDBY";
                    hudStatus.style.color = "#FF9F1C"; // Amber
                }
                if(hudPulse) {
                    hudPulse.classList.remove('active');
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
        let targetEntropy = window.CORTEX_TELEMETRY.connected ? 
            (window.CORTEX_TELEMETRY.exergy * 20.0) : 0.1;
        
        // clamp
        targetEntropy = Math.max(0.1, Math.min(3.0, targetEntropy));
        
        // LERP
        window.CORTEX_TELEMETRY.smoothedEntropy += (targetEntropy - window.CORTEX_TELEMETRY.smoothedEntropy) * 0.05;
    }
    telemetryLoop();
});
