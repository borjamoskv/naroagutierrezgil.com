# VISIÓN SOTA AWWWARDS V2.0: "Hiperrealismo Lítico & Materia Computacional"

Este documento cristaliza la estrategia arquitectónica definitiva (Target: Awwwards SOTY).
Hemos pivotado. Lo más disruptivo en 2026 no es añadir más shaders a una imagen 2D.
Es el salto de **"imagen + WebGL"** a **"realidad capturada + renderizada como materia navegable"**.

## Core Philosophy: La Obra Como Objeto Físico Escaneado
*Casi todos los portfolios digitales intentan parecer futuristas. Muy pocos intentan que Internet parezca un objeto físico. El visitante no navega imágenes. Navega materia.*
No invertiremos meses en partículas o glitches. Invertiremos meses en capturar una obra real, convertirla en materia navegable, y hacer que la luz revele esa materia bajo un rigor termodinámico absoluto.

---

## EL NÚCLEO SOTA (La Combinación Ganadora Awwwards 2026)

### 1. Gaussian Splatting (El Retrato Existe Dentro De La Piedra)
- **Mecánica**: Archivos `.ksplat` o `.ply` escaneados fotogramétricamente de las obras de Naroa, renderizados vía Three.js (`GaussianSplats3D`).
- **Efecto**: Como una excavación arqueológica. La pantalla empieza siendo pizarra oscura. La luz rasante descubre millones de splats (puntos 3D volumétricos). La pintura parece atrapada dentro del mineral y tiene paralaje y profundidad reales. 

### 2. PBR (Physically Based Rendering) Extremo
- **Mecánica**: Materiales `MeshPhysicalMaterial` con mapas completos: `Roughness`, `Metalness`, `Normal`, `Clearcoat`, `Ambient Occlusion`.
- **Iluminación HDRI**: Uso de Image-Based Lighting (`Environment` maps precalculados) para reflejos perfectos del entorno sobre el oro y la resina.
- **Efecto**: La luz reacciona a los pigmentos de polvo de oro, poliéster y pizarra exactamente como lo haría en una galería de arte en Bilbao. No parece un filtro web, parece física óptica.

### 3. Post-Processing & Cinematic Pipeline
- **Mecánica**: Integración de pasadas de post-procesado (Bloom, Depth of Field dinámico atado al raycaster, Tone Mapping ACESFilmic).
- **Efecto**: Profundidad de campo realista. Las partes alejadas de la resina se desenfocan como en una cámara DSLR.

### 4. Transición a WebGPU
- **Mecánica**: Compute Shaders para fluidos o simulación de memoria radiante.
- **Efecto**: Renderizado de hasta 5 millones de partículas/splats a 60 FPS, permitiendo que la web tenga una "pizarra termodinámica" donde el cursor interactúa físicamente con condensación de agua, polvo de mica, o trazados de pintura.

---

## HOJA DE RUTA C5-REAL (Implementación Directa)

1. **[Fase 1] Escaneo PBR Pseudo-3D**: Transmutar los lienzos 2D en `MeshPhysicalMaterial` con mapas de altura/normales generados procedimentalmente en Three.js, iluminados por HDRi (Environment). *(En Ejecución)*
2. **[Fase 2] Post-Processing Cinematic**: Inyección de `EffectComposer` con DOF y Bloom reactivo a la atención del usuario.
3. **[Fase 3] Volumetric Splatting**: Adquisición de escaneos reales (`.splat`) de la Pizarra de Naroa, reemplazando la malla plana por nubes de puntos de resolución infinita.

---
*Status: C5-REAL (Matriz Integrada en Core SOTA)*
