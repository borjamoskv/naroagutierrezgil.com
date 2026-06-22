/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { SplatPhysicsEngine } from '@/lib/splat-physics/SplatPhysicsEngine';
import { SplatAudioEngine } from '@/lib/audio/SplatAudioEngine';

import { useAgent } from 'agents/react';
import type { EntropicCanvasAgent, EntropicState } from '@/agents/EntropicCanvasAgent';

function makePerspectiveMatrix(fovRad: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1.0 / Math.tan(fovRad / 2.0);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1.0;
  out[14] = (2.0 * far * near) / (near - far);
  return out;
}

function useKintsugiAgent() {
  const agent = useAgent<EntropicCanvasAgent, EntropicState>({
    agent: "EntropicCanvasAgent",
    name: "global-canvas",
  });

  const state = agent.state;
  const entropy = state?.globalEntropy ?? 0;
  const repairs = state?.totalRepairs ?? 0;
  const scars = state?.scars ?? [];
  const kintsugiActive = state?.kintsugiActive ?? false;

  const applyFriction = async (x: number, y: number, intensity: number) => {
    return agent.stub.applyFriction(x, y, intensity);
  };

  const injectGold = async (intensity: number, x: number, y: number) => {
    return agent.stub.injectGold(intensity);
  };

  return { entropy, repairs, scars, kintsugiActive, applyFriction, injectGold, socket: agent };
}

function SplatInteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>('Initializing C5-REAL Splat Physics Engine...');
  const engineRef = useRef<SplatPhysicsEngine | null>(null);
  const audioEngineRef = useRef<SplatAudioEngine | null>(null);
  
  const isDownRef = useRef(false);
  const mousePosRef = useRef({ x: -10.0, y: -10.0 });
  const lastMouseRef = useRef({ x: -10.0, y: -10.0, time: 0 });
  const zoomRef = useRef(1.0);

  const [flash, setFlash] = useState(false);
  const [goldFlash, setGoldFlash] = useState(false);
  const [fps, setFps] = useState(60);

  // Kintsugi Agent Connection (Producción C5-REAL)
  const agent = useKintsugiAgent();
  const { entropy, repairs, scars, kintsugiActive } = agent;
  
  const scarsRef = useRef(scars);
  useEffect(() => {
    scarsRef.current = scars;
  }, [scars]);

  // WebSocket message listener
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'CANVAS_FRACTURE') {
          setFlash(true);
          if (audioEngineRef.current) {
            audioEngineRef.current.playGrain(500.0, 500.0);
          }
          setStatus('CANVAS FRACTURED: La fricción colectiva ha quebrado la obra. Inyección de resina requerida.');
        } else if (data.type === 'KINTSUGI_COMPLETE') {
          setGoldFlash(true);
          if (audioEngineRef.current) {
            audioEngineRef.current.playGrain(200.0, 50.0);
          }
          setStatus('[C5-REAL ENGINE ACTIVE]: Kintsugi completo. La obra ha sido reparada y reforzada con oro.');
        }
      } catch (err) {}
    };
    
    agent.socket.addEventListener('message', handleMessage);
    return () => {
      agent.socket.removeEventListener('message', handleMessage);
    };
  }, [agent.socket]);

  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  useEffect(() => {
    if (goldFlash) {
      const timer = setTimeout(() => setGoldFlash(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [goldFlash]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let animationFrameId: number;
    let isMounted = true;
    const splatCount = 100000; // 100k particles for high-fidelity Slate plaque rendering

    let frameCount = 0;
    let lastFpsUpdateTime = performance.now();

    const initEngine = async () => {
      try {
        const engine = new SplatPhysicsEngine();
        const success = await engine.init();
        if (!success || !isMounted) {
          setStatus('ERROR: WebGPU no soportado en este navegador.');
          return;
        }
        engineRef.current = engine;

        const context = canvas.getContext('webgpu') as any;
        if (!context) {
          setStatus('ERROR: No se pudo obtener el contexto WebGPU del canvas.');
          return;
        }

        const presentationFormat = (navigator as any).gpu.getPreferredCanvasFormat();
        context.configure({
          device: engine.device!,
          format: presentationFormat,
          alphaMode: 'opaque'
        });

        // Generate particle positions resembling a textured slate plaque
        const positions = new Float32Array(splatCount * 4);
        const gridSide = Math.sqrt(splatCount); // ~316 particles per side
        for (let i = 0; i < splatCount; i++) {
          const row = Math.floor(i / gridSide);
          const col = i % gridSide;
          const x = ((col / gridSide) - 0.5) * 3.0;
          const y = ((row / gridSide) - 0.5) * 3.0;
          const z = Math.sin(x * 6.0) * Math.cos(y * 6.0) * 0.08 + (Math.random() - 0.5) * 0.02;
          
          const idx = i * 4;
          positions[idx] = x;
          positions[idx + 1] = y;
          positions[idx + 2] = z;
          positions[idx + 3] = 1.0;
        }

        engine.setupData(positions);

        const audio = new SplatAudioEngine();
        await audio.init();
        audioEngineRef.current = audio;

        setStatus(`C5-REAL ENGINE ACTIVE: Loaded 100K Splats in WebGPU Compute.`);

        const handleResize = () => {
          if (!canvas) return;
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial setup

        const renderLoop = (time: number) => {
          if (!isMounted) return;

          if (window.scrollY > window.innerHeight) {
            animationFrameId = requestAnimationFrame(renderLoop);
            return;
          }

          // FPS calculation
          frameCount++;
          const now = performance.now();
          if (now - lastFpsUpdateTime >= 1000) {
            setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdateTime)));
            frameCount = 0;
            lastFpsUpdateTime = now;
          }

          if (engineRef.current && context) {
            const aspect = canvas.width / canvas.height;
            const mappedX = mousePosRef.current.x * 1.5 * aspect;
            const mappedY = mousePosRef.current.y * 1.5;

            // Run compute shader (Physics update)
            engineRef.current.runComputePass(
              mappedX,
              mappedY,
              time * 0.001,
              isDownRef.current ? 0.16 : 0.08, // force
              0.02, // elasticity
              0.96, // damping
              isDownRef.current ? 0.08 : 0.04, // heatRate
              zoomRef.current
            );

            // Camera ViewProjection + Parallax Matrix
            const proj = makePerspectiveMatrix(Math.PI / 4, aspect, 0.1, 100.0);
            const parallaxX = mousePosRef.current.x * 0.25;
            const parallaxY = mousePosRef.current.y * 0.25;
            const currentDistance = -3.5 / zoomRef.current;
            
            const viewProj = new Float32Array(16);
            viewProj.set(proj);
            viewProj[12] = proj[0] * parallaxX + viewProj[12];
            viewProj[13] = proj[5] * parallaxY + viewProj[13];
            viewProj[14] = proj[10] * currentDistance + viewProj[14];
            viewProj[15] = proj[11] * currentDistance;

            // Get dynamic primary color from doc style
            const computedStyle = getComputedStyle(document.documentElement);
            const primaryColor = computedStyle.getPropertyValue('--primary').trim() || '#2B3BE5';
            const cleanHex = primaryColor.replace('#', '');
            const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
            const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
            const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

            // Render to WebGPU context
            engineRef.current.render(context, viewProj, [r, g, b], zoomRef.current, mappedX, mappedY);
          }

          animationFrameId = requestAnimationFrame(renderLoop);
        };

        animationFrameId = requestAnimationFrame(renderLoop);

        const handleWheel = (e: WheelEvent) => {
          e.preventDefault();
          zoomRef.current = Math.max(1.0, Math.min(5.0, zoomRef.current - e.deltaY * 0.0025));
        };
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
          window.removeEventListener('resize', handleResize);
          canvas.removeEventListener('wheel', handleWheel);
        };
      } catch (err: unknown) {
        setStatus(`ERROR: ${(err as Error).message}. Verifica flags de WebGPU.`);
      }
    };

    initEngine();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handlePointerDown = async (e: React.PointerEvent) => {
    isDownRef.current = true;
    if (audioEngineRef.current) {
      await audioEngineRef.current.resume();
    }
    handlePointerMove(e);
  };
  const handlePointerUp = () => (isDownRef.current = false);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      // Normalize pointer coords to [-1.0, 1.0] for WebGPU projection
      const x = ((e.clientX - rect.left) / rect.width) * 2.0 - 1.0;
      const y = -(((e.clientY - rect.top) / rect.height) * 2.0 - 1.0);
      
      mousePosRef.current = { x, y };
      
      const pixelX = e.clientX - rect.left;
      const pixelY = e.clientY - rect.top;
      
      if (isDownRef.current) {
        const now = performance.now();
        const dt = now - lastMouseRef.current.time;
        if (dt > 0) {
          const dx = pixelX - lastMouseRef.current.x;
          const dy = pixelY - lastMouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const velocity = (dist / dt) * 1000.0; // px per second
          
          if (audioEngineRef.current) {
            audioEngineRef.current.playGrain(velocity, 150.0);
          }
        }
        lastMouseRef.current = { x: pixelX, y: pixelY, time: now };
      }
    }
    
    if (isDownRef.current && !kintsugiActive) {
       if (Math.random() > 0.95) { 
         agent.applyFriction(e.clientX, e.clientY, 2.5).catch(console.error);
       }
    }
  };

  const handleInjectGold = () => {
    if (kintsugiActive) {
      agent.injectGold(15.0, window.innerWidth / 2, window.innerHeight / 2).catch(console.error);
      setStatus(`[C5-REAL ENGINE ACTIVE]: Inyectando oro colectivo... Reparación #${repairs + 1}`);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0A0A0A] overflow-hidden">
      <div className="absolute top-4 left-4 z-10 font-mono text-xs text-[#2B3BE5] pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-white/30">{status} // {fps} FPS</p>
      </div>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-crosshair absolute inset-0 touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
      />

      {/* Thermodynamic State UI */}
      <div className="absolute top-4 right-4 z-10 border border-[#2B3BE5]/30 p-4 bg-black/50 backdrop-blur-md pointer-events-none">
        <p className="text-[#2B3BE5] font-bold mb-2 text-[10px] tracking-widest uppercase">Thermodynamic State (KV)</p>
        <p className="text-white/70 text-[10px] font-mono">Entropía: <span className={kintsugiActive ? 'text-rose-500 font-bold animate-pulse' : 'text-emerald-400'}>{entropy.toFixed(2)}%</span></p>
        <p className="text-white/70 text-[10px] font-mono">Cicatrices: {repairs}</p>
        <p className="text-white/70 text-[10px] font-mono">Status: {kintsugiActive ? 'FRACTURADO' : 'ESTABLE'}</p>
      </div>

      {/* Kintsugi Overlay - Cicatrices de Estado Persistente */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-80 z-20">
        {(scars as { x: number; y: number; depth: number; timestamp: number }[]).map((scar, i) => (
          <circle 
            key={`${scar.timestamp}-${i}`} 
            cx={scar.x} 
            cy={scar.y} 
            r={scar.depth * (repairs > 0 ? 1.5 : 1)} 
            fill={repairs > 0 ? "#F59E0B" : "#2B3BE5"} 
            className="transition-all duration-1000 ease-out"
            filter={repairs > 0 ? "drop-shadow(0px 0px 8px #F59E0B)" : "none"}
          />
        ))}
      </svg>

      {/* Stark Visual Fracture Overlay when active */}
      {kintsugiActive && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-[25] pointer-events-none">
          <div className="text-center p-8 border border-[#2B3BE5]/30 bg-[#0A0A0A]/90 max-w-md pointer-events-auto">
            <h2 className="text-[#2B3BE5] font-black text-2xl tracking-[0.2em] mb-4 uppercase">
              CANVAS FRACTURED
            </h2>
            <p className="text-white/70 font-mono text-xs leading-relaxed uppercase mb-6">
              La fricción colectiva ha quebrado la obra. Inyección de resina de oro requerida para sanar las cicatrices.
            </p>
            <button 
              className="px-6 py-3 bg-amber-500 text-black font-bold font-sans tracking-widest text-[10px] uppercase cursor-pointer hover:bg-amber-400 transition-all rounded-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105"
              onClick={handleInjectGold}
            >
              Inyección Colaborativa de Oro
            </button>
          </div>
          {/* Cracks SVG overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <path d="M100,0 L250,300 L200,450 L500,600 L450,800 L600,1000 M900,100 L700,400 L750,550 L500,600 M0,700 L300,650 L500,600 M1000,900 L800,750 L500,600" stroke="#2B3BE5" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          </svg>
        </div>
      )}

      {/* Screen flash overlays */}
      {flash && (
        <div className="absolute inset-0 bg-[#2B3BE5]/30 pointer-events-none z-50 transition-opacity duration-300" />
      )}
      {goldFlash && (
        <div className="absolute inset-0 bg-amber-500/30 pointer-events-none z-50 transition-opacity duration-1000" />
      )}
    </div>
  );
}

export default function SplatBenchmarkCanvas() {
  const [interacted, setInteracted] = useState(false);

  if (!interacted) {
    return (
      <div 
        className="relative w-full h-full bg-[#0A0A0A] overflow-hidden cursor-crosshair flex flex-col items-center justify-center border border-white/5 hover:border-primary/30 transition-colors duration-500 group pointer-events-auto"
        onPointerDown={() => setInteracted(true)}
      >
        <div className="absolute top-4 left-4 z-10 font-mono text-[9px] text-[#2B3BE5] pointer-events-none tracking-widest uppercase">
          <p>[SPLAT BENCHMARK - MACRO TO PIGMENT]</p>
          <p className="text-white/30 mt-1">SPLAT SIMULATOR INACTIVE</p>
        </div>
        <div className="text-white/40 font-mono text-[10px] tracking-[0.3em] uppercase group-hover:text-primary transition-colors duration-500 text-center px-6 leading-relaxed select-none">
          [ CLICK / TAP PARA CARGAR SIMULACIÓN WEBGPU ]
        </div>
      </div>
    );
  }

  return <SplatInteractiveCanvas />;
}
