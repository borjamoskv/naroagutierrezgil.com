// C5-REAL: TSL Node Library for Naroa.online
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
//
// Shared TSL shader nodes replacing all GLSL template literals.
// Each function returns a composable TSL node for use with NodeMaterial.
// Compiles to both WGSL (WebGPU) and GLSL (WebGL2 fallback) via Three.js transpiler.

import {
  Fn,
  uniform,
  texture,
  uv,
  positionLocal,
  normalLocal,
  vec2,
  vec3,
  vec4,
  float,
  sin,
  cos,
  abs,
  dot,
  normalize,
  pow,
  floor,
  fract,
  length,
  distance,
  smoothstep,
  mix,
  max,
  step,
  time as timerGlobal,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

// ============================================================================
// PRIMITIVE: Hash function for procedural noise
// Equivalent to GLSL: fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123)
// ============================================================================
export const hashVec2 = /*@__PURE__*/ Fn(([p_immutable]: [Node<"vec2">]) => {
  const p = vec2(p_immutable);
  return fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453123));
});

// ============================================================================
// SLATE RELIEF: Surface displacement simulating stone texture
// Used by: Hero, Carousel Front, Gallery Cards
// ============================================================================
export const slateRelief = /*@__PURE__*/ Fn(
  ([uvCoord, timeVal, intensity]: [Node<"vec2">, Node<"float">, Node<"float">]) => {
    const u = vec2(uvCoord);
    const t = float(timeVal);
    const amp = float(intensity);
    return sin(u.x.mul(12.0).add(t.mul(0.2)))
      .mul(cos(u.y.mul(12.0).add(t.mul(0.2))))
      .mul(amp);
  }
);

// ============================================================================
// CHAOS RIPPLE: Extra organic displacement in CAOS mode
// ============================================================================
export const chaosRipple = /*@__PURE__*/ Fn(
  ([uvCoord, timeVal, appMode]: [Node<"vec2">, Node<"float">, Node<"float">]) => {
    const u = vec2(uvCoord);
    const t = float(timeVal);
    const mode = float(appMode);
    return sin(u.x.mul(24.0).add(t.mul(2.5)))
      .mul(cos(u.y.mul(24.0).add(t.mul(2.5))))
      .mul(0.035)
      .mul(mode);
  }
);

// ============================================================================
// CURSOR PUSH: Local displacement near the mouse position
// ============================================================================
export const cursorPush = /*@__PURE__*/ Fn(
  ([uvCoord, mouseUV, strength]: [Node<"vec2">, Node<"vec2">, Node<"float">]) => {
    const u = vec2(uvCoord);
    const m = vec2(mouseUV);
    const s = float(strength);
    const dist = distance(u, m);
    const force = smoothstep(float(0.35), float(0.0), dist);
    return force.mul(s);
  }
);

// ============================================================================
// MICA SPARKLES: Procedural high-frequency mineral glitter
// Used by: Hero, Carousel Front, Gallery Cards
// ============================================================================
export const micaSparkles = /*@__PURE__*/ Fn(
  ([
    uvCoord,
    timeVal,
    normalVec,
    halfDirVec,
    hoverVal,
    distanceFactor,
    frequency,
    threshold,
  ]: [
    Node<"vec2">,
    Node<"float">,
    Node<"vec3">,
    Node<"vec3">,
    Node<"float">,
    Node<"float">,
    Node<"float">,
    Node<"float">,
  ]) => {
    const u = vec2(uvCoord);
    const t = float(timeVal);
    const n = vec3(normalVec);
    const h = vec3(halfDirVec);
    const hover = float(hoverVal);
    const distFactor = float(distanceFactor);
    const freq = float(frequency);
    const thresh = float(threshold);

    const micaNoise = hashVec2(floor(u.mul(freq)));
    const angleFactor = max(dot(n, h), float(0.0));
    const speed = float(1.2).add(micaNoise.mul(1.8));
    const blink = float(0.3).add(float(0.7).mul(sin(t.mul(speed).add(micaNoise.mul(12.0)))));
    const sparkle = pow(angleFactor, float(64.0)).mul(blink).mul(hover).mul(distFactor);

    // Only activate for high-noise cells (above threshold)
    return sparkle.mul(step(thresh, micaNoise));
  }
);

// ============================================================================
// KINTSUGI VEINS: Procedural gold fracture lines
// Used by: Hero, Carousel Front, Gallery Cards
// ============================================================================
export const kintsugiVeins = /*@__PURE__*/ Fn(
  ([
    uvCoord,
    timeVal,
    appMode,
    freqX,
    freqY,
  ]: [
    Node<"vec2">,
    Node<"float">,
    Node<"float">,
    Node<"float">,
    Node<"float">,
  ]) => {
    const u = vec2(uvCoord);
    const t = float(timeVal);
    const mode = float(appMode);
    const fx = float(freqX);
    const fy = float(freqY);

    const kintsugiNoise = sin(u.x.mul(fx).add(u.y.mul(fy)).add(sin(u.x.mul(30.0)).mul(0.5)));
    const veinWidth = float(0.009)
      .add(sin(t.mul(1.0).add(u.x.mul(4.0))).mul(0.002))
      .add(mode.mul(0.01));
    return smoothstep(veinWidth, float(0.0), abs(kintsugiNoise.sub(0.25)));
  }
);

// ============================================================================
// CURSOR LIGHT: UV-space point light following cursor
// Returns { diff, spec, halfDir, distanceFactor }
// ============================================================================
export const cursorLighting = /*@__PURE__*/ Fn(
  ([
    uvCoord,
    mouseUV,
    normalVec,
    viewDir,
    zOffset,
  ]: [
    Node<"vec2">,
    Node<"vec2">,
    Node<"vec3">,
    Node<"vec3">,
    Node<"float">,
  ]) => {
    const u = vec2(uvCoord);
    const m = vec2(mouseUV);
    const n = vec3(normalVec);
    const v = vec3(viewDir);
    const z = float(zOffset);

    const lightPos = vec3(m.x.sub(0.5), m.y.sub(0.5), z);
    const surfacePos = vec3(u.x.sub(0.5), u.y.sub(0.5), float(0.0));
    const lightDir = normalize(lightPos.sub(surfacePos));

    const distFactor = float(1.0).sub(smoothstep(float(0.0), float(0.7), distance(u, m)));
    const diff = max(dot(n, lightDir), float(0.0)).mul(float(0.4).add(float(0.6).mul(distFactor)));
    const halfDir = normalize(lightDir.add(v));
    const spec = pow(max(dot(n, halfDir), float(0.0)), float(32.0));

    return vec4(diff, spec, distFactor, float(0.0));
  }
);

// ============================================================================
// DISINTEGRATION FIELD: Hash-based particle displacement
// Used by: Carousel particle system
// ============================================================================
export const disintegrationDisplace = /*@__PURE__*/ Fn(
  ([
    uvCoord,
    progress,
    timeVal,
  ]: [
    Node<"vec2">,
    Node<"float">,
    Node<"float">,
  ]) => {
    const u = vec2(uvCoord);
    const prog = float(progress);
    const t = float(timeVal);

    const h1 = hashVec2(u.mul(13.0)).sub(0.5);
    const h2 = hashVec2(u.mul(17.0)).sub(0.5);
    const h3 = hashVec2(u.mul(23.0)).sub(0.5);

    const turbX = sin(float(0.0).add(t.mul(2.0))).mul(0.15);
    const turbY = cos(float(0.0).add(t.mul(2.0))).mul(0.15);

    const dx = h1.add(turbX).mul(1.5).mul(prog);
    const dy = h2.add(turbY).mul(1.5).mul(prog);
    const dz = h3.mul(1.5).mul(prog);

    return vec3(dx, dy, dz);
  }
);

// ============================================================================
// GOLD COLOR CONSTANT
// ============================================================================
export const GOLD_COLOR = /*@__PURE__*/ vec3(0.96, 0.72, 0.2);

// ============================================================================
// NOIR PALETTE
// ============================================================================
export const NOIR_900 = /*@__PURE__*/ vec3(0.04, 0.04, 0.04);
export const SLATE_DARK = /*@__PURE__*/ vec3(0.067, 0.067, 0.075);
