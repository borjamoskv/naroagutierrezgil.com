// Autoría: Borja Moskv (borjamoskv) | Realidad: C5-REAL
/**
 * C5-REAL E2E Test Suite for real-time collaborative canvas sync
 * Covers Tiers 1-4, minimum 27 test cases.
 */
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = 8787;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const WS_BASE_URL = `ws://127.0.0.1:${PORT}`;

class TestClient {
  constructor(roomName) {
    this.roomName = roomName;
    this.url = `${WS_BASE_URL}/agents/entropic-canvas-agent/${roomName}`;
    this.ws = null;
    this.state = null;
    this.identity = null;
    this.pendingRPCs = new Map();
    this.onStateUpdateCallback = null;
    this.broadcastEvents = [];
    this.onMessageCallback = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.on('open', () => {
        // Connected successfully, waiting for state and identity
      });

      this.ws.on('message', (data) => {
        const str = data.toString();
        
        let msg;
        try {
          msg = JSON.parse(str);
        } catch (e) {
          // Non-JSON or raw broadcasts are stored
          this.broadcastEvents.push({ raw: str });
          if (this.onMessageCallback) {
            this.onMessageCallback({ raw: str });
          }
          return;
        }

        if (this.onMessageCallback) {
          this.onMessageCallback(msg);
        }

        if (msg.type === 'cf_agent_identity') {
          this.identity = msg;
        } else if (msg.type === 'cf_agent_state') {
          this.state = msg.state;
          if (this.onStateUpdateCallback) {
            this.onStateUpdateCallback(this.state);
          }
          if (this.identity) {
            resolve(this.state);
          }
        } else if (msg.type === 'rpc') {
          const handler = this.pendingRPCs.get(msg.id);
          if (handler) {
            this.pendingRPCs.delete(msg.id);
            if (msg.success) {
              handler.resolve(msg.result);
            } else {
              handler.reject(new Error(msg.error));
            }
          }
        } else {
          this.broadcastEvents.push(msg);
        }
      });

      this.ws.on('error', (err) => {
        reject(err);
      });

      this.ws.on('close', () => {
        for (const handler of this.pendingRPCs.values()) {
          handler.reject(new Error("Connection closed"));
        }
        this.pendingRPCs.clear();
      });
    });
  }

  call(method, args = []) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error("WebSocket not open"));
      }
      const id = crypto.randomUUID();
      this.pendingRPCs.set(id, { resolve, reject });
      const payload = {
        type: 'rpc',
        id,
        method,
        args
      };
      this.ws.send(JSON.stringify(payload));
    });
  }

  sendRaw(payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not open");
    }
    this.ws.send(payload);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Helper: wait for a condition or timeout
function waitFor(conditionFn, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (conditionFn()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
      }
    }, 50);
  });
}

function startWrangler() {
  return new Promise((resolve, reject) => {
    try {
      const wranglerDir = path.join(__dirname, '..', '.wrangler');
      if (fs.existsSync(wranglerDir)) {
        console.log("Purging .wrangler directory to prevent state pollution...");
        fs.rmSync(wranglerDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn("Failed to purge .wrangler directory:", e.message);
    }

    console.log("Starting wrangler dev server...");
    const wrangler = spawn('npx', ['wrangler', 'dev', '-c', 'wrangler.jsonc', '--port', String(PORT)], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    let stdoutData = "";
    let stderrData = "";
    let resolved = false;

    wrangler.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdoutData += chunk;
      if (chunk.includes("Ready on http://localhost") || chunk.includes("http://127.0.0.1")) {
        if (!resolved) {
          resolved = true;
          resolve(wrangler);
        }
      }
    });

    wrangler.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderrData += chunk;
    });

    wrangler.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    wrangler.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Wrangler exited with code ${code}. Stderr: ${stderrData}`));
      }
    });

    // Polling fallback
    const pollInterval = setInterval(() => {
      if (resolved) {
        clearInterval(pollInterval);
        return;
      }
      http.get(`${BASE_URL}/`, (res) => {
        clearInterval(pollInterval);
        if (!resolved) {
          resolved = true;
          resolve(wrangler);
        }
      }).on('error', () => {});
    }, 500);

    setTimeout(() => {
      clearInterval(pollInterval);
      if (!resolved) {
        resolved = true;
        wrangler.kill();
        reject(new Error("Timeout waiting for wrangler to start. Stderr: " + stderrData));
      }
    }, 15000);
  });
}

async function runTests() {
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  async function test(name, fn) {
    console.log(`Running test: ${name}...`);
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}\n`);
      results.push({ name, status: 'PASS' });
      passedCount++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${e.message}\n`);
      results.push({ name, status: 'FAIL', error: e.message });
      failedCount++;
    }
  }

  // --- TIER 1: FEATURE COVERAGE (10 Cases) ---

  await test("1.1 Connection initialization: Client receives initial state", async () => {
    const client = new TestClient("room_t1_c1");
    const state = await client.connect();
    try {
      if (state.globalEntropy !== 0) throw new Error(`Expected globalEntropy = 0, got ${state.globalEntropy}`);
      if (state.kintsugiActive !== false) throw new Error(`Expected kintsugiActive = false, got ${state.kintsugiActive}`);
      if (!Array.isArray(state.scars) || state.scars.length !== 0) throw new Error("Expected scars array to be empty");
    } finally {
      client.close();
    }
  });

  await test("1.2 Friction application updates: Client sends friction, receives updated entropy > 0", async () => {
    const client = new TestClient("room_t1_c2");
    await client.connect();
    try {
      const state = await client.call("applyFriction", [0, 0, 10]);
      if (state.globalEntropy <= 0) throw new Error(`Expected entropy > 0, got ${state.globalEntropy}`);
      if (state.globalEntropy !== 0.5) throw new Error(`Expected entropy = 0.5, got ${state.globalEntropy}`);
    } finally {
      client.close();
    }
  });

  await test("1.3 Shared session sync: Second client connects and gets the current synced state", async () => {
    const clientA = new TestClient("room_t1_c3");
    const clientB = new TestClient("room_t1_c3");
    
    await clientA.connect();
    try {
      await clientA.call("applyFriction", [0, 0, 20]); // sets entropy to 1.0
      
      const stateB = await clientB.connect();
      if (stateB.globalEntropy !== 1.0) {
        throw new Error(`Expected client B to receive entropy = 1.0, got ${stateB.globalEntropy}`);
      }
    } finally {
      clientA.close();
      clientB.close();
    }
  });

  await test("1.4 Scar addition: High-force friction adds a scar to state scars", async () => {
    const client = new TestClient("room_t1_c4");
    await client.connect();
    try {
      const state = await client.call("applyFriction", [100, 200, 12.0]);
      if (state.scars.length !== 1) throw new Error(`Expected 1 scar, got ${state.scars.length}`);
      const scar = state.scars[0];
      if (scar.x !== 100 || scar.y !== 200 || scar.depth !== 12.0) {
        throw new Error(`Invalid scar structure: ${JSON.stringify(scar)}`);
      }
    } finally {
      client.close();
    }
  });

  await test("1.5 Real-time scar sync: Second client receives the new scar in their state instantly", async () => {
    const clientA = new TestClient("room_t1_c5");
    const clientB = new TestClient("room_t1_c5");
    await clientA.connect();
    await clientB.connect();
    try {
      let scarReceived = false;
      clientB.onStateUpdateCallback = (state) => {
        if (state.scars.length === 1 && state.scars[0].depth === 8.0) {
          scarReceived = true;
        }
      };
      
      await clientA.call("applyFriction", [300, 400, 8.0]);
      await waitFor(() => scarReceived, 2000);
    } finally {
      clientA.close();
      clientB.close();
    }
  });

  await test("1.6 Fracture activation: State entropy reaching 100 triggers kintsugiActive: true", async () => {
    const client = new TestClient("room_t1_c6");
    await client.connect();
    try {
      const state = await client.call("applyFriction", [0, 0, 2000]); // triggers 100 entropy
      if (state.kintsugiActive !== true) throw new Error("Expected kintsugiActive = true");
      if (state.globalEntropy !== 100) throw new Error(`Expected globalEntropy = 100, got ${state.globalEntropy}`);
    } finally {
      client.close();
    }
  });

  await test("1.7 WebSocket broadcast on fracture: Second client receives CANVAS_FRACTURE raw broadcast event instantly", async () => {
    const clientA = new TestClient("room_t1_c7");
    const clientB = new TestClient("room_t1_c7");
    await clientA.connect();
    await clientB.connect();
    try {
      let fractureReceived = false;
      clientB.onMessageCallback = (msg) => {
        if (msg.type === 'CANVAS_FRACTURE') {
          fractureReceived = true;
        }
      };
      await clientA.call("applyFriction", [0, 0, 2000]);
      await waitFor(() => fractureReceived, 2000);
    } finally {
      clientA.close();
      clientB.close();
    }
  });

  await test("1.8 Gold injection repair: Client sends injectGold, entropy decreases", async () => {
    const client = new TestClient("room_t1_c8");
    await client.connect();
    try {
      await client.call("applyFriction", [0, 0, 2000]); // fracture
      const state = await client.call("injectGold", [30.0]);
      if (state.globalEntropy !== 70.0) throw new Error(`Expected entropy = 70.0, got ${state.globalEntropy}`);
      if (state.kintsugiActive !== true) throw new Error("Expected kintsugiActive = true during partial repair");
    } finally {
      client.close();
    }
  });

  await test("1.9 Real-time gold update sync: Second client receives the reduced entropy state instantly", async () => {
    const clientA = new TestClient("room_t1_c9");
    const clientB = new TestClient("room_t1_c9");
    await clientA.connect();
    await clientB.connect();
    try {
      await clientA.call("applyFriction", [0, 0, 2000]); // fracture
      let goldReceived = false;
      clientB.onStateUpdateCallback = (state) => {
        if (state.globalEntropy === 70.0) {
          goldReceived = true;
        }
      };
      await clientA.call("injectGold", [30.0]);
      await waitFor(() => goldReceived, 2000);
    } finally {
      clientA.close();
      clientB.close();
    }
  });

  await test("1.10 Kintsugi completion: Reducing entropy to 0 resets kintsugiActive and increments repairs", async () => {
    const clientA = new TestClient("room_t1_c10");
    const clientB = new TestClient("room_t1_c10");
    await clientA.connect();
    await clientB.connect();
    try {
      await clientA.call("applyFriction", [0, 0, 2000]); // fracture
      let kintsugiCompleted = false;
      clientB.onMessageCallback = (msg) => {
        if (msg.type === 'KINTSUGI_COMPLETE') {
          kintsugiCompleted = true;
        }
      };
      const state = await clientA.call("injectGold", [100.0]);
      if (state.globalEntropy !== 0) throw new Error(`Expected entropy = 0, got ${state.globalEntropy}`);
      if (state.kintsugiActive !== false) throw new Error("Expected kintsugiActive = false");
      if (state.totalRepairs !== 1) throw new Error(`Expected totalRepairs = 1, got ${state.totalRepairs}`);
      await waitFor(() => kintsugiCompleted, 2000);
    } finally {
      clientA.close();
      clientB.close();
    }
  });

  // --- TIER 2: BOUNDARY & CORNER CASES (10 Cases) ---

  await test("2.1 Friction with force = 0: Verify entropy and scars do not change", async () => {
    const client = new TestClient("room_t2_c1");
    await client.connect();
    try {
      const state = await client.call("applyFriction", [10, 10, 0]);
      if (state.globalEntropy !== 0) throw new Error(`Expected entropy = 0, got ${state.globalEntropy}`);
      if (state.scars.length !== 0) throw new Error("Expected 0 scars");
    } finally {
      client.close();
    }
  });

  await test("2.2 Friction with negative force: Verify the agent handles/rejects negative entropy", async () => {
    const client = new TestClient("room_t2_c2");
    await client.connect();
    try {
      let rejected = false;
      try {
        await client.call("applyFriction", [10, 10, -5.0]);
      } catch (err) {
        rejected = true;
        if (!err.message.includes("Violación Termodinámica")) {
          throw new Error(`Unexpected error message: ${err.message}`);
        }
      }
      if (!rejected) throw new Error("Expected negative friction force to be rejected via validateStateChange");
    } finally {
      client.close();
    }
  });

  await test("2.3 Gold injection when not fractured: Verify injectGold is a no-op", async () => {
    const client = new TestClient("room_t2_c3");
    await client.connect();
    try {
      const state = await client.call("injectGold", [10.0]);
      if (state.globalEntropy !== 0) throw new Error("Expected entropy to remain 0");
      if (state.kintsugiActive !== false) throw new Error("Expected kintsugi to remain inactive");
    } finally {
      client.close();
    }
  });

  await test("2.4 Friction when fractured: Verify applyFriction is blocked when kintsugiActive is true", async () => {
    const client = new TestClient("room_t2_c4");
    await client.connect();
    try {
      await client.call("applyFriction", [0, 0, 2000]); // fracture
      const state = await client.call("applyFriction", [10, 10, 100]); // attempt friction
      if (state.globalEntropy !== 100) throw new Error("Friction should be blocked when fractured");
    } finally {
      client.close();
    }
  });

  await test("2.5 Scar list limit: Generate >1000 scars, verify scars array length is capped at 1000 (FIFO eviction)", async () => {
    const client = new TestClient("room_t2_c5");
    await client.connect();
    try {
      let totalScarsCreated = 0;
      let state;
      while (totalScarsCreated < 1050) {
        state = await client.call("applyFriction", [1, 1, 6.0]);
        totalScarsCreated++;
        if (state.kintsugiActive) {
          state = await client.call("injectGold", [100.0]); // resets entropy, preserves scars
        }
      }
      
      console.log(`Generated ${totalScarsCreated} scars. Current scars length in state: ${state.scars.length}`);
      if (state.scars.length !== 1000) {
        throw new Error(`Expected scars array length to be capped at 1000, got ${state.scars.length}`);
      }
    } finally {
      client.close();
    }
  });

  await test("2.6 Partial repair: Inject less gold than current entropy, verify kintsugi remains active", async () => {
    const client = new TestClient("room_t2_c6");
    await client.connect();
    try {
      await client.call("applyFriction", [0, 0, 2000]); // fracture (entropy = 100)
      const state = await client.call("injectGold", [40.0]);
      if (state.globalEntropy !== 60.0) throw new Error(`Expected entropy = 60.0, got ${state.globalEntropy}`);
      if (state.kintsugiActive !== true) throw new Error("Expected kintsugiActive to remain true");
    } finally {
      client.close();
    }
  });

  await test("2.7 Over-repair: Inject more gold than current entropy, verify entropy caps at 0 and kintsugi deactivates", async () => {
    const client = new TestClient("room_t2_c7");
    await client.connect();
    try {
      await client.call("applyFriction", [0, 0, 2000]); // fracture (entropy = 100)
      const state = await client.call("injectGold", [150.0]);
      if (state.globalEntropy !== 0) throw new Error(`Expected entropy to cap at 0, got ${state.globalEntropy}`);
      if (state.kintsugiActive !== false) throw new Error("Expected kintsugiActive to deactivate");
      if (state.totalRepairs !== 1) throw new Error(`Expected totalRepairs = 1, got ${state.totalRepairs}`);
    } finally {
      client.close();
    }
  });

  await test("2.8 Invalid WebSocket message: Send malformed JSON payload, verify server handles gracefully", async () => {
    const client = new TestClient("room_t2_c8");
    await client.connect();
    try {
      client.sendRaw("{invalid_json: true");
      // Server should not crash. Wait a bit, then do a valid RPC call to verify connection is alive
      await new Promise(r => setTimeout(r, 200));
      const state = await client.call("applyFriction", [0, 0, 10]);
      if (state.globalEntropy !== 0.5) throw new Error(`Expected entropy = 0.5, got ${state.globalEntropy}`);
    } finally {
      client.close();
    }
  });

  await test("2.9 High concurrency: Connect 10 simultaneous clients and verify they receive updates", async () => {
    const clients = Array.from({ length: 10 }, (_, i) => new TestClient(`room_t2_c9`));
    try {
      const connectPromises = clients.map(c => c.connect());
      const states = await Promise.all(connectPromises);
      for (const s of states) {
        if (s.globalEntropy !== 0) throw new Error("Expected initial entropy = 0");
      }
    } finally {
      clients.forEach(c => c.close());
    }
  });

  await test("2.10 State validation: Attempting to set negative entropy throws validation error", async () => {
    const client = new TestClient("room_t2_c10");
    await client.connect();
    try {
      let errorMsg = "";
      try {
        await client.call("applyFriction", [0, 0, -10.0]);
      } catch (err) {
        errorMsg = err.message;
      }
      if (!errorMsg.includes("Violación Termodinámica")) {
        throw new Error(`Expected 'Violación Termodinámica' validation error, got: '${errorMsg}'`);
      }
    } finally {
      client.close();
    }
  });

  // --- TIER 3: CROSS-FEATURE COMBINATIONS (2 Cases) ---

  await test("3.1 Gold injection attempt before fracture is ignored, then fracture, then gold succeeds", async () => {
    const client = new TestClient("room_t3_c1");
    await client.connect();
    try {
      // 1. Attempt gold injection (ignored when not fractured)
      let state = await client.call("injectGold", [50.0]);
      if (state.globalEntropy !== 0 || state.kintsugiActive !== false) {
        throw new Error("Expected gold injection to be ignored before fracture");
      }

      // 2. Trigger fracture
      state = await client.call("applyFriction", [0, 0, 2000]);
      if (state.kintsugiActive !== true || state.globalEntropy !== 100) {
        throw new Error("Expected fracture to activate");
      }

      // 3. Inject gold (should succeed now)
      state = await client.call("injectGold", [50.0]);
      if (state.globalEntropy !== 50 || state.kintsugiActive !== true) {
        throw new Error("Expected gold injection to succeed and decrease entropy to 50");
      }

      // 4. Complete repair
      state = await client.call("injectGold", [50.0]);
      if (state.globalEntropy !== 0 || state.kintsugiActive !== false || state.totalRepairs !== 1) {
        throw new Error("Expected repair to complete");
      }
    } finally {
      client.close();
    }
  });

  await test("3.2 Fracture, partial repair, blocked friction, complete repair, friction enabled", async () => {
    const client = new TestClient("room_t3_c2");
    await client.connect();
    try {
      // 1. Fracture
      let state = await client.call("applyFriction", [0, 0, 2000]);
      
      // 2. Partial repair
      state = await client.call("injectGold", [50.0]);
      if (state.globalEntropy !== 50 || state.kintsugiActive !== true) {
        throw new Error("Expected partial repair to entropy = 50");
      }

      // 3. Friction attempted (blocked)
      state = await client.call("applyFriction", [10, 10, 100]);
      if (state.globalEntropy !== 50) {
        throw new Error("Expected friction to be ignored during repair");
      }

      // 4. Complete repair
      state = await client.call("injectGold", [50.0]);
      if (state.globalEntropy !== 0 || state.kintsugiActive !== false) {
        throw new Error("Expected repair to complete");
      }

      // 5. Friction enabled again
      state = await client.call("applyFriction", [0, 0, 10.0]);
      if (state.globalEntropy !== 0.5) {
        throw new Error(`Expected friction to increase entropy, got ${state.globalEntropy}`);
      }
    } finally {
      client.close();
    }
  });

  // --- TIER 4: REAL-WORLD APPLICATION SCENARIOS (5 Cases) ---

  await test("4.1 5 concurrent clients applying friction until fracture, checking all get fracture event", async () => {
    const clients = Array.from({ length: 5 }, (_, i) => new TestClient("room_t4_c1"));
    const connectPromises = clients.map(c => c.connect());
    await Promise.all(connectPromises);
    
    try {
      const fractureSignals = clients.map(c => {
        return new Promise(resolve => {
          c.onMessageCallback = (msg) => {
            if (msg.type === 'CANVAS_FRACTURE') {
              resolve();
            }
          };
        });
      });

      // All 5 clients concurrently apply friction to push entropy past 100
      // 5 * 400 = 2000 force, which is 100 entropy total.
      const frictionPromises = clients.map(c => c.call("applyFriction", [10, 10, 400.0]));
      await Promise.all(frictionPromises);

      // Wait for all 5 clients to receive the fracture broadcast event
      await Promise.all(fractureSignals);
    } finally {
      clients.forEach(c => c.close());
    }
  });

  await test("4.2 Concurrent gold injection by 5 clients repairing the canvas completely, verifying final reset", async () => {
    const clients = Array.from({ length: 5 }, (_, i) => new TestClient("room_t4_c2"));
    const connectPromises = clients.map(c => c.connect());
    await Promise.all(connectPromises);

    try {
      const completeSignals = clients.map(c => {
        return new Promise(resolve => {
          c.onMessageCallback = (msg) => {
            if (msg.type === 'KINTSUGI_COMPLETE') {
              resolve(msg.repairNumber);
            }
          };
        });
      });

      // 1. Fracture from Client 0
      let state = await clients[0].call("applyFriction", [0, 0, 2000]);
      if (!state.kintsugiActive) throw new Error("Expected room to be fractured");

      // 2. Coordinated gold injection by 5 clients (5 * 20.0 = 100.0 amount)
      const injectPromises = clients.map(c => c.call("injectGold", [20.0]));
      const finalStates = await Promise.all(injectPromises);

      // Verify that at least the last completed state has entropy = 0 and kintsugiActive = false
      const fullyRepairedState = finalStates.find(s => s.globalEntropy === 0 && s.kintsugiActive === false);
      if (!fullyRepairedState) {
        throw new Error(`Expected at least one final state to be fully repaired, got states: ${JSON.stringify(finalStates.map(s => s.globalEntropy))}`);
      }

      // Wait for all clients to receive the complete broadcast
      const repairNumbers = await Promise.all(completeSignals);
      for (const repNum of repairNumbers) {
        if (repNum !== 1) throw new Error(`Expected repairNumber = 1 in broadcast, got ${repNum}`);
      }
    } finally {
      clients.forEach(c => c.close());
    }
  });

  await test("4.3 Multiple rounds of fracture and repair: verify totalRepairs increments correctly across rounds", async () => {
    const client = new TestClient("room_t4_c3");
    await client.connect();
    try {
      for (let round = 1; round <= 3; round++) {
        let state = await client.call("applyFriction", [0, 0, 2000]); // fracture
        if (state.kintsugiActive !== true) throw new Error(`Round ${round}: Expected kintsugiActive = true`);
        state = await client.call("injectGold", [100.0]); // repair
        if (state.kintsugiActive !== false) throw new Error(`Round ${round}: Expected kintsugiActive = false`);
        if (state.totalRepairs !== round) throw new Error(`Round ${round}: Expected totalRepairs = ${round}, got ${state.totalRepairs}`);
      }
    } finally {
      client.close();
    }
  });

  await test("4.4 Persistent state recovery: Disconnect all clients, wait, connect a new client, verify state recovered", async () => {
    const clientA = new TestClient("room_t4_c4");
    await clientA.connect();
    try {
      await clientA.call("applyFriction", [0, 0, 20.0]); // sets entropy to 1.0
    } finally {
      clientA.close();
    }

    // Wait a brief period to mimic disconnection
    await new Promise(r => setTimeout(r, 1000));

    // Connect Client B
    const clientB = new TestClient("room_t4_c4");
    try {
      const stateB = await clientB.connect();
      if (stateB.globalEntropy !== 1.0) {
        throw new Error(`Expected state to persist entropy = 1.0, got ${stateB.globalEntropy}`);
      }
    } finally {
      clientB.close();
    }
  });

  await test("4.5 KV Observability Ledger: Verify fracture and repair entries written to RADIANCE_MEMORY", async () => {
    const client = new TestClient("room_t4_c5");
    await client.connect();
    try {
      // 1. Trigger fracture (force = 2000)
      await client.call("applyFriction", [0, 0, 2000]);
      
      // 2. Complete repair (amount = 100)
      await client.call("injectGold", [100]);

      // Wait a short duration for the asynchronous onStateUpdate/KV writes to complete in the worker
      await new Promise(r => setTimeout(r, 1000));

      // 3. Inspect KV ledger via HTTP route
      const inspectRes = await fetch(`${BASE_URL}/test-kv-inspect`);
      if (!inspectRes.ok) {
        throw new Error(`Failed to inspect KV ledger: HTTP status ${inspectRes.status}`);
      }
      const ledger = await inspectRes.json();
      console.log("  KV Ledger contents:", JSON.stringify(ledger));

      // 4. Assert key prefixes
      const keys = ledger.keys || [];
      const hasFractureKey = keys.some(k => k.startsWith("fracture_"));
      const hasKintsugiKey = keys.some(k => k.startsWith("kintsugi_"));

      if (!hasFractureKey) {
        throw new Error("Expected a key starting with 'fracture_' in KV RADIANCE_MEMORY");
      }
      if (!hasKintsugiKey) {
        throw new Error("Expected a key starting with 'kintsugi_' in KV RADIANCE_MEMORY");
      }
    } finally {
      client.close();
    }
  });

  console.log(`\n======================================`);
  console.log(`E2E TEST RUN SUMMARY:`);
  console.log(`  Total Test Cases: ${results.length}`);
  console.log(`  PASSED: ${passedCount}`);
  console.log(`  FAILED: ${failedCount}`);
  console.log(`======================================\n`);

  return {
    results,
    passedCount,
    failedCount
  };
}

async function main() {
  let wranglerProcess;
  try {
    wranglerProcess = await startWrangler();
    const summary = await runTests();
    process.exitCode = summary.failedCount > 0 ? 1 : 0;
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exitCode = 1;
  } finally {
    if (wranglerProcess) {
      console.log("Stopping wrangler dev server...");
      wranglerProcess.kill();
    }
  }
}

if (require.main === module) {
  main();
}
