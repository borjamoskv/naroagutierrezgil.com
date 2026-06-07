'use client';

import { useEffect, useRef, useState } from 'react';
import { WebGPUSplatSimulator } from '@/lib/splat-physics/WebGPUSplatPhysics';
import { SplatAudioEngine } from '@/lib/audio/SplatAudioEngine';
import { useAgent } from 'agents/react';

export default function SplatBenchmarkCanvas() {
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
        await simulator.init(canvasRef.current!, '/assets/naroa_artwork_1.splat', splatCount);
        simulatorRef.current = simulator;
        
        const audio = new SplatAudioEngine();
        await audio.init();
        audioEngineRef.current = audio;

        const actualSplats = (simulator as any).splatCount || splatCount;
        const tier = actualSplats <= 100000 ? 'MOBILE/LOW' : (actualSplats <= 300000 ? 'DESKTOP_MID' : 'DESKTOP_HIGH');
        setStatus(`C5-REAL ENGINE ACTIVE: Loaded ${actualSplats} splats [Tier: ${tier}] into WebGPU Compute at 60fps.`);
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
    <div className="relative w-full h-full bg-[#0A0A0A] border border-[#2B3BE5] overflow-hidden">
      <div className="absolute top-4 left-4 z-10 font-mono text-xs text-[#2B3BE5] pointer-events-none">
        <p>[SPLAT BENCHMARK - MACRO TO PIGMENT]</p>
        <p className="text-white mt-1">{status}</p>
        <p className="mt-4 text-gray-500 max-w-sm">
          Aplica un tensor de fuerza al Compute Shader interactuando con este plano. La fricción se sincroniza vía Cloudflare Agents SDK. Las fracturas se revelarán volumétricamente.
        </p>

        <div className="mt-8 border border-[#2B3BE5]/30 p-4 bg-black/50 backdrop-blur-md">
          <p className="text-[#2B3BE5] font-bold mb-2">THERMODYNAMIC STATE (C5-REAL)</p>
          <p className="text-white/70">Entropía Global: <span className={kintsugiActive ? 'text-rose-500 font-bold animate-pulse' : 'text-emerald-400'}>{entropy.toFixed(2)}%</span></p>
          <p className="text-white/70">Cicatrices Doradas: {repairs}</p>
          <p className="text-white/70">Status: {kintsugiActive ? 'FRACTURADO' : 'ESTABLE'}</p>
          
          {kintsugiActive && (
             <button 
                className="mt-4 px-4 py-2 bg-amber-500 text-black font-bold pointer-events-auto cursor-pointer hover:bg-amber-400 transition-colors"
                onClick={handleInjectGold}
             >
               INYECCIÓN COLABORATIVA DE ORO (KINTSUGI)
             </button>
          )}
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        width={1000}
        height={1000}
        className="w-full h-full cursor-crosshair absolute inset-0 mix-blend-lighten"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
      />
    </div>
  );
}
