<!-- [C5-REAL] Exergy-Maximized -->
# 🧱 TECHNICAL_SPEC.md — naroagutierrezgil.com

**Architecture: SSG (Static Site Generation) + Edge Functions + WebGL Canvas**
**Runtime Level: C5-REAL**

## 1. 🌌 Foundational Axioms
- **Ontology**: Portfolio/Showcase matrix.
- **Rendering Model**: Full SSG via Next.js (`out/` export), augmented by Cloudflare Pages Edge Functions.
- **Canvas Engine**: React Three Fiber (`@react-three/fiber`, `@react-three/drei`) over WebGL.

## 2. 🗺️ Module Map
- **`src/`**: Primary application DOM and Canvas logic.
- **`functions/`**: Edge computing logic (Cloudflare Workers native routing).
- **`public/`**: Static structural assets (textures, GLTF matrices).
- **`docs/`**: Cryptographic audit and structural spec tracking.

## 3. 🛡️ Invariants
- **V8 Isolate Execution**: Functions MUST execute within Cloudflare's strict latency boundaries. 
- **WebGL Frame Budget**: `useFrame` mutations MUST NOT exceed 16.6ms (60FPS deterministic constraint).
- **Zero Anergy Deployment**: `npm run deploy` invokes strict build -> deploy pipeline to `out/` without intermediate entropy.

## 4. 🔄 Write-Path Contract
- Commits MUST pass strictly typed ESNext linters.
- Static bundles MUST NOT contain dynamic SSR invocations.
