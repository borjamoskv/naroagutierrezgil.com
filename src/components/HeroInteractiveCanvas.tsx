'use client';

// C5-REAL: Hero Interactive Canvas — TSL/WebGPU Architecture
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
// Migrated from GLSL ShaderMaterial to TSL NodeMaterial

import { useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
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
  If,
} from 'three/tsl';
import { MeshStandardNodeMaterial } from 'three/webgpu';
import WebGPUCanvas from './WebGPUCanvas';
import {
  hashVec2,
  slateRelief,
  chaosRipple,
  cursorPush,
  micaSparkles,
  kintsugiVeins,
  cursorLighting,
  GOLD_COLOR,
} from '@/lib/tsl/naroa-nodes';

function VolumetricHeroPortrait({ url }: { url: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useLoader(THREE.TextureLoader, url);
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const targetMouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const scrollProgressRef = useRef(0);
  const [appModeVal, setAppModeVal] = useState(0.0);

  // TSL uniforms — mutable .value
  const uTime = useMemo(() => uniform(0.0), []);
  const uMouse = useMemo(() => uniform(new THREE.Vector2(0.5, 0.5)), []);
  const uScrollProgress = useMemo(() => uniform(0.0), []);
  const uOpacity = useMemo(() => uniform(0.0), []);
  const uAppMode = useMemo(() => uniform(0.0), []);
  const uTexture = useMemo(() => {
    const t = new THREE.Texture();
    t.minFilter = THREE.LinearFilter;
    return uniform(t as any) as any;
  }, []);

  // Build TSL NodeMaterial
  const material = useMemo(() => {
    const mat = new MeshStandardNodeMaterial();
    mat.transparent = true;
    mat.depthWrite = true;
    mat.roughness = 0.85;
    mat.metalness = 0.0;

    // ---- VERTEX: Position Node ----
    const uvNode = uv();
    const pos = positionLocal.toVar();

    // Slate relief displacement
    const relief = slateRelief(uvNode, uTime, float(0.01));

    // Cursor push
    const cursorDist = distance(uvNode, uMouse);
    const cursorForce = smoothstep(float(0.35), float(0.0), cursorDist);
    const push = cursorForce.mul(0.04).mul(float(1.0).sub(uScrollProgress));

    // Chaos ripple in CAOS mode
    const chaos = chaosRipple(uvNode, uTime, uAppMode);

    // Scroll disintegration deformation
    const scrollX = sin(uvNode.y.mul(10.0).add(uTime.mul(2.0))).mul(0.15).mul(uScrollProgress);
    const scrollY = cos(uvNode.x.mul(10.0).add(uTime.mul(2.0))).mul(0.15).mul(uScrollProgress);
    const scrollZ = uScrollProgress.mul(0.5);

    const displaced = vec3(
      pos.x.add(scrollX),
      pos.y.add(scrollY),
      pos.z.add(relief).add(push).add(chaos).add(scrollZ)
    );
    mat.positionNode = displaced;

    // ---- FRAGMENT: Color Node ----
    const colorFn = Fn(() => {
      const texUv = uv().toVar();

      // Glitch coordinates in CHAOS mode
      const glitchForce = sin(uTime.mul(15.0).add(texUv.y.mul(40.0))).mul(0.005).mul(uAppMode);
      const glitchedUv = vec2(texUv.x.add(glitchForce), texUv.y);

      const texColor = texture(uTexture, glitchedUv);

      // Normalized vectors for lighting
      const normal = normalize(normalLocal);
      const viewDir = normalize(vec3(0.0, 0.0, 1.0));

      // Cursor light
      const lightResult = cursorLighting(uv(), uMouse, normal, viewDir, float(0.45));
      const diff = lightResult.x;
      const spec = lightResult.y;
      const distFactor = lightResult.z;

      // Half direction for sparkles
      const lightPos = vec3(uMouse.x.sub(0.5), uMouse.y.sub(0.5), float(0.45));
      const surfacePos = vec3(uv().x.sub(0.5), uv().y.sub(0.5), float(0.0));
      const lightDir = normalize(lightPos.sub(surfacePos));
      const halfDir = normalize(lightDir.add(viewDir));

      // Mica sparkles
      const sparkle = micaSparkles(
        uv(), uTime, normal, halfDir,
        float(1.0), // always active for hero
        float(0.5).add(float(0.5).mul(distFactor)),
        float(200.0), // frequency
        float(0.94)   // threshold
      );

      // Kintsugi veins
      const vein = kintsugiVeins(uv(), uTime, uAppMode, float(16.0), float(22.0));

      // Glow near mouse for veins
      const goldVeinGlow = smoothstep(float(0.3), float(0.0), distance(uv(), uMouse));

      // Compose lighting
      const ambient = texColor.rgb.mul(0.5);
      const diffuseColor = texColor.rgb.mul(diff).mul(0.7);
      const specularColor = vec3(1.0, 1.0, 1.0).mul(spec).mul(0.25);

      const litColor = ambient.add(diffuseColor).add(specularColor);

      // Add sparkles
      const withSparkles = litColor.add(GOLD_COLOR.mul(sparkle).mul(1.8));

      // Inject kintsugi
      const veinColor = GOLD_COLOR.mul(
        float(1.1).add(goldVeinGlow.mul(2.0)).add(uAppMode.mul(1.5))
      ).mul(float(0.8).add(float(0.2).mul(sin(uTime.mul(3.5)))));

      const finalColor = mix(withSparkles, veinColor, vein.mul(0.85));

      return vec4(finalColor, float(1.0));
    });

    mat.colorNode = colorFn();

    // ---- FRAGMENT: Opacity Node ----
    mat.opacityNode = uOpacity.mul(float(1.0).sub(uScrollProgress));

    return mat;
  }, [uTime, uMouse, uScrollProgress, uOpacity, uAppMode, uTexture]);

  // Monitor cursor, scroll, and dimension state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialMode = localStorage.getItem('naroa_app_mode') || 'ORDEN';
      setAppModeVal(initialMode === 'CAOS' ? 1.0 : 0.0);
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current.x = e.clientX / window.innerWidth;
      targetMouseRef.current.y = 1.0 - (e.clientY / window.innerHeight);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.8;
      scrollProgressRef.current = Math.min(Math.max(scrollY / threshold, 0.0), 1.0);
    };

    const handleDimension = (e: Event) => {
      const mode = (e as CustomEvent).detail;
      setAppModeVal(mode === 'CAOS' ? 1.0 : 0.0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('dimension-changed', handleDimension);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('dimension-changed', handleDimension);
    };
  }, []);

  // Assign texture once loaded
  useEffect(() => {
    if (tex) {
      tex.minFilter = THREE.LinearFilter;
      uTexture.value = tex;
    }
  }, [tex, uTexture]);

  useFrame((state, delta) => {
    // Lerp mouse coordinates for smooth inertia
    mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, targetMouseRef.current.x, delta * 5.0);
    mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, targetMouseRef.current.y, delta * 5.0);

    // Update TSL uniforms
    uTime.value = state.clock.getElapsedTime();
    (uMouse.value as THREE.Vector2).set(mouseRef.current.x, mouseRef.current.y);
    uScrollProgress.value = THREE.MathUtils.lerp(uScrollProgress.value as number, scrollProgressRef.current, delta * 6.0);
    uAppMode.value = THREE.MathUtils.lerp(uAppMode.value as number, appModeVal, delta * 5.0);
    // Smooth fade-in on mount
    uOpacity.value = THREE.MathUtils.lerp(uOpacity.value as number, 1.0, delta * 2.0);

    // Apply camera/plane parallax rotation
    if (meshRef.current) {
      const tiltX = (mouseRef.current.y - 0.5) * 0.12;
      const tiltY = (mouseRef.current.x - 0.5) * -0.12;
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, tiltX, delta * 4.0);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, tiltY, delta * 4.0);

      // Move back slightly on scroll
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, -scrollProgressRef.current * 1.5, delta * 4.0);
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow material={material}>
      <planeGeometry args={[2.8, 3.5, 64, 64]} />
    </mesh>
  );
}

export default function HeroInteractiveCanvas({ url }: { url: string }) {
  return (
    <div className="w-full h-full relative z-10">
      {/* Background glow vignette inside the canvas space */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.04)_0%,transparent_70%)] pointer-events-none z-0" />

      <WebGPUCanvas
        camera={{ position: [0, 0, 3.2], fov: 60 }}
        dpr={[1, 1.5]}
        className="w-full h-full"
        style={{ background: '#050505' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 3]} intensity={1.0} castShadow />
        <VolumetricHeroPortrait url={url} />
      </WebGPUCanvas>
    </div>
  );
}
