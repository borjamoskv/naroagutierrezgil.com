'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Html, Environment, Float, ContactShadows, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Shaders for Interactive Canvas Details Viewer
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
    
    // Wave displacement simulating slate relief
    float wave = sin(uv.x * 8.0 + uTime * 0.5) * cos(uv.y * 8.0 + uTime * 0.5) * 0.003;
    float chaosWave = sin(uv.x * 16.0 + uTime * 1.5) * cos(uv.y * 16.0 + uTime * 1.5) * 0.015 * uAppMode;
    
    // Local displacement near the cursor
    float dist = distance(uv, uMouseUV);
    float force = smoothstep(0.25, 0.0, dist);
    pos.z += wave + force * 0.012 * uHover + chaosWave;
    
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
    vec3 lightPos = vec3(uMouseUV.x - 0.5, uMouseUV.y - 0.5, 0.3);
    vec3 surfacePos = vec3(vUv.x - 0.5, vUv.y - 0.5, 0.0);
    vec3 lightDir = normalize(lightPos - surfacePos);
    
    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    
    // Specular component
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
    
    // Mica mineral sparkles (procedural glittering)
    float micaFrequency = 180.0;
    float micaNoise = hash(floor(vUv * micaFrequency));
    float micaSparkle = 0.0;
    if (micaNoise > 0.95) {
      float angleFactor = max(dot(normal, halfDir), 0.0);
      float speed = 1.5 + micaNoise * 2.0;
      float blink = 0.4 + 0.6 * sin(uTime * speed + micaNoise * 10.0);
      micaSparkle = pow(angleFactor, 48.0) * blink * uHover * 2.2;
    }
    
    // Kintsugi gold veins (procedural fractures) - Expand in CAOS mode
    float kintsugiNoise = sin(vUv.x * 24.0 + vUv.y * 36.0 + sin(vUv.x * 50.0) * 0.4);
    float veinWidth = 0.012 + sin(uTime * 1.2 + vUv.x * 6.0) * 0.003 + (uAppMode * 0.012);
    float isVein = smoothstep(veinWidth, 0.0, abs(kintsugiNoise - 0.15));
    
    vec3 goldColor = vec3(0.96, 0.72, 0.2); // Gold accent
    
    // Hover glow effect near the vein
    float distToMouse = distance(vUv, uMouseUV);
    float glow = smoothstep(0.2, 0.0, distToMouse) * uHover;
    
    // Ambient light - Noir style
    vec3 ambient = texColor.rgb * 0.45;
    vec3 diffuseColor = texColor.rgb * diff * 0.65;
    vec3 specularColor = vec3(1.0) * spec * 0.3 * uHover;
    
    vec3 finalColor = ambient + diffuseColor + specularColor;
    
    // Add mica mineral sparkles
    finalColor += goldColor * micaSparkle;
    
    // Blend in gold veins
    vec3 veinColor = goldColor * (1.2 + glow * 2.5 + (uAppMode * 2.0)) * (0.85 + 0.15 * sin(uTime * 5.0));
    finalColor = mix(finalColor, veinColor, isVein * 0.9);
    
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

interface Hotspot {
  id: string;
  x: number;
  y: number;
  z: number;
  title: string;
  description: string;
  side: 'front' | 'back';
}

const artworksData = [
  {
    id: 'james',
    title: 'James Dean',
    src: '/assets/james-new.webp',
    material: 'Pizarra de Tejado Vasco',
    year: '2026',
    audioTitle: 'Summer Monroe (Naroart x Borja Moskv Rework)',
    hotspots: [
      {
        id: 'pizarra',
        x: -0.4,
        y: 0.5,
        z: 0.03,
        title: 'Pizarra Centenaria',
        description: 'Pizarra de tejado vasco recuperada de derribos históricos en Bilbao, sellada con resinas epoxi y pulida a mano.',
        side: 'front'
      },
      {
        id: 'kintsugi',
        x: 0.2,
        y: -0.3,
        z: 0.03,
        title: 'Kintsugi Accidental',
        description: 'Textura de cola y acrílico resquebrajada naturalmente y rellenada con esmalte de oro líquido para sanar la grieta.',
        side: 'front'
      },
      {
        id: 'reverso-qr',
        x: 0,
        y: 0,
        z: -0.03,
        title: 'Ledger de Autenticidad',
        description: 'Firma física de la artista, QR criptográfico y enlace al re-work musical electrónico compuesto junto a Borja Moskv.',
        side: 'back'
      }
    ] as Hotspot[]
  },
  {
    id: 'cantinflas',
    title: 'Cantinflas',
    src: '/assets/cantinflas-kintsugi.webp',
    material: 'Kintsugi Accidental',
    year: '2026',
    audioTitle: 'Lágrimas de Oro (Beat & Texture Rework)',
    hotspots: [
      {
        id: 'mica',
        x: 0.3,
        y: 0.4,
        z: 0.03,
        title: 'Mica Shimmer',
        description: 'Láminas minerales de mica encoladas en relieve que interactúan dinámicamente según la incidencia de la luz física.',
        side: 'front'
      },
      {
        id: 'ojos',
        x: -0.1,
        y: 0.1,
        z: 0.03,
        title: 'Gesto de Cristal',
        description: 'Pupila tridimensional construida mediante microcapas superpuestas de barniz cerámico denso aplicadas con palillo.',
        side: 'front'
      },
      {
        id: 'reverso-firmas',
        x: 0.1,
        y: -0.4,
        z: -0.03,
        title: 'Sello de Creador',
        description: 'Crédito de autoría a Borja Moskv y Naroart, detallando el balance de exergía física del proceso de cocción del lienzo.',
        side: 'back'
      }
    ] as Hotspot[]
  },
  {
    id: 'dakari',
    title: 'El Gran Dakari',
    src: '/assets/el-gran-dakari-C1tAWAhR.webp',
    material: 'Pizarra Vasco-Pop',
    year: '2026',
    audioTitle: 'Dakari Rhythm & Mineral Waves',
    hotspots: [
      {
        id: 'cantinflowers',
        x: -0.2,
        y: -0.4,
        z: 0.03,
        title: 'Fusión Cantinflowers',
        description: 'Mezcla termodinámica de cola blanca y acrílico de alta densidad que genera texturas volcánicas resquebrajadas.',
        side: 'front'
      },
      {
        id: 'pop',
        x: 0.2,
        y: 0.3,
        z: 0.03,
        title: 'Hiperrealismo Pop',
        description: 'Trazo de alta precisión y saturación cromática cobalto que desafía la naturaleza rústica del soporte de pizarra.',
        side: 'front'
      }
    ] as Hotspot[]
  },
  {
    id: 'audre',
    title: 'AUDRE...',
    src: '/assets/audrey-hepburn-DbIBTtIp.webp',
    material: 'Acrílico & Basalto',
    year: '2026',
    audioTitle: 'Audrey (Classic & Mineral Waves)',
    hotspots: [
      {
        id: 'elegance',
        x: -0.3,
        y: 0.4,
        z: 0.03,
        title: 'Elegancia Eterna',
        description: 'La sobriedad y pureza del rostro iconográfico capturado en acrílico de alta saturación sobre basalto liso.',
        side: 'front'
      },
      {
        id: 'basalto',
        x: 0.3,
        y: -0.3,
        z: 0.03,
        title: 'Soporte Volcánico',
        description: 'Una pesada losa de basalto cortada a mano, que actúa como el lienzo rústico pero refinado para la obra pop.',
        side: 'front'
      },
      {
        id: 'reverso-audre',
        x: 0.1,
        y: -0.2,
        z: -0.03,
        title: 'Firma y QR Criptográfico',
        description: 'El reverso de la losa incluye la firma física de Naroart, y un código QR enlazado a la sonorización experimental de Borja Moskv.',
        side: 'back'
      }
    ] as Hotspot[]
  }
];

function InteractiveCanvasModel({ src, hotspots, activeHotspot, setActiveHotspot, rotationY, setRotationY }: {
  src: string;
  hotspots: Hotspot[];
  activeHotspot: Hotspot | null;
  setActiveHotspot: (h: Hotspot | null) => void;
  rotationY: number;
  setRotationY: (y: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const frontMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useLoader(THREE.TextureLoader, src);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const mouseUV = useRef(new THREE.Vector2(0.5, 0.5));
  const [appModeVal, setAppModeVal] = useState(0.0);

  // Monitor global dimension state changes reactively
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

  const frontUniforms = useMemo(() => ({
    uTexture: { value: null as THREE.Texture | null },
    uTime: { value: 0.0 },
    uMouseUV: { value: mouseUV.current },
    uHover: { value: 0.0 },
    uOpacity: { value: 1.0 },
    uAppMode: { value: 0.0 }
  }), []);

  useEffect(() => {
    if (texture) {
      const tex = texture as any;
      tex['minFilter'] = THREE.LinearFilter;
      tex['colorSpace'] = THREE.SRGBColorSpace;
      tex['needsUpdate'] = true;
      if (frontMaterialRef.current) {
        frontMaterialRef.current.uniforms.uTexture.value = texture;
      }
    }
  }, [texture]);

  // Handle auto-rotation decay or user interaction updates
  useFrame((state, delta) => {
    if (meshRef.current && !isDragging.current) {
      // Lerp current mesh rotation to target rotationY set by button controls or dragging
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotationY, delta * 5);
    }

    if (frontMaterialRef.current) {
      frontMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      frontMaterialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        frontMaterialRef.current.uniforms.uHover.value,
        hovered ? 1.0 : 0.0,
        delta * 6.0
      );
      frontMaterialRef.current.uniforms.uAppMode.value = THREE.MathUtils.lerp(
        frontMaterialRef.current.uniforms.uAppMode.value,
        appModeVal,
        delta * 5.0
      );
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          isDragging.current = true;
          previousMousePosition.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => {
          isDragging.current = false;
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        onPointerMove={(e) => {
          if (isDragging.current && meshRef.current) {
            const deltaX = e.clientX - previousMousePosition.current.x;
            const newRotY = rotationY + deltaX * 0.01;
            setRotationY(newRotY);
            meshRef.current.rotation.y = newRotY;
            previousMousePosition.current = { x: e.clientX, y: e.clientY };
          } else if (e.uv) {
            mouseUV.current.copy(e.uv);
          }
        }}
      >
        {/* Box geometry representing the heavy slate slab */}
        <boxGeometry args={[1.6, 2.0, 0.06]} />
        
        {/* Left Side */}
        <meshPhysicalMaterial attach="material-0" color="#141416" roughness={0.8} metalness={0.2} clearcoat={0.1} />
        {/* Right Side */}
        <meshPhysicalMaterial attach="material-1" color="#141416" roughness={0.8} metalness={0.2} clearcoat={0.1} />
        {/* Top Side */}
        <meshPhysicalMaterial attach="material-2" color="#1c1c1e" roughness={0.8} metalness={0.2} clearcoat={0.1} />
        {/* Bottom Side */}
        <meshPhysicalMaterial attach="material-3" color="#111113" roughness={0.8} metalness={0.2} clearcoat={0.1} />
        
        {/* Front Face (Artwork with interactive shaders) */}
        <shaderMaterial 
          ref={frontMaterialRef}
          attach="material-4" 
          vertexShader={frontVertexShader}
          fragmentShader={frontFragmentShader}
          uniforms={frontUniforms}
          transparent={true}
        />
        
        {/* Back Face (Natural slate backing + signature + QR code symbol) */}
        <meshPhysicalMaterial 
          attach="material-5" 
          color="#0d0d0f" 
          roughness={0.9} 
          metalness={0.3}
          clearcoat={0.05}
          clearcoatRoughness={0.8}
        />

        {/* Hotspots represented as interactive HTML elements in 3D */}
        {hotspots.map((hotspot) => {
          // Calculate if the hotspot is facing the camera based on rotation
          const currentRotation = meshRef.current ? meshRef.current.rotation.y % (Math.PI * 2) : rotationY % (Math.PI * 2);
          const absRot = Math.abs(currentRotation);
          const isFacingFront = (absRot < Math.PI / 2) || (absRot > Math.PI * 1.5);
          const showHotspot = (hotspot.side === 'front' && isFacingFront) || (hotspot.side === 'back' && !isFacingFront);

          if (!showHotspot) return null;

          return (
            <Html
              key={hotspot.id}
              position={[hotspot.x, hotspot.y, hotspot.z]}
              center
              distanceFactor={3.2}
              className="pointer-events-auto"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot);
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono text-[9px] font-bold cursor-pointer transition-all duration-300 ${
                  activeHotspot?.id === hotspot.id
                    ? 'bg-[#2B3BE5] border-[#2B3BE5] text-white scale-125 shadow-[0_0_15px_#2B3BE5]'
                    : 'bg-black/80 border-white/40 text-white/80 hover:border-[#2B3BE5] hover:text-[#2B3BE5]'
                }`}
              >
                +
              </button>
            </Html>
          );
        })}
      </mesh>
    </group>
  );
}

export default function LuxuryArtworkViewer({ onExpand }: { onExpand?: (artwork: { src: string; title: string; category?: string; desc?: string }) => void }) {
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [rotationY, setRotationY] = useState(0);

  const speakAudreyQuote = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const quotes = [
      "Elegance is the only beauty that never fades.",
      "Nothing is impossible, the word itself says 'I'm possible'!",
      "The most important thing is to enjoy your life - to be happy - it's all that matters.",
      "For beautiful eyes, look for the good in others; for beautiful lips, speak only words of kindness; and for poise, walk with the knowledge that you are never alone."
    ];

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const utterance = new SpeechSynthesisUtterance(quote);

    // Try to get a high-quality female English voice with a British accent (en-GB)
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('female')) ||
                          voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('google')) ||
                          voices.find(v => v.lang === 'en-GB') ||
                          voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
                          voices.find(v => v.lang.startsWith('en'));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 0.85;  // Elegant and soft tempo
    utterance.pitch = 1.15; // Soft feminine high pitch
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const artwork = artworksData[selectedArtworkIndex];

  // Sync audio reference on artwork change
  useEffect(() => {
    setActiveHotspot(null);
    setRotationY(0); // Reset rotation to front view
  }, [selectedArtworkIndex]);



  // Manual rotation controls
  const rotateFront = () => setRotationY(0);
  const rotateBack = () => setRotationY(Math.PI);

  const isBackView = Math.abs(rotationY % (Math.PI * 2)) > Math.PI / 2 && Math.abs(rotationY % (Math.PI * 2)) < Math.PI * 1.5;

  return (
    <section id="alcova-detalles" className="relative z-10 py-32 px-6 sm:px-12 bg-[#080808] border-t border-white/5 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[50vw] h-[50vw] bg-[#2B3BE5]/5 rounded-full filter blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-[#F59E0B]/3 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Title Block */}
        <div className="mb-20 text-center flex flex-col items-center">
          <span className="text-[#2B3BE5] font-mono tracking-[0.4em] text-[9px] uppercase mb-3">
            Exploración de la Materia · Savoir-Faire
          </span>
          <h2 className="text-4xl sm:text-6xl font-brutal-title text-white">
            El Arte en Detalle
          </h2>
          <div className="w-12 h-[1px] bg-white/20 mt-6" />
        </div>

        {/* Artwork Selector Grid Header */}
        <div className="flex justify-center gap-4 sm:gap-8 mb-16 border-b border-white/5 pb-4 max-w-lg mx-auto">
          {artworksData.map((art, idx) => (
            <button
              key={art.id}
              onClick={() => {
                setSelectedArtworkIndex(idx);
                if (art.id === 'audre') {
                  speakAudreyQuote();
                }
              }}
              className={`font-mono text-[9px] sm:text-[10px] tracking-widest uppercase pb-3 transition-all duration-300 border-b cursor-pointer ${
                idx === selectedArtworkIndex
                  ? 'border-[#2B3BE5] text-white font-bold'
                  : 'border-transparent text-white/40 hover:text-white/80'
              }`}
            >
              {art.title}
            </button>
          ))}
        </div>

        {/* main interactive columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Column 1: Info & Hotspots details */}
          <div className="lg:col-span-4 flex flex-col order-2 lg:order-1">
            <div className="border-l border-[#2B3BE5]/40 pl-6 mb-8 flex flex-col gap-3">
              <div className="flex justify-between items-start w-full">
                <div>
                  <span className="text-white/40 font-mono text-[9px] tracking-widest uppercase">
                    {artwork.material} // {artwork.year}
                  </span>
                  <h3 className="text-3xl font-serif font-black text-white uppercase mt-2">
                    {artwork.title}
                  </h3>
                </div>
                {artwork.id === 'audre' && (
                  <button
                    onClick={speakAudreyQuote}
                    className="bg-black/60 border border-white/10 hover:border-primary px-3 py-1.5 rounded-sm font-mono text-[8px] tracking-widest uppercase text-primary hover:text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.02)] flex items-center gap-2"
                    title="Escuchar voz de Audrey"
                  >
                    <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Voice
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onExpand && onExpand({ src: artwork.src, title: artwork.title, category: artwork.material, desc: `Obra original creada en el año ${artwork.year}.` })}
                  className="font-mono text-[9px] tracking-widest uppercase bg-black hover:bg-white/5 border border-white/10 hover:border-[#2B3BE5] px-4 py-2 transition-all cursor-pointer rounded-sm text-white/70 hover:text-white flex items-center gap-2"
                >
                  <span>🔍 Ampliar Obra</span>
                </button>
                <Link
                  href={`/contacto?obra=${artwork.id}&action=adquirir`}
                  className="font-mono text-[9px] tracking-widest uppercase bg-[var(--primary)] hover:bg-white border border-[var(--primary)] hover:border-white px-5 py-2 transition-all cursor-pointer rounded-sm text-white hover:text-black font-bold shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] flex items-center gap-2"
                >
                  <span>🛒 Adquirir / Encargar</span>
                </Link>
              </div>
            </div>

            {/* Dynamic details card based on active hotspot */}
            <div className="min-h-[220px] bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-sm relative shadow-2xl flex flex-col justify-center">
              {activeHotspot ? (
                <div className="animate-[fadeIn_0.5s_ease-out]">
                  <span className="text-[#2B3BE5] font-mono text-[9px] tracking-widest uppercase block mb-2">
                    Detalle: {activeHotspot.title}
                  </span>
                  <p className="text-white/80 font-sans text-sm leading-relaxed">
                    {activeHotspot.description}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 text-white/30 font-mono text-[10px] tracking-widest uppercase">
                  [ Haz clic en los puntos interactivos (+) sobre el lienzo para explorar los detalles de la obra ]
                </div>
              )}
            </div>

            {/* Rotate control buttons (Front / Back view) */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={rotateFront}
                className={`flex-1 py-3.5 border font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                  !isBackView
                    ? 'border-[#2B3BE5] bg-[#2B3BE5]/10 text-white font-bold'
                    : 'border-white/10 hover:border-white/30 text-white/60'
                }`}
              >
                Ver Anverso
              </button>
              <button
                onClick={rotateBack}
                className={`flex-1 py-3.5 border font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                  isBackView
                    ? 'border-[#2B3BE5] bg-[#2B3BE5]/10 text-white font-bold'
                    : 'border-white/10 hover:border-white/30 text-white/60'
                }`}
              >
                Ver Reverso (QR)
              </button>
            </div>
          </div>

          {/* Column 2: 3D interactive Canvas */}
          <div className="lg:col-span-5 h-[500px] sm:h-[600px] w-full relative order-1 lg:order-2 flex justify-center items-center">
            {/* 3D Canvas wrapper */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.04)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="w-full h-full cursor-grab active:cursor-grabbing relative z-10">
              <Canvas
                camera={{ position: [0, 0, 3.2], fov: 50 }}
                dpr={[1, 1.5]}
                shadows={{ type: THREE.PCFShadowMap }}
                gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
              >
                <ambientLight intensity={0.4} />
                <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow shadow-bias={-0.0001} />
                <directionalLight position={[-3, -2, -2]} intensity={0.8} color="#2B3BE5" />
                <pointLight position={[0, 2, 4]} intensity={1.0} color="#F59E0B" distance={10} />
                
                {/* AWWWARDS LEVEL HYPERREALISM: Studio Lighting Environment */}
                <Environment preset="city" resolution={512}>
                  {/* Lightformers act as physical studio softboxes reflecting off the clearcoat resin */}
                  <Lightformer form="rect" intensity={2} position={[2, 3, 3]} scale={[5, 1, 1]} target={[0, 0, 0]} />
                  <Lightformer form="rect" intensity={3} color="#2B3BE5" position={[-3, -1, -1]} scale={[3, 5, 1]} target={[0, 0, 0]} />
                  <Lightformer form="circle" intensity={1.5} color="#F59E0B" position={[0, 5, -2]} scale={[2, 2, 1]} target={[0, 0, 0]} />
                </Environment>

                <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4} floatingRange={[-0.05, 0.05]}>
                  <InteractiveCanvasModel
                    src={artwork.src}
                    hotspots={artwork.hotspots}
                    activeHotspot={activeHotspot}
                    setActiveHotspot={setActiveHotspot}
                    rotationY={rotationY}
                    setRotationY={setRotationY}
                  />
                </Float>

                {/* Hyper-realistic physical shadow on an invisible floor plane */}
                <ContactShadows position={[0, -1.3, 0]} opacity={0.65} scale={5} blur={2.5} far={4} color="#000000" />

                {/* SOTA AWWWARDS Post-Processing Pipeline */}
                <EffectComposer multisampling={8}>
                  <Bloom luminanceThreshold={1.2} mipmapBlur intensity={1.5} />
                  <ChromaticAberration 
                    blendFunction={BlendFunction.NORMAL}
                    offset={new THREE.Vector2(0.0005, 0.0005)}
                  />
                  <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
                  <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
              </Canvas>
            </div>

            {/* Parallax instruction helper */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[0.2em] text-white/30 pointer-events-none uppercase">
              Arrastra para girar el soporte
            </div>
          </div>



        </div>

      </div>
    </section>
  );
}
