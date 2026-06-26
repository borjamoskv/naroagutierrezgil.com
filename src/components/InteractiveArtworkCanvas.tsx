'use client';

// C5-REAL: Interactive Artwork Canvas — TSL/WebGPU Architecture
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
// Migrated from GLSL ShaderMaterial to TSL NodeMaterial

import { useFrame, useLoader } from '@react-three/fiber';
import { useRef, useMemo, useEffect, useState } from 'react';
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
} from 'three/tsl';
import { MeshStandardNodeMaterial } from 'three/webgpu';
import WebGPUCanvas from './WebGPUCanvas';
import {
  hashVec2,
  kintsugiVeins,
  GOLD_COLOR,
} from '@/lib/tsl/naroa-nodes';

function VolumetricPlane({ url, mouse, isHovered }: { url: string; mouse: THREE.Vector2; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useLoader(THREE.TextureLoader, url);
  const [appModeVal, setAppModeVal] = useState(0.0);

  // TSL uniforms
  const uTime = useMemo(() => uniform(0.0), []);
  const uMouse = useMemo(() => uniform(new THREE.Vector2(0.5, 0.5)), []);
  const uHover = useMemo(() => uniform(0.0), []);
  const uAppMode = useMemo(() => uniform(0.0), []);
  const uTexture = useMemo(() => {
    const t = new THREE.Texture();
    t.minFilter = THREE.LinearFilter;
    return uniform(t as any) as any;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialMode = localStorage.getItem('naroa_app_mode') || 'ORDEN';
      setAppModeVal(initialMode === 'CAOS' ? 1.0 : 0.0);
    }
    const handleDimension = (e: Event) => {
      const mode = (e as CustomEvent).detail;
      setAppModeVal(mode === 'CAOS' ? 1.0 : 0.0);
    };
    window.addEventListener('dimension-changed', handleDimension);
    return () => window.removeEventListener('dimension-changed', handleDimension);
  }, []);

  // Build TSL NodeMaterial
  const material = useMemo(() => {
    const mat = new MeshStandardNodeMaterial();
    mat.transparent = true;
    mat.roughness = 0.85;
    mat.metalness = 0.0;

    // ---- VERTEX: Position Node ----
    const uvNode = uv();
    const pos = positionLocal.toVar();

    // Wave deformation: liquid ripple under mouse
    const dist = distance(uvNode, uMouse);
    const force = smoothstep(float(0.3), float(0.0), dist);

    const wave = sin(dist.mul(20.0).sub(uTime.mul(4.0))).mul(0.015).mul(force).mul(uHover);
    const chaosWave = sin(dist.mul(35.0).sub(uTime.mul(6.0))).mul(0.03).mul(force).mul(uAppMode);
    const zDisp = wave.add(chaosWave);

    mat.positionNode = vec3(pos.x, pos.y, pos.z.add(zDisp));

    // ---- FRAGMENT: Color Node ----
    const colorFn = Fn(() => {
      const baseUv = uv().toVar();

      // Lens distortion refraction centered at cursor
      const distToMouse = distance(baseUv, uMouse);
      const lensForce = smoothstep(float(0.25), float(0.0), distToMouse);
      const offsetDir = normalize(baseUv.sub(uMouse));
      const lensDistortion = float(0.012).mul(uHover).add(uAppMode.mul(0.025));
      const distortedUv = baseUv.sub(
        offsetDir.mul(sin(distToMouse.mul(6.28)).mul(lensDistortion).mul(lensForce))
      );

      const texColor = texture(uTexture, distortedUv);

      const normal = normalize(normalLocal);
      const viewDir = normalize(vec3(0.0, 0.0, 1.0));

      // Virtual point light floating above cursor
      const lightPos = vec3(uMouse.x.sub(0.5), uMouse.y.sub(0.5), float(0.35));
      const surfacePos = vec3(uv().x.sub(0.5), uv().y.sub(0.5), float(0.0));
      const lightDir = normalize(lightPos.sub(surfacePos));

      const diff = max(dot(normal, lightDir), float(0.0));
      const halfDir = normalize(lightDir.add(viewDir));
      const spec = pow(max(dot(normal, halfDir), float(0.0)), float(32.0));

      // Mica mineral sparkles
      const micaNoise = hashVec2(floor(uv().mul(220.0)));
      const angleFactor = max(dot(normal, halfDir), float(0.0));
      const blink = float(0.4).add(
        float(0.6).mul(sin(uTime.mul(float(2.0).add(micaNoise.mul(3.0))).add(micaNoise.mul(15.0))))
      );
      const micaSparkle = pow(angleFactor, float(64.0)).mul(blink).mul(uHover).mul(2.0)
        .mul(step(float(0.96), micaNoise));

      // Kintsugi veins (only in CAOS mode)
      const kintsugiNoise = sin(uv().x.mul(30.0).add(uv().y.mul(45.0)));
      const veinWidth = float(0.008).mul(uAppMode);
      const isVein = smoothstep(veinWidth, float(0.0), abs(kintsugiNoise.sub(0.2)));

      // Compose lighting
      const ambient = texColor.rgb.mul(0.6);
      const diffuseColor = texColor.rgb.mul(diff).mul(0.5);
      const specularColor = vec3(1.0, 1.0, 1.0).mul(spec).mul(0.25).mul(uHover);

      const litColor = ambient.add(diffuseColor).add(specularColor);
      const withSparkles = litColor.add(GOLD_COLOR.mul(micaSparkle));

      // Gold veins
      const veinColor = GOLD_COLOR.mul(float(1.1).add(uAppMode.mul(1.5)));
      const finalColor = mix(withSparkles, veinColor, isVein.mul(0.8));

      return vec4(finalColor, float(1.0));
    });

    mat.colorNode = colorFn();

    return mat;
  }, [uTime, uMouse, uHover, uAppMode, uTexture]);

  useEffect(() => {
    if (tex) {
      tex.minFilter = THREE.LinearFilter;
      uTexture.value = tex;
    }
  }, [tex, uTexture]);

  useFrame((state, delta) => {
    uTime.value = state.clock.getElapsedTime();
    (uMouse.value as THREE.Vector2).copy(mouse);
    uHover.value = THREE.MathUtils.lerp(uHover.value as number, isHovered ? 1.0 : 0.0, delta * 6.0);
    uAppMode.value = THREE.MathUtils.lerp(uAppMode.value as number, appModeVal, delta * 5.0);
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[2.0, 2.5, 32, 32]} />
    </mesh>
  );
}

export default function InteractiveArtworkCanvas({ url, isHovered, mouseX, mouseY }: {
  url: string;
  isHovered: boolean;
  mouseX: number;
  mouseY: number;
}) {
  const mouseVec = useMemo(() => new THREE.Vector2(0.5, 0.5), []);

  useEffect(() => {
    mouseVec.set(mouseX, mouseY);
  }, [mouseX, mouseY, mouseVec]);

  return (
    <div className="w-full h-full absolute inset-0 z-10 pointer-events-none">
      <WebGPUCanvas
        camera={{ position: [0, 0, 2.0], fov: 60 }}
        dpr={[1, 1.2]}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <VolumetricPlane url={url} mouse={mouseVec} isHovered={isHovered} />
      </WebGPUCanvas>
    </div>
  );
}
