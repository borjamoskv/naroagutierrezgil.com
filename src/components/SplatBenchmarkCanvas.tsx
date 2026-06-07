'use client';

import { useEffect, useRef, useState } from 'react';
import { WebGPUSplatSimulator } from '@/lib/splat-physics/WebGPUSplatPhysics';
import { SplatAudioEngine } from '@/lib/audio/SplatAudioEngine';
import { useAgent } from 'agents/react';

function SplatInteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>('Initializing C5-REAL Splat Physics Engine...');
  const simulatorRef = useRef<WebGPUSplatSimulator | null>(null);
  const audioEngineRef = useRef<SplatAudioEngine | null>(null);
  const isDownRef = useRef(false);
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const lastMouseRef = useRef({ x: -1000, y: -1000, time: 0 });

  // Kintsugi State
  const [entropy, setEntropy] = useState<number>(0);
  const [kintsugiActive, setKintsugiActive] = useState<boolean>(false);
  const [repairs, setRepairs] = useState<number>(0);
  const [scars, setScars] = useState<Array<{ x: number; y: number; depth: number; timestamp: number }>>([]);
  const scarsRef = useRef(scars);

  // Sync state to ref for render loop
  useEffect(() => {
    scarsRef.current = scars;
  }, [scars]);

  // Cloudflare Agent Connection (Producción C5-REAL)
  const agent = useAgent({
    agent: "EntropicCanvas",
    name: "naroa-master-canvas",
    onStateUpdate: (newState: { globalEntropy: number; kintsugiActive: boolean; totalRepairs: number; scars: Array<{ x: number; y: number; depth: number; timestamp: number }> }) => {
      setEntropy(newState.globalEntropy);
      setKintsugiActive(newState.kintsugiActive);
      setRepairs(newState.totalRepairs);
      setScars(newState.scars || []);
    },
    onMessage: (msg: { type: string; message?: string; repairNumber?: number }) => {
      if (msg.type === 'CANVAS_FRACTURE') {
        setStatus(`[KINTSUGI ALERT]: ${msg.message}`);
      } else if (msg.type === 'KINTSUGI_COMPLETE') {
        setStatus(`[C5-REAL ENGINE ACTIVE]: Reparaciones históricas: ${msg.repairNumber}`);
      }
    }
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    
    let animationFrameId: number;
    const splatCount = 200000; // Increased count for better visual density

    const initEngine = async () => {
      try {
        const simulator = new WebGPUSplatSimulator();
        await simulator.init(canvasRef.current!, undefined, splatCount);
        simulatorRef.current = simulator;
        
        const audio = new SplatAudioEngine();
        await audio.init();
        audioEngineRef.current = audio;

        setStatus(`C5-REAL ENGINE ACTIVE: Loaded .splat into WebGPU Compute at 60fps.`);
        const renderLoop = () => {
          if (simulatorRef.current) {
            simulatorRef.current.step(mousePosRef.current.x, mousePosRef.current.y, isDownRef.current, scarsRef.current);
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
    
    if (isDownRef.current && agent && !kintsugiActive) {
       // Pseudo-throttle para no saturar WebSockets en desarrollo
       if (Math.random() > 0.8) { 
         (agent as unknown as { applyFriction: (x: number, y: number, f: number) => Promise<void> }).applyFriction(e.clientX, e.clientY, 2.5).catch(console.error);
       }
    }
  };

  const handleInjectGold = () => {
    if (agent && kintsugiActive) {
      (agent as unknown as { injectGold: (a: number) => Promise<void> }).injectGold(15.0).catch(console.error);
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
        className="w-full h-full cursor-crosshair absolute inset-0"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
      />
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
