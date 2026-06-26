
'use client';

// C5-REAL: 3D Kintsugi Splatting Carousel — TSL/WebGPU Architecture
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
// Migrated from GLSL ShaderMaterial to TSL NodeMaterial
// 4 GLSL shaders → 2 TSL NodeMaterials (front face + disintegration particles)

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
} from 'three/tsl';
import { MeshStandardNodeMaterial, PointsNodeMaterial } from 'three/webgpu';
import WebGPUCanvas from './WebGPUCanvas';

import { allArtworks } from '@/data/artworks';
import {
  hashVec2,
  slateRelief,
  chaosRipple,
  cursorPush,
  micaSparkles,
  kintsugiVeins,
  cursorLighting,
  disintegrationDisplace,
  GOLD_COLOR,
} from '@/lib/tsl/naroa-nodes';

// Injecting the complete artwork dataset into the 3D Splatting Carousel
const carouselArtworks = allArtworks.map(art => ({ src: art.img, title: art.title }));

function KintsugiSplatCard({ url, index, count, currentAngleRef, setActiveIndex }: {
  url: string;
  index: number;
  count: number;
  currentAngleRef: React.MutableRefObject<number>;
  setActiveIndex: (idx: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const tex = useLoader(THREE.TextureLoader, url);
  const [hovered, setHovered] = useState(false);
  const [mouseUV] = useState(() => new THREE.Vector2(0.5, 0.5));

  const [appModeVal, setAppModeVal] = useState(() => {
    if (typeof window !== 'undefined') {
      const initialMode = localStorage.getItem('naroa_app_mode') || 'ORDEN';
      return initialMode === 'CAOS' ? 1.0 : 0.0;
    }
    return 0.0;
  });

  useEffect(() => {
    const handleDimension = (e: Event) => {
      const mode = (e as CustomEvent).detail;
      setAppModeVal(mode === 'CAOS' ? 1.0 : 0.0);
    };
    window.addEventListener('dimension-changed', handleDimension);
    return () => window.removeEventListener('dimension-changed', handleDimension);
  }, []);

  // Angular offset of this card in the circle
  const cardOffsetAngle = (index / count) * Math.PI * 2;
  const radius = Math.max(2.5, (count * 1.4) / (2 * Math.PI));

  // Grid for particle system
  const gridResolution = 80;
  const [positions, uvs] = useMemo(() => {
    const posArr = new Float32Array(gridResolution * gridResolution * 3);
    const uvArr = new Float32Array(gridResolution * gridResolution * 2);

    for (let i = 0; i < gridResolution; i++) {
      for (let j = 0; j < gridResolution; j++) {
        const u = i / (gridResolution - 1);
        const v = j / (gridResolution - 1);
        const idx3 = (i * gridResolution + j) * 3;
        const idx2 = (i * gridResolution + j) * 2;
        posArr[idx3] = (u - 0.5) * 1.2;
        posArr[idx3 + 1] = (v - 0.5) * 1.6;
        posArr[idx3 + 2] = 0;
        uvArr[idx2] = u;
        uvArr[idx2 + 1] = v;
      }
    }
    return [posArr, uvArr];
  }, []);

  // ---- TSL UNIFORMS ----
  // Front face uniforms
  const uFrontTime = useMemo(() => uniform(0.0), []);
  const uFrontMouseUV = useMemo(() => uniform(new THREE.Vector2(0.5, 0.5)), []);
  const uFrontHover = useMemo(() => uniform(0.0), []);
  const uFrontOpacity = useMemo(() => uniform(1.0), []);
  const uFrontAppMode = useMemo(() => uniform(0.0), []);
  const uFrontTexture = useMemo(() => {
    const t = new THREE.Texture();
    t.minFilter = THREE.LinearFilter;
    return uniform(t as any) as any;
  }, []);

  // Disintegration particle uniforms
  const uParticleProgress = useMemo(() => uniform(0.0), []);
  const uParticleTime = useMemo(() => uniform(0.0), []);
  const uParticleTexture = useMemo(() => {
    const t = new THREE.Texture();
    t.minFilter = THREE.LinearFilter;
    return uniform(t as any) as any;
  }, []);

  // ---- FRONT FACE TSL MATERIAL ----
  const frontMaterial = useMemo(() => {
    const mat = new MeshStandardNodeMaterial();
    mat.transparent = true;
    mat.roughness = 0.85;
    mat.metalness = 0.0;

    const uvNode = uv();
    const pos = positionLocal.toVar();

    // Wave displacement simulating slate relief
    const wave = sin(uvNode.x.mul(8.0).add(uFrontTime.mul(0.5)))
      .mul(cos(uvNode.y.mul(8.0).add(uFrontTime.mul(0.5))))
      .mul(0.003);

    // Chaos wave
    const chaosWave = sin(uvNode.x.mul(16.0).add(uFrontTime.mul(1.5)))
      .mul(cos(uvNode.y.mul(16.0).add(uFrontTime.mul(1.5))))
      .mul(0.015)
      .mul(uFrontAppMode);

    // Local displacement near cursor
    const dist = distance(uvNode, uFrontMouseUV);
    const force = smoothstep(float(0.25), float(0.0), dist);
    const zDisp = wave.add(force.mul(0.012).mul(uFrontHover)).add(chaosWave);

    mat.positionNode = vec3(pos.x, pos.y, pos.z.add(zDisp));

    // ---- FRAGMENT: Color Node ----
    const colorFn = Fn(() => {
      const texColor = texture(uFrontTexture, uv());

      const normal = normalize(normalLocal);
      const viewDir = normalize(vec3(0.0, 0.0, 1.0));

      // Mouse light source
      const lightPos = vec3(uFrontMouseUV.x.sub(0.5), uFrontMouseUV.y.sub(0.5), float(0.3));
      const surfacePos = vec3(uv().x.sub(0.5), uv().y.sub(0.5), float(0.0));
      const lightDir = normalize(lightPos.sub(surfacePos));

      const diff = max(dot(normal, lightDir), float(0.0));
      const halfDir = normalize(lightDir.add(viewDir));
      const spec = pow(max(dot(normal, halfDir), float(0.0)), float(32.0));

      // Mica sparkles
      const micaNoise = hashVec2(floor(uv().mul(180.0)));
      const angleFactor = max(dot(normal, halfDir), float(0.0));
      const speed = float(1.5).add(micaNoise.mul(2.0));
      const blink = float(0.4).add(float(0.6).mul(sin(uFrontTime.mul(speed).add(micaNoise.mul(10.0)))));
      const micaSparkle = pow(angleFactor, float(48.0)).mul(blink).mul(uFrontHover).mul(2.2)
        .mul(step(float(0.95), micaNoise));

      // Kintsugi gold veins
      const kintsugiNoise = sin(uv().x.mul(24.0).add(uv().y.mul(36.0)).add(sin(uv().x.mul(50.0)).mul(0.4)));
      const veinWidth = float(0.012)
        .add(sin(uFrontTime.mul(1.2).add(uv().x.mul(6.0))).mul(0.003))
        .add(uFrontAppMode.mul(0.012));
      const isVein = smoothstep(veinWidth, float(0.0), abs(kintsugiNoise.sub(0.15)));

      // Hover glow near the vein
      const distToMouse = distance(uv(), uFrontMouseUV);
      const glow = smoothstep(float(0.2), float(0.0), distToMouse).mul(uFrontHover);

      // Lighting composition
      const ambient = texColor.rgb.mul(0.45);
      const diffuseColor = texColor.rgb.mul(diff).mul(0.65);
      const specularColor = vec3(1.0, 1.0, 1.0).mul(spec).mul(0.3).mul(uFrontHover);

      const litColor = ambient.add(diffuseColor).add(specularColor);
      const withSparkles = litColor.add(GOLD_COLOR.mul(micaSparkle));

      // Gold veins
      const veinColor = GOLD_COLOR
        .mul(float(1.2).add(glow.mul(2.5)).add(uFrontAppMode.mul(2.0)))
        .mul(float(0.85).add(float(0.15).mul(sin(uFrontTime.mul(5.0)))));
      const finalColor = mix(withSparkles, veinColor, isVein.mul(0.9));

      return vec4(finalColor, float(1.0));
    });

    mat.colorNode = colorFn();
    mat.opacityNode = uFrontOpacity;

    return mat;
  }, [uFrontTime, uFrontMouseUV, uFrontHover, uFrontOpacity, uFrontAppMode, uFrontTexture]);

  // ---- DISINTEGRATION PARTICLE TSL MATERIAL ----
  const particleMaterial = useMemo(() => {
    const mat = new PointsNodeMaterial();
    mat.transparent = true;
    mat.depthWrite = false;
    mat.blending = THREE.AdditiveBlending;

    // Position: displace particles based on progress
    const uvNode = uv();
    const pos = positionLocal.toVar();
    const displace = disintegrationDisplace(uvNode, uParticleProgress, uParticleTime);
    mat.positionNode = pos.add(displace);

    // Size: shimmer effect
    const shimmer = float(1.0).add(sin(uParticleTime.mul(5.0).add(uv().x.mul(10.0))).mul(0.2));
    mat.sizeNode = float(18.0).mul(shimmer);
    mat.sizeAttenuation = true;

    // Color: morph from texture to gold
    const colorFn = Fn(() => {
      const texColor = texture(uParticleTexture, uv());
      const goldMorph = GOLD_COLOR.mul(
        float(0.8).add(sin(uParticleTime.mul(3.0).add(uv().y.mul(5.0))).mul(0.2))
      );
      const mixedColor = mix(texColor.rgb, goldMorph, uParticleProgress.mul(0.8));
      const alpha = float(1.0).sub(uParticleProgress.mul(0.3)).mul(0.9);
      return vec4(mixedColor, alpha);
    });

    mat.colorNode = colorFn();

    return mat;
  }, [uParticleProgress, uParticleTime, uParticleTexture]);

  // Assign texture to both materials
  useEffect(() => {
    if (tex) {
      const clonedTex = tex.clone();
      clonedTex.minFilter = THREE.LinearFilter;
      clonedTex.needsUpdate = true;
      uFrontTexture.value = clonedTex;
      uParticleTexture.value = clonedTex;
    }
  }, [tex, uFrontTexture, uParticleTexture]);

  useFrame((state, delta) => {
    const worldAngle = cardOffsetAngle + currentAngleRef.current;
    const targetX = Math.sin(worldAngle) * radius;
    const targetZ = Math.cos(worldAngle) * radius;

    // Smooth lerp to target position
    if (meshRef.current) {
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 6);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 6);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, hovered ? 0.25 : 0, delta * 6);
      meshRef.current.lookAt(0, 0, 0);
    }

    if (pointsRef.current) {
      pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, targetX, delta * 6);
      pointsRef.current.position.z = THREE.MathUtils.lerp(pointsRef.current.position.z, targetZ, delta * 6);
      pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, hovered ? 0.25 : 0, delta * 6);
      pointsRef.current.lookAt(0, 0, 0);
    }

    // DISINTEGRATION MATH
    const cosAngle = Math.cos(worldAngle);
    const targetProgress = 1.0 - (cosAngle + 1.0) / 2.0;

    uParticleProgress.value = THREE.MathUtils.lerp(uParticleProgress.value as number, targetProgress, delta * 5);
    uParticleTime.value = state.clock.getElapsedTime();

    // Cross-fade solid mesh vs particles
    const progress = uParticleProgress.value as number;
    const isSolid = progress <= 0.45;

    const targetHover = hovered ? 1.0 : 0.0;
    uFrontHover.value = THREE.MathUtils.lerp(uFrontHover.value as number, targetHover, delta * 6);
    uFrontTime.value = state.clock.getElapsedTime();
    uFrontOpacity.value = THREE.MathUtils.lerp(uFrontOpacity.value as number, isSolid ? 1.0 : 0.0, delta * 10);
    uFrontAppMode.value = THREE.MathUtils.lerp(uFrontAppMode.value as number, appModeVal, delta * 5.0);
    (uFrontMouseUV.value as THREE.Vector2).copy(mouseUV);

    if (meshRef.current) {
      meshRef.current.visible = isSolid;
    }
    if (pointsRef.current) {
      pointsRef.current.visible = !isSolid;
    }
  });

  const handlePointerMove = (e: { stopPropagation: () => void; uv?: THREE.Vector2 }) => {
    e.stopPropagation();
    if (e.uv) {
      mouseUV.copy(e.uv);
    }
  };

  return (
    <>
      {/* Solid Slate Card (renders when facing front) */}
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          setActiveIndex(index);
        }}
        onPointerOut={() => setHovered(false)}
        onPointerMove={handlePointerMove}
        onClick={() => setActiveIndex(index)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.2, 1.6, 0.05]} />
        {/* Front face uses TSL material */}
        <primitive object={frontMaterial} attach="material-4" />
        {/* Dark rock slate material for sides/back */}
        <meshStandardMaterial attach="material-0" color="#111113" roughness={0.9} />
        <meshStandardMaterial attach="material-1" color="#111113" roughness={0.9} />
        <meshStandardMaterial attach="material-2" color="#111113" roughness={0.9} />
        <meshStandardMaterial attach="material-3" color="#111113" roughness={0.9} />
        <meshStandardMaterial attach="material-5" color="#08080a" roughness={0.95} />
      </mesh>

      {/* Disintegrated Points System (renders when rotating away) */}
      <points ref={pointsRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-uv" args={[uvs, 2]} />
        </bufferGeometry>
        <primitive object={particleMaterial} attach="material" />
      </points>
    </>
  );
}

function FloatingLights() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.getElapsedTime()) * 3.5;
      lightRef.current.position.y = Math.cos(state.clock.getElapsedTime() * 0.4) * 2.0;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <pointLight ref={lightRef} distance={8} intensity={5} color="#2B3BE5" />
    </>
  );
}

function CarouselAngleInterpolator({ targetAngle, currentAngleRef }: { targetAngle: number; currentAngleRef: React.MutableRefObject<number> }) {
  useFrame((_state, delta) => {
    currentAngleRef.current = THREE.MathUtils.lerp(
      currentAngleRef.current,
      targetAngle,
      delta * 4
    );
  });
  return null;
}

export default function ThreeDCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentAngleRef = useRef(0);
  const targetAngle = -activeIndex * (Math.PI * 2 / carouselArtworks.length);

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % carouselArtworks.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + carouselArtworks.length) % carouselArtworks.length);
  };

  return (
    <section className="relative z-10 w-full py-24 bg-black border-t border-white/5 overflow-hidden flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full px-6 mb-12 text-center">
        <span className="text-primary/70 font-sans tracking-[0.4em] uppercase text-[9px] mb-2 block">
          Arqueología Virtual 3D — #C5-REAL
        </span>
        <h2 className="text-3xl sm:text-5xl font-brutal-title text-foreground">
          Galería Tridimensional
        </h2>
        <p className="max-w-xl mx-auto text-foreground/40 font-sans text-xs tracking-wider mt-4 leading-relaxed">
          Haz clic o navega para orbitar. Las pizarras se desintegran físicamente en filamentos de oro y partículas cuánticas (Splatting) conforme se alejan del eje central.
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-[600px] relative">
        {/* Glow halo behind canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.06)_0%,transparent_60%)] pointer-events-none z-0" />

        <WebGPUCanvas
          camera={{ position: [0, 0, 4.0], fov: 60 }}
          dpr={[1, 1.5]}
          shadows
          className="z-10"
        >
          <FloatingLights />
          <CarouselAngleInterpolator targetAngle={targetAngle} currentAngleRef={currentAngleRef} />
          {carouselArtworks.map((art, idx) => (
            <KintsugiSplatCard
              key={art.src}
              url={art.src}
              index={idx}
              count={carouselArtworks.length}
              currentAngleRef={currentAngleRef}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </WebGPUCanvas>

        {/* Carousel Navigation HUD */}
        <button
          onClick={prevCard}
          className="absolute left-6 md:left-20 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/10 hover:border-primary text-white hover:text-primary transition-all duration-300 font-serif text-lg bg-black/40 backdrop-blur-sm cursor-pointer flex items-center justify-center rounded-sm"
          aria-label="Previous slate"
        >
          ‹
        </button>
        <button
          onClick={nextCard}
          className="absolute right-6 md:right-20 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/10 hover:border-primary text-white hover:text-primary transition-all duration-300 font-serif text-lg bg-black/40 backdrop-blur-sm cursor-pointer flex items-center justify-center rounded-sm"
          aria-label="Next slate"
        >
          ›
        </button>

        {/* Selected Art Overlay HUD */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/70 backdrop-blur-md border border-white/10 px-8 py-4 rounded-sm flex flex-col items-center gap-1 shadow-2xl">
          <span className="text-primary font-mono text-[8px] tracking-[0.3em] uppercase">
            Pizarra #{activeIndex + 1} / {carouselArtworks.length}
          </span>
          <span className="text-white font-serif tracking-widest text-sm uppercase">
            {carouselArtworks[activeIndex].title}
          </span>
        </div>
      </div>
    </section>
  );
}
