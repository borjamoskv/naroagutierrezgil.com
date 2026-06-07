/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';
import { WebGPUSplatSimulator } from '@/lib/splat-physics/WebGPUSplatPhysics';
import { SplatAudioEngine } from '@/lib/audio/SplatAudioEngine';

// Custom KV-based Multiplayer Hook (replaces DO/Agents SDK to support Free Tier)
function useKintsugiKV() {
  const [entropy, setEntropy] = useState(0);
  const [repairs, setRepairs] = useState(0);
  const [scars, setScars] = useState<unknown[]>([]);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/kintsugi');
      if (res.ok) {
        const data = await res.json() as { entropy?: number; repairs?: number; scars?: unknown[] };
        setEntropy(data.entropy || 0);
        setRepairs(data.repairs || 0);
        setScars(data.scars || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  const applyFriction = async (x: number, y: number, intensity: number) => {
    fetch('/api/kintsugi', {
      method: 'POST',
      body: JSON.stringify({ type: 'FRICTION', payload: { x, y, intensity } }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const injectGold = async (intensity: number, x: number, y: number) => {
    fetch('/api/kintsugi', {
      method: 'POST',
      body: JSON.stringify({ type: 'REPAIR', payload: { x, y, intensity } }),
      headers: { 'Content-Type': 'application/json' }
    }).then(fetchState);
  };

  return { entropy, repairs, scars, applyFriction, injectGold };
}

function SplatInteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>('Initializing C5-REAL Splat Physics Engine...');
  const simulatorRef = useRef<WebGPUSplatSimulator | null>(null);
  const audioEngineRef = useRef<SplatAudioEngine | null>(null);
  const isDownRef = useRef(false);
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const lastMouseRef = useRef({ x: -1000, y: -1000, time: 0 });

  // Kintsugi KV Connection (Producción C5-REAL)
  const agent = useKintsugiKV();
  const { entropy, repairs, scars } = agent;
  const kintsugiActive = entropy > 50;
  
  const scarsRef = useRef(scars);
  useEffect(() => {
    scarsRef.current = scars;
  }, [scars]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    let animationFrameId: number;
    const splatCount = 200000; // Increased count for better visual density

    const initEngine = async () => {
      try {
        const simulator = new WebGPUSplatSimulator();
        await simulator.init(splatCount);
        simulatorRef.current = simulator;
        
        const audio = new SplatAudioEngine();
        await audio.init();
        audioEngineRef.current = audio;

        setStatus(`C5-REAL ENGINE ACTIVE: Loaded .splat into WebGPU Compute at 60fps.`);
        const renderLoop = () => {
          if (window.scrollY > window.innerHeight) {
            animationFrameId = requestAnimationFrame(renderLoop);
            return;
          }

          if (simulatorRef.current) {
            simulatorRef.current.step(mousePosRef.current.x, mousePosRef.current.y, isDownRef.current, splatCount);
          }
          animationFrameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
      } catch (err: unknown) {
        setStatus(`ERROR: ${(err as Error).message}. Verifica flags de WebGPU en el navegador.`);
      }
    };

    initEngine();

    return () => {
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
      mousePosRef.current.x = e.clientX - rect.left;
      mousePosRef.current.y = e.clientY - rect.top;
      
      if (isDownRef.current) {
        const now = performance.now();
        const dt = now - lastMouseRef.current.time;
        if (dt > 0) {
          const dx = mousePosRef.current.x - lastMouseRef.current.x;
          const dy = mousePosRef.current.y - lastMouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const velocity = (dist / dt) * 1000.0; // px per second
          
          if (audioEngineRef.current) {
            audioEngineRef.current.playGrain(velocity, 150.0); // 150 is interaction force
          }
        }
        lastMouseRef.current = { x: mousePosRef.current.x, y: mousePosRef.current.y, time: now };
      }
    }
    
    if (isDownRef.current && !kintsugiActive) {
       // Pseudo-throttle para no saturar KV en desarrollo
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
      <div className="absolute top-4 left-4 z-10 font-mono text-xs text-[#2B3BE5] pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
        <p className="text-white/30">{status}</p>
      </div>
      {kintsugiActive && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <button 
            className="px-6 py-3 bg-amber-500 text-black font-bold font-sans tracking-widest text-[10px] uppercase cursor-pointer hover:bg-amber-400 transition-all rounded-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105"
            onClick={handleInjectGold}
          >
            Inyección Colaborativa de Oro
          </button>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        width={1000}
        height={1000}
        className="w-full h-full cursor-crosshair mix-blend-screen absolute inset-0"
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
    </div>
  );
}

export default function SplatBenchmarkCanvas() {
  const [interacted, setInteracted] = useState(false);

  if (!interacted) {
    return (
      <div 
        className="relative w-full h-full bg-[#0A0A0A] overflow-hidden cursor-crosshair flex flex-col items-center justify-center border border-white/5 hover:border-primary/30 transition-colors duration-500 group"
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
