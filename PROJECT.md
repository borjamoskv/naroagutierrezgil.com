# Project: Naroart Entropic Canvas Collaborative Sync

## Architecture
- Durable Object (Agent): `EntropicCanvasAgent` in `src/agents/EntropicCanvasAgent.ts`. Managed by Cloudflare Workers (using the `agents` library).
- Client Hook: `useAgent` from `agents/react` connects to `EntropicCanvasAgent` over WebSockets for real-time sync of state (`EntropicState`).
- KV Storage: `RADIANCE_MEMORY` KV Namespace acts as a persistent fallback / observability ledger for fracture and repair events.
- Next.js Frontend: `src/components/SplatBenchmarkCanvas.tsx` (GPU canvas) and `src/components/PaintTrail.tsx` (mouse trails) both synchronize with the same `EntropicCanvasAgent` instance (`global-canvas`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration | Analyze codebase, identify exact changes, verify build | None | DONE |
| 2 | E2E Testing Track | Design and implement the requirement-driven E2E test suite | M1 | DONE |
| 3 | Backend Hardening | Audit and refine `EntropicCanvasAgent` for correct Durable Object storage state recovery and KV backup | M1 | DONE |
| 4 | Frontend Refactoring | Replaces custom KV polling in SplatBenchmarkCanvas and PaintTrail with real-time useAgent hooks, hooks up GOLD and fractures | M2, M3 | DONE |
| 5 | Dual Track Verification | Run full E2E test suite, perform adversarial testing, check integrity | M4 | DONE |

## Code Layout
- Frontend canvas: `src/components/SplatBenchmarkCanvas.tsx`
- Mouse trail component: `src/components/PaintTrail.tsx`
- Cloudflare Agent DO: `src/agents/EntropicCanvasAgent.ts`
- Workers Entrypoint: `src/agents/index.ts`
- Cloudflare configuration: `wrangler.jsonc`, `wrangler.toml`

## Interface Contracts
### Client ↔ EntropicCanvasAgent (Durable Object)
- Websocket Protocol: standard agents package sync protocol
- RPC Methods:
  - `applyFriction(x: number, y: number, force: number): Promise<EntropicState>`
  - `injectGold(amount: number): Promise<EntropicState>`
