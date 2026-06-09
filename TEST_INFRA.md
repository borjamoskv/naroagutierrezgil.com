# E2E Test Infrastructure for Real-Time Collaborative Canvas Sync

## Overview
This document details the design, implementation, and management of the E2E testing framework constructed for the collaborative entropic canvas. The infrastructure runs against the live local Cloudflare Workers and Durable Objects instance.

## Test Environment Management

- **Local Worker Instance**: Managed via `wrangler dev` (version 4.98.0+). The dev server is started programmatically by the test runner (`scripts/run-e2e-tests.js`) before executing test cases and is cleanly shut down afterwards.
- **Port Binding**: Binds to port `8787`.
- **State Isolation**: Independent, random room IDs (`room_tX_cY`) are generated for each test run to ensure strict namespace and state isolation.
- **State Persistence**: Durable Objects state is preserved during brief disconnections (simulated client restarts) and verifies recovery on reconnect.

## Test Client Design

To replicate the client-side library behaviour without requiring browser-only APIs or bundling layers, a lightweight `TestClient` class was implemented:
- **WebSocket Protocol**: Utilizes the Node.js `ws` library.
- **Dynamic Connection**: Resolves routes to `/agents/entropic-canvas-agent/<room_name>?_pk=<uuid>` where `_pk` serves as the client identifier.
- **JSON-RPC Routing**: Overrides manual parsing to implement the required wire format:
  ```json
  {
    "type": "rpc",
    "id": "<uuid>",
    "method": "applyFriction" | "injectGold",
    "args": [...]
  }
  ```
- **State Updates**: Tracks state broadcasts (`type: "cf_agent_state"`) and custom broadcast events (like `CANVAS_FRACTURE` and `KINTSUGI_COMPLETE`).

## KV Observability Endpoint

To verify KV writing without violating the opaque-box testing paradigm, a dedicated diagnostics route `/test-kv-inspect` was built into the worker's router (`src/agents/index.ts`):
- **Function**: Queries all keys in the `RADIANCE_MEMORY` KV namespace matching prefixes `fracture_` and `kintsugi_`.
- **Payload**: Returns a JSON representation containing the keys and their serialized JSON event data (scars, repairs, gold amounts).
- **Test Utilization**: Test case `4.5` performs actions, triggers events, sleeps briefly, and calls this endpoint to ensure that a ledger of thermodynamic events is permanently stored in KV storage.
