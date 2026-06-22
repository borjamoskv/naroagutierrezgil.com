/* eslint-disable react-hooks/immutability */
'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface CarouselItem {
  src: string;
  title: string;
}

const carouselArtworks: CarouselItem[] = [
  { src: '/assets/el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari' },
  { src: '/assets/geisha-MfRtKWdu.webp', title: 'Geisha' },
  { src: '/assets/hq-james-CjsTrO7r.webp', title: 'James Dean' },
  { src: '/assets/hq-amy-BRTriASV.webp', title: 'Amy Winehouse' },
  { src: '/assets/lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro' },
  { src: '/assets/la-pensadora-CFHSnMA0.webp', title: 'La Pensadora' }
];

// Custom Vertex Shader for JIT Particle Disintegration (Splat Effect)
const cardVertexShader = `
  uniform float uProgress;
  uniform float uTime;
  
  varying vec2 vUv;
  
  // Hash function for random particle direction
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    if (uProgress > 0.01) {
      // Create random displacement vector based on position
      float h1 = hash(uv * 13.0) - 0.5;
      float h2 = hash(uv * 17.0) - 0.5;
      float h3 = hash(uv * 23.0) - 0.5;
      vec3 displace = vec3(h1, h2, h3) * 1.5;
      
      // Add wave-like turbulence
      displace.x += sin(position.y * 3.0 + uTime * 2.0) * 0.15;
      displace.y += cos(position.x * 3.0 + uTime * 2.0) * 0.15;
      
      // Disintegrate out based on progress
      pos += displace * uProgress;
    }
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    // Scale particle size in 3D space with a gold/mica shimmer effect
    float shimmer = 1.0 + sin(uTime * 5.0 + uv.x * 10.0) * 0.2;
    gl_PointSize = (18.0 / -viewPosition.z) * shimmer;
  }
`;

const cardFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform float uTime;
  
  varying vec2 vUv;
  
  void main() {
    // Circle shape for particles
    vec2 temp = gl_PointCoord - vec2(0.5);
    if (length(temp) > 0.5) {
      discard;
    }
    
    vec4 texColor = texture2D(uTexture, vUv);
    
    // Morph color into golden/mica splat particles when disintegrating
    vec3 goldColor = vec3(0.96, 0.72, 0.2) * (0.8 + sin(uTime * 3.0 + vUv.y * 5.0) * 0.2);
    vec3 mixedColor = mix(texColor.rgb, goldColor, uProgress * 0.8);
    
    // Soft particle alpha falloff
    float alpha = smoothstep(0.5, 0.1, length(temp)) * (1.0 - uProgress * 0.3);
    gl_FragColor = vec4(mixedColor, alpha * 0.9);
  }
`;

function KintsugiSplatCard({ url, index, count, _activeIndex, currentAngleRef, setActiveIndex }: {
  url: string;
  index: number;
  count: number;
  _activeIndex: number;
  currentAngleRef: React.MutableRefObject<number>;
  setActiveIndex: (idx: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const solidMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const texture = useLoader(THREE.TextureLoader, url);
  const [hovered, setHovered] = useState(false);

  // Angular offset of this card in the circle
  const cardOffsetAngle = (index / count) * Math.PI * 2;
  const radius = 2.5;

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
        
        posArr[idx3] = (u - 0.5) * 1.2;     // Width matches boxGeometry
        posArr[idx3 + 1] = (v - 0.5) * 1.6; // Height matches boxGeometry
        posArr[idx3 + 2] = 0;
        
        uvArr[idx2] = u;
        uvArr[idx2 + 1] = v;
      }
    }
    return [posArr, uvArr];
  }, []);

  const uniforms = useMemo(() => ({
    uTexture: { value: null as THREE.Texture | null },
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 }
  }), []);

  useEffect(() => {
    if (texture && materialRef.current) {
      texture.minFilter = THREE.LinearFilter;
      materialRef.current.uniforms.uTexture.value = texture;
    }
  }, [texture]);

  useFrame((state, delta) => {
    // Current world angle of this card
    const worldAngle = cardOffsetAngle + currentAngleRef.current;
    
    // Position on the orbit circle
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

    // DISINTEGRATION MATH:
    // cos(worldAngle) is 1.0 when card is directly in front, and -1.0 when directly in back.
    // uProgress goes from 0.0 (front, fully solid) to 1.0 (back, fully disintegrated).
    const cosAngle = Math.cos(worldAngle);
    const targetProgress = 1.0 - (cosAngle + 1.0) / 2.0;
    
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        targetProgress,
        delta * 5
      );
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }

    // Cross-fade solid mesh opacity and points visibility
    const progress = materialRef.current?.uniforms.uProgress.value ?? 0.0;
    const isSolid = progress <= 0.45;
    
    if (solidMaterialRef.current) {
      solidMaterialRef.current.opacity = THREE.MathUtils.lerp(
        solidMaterialRef.current.opacity,
        isSolid ? 1.0 : 0.0,
        delta * 10
      );
      solidMaterialRef.current.transparent = true;
    }

    if (meshRef.current) {
      meshRef.current.visible = isSolid;
    }
    if (pointsRef.current) {
      pointsRef.current.visible = !isSolid;
    }
  });

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
        onClick={() => setActiveIndex(index)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.2, 1.6, 0.05]} />
        <meshStandardMaterial
          ref={solidMaterialRef}
          attach="material-4" // Front Face
          map={texture}
          roughness={0.15}
          metalness={0.1}
        />
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
        <shaderMaterial
          ref={materialRef}
          vertexShader={cardVertexShader}
          fragmentShader={cardFragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
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
      delta * 4 // Smooth orbit speed
    );
  });
  return null;
}

export default function ThreeDCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Thread-safe values for interpolation in useFrame
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);

  // Set target angle whenever active card changes
  useEffect(() => {
    targetAngleRef.current = -activeIndex * (Math.PI * 2 / carouselArtworks.length);
  }, [activeIndex]);

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
        <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-wide text-foreground uppercase">
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
        
        <Canvas
          camera={{ position: [0, 0, 4.0], fov: 60 }}
          dpr={[1, 1.5]}
          shadows
          className="z-10"
        >
          <FloatingLights />
          <CarouselAngleInterpolator targetAngle={targetAngleRef.current} currentAngleRef={currentAngleRef} />
          {carouselArtworks.map((art, idx) => (
            <KintsugiSplatCard
              key={art.src}
              url={art.src}
              index={idx}
              count={carouselArtworks.length}
              _activeIndex={activeIndex}
              currentAngleRef={currentAngleRef}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </Canvas>

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
