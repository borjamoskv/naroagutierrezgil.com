# Entropic Canvas Multi-Player Sync Analysis & Plan

- **Status**: Completed (Read-Only Analysis)
- **Reality Level**: `#C5-REAL` (Verified via local code audit and compilation tests)

---

## 1. Verifiable Project Status (`#C5-REAL`)

```yaml
Claim: The repository compiles successfully via Next.js and TypeScript, but contains pre-existing linting errors in ThreeDCarousel.tsx.
Proof:
  Base:
    - Running 'npx tsc --noEmit' in root completed with exit code 0.
    - Running 'npm run build' in root completed with exit code 0.
    - Running 'npm run lint' in root returned exit code 1 with 19 problems (12 errors, 7 warnings) in ThreeDCarousel.tsx.
  Range: [0, 1]
  Confidence: C5
```

### Pre-Existing Linting Errors
All 12 linting errors are located in `src/components/ThreeDCarousel.tsx`:
- **Line 197:20**: `Cannot access ref value during render` on `materialRef.current?.uniforms.uProgress.value`.
- **Line 198:21**: `Cannot access ref value during render` on `showSolid = progress <= 0.45`.

*Note: These linting errors do not block Next.js builds, which complete successfully.*

---

## 2. Server-Side State Management (Durable Objects vs KV)

```yaml
Claim: State is stored with strong consistency in Durable Objects (SQLite) and archived with eventual consistency in Cloudflare KV.
Proof:
  Base:
    - wrangler.jsonc binds class 'EntropicCanvasAgent' to 'EntropicCanvas' Durable Object and includes tag 'v1' migration: 'new_sqlite_classes: ["EntropicCanvasAgent"]'.
    - EntropicCanvasAgent.ts uses 'this.setState()' to update the state, which is managed by the SQLite DO backend.
    - EntropicCanvasAgent.ts uses 'env.RADIANCE_MEMORY.put()' to store 'fracture_${timestamp}' and 'kintsugi_${timestamp}' events.
  Range: [1, 1]
  Confidence: C5
```

### Storage Architecture Detail
| Dimension | Durable Objects (SQLite) | Cloudflare KV (`RADIANCE_MEMORY`) |
|---|---|---|
| **Role** | Primary real-time state database | Historical event log / Ledger |
| **Consistency** | Strong Consistency (Single DO instance handles all writes) | Eventual Consistency (Globally replicated) |
| **Persistence** | Survives server restarts and client disconnections | Permanent storage (immutable event append) |
| **Data Kept** | `globalEntropy`, `kintsugiActive`, `totalRepairs`, and `scars` (up to 1000 hot memory items) | `fracture_${timestamp}` & `kintsugi_${timestamp}` metadata |

---

## 3. `PaintTrail.tsx` Bug Analysis & Fix

### Bug Identification
In `src/components/PaintTrail.tsx` (lines 42–44), the RPC method is invoked directly on the client object returned by `useAgent`:
```typescript
if (typeof (agent as any).applyFriction === 'function') {
  (agent as any).applyFriction(e.clientX, e.clientY, accumForce * 0.05);
}
```
`useAgent` returns an object of type `Omit<PartySocket, "path"> & { state, call, stub, ... }`. It does **not** expose RPC methods on the root client object. The condition `typeof (agent as any).applyFriction === 'function'` evaluates to `false`, causing the local friction to **never** propagate to the server.

### Proposed Fix
Invoke the RPC method via `agent.stub` and import the agent types for full TypeScript validation.

#### Before:
```typescript
import { useAgent } from "agents/react";
import type { EntropicState } from "@/agents/EntropicCanvasAgent";
...
  const agent = useAgent({
    agent: "EntropicCanvasAgent",
    name: "global-canvas",
    onStateUpdate: (state: EntropicState) => {
      setEntropy(state.globalEntropy || 0);
    }
  });
...
      if (Date.now() - lastCallTime > 500 && accumForce > 50) {
        if (typeof (agent as any).applyFriction === 'function') {
          (agent as any).applyFriction(e.clientX, e.clientY, accumForce * 0.05);
        }
        accumForce = 0;
        lastCallTime = Date.now();
      }
```

#### Proposed After:
```typescript
import { useAgent } from "agents/react";
import type { EntropicCanvasAgent, EntropicState } from "@/agents/EntropicCanvasAgent";
...
  const agent = useAgent<EntropicCanvasAgent, EntropicState>({
    agent: "EntropicCanvasAgent",
    name: "global-canvas",
    onStateUpdate: (state) => {
      setEntropy(state.globalEntropy || 0);
    }
  });
...
      if (Date.now() - lastCallTime > 500 && accumForce > 50) {
        agent.stub.applyFriction(e.clientX, e.clientY, accumForce * 0.05).catch(console.error);
        accumForce = 0;
        lastCallTime = Date.now();
      }
```

---

## 4. `useKintsugiKV` Hook Refactoring Plan

Currently, `SplatBenchmarkCanvas.tsx` uses `useKintsugiKV()` to query `/api/kintsugi` on a 3-second poll interval. This causes:
1. High-frequency KV write/read overhead.
2. 3000ms sync lag between users.
3. Mismatch in HTTP methods: the client posts `type: 'REPAIR'`, while the Pages Function (`kintsugi.ts:62`) expects `type: 'INJECT_GOLD'`, breaking repair capability.

### Proposed Refactoring of `SplatBenchmarkCanvas.tsx`

```typescript
import { useAgent } from 'agents/react';
import type { EntropicCanvasAgent, EntropicState } from '@/agents/EntropicCanvasAgent';

function useKintsugiAgent() {
  const agent = useAgent<EntropicCanvasAgent, EntropicState>({
    agent: "EntropicCanvasAgent",
    name: "global-canvas",
  });

  const state = agent.state;
  const entropy = state?.globalEntropy ?? 0;
  const repairs = state?.totalRepairs ?? 0;
  const scars = state?.scars ?? [];
  const kintsugiActive = state?.kintsugiActive ?? false;

  const applyFriction = async (x: number, y: number, intensity: number) => {
    return agent.stub.applyFriction(x, y, intensity);
  };

  const injectGold = async (intensity: number, x: number, y: number) => {
    return agent.stub.injectGold(intensity);
  };

  return { entropy, repairs, scars, kintsugiActive, applyFriction, injectGold, socket: agent };
}
```

---

## 5. Event Broadcast & Visual Overlay Execution

### Server Broadcast Lifecycle
1. When `applyFriction` pushes `globalEntropy >= 100.0`, the `onStateUpdate` callback is executed:
```typescript
// EntropicCanvasAgent.ts (Line 38)
async onStateUpdate(state: EntropicState) {
  if (state.globalEntropy >= 100.0 && !state.kintsugiActive) {
    this.setState({ ...state, kintsugiActive: true });
    this.broadcast(JSON.stringify({ 
      type: 'CANVAS_FRACTURE', 
      message: 'La fricción colectiva ha quebrado la obra. Inyección de resina requerida.' 
    }));
```
2. `this.broadcast(...)` sends a raw WebSocket message directly to all active connections.

### Client Event Capture Plan
Clients can listen to WebSocket raw events instantly. We will register an event listener on the `socket` (returned from `useAgent` / `useKintsugiAgent`).

```typescript
// Add inside SplatInteractiveCanvas component:
const agent = useKintsugiAgent();
const { entropy, repairs, scars, kintsugiActive } = agent;

useEffect(() => {
  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'CANVAS_FRACTURE') {
        // 1. Immediately trigger CSS fracture overlay animation
        // 2. Play Web Audio crack sound effect via SplatAudioEngine
        console.log("CRITICAL: Canvas fractured!", data.message);
      } else if (data.type === 'KINTSUGI_COMPLETE') {
        // 1. Play gold resolution sound
        // 2. Flash golden UI transition
        console.log("KINTSUGI COMPLETE: Repair #", data.repairNumber);
      }
    } catch (e) {
      console.error("Failed to parse agent broadcast message", e);
    }
  };

  agent.socket.addEventListener('message', handleWebSocketMessage);
  return () => {
    agent.socket.removeEventListener('message', handleWebSocketMessage);
  };
}, [agent.socket]);
```

---

## 6. Implementation Steps for Next Milestone

1. **Fix `PaintTrail.tsx`**: Update imports, type signature of `useAgent`, and convert client call to `agent.stub.applyFriction()`.
2. **Refactor `SplatBenchmarkCanvas.tsx`**:
   - Delete the outdated `useKintsugiKV` hook.
   - Replace it with the WebSocket-based `useKintsugiAgent` hook.
   - Bind component state variables directly to `agent.state` values.
   - Connect client-side action buttons (`handleInjectGold` and pointer events) to `agent.stub` method invocations.
   - Bind `kintsugiActive` visual logic to `agent.state.kintsugiActive` instead of the approximation (`entropy > 50`).
3. **Register Audio & Visual Triggers**: Create UI overlay for fractures and link to `SplatAudioEngine` triggers within the WebSocket `message` listener.
