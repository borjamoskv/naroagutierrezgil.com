## 2026-06-09T08:41:56Z

# Teamwork Project Prompt — Final

Implement a real-time collaborative multiplayer synchronization mechanism for Naroart's entropic canvas utilizing Cloudflare Workers / Durable Objects, allowing multiple concurrent visitors to apply friction and inject gold collaboratively.

Working directory: `/Users/borjafernandezangulo/10_PROJECTS/naroagutierrezgil.com`

## Requirements

### R1. Real-time Synchronization
The canvas must synchronize entropic state changes (scars, global entropy level, kintsugi activation) instantly across all connected clients via WebSockets or long polling.

### R2. Durable Storage Fallback
Persist the collective entropic state and kintsugi repair history in Cloudflare KV or Durable Object storage, ensuring that the canvas state is not lost when clients disconnect.

## Acceptance Criteria

### Connection Integrity
- [ ] Multiple tabs visiting the page can interact with the canvas simultaneously and see each other's cursor effects or friction scars in real-time.
- [ ] When a "CANVAS_FRACTURE" event occurs, all connected clients receive the notification and trigger the visual fracture overlay instantly.
