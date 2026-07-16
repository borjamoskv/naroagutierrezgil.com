# STYLE_MANUAL.md — GPT-5.6 Sol Cinematic Premium (Industrial Noir 2026)

Este manual de estilo define las invariantes estéticas absolutas para todo desarrollo, refactorización y autogeneración de componentes frontend en la topología de **naroagutierrezgil.com**.

---

## 🏛️ 1. Filosofía Core: Hiperrealismo Lítico & Materia Computacional
El usuario no navega imágenes estáticas. Navega materia digital reactiva (pizarra, mica, oro) colocada en un espacio tridimensional. Toda interfaz debe comportarse como un organismo con peso, textura y respuesta óptica a la luz física.

---

## ⚡ 2. Invariantes de Renderizado (GPT-5.6 Sol Cinematic Premium)

### A. Entornos Volumétricos
- Toda UI debe colocarse en un espacio 3D real o proyectado que simule profundidad física.
- Las capas de fondo deben responder al scroll y al movimiento del cursor mediante paralaje multicapa (e.g. `WebGLBackground`, `ThreeDCarousel`).
- Los elementos del plano deben poseer relieve material mediante mapas de normales/desplazamientos o shaders de distribución (Splatting).

### B. Iluminación Direccional y HDRI
- El lienzo o UI debe ser iluminado por fuentes de luz físicas y direccionales explícitas (`directionalLight` con sombras duras, `pointLight` reactivas al ratón, `spotLight`).
- Uso obligatorio de Image-Based Lighting (IBL) a través de mapas de entorno HDRI (`preset="city"` o similares) para reflejar de forma hiperrealista el entorno sobre acabados metálicos (oro) y cerámicos.

### C. Refracciones y Acabados de Superproducción
- **Materiales PBR Extremos:** Uso exclusivo de `meshPhysicalMaterial` con propiedades de `clearcoat` alto, `roughness` variable, y mapas de `metalness`.
- **Texturas Procedimentales:** Shaders a nivel de fragmento para simular el brillo del polvo de oro (`#F59E0B`) o el centelleo de las láminas de mica mineral encoladas.
- **Kintsugi Shaders:** Venas doradas luminosas que se expanden o colapsan según el estado entrópico del canvas.

### D. Post-Processing & Cinematic Pipeline
Toda escena interactiva en 3D/WebGL debe estar orquestada bajo un `EffectComposer` con las siguientes pasadas obligatorias:
1. **Bloom:** Luminancia de umbral alto para destellos y venas de oro.
2. **Depth of Field (DOF):** Desenfoque de cámara realista focalizado dinámicamente según la atención del raycaster.
3. **Chromatic Aberration:** Dispersión cromática en los bordes para emular lentes DSLR de cine.
4. **Film Grain (Noise):** Ruido analógico de baja densidad para romper la artificialidad del píxel plano.

---

## 🎨 3. Paleta de Colores Inmutable (Noir Cobalto/Oro)
- **Void:** `#0A0A0A` / `#050505` (Sombras ultra-profundas y base abisal)
- **Cobalto (YInMn):** `#2B3BE5` (Cobalto puro, alta exergía lumínica)
- **Kintsugi Oro:** `#F59E0B` / `#FFD700` (Resina de curación metálica)
- **Mica Dust:** `rgba(234, 234, 234, 0.85)` (Brillo mineral templado)
- **Sovereign Amber:** `#FF9F1C` (Puntos calientes / HUD interactivo)

---

## ⚡ 4. Wow-Effect Mandatorio (Mimo-Pattern)
Cualquier interfaz interactiva debe inyectar por defecto:
1. **Custom Cursor:** Puntero SVG interactivo que mute de forma en hovers y clics, dejando un rastro dinámico de partículas/glitch (e.g. `CustomCursor.tsx`).
2. **Micro-interacciones Kinéticas:** Transiciones cinemáticas fluidas con físicas de muelle (`GSAP` o `Lenis` para scroll suave).
