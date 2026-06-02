# 🔬 SPLAT BENCHMARK PROTOCOL & SPATIAL LOD

Este documento cristaliza la estrategia de ingeniería para la inyección de Gaussian Splatting en la arquitectura WebGPU, priorizando el rendimiento físico sobre la estética durante la fase de validación.

## FASE 1: Banco de Pruebas Escalonado

Antes de capturar la obra definitiva, se validará la viabilidad técnica mediante un protocolo de estrés (Stress-Testing Protocol).

### Benchmark 0 — Pipeline Básico
* **Objetivo:** `.splat` → navegador → render.
* **Criterio de éxito:** Carga correcta, renderizado sin corrupción, control de cámara estable. Sin importar la calidad artística.

### Benchmark 1 — Escala (FPS vs Densidad)
Medición estricta de FPS (objetivo: 60fps / 16.6ms frame time) en distintos chipsets:
* MacBook M1/M2 / GPU Integrada
* iPhone 13+ / Dispositivo Móvil High-End
* Android Medio / Gama Media

| Splat Count | MacBook M1 (FPS) | iPhone (FPS) | Android (FPS) |
|-------------|------------------|--------------|---------------|
| 100k        | TBD              | TBD          | TBD           |
| 500k        | TBD              | TBD          | TBD           |
| 1M          | TBD              | TBD          | TBD           |
| 2M          | TBD              | TBD          | TBD           |
| 5M          | TBD              | TBD          | TBD           |

### Benchmark 2 — Presión de Memoria
Monitoreo de cuellos de botella por densidad geométrica o peso de texturas:
* **Métricas:** Tiempo de carga inicial, VRAM asimilada, RAM en uso.
* **Vector de fallo común:** OOM (Out of Memory) en dispositivos móviles por texturas masivas.

### Benchmark 3 — Degradación Adaptativa (Adaptive LOD)
El sistema **no** debe forzar la misma topología a todos los clientes.
* **Desktop Potente:** Modelo completo (Full Splat).
* **Desktop Medio:** LOD reducido (Decimation en backend o runtime).
* **Móvil:** LOD agresivo (Low-res splat o fallback a WebGL point cloud/video).

---

## FASE 2: La Arquitectura "Macro-to-Pigment" (Spatial LOD)

Para resolver el problema del peso masivo de un cuadro de alta densidad, la captura de la obra no será un archivo monolítico.

**Flujo Hiperrealista Dinámico:**
El sistema cargará dinámicamente diferentes archivos `.splat` (o niveles de detalle) basándose en la proximidad de la cámara de excavación:

1. **Nivel Macro (Museo):** Malla general de la obra. Baja densidad, luz global correcta.
2. **Nivel Detalle (Cuadro):** Densidad media, primeros rasgos faciales identificables.
3. **Nivel Detalle Extremo (Textura):** Carga dinámica de la sección que se está observando. Relieve del trazo.
4. **Nivel Microscópico (Pigmento):** Densidad extrema localizada. Ruptura del acrílico sobre la pizarra.

*Esta técnica permite infinitos detalles físicos sin saturar la VRAM del dispositivo.*

**Vector de ejecución bloqueado hasta:** Recepción del primer test de captura móvil `.splat` (Benchmark 0).
