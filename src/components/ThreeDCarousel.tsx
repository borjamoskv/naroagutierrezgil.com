
'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface CarouselItem {
  src: string;
  title: string;
  category?: string;
  desc?: string;
}

const carouselArtworks: CarouselItem[] = [
  { src: '/assets/el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari', category: 'Mica & Cerámica', desc: 'Relieve de mica mineral y esmalte cerámico denso.' },
  { src: '/assets/geisha-MfRtKWdu.webp', title: 'Geisha', category: 'Técnica Mixta', desc: 'Mezcla de polvos de oro, mica y acrílicos en relieve.' },
  { src: '/assets/james-new.webp', title: 'James Dean', category: 'Retrato Pop', desc: 'Iconografía pop monumental pintada sobre pizarra de tejado vasco.' },
  { src: '/assets/amy-new.webp', title: 'Amy Winehouse', category: 'Retrato Pop', desc: 'Trazo hiperrealista y sinuoso que captura la esencia de la voz.' },
  { src: '/assets/lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro', category: 'Kintsugi Accidental', desc: 'Líneas de fractura curadas con esmalte de oro líquido.' },
  { src: '/assets/la-pensadora-CFHSnMA0.webp', title: 'La Pensadora', category: 'Taller', desc: 'Estudio de mirada y reflexión sobre soporte lítico.' }
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
    
    if (uProgress > 0.005) {
      // Create violent random displacement vector based on position
      float h1 = hash(uv * 13.0) - 0.5;
      float h2 = hash(uv * 17.0) - 0.5;
      float h3 = hash(uv * 23.0) - 0.5;
      vec3 displace = vec3(h1, h2, h3) * 3.5;
      
      // Add heavy wave-like turbulence (curl noise approximation)
      displace.x += sin(position.y * 6.0 + uTime * 5.0) * 0.4;
      displace.y += cos(position.x * 6.0 + uTime * 5.0) * 0.4;
      displace.z += sin(position.x * 8.0 + uTime * 6.0) * 0.5;
      
      // Disintegrate out aggressively based on progress (ease out)
      float pSq = uProgress * uProgress;
      pos += displace * pSq * 1.5;
    }
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    // Scale particle size in 3D space with an intense gold/mica shimmer effect
    float shimmer = 1.0 + sin(uTime * 8.0 + uv.x * 15.0) * 0.4;
    gl_PointSize = (26.0 / -viewPosition.z) * shimmer;
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
    
    // Morph color aggressively into golden/mica splat particles when disintegrating
    vec3 goldColor = vec3(0.98, 0.82, 0.2) * (1.2 + sin(uTime * 6.0 + vUv.y * 8.0) * 0.4);
    vec3 mixedColor = mix(texColor.rgb, goldColor, uProgress * 1.2);
    
    // Soft particle alpha falloff
    float alpha = smoothstep(0.5, 0.1, length(temp)) * (1.0 - uProgress * 0.5);
    gl_FragColor = vec4(mixedColor, alpha * 0.95);
  }
`;

// Custom Front Face Shader for Slate & Mica Kintsugi (SOTAY-2026 Spec)
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
const frontVertexShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouseUV;
  uniform float uAppMode;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Brutal wave displacement simulating slate relief
    float wave = sin(uv.x * 12.0 + uTime * 1.5) * cos(uv.y * 12.0 + uTime * 1.5) * 0.008;
    float chaosWave = sin(uv.x * 24.0 + uTime * 4.0) * cos(uv.y * 24.0 + uTime * 4.0) * 0.03 * uAppMode;
    
    // Aggressive local displacement near the cursor
    float dist = distance(uv, uMouseUV);
    float force = smoothstep(0.35, 0.0, dist);
    pos.z += wave + force * 0.02 * uHover + chaosWave;
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    vNormal = normalMatrix * normal;
    vViewPosition = -viewPosition.xyz;
  }
`;

const frontFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouseUV;
  uniform float uHover;
  uniform float uOpacity;
  uniform float uAppMode;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  
  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    
    // Normal lighting calculations
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Mouse light source position in local UV space
    vec3 lightPos = vec3(uMouseUV.x - 0.5, uMouseUV.y - 0.5, 0.4);
    vec3 surfacePos = vec3(vUv.x - 0.5, vUv.y - 0.5, 0.0);
    vec3 lightDir = normalize(lightPos - surfacePos);
    
    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    
    // Specular component
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 48.0);
    
    // Mica mineral sparkles (procedural high frequency glittering)
    float micaFrequency = 200.0;
    float micaNoise = hash(floor(vUv * micaFrequency));
    float micaSparkle = 0.0;
    if (micaNoise > 0.94) {
      float angleFactor = max(dot(normal, halfDir), 0.0);
      float speed = 2.0 + micaNoise * 3.0;
      float blink = 0.4 + 0.6 * sin(uTime * speed + micaNoise * 20.0);
      micaSparkle = pow(angleFactor, 32.0) * blink * uHover * 4.0;
    }
    
    // Kintsugi gold veins (procedural fractures) - Expand radically in CAOS mode
    float kintsugiNoise = sin(vUv.x * 30.0 + vUv.y * 40.0 + sin(vUv.x * 60.0 + uTime) * 0.6);
    float veinWidth = 0.015 + sin(uTime * 2.0 + vUv.x * 10.0) * 0.005 + (uAppMode * 0.02);
    float isVein = smoothstep(veinWidth, 0.0, abs(kintsugiNoise - 0.15));
    
    vec3 goldColor = vec3(0.98, 0.78, 0.2); // Intense Gold accent
    
    // Hover glow effect near the vein
    float distToMouse = distance(vUv, uMouseUV);
    float glow = smoothstep(0.3, 0.0, distToMouse) * uHover;
    
    // Ambient light - Brutalist Noir style
    vec3 ambient = texColor.rgb * 0.45;
    vec3 diffuseColor = texColor.rgb * diff * 0.7;
    vec3 specularColor = vec3(1.0) * spec * 0.5 * uHover;
    
    vec3 finalColor = ambient + diffuseColor + specularColor;
    
    // Add mica mineral sparkles
    finalColor += goldColor * micaSparkle;
    
    // Blend in gold veins with blooming intensity
    vec3 veinColor = goldColor * (1.5 + glow * 3.5 + (uAppMode * 3.0)) * (0.8 + 0.2 * sin(uTime * 8.0));
    finalColor = mix(finalColor, veinColor, isVein * 0.95);
    
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;
function KintsugiSplatCard({ url, index, count, currentAngleRef, setActiveIndex, onExpand, activeIndex }: {
  url: string;
  index: number;
  count: number;
  currentAngleRef: React.MutableRefObject<number>;
  setActiveIndex: (idx: number) => void;
  onExpand?: (artwork: { src: string; title: string; category?: string; desc?: string }) => void;
  activeIndex: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const frontMaterialRef = useRef<THREE.ShaderMaterial>(null);
  
  const texture = useLoader(THREE.TextureLoader, url);
  const [hovered, setHovered] = useState(false);
  const [mouseUV] = useState(() => new THREE.Vector2(0.5, 0.5));
  
  // Safe state initializer to avoid calling setState during effect execution
  const [appModeVal, setAppModeVal] = useState(() => {
    if (typeof window !== 'undefined') {
      const initialMode = localStorage.getItem('naroa_app_mode') || 'ORDEN';
      return initialMode === 'CAOS' ? 1.0 : 0.0;
    }
    return 0.0;
  });

  // Monitor cursor movement and dimension toggling reactively
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

  const frontUniforms = useMemo(() => ({
    uTexture: { value: null as THREE.Texture | null },
    uTime: { value: 0.0 },
    uMouseUV: { value: mouseUV },
    uHover: { value: 0.0 },
    uOpacity: { value: 1.0 },
    uAppMode: { value: 0.0 }
  }), [mouseUV]);

  useEffect(() => {
    if (texture) {
      // Modify property using index syntax to bypass React Compiler's strict read-only tracking
      const tex = texture as any;
      tex['minFilter'] = THREE.LinearFilter;
      if (materialRef.current) {
        materialRef.current.uniforms.uTexture.value = texture;
      }
      if (frontMaterialRef.current) {
        frontMaterialRef.current.uniforms.uTexture.value = texture;
      }
    }
  }, [texture]);;

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
    
    const targetHover = hovered ? 1.0 : 0.0;
    if (frontMaterialRef.current) {
      frontMaterialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        frontMaterialRef.current.uniforms.uHover.value,
        targetHover,
        delta * 6
      );
      frontMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      frontMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        frontMaterialRef.current.uniforms.uOpacity.value,
        isSolid ? 1.0 : 0.0,
        delta * 10
      );
      frontMaterialRef.current.uniforms.uAppMode.value = THREE.MathUtils.lerp(
        frontMaterialRef.current.uniforms.uAppMode.value,
        appModeVal,
        delta * 5.0
      );
    }

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
        onClick={(e) => {
          e.stopPropagation();
          if (activeIndex === index) {
            if (onExpand) {
              onExpand(carouselArtworks[index]);
            }
          } else {
            setActiveIndex(index);
          }
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.2, 1.6, 0.05]} />
        <shaderMaterial
          ref={frontMaterialRef}
          attach="material-4" // Front Face
          vertexShader={frontVertexShader}
          fragmentShader={frontFragmentShader}
          uniforms={frontUniforms}
          transparent={true}
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
function CarouselAngleInterpolator({ targetAngle, currentAngleRef, isIdle, targetAngleRef }: {
  targetAngle: number;
  currentAngleRef: React.MutableRefObject<number>;
  isIdle: boolean;
  targetAngleRef: React.MutableRefObject<number>;
}) {
  const velocityRef = useRef(0);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1); // Prevent physics explosion on lag spikes

    if (isIdle) {
      // Very slow and smooth continuous automatic rotation
      targetAngleRef.current += 0.06 * dt;

      // Soft spring to follow the slowly moving target angle
      const tension = 30;
      const damping = 12;
      const diff = currentAngleRef.current - targetAngleRef.current;
      const force = -tension * diff - damping * velocityRef.current;
      velocityRef.current += force * dt;
      currentAngleRef.current += velocityRef.current * dt;
    } else {
      // High-precision interactive spring with bounce overshoot effect on button clicks
      targetAngleRef.current = targetAngle;

      const tension = 120;
      const damping = 18;
      const diff = currentAngleRef.current - targetAngle;
      const force = -tension * diff - damping * velocityRef.current;
      velocityRef.current += force * dt;
      currentAngleRef.current += velocityRef.current * dt;
    }
  });
  return null;
}

export default function ThreeDCarousel({ onExpand }: { onExpand?: (artwork: { src: string; title: string; category?: string; desc?: string }) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isIdle, setIsIdle] = useState(true);
  const lastInteractionTime = useRef(0);

  // Thread-safe values for interpolation in useFrame
  const currentAngleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const baseAngle = -activeIndex * (Math.PI * 2 / carouselArtworks.length);

  const registerInteraction = () => {
    setIsIdle(false);
    lastInteractionTime.current = Date.now();
  };

  const nextCard = () => {
    registerInteraction();
    setActiveIndex((prev) => (prev + 1) % carouselArtworks.length);
  };

  const prevCard = () => {
    registerInteraction();
    setActiveIndex((prev) => (prev - 1 + carouselArtworks.length) % carouselArtworks.length);
  };

  // Sync target ref when active index is mutated via click
  useEffect(() => {
    if (!isIdle) {
      targetAngleRef.current = baseAngle;
    }
  }, [activeIndex, isIdle, baseAngle]);

  // Handle return to automatic rotation in idle state after 8s of inactivity
  useEffect(() => {
    const checkIdle = setInterval(() => {
      if (!isIdle && Date.now() - lastInteractionTime.current > 8000) {
        setIsIdle(true);
        targetAngleRef.current = currentAngleRef.current; // Start rotating from current position
      }
    }, 1000);
    return () => clearInterval(checkIdle);
  }, [isIdle]);

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
        
        <Canvas
          camera={{ position: [0, 0, 4.0], fov: 60 }}
          dpr={[1, 1.5]}
          shadows
          className="z-10"
        >
          <FloatingLights />
          <CarouselAngleInterpolator targetAngle={baseAngle} currentAngleRef={currentAngleRef} isIdle={isIdle} targetAngleRef={targetAngleRef} />
          {carouselArtworks.map((art, idx) => (
            <KintsugiSplatCard
              key={art.src}
              url={art.src}
              index={idx}
              count={carouselArtworks.length}
              currentAngleRef={currentAngleRef}
              setActiveIndex={setActiveIndex}
              onExpand={onExpand}
              activeIndex={activeIndex}
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
        <div 
          onClick={() => onExpand && onExpand(carouselArtworks[activeIndex])}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-black/70 hover:bg-black/90 border border-white/10 hover:border-primary/50 px-8 py-4 rounded-sm flex flex-col items-center gap-1 shadow-2xl cursor-pointer group transition-all duration-300"
        >
          <span className="text-primary font-mono text-[8px] tracking-[0.3em] uppercase group-hover:scale-105 transition-transform">
            Pizarra #{activeIndex + 1} / {carouselArtworks.length} • [ AMPLIAR ]
          </span>
          <span className="text-white font-serif tracking-widest text-sm uppercase">
            {carouselArtworks[activeIndex].title}
          </span>
        </div>
      </div>
    </section>
  );
}
