'use client';

import { useEffect, useRef, useState } from 'react';
import { WebGPUSplatSimulator } from '@/lib/splat-physics/WebGPUSplatPhysics';
import { useAgent } from 'agents/react';

export default function SplatBenchmarkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>('Initializing C5-REAL Splat Physics Engine...');
  const simulatorRef = useRef<WebGPUSplatSimulator | null>(null);
  const isDownRef = useRef(false);

  // Kintsugi State
  const [entropy, setEntropy] = useState<number>(0);
  const [kintsugiActive, setKintsugiActive] = useState<boolean>(false);
  const [repairs, setRepairs] = useState<number>(0);

  // Cloudflare Agent Connection
  const agent = useAgent({
    agent: "EntropicCanvas",
    name: "naroa-master-canvas",
    siteUrl: "http://localhost:8787", // Dev port
    onStateUpdate: (newState: { globalEntropy: number; kintsugiActive: boolean; totalRepairs: number }) => {
      setEntropy(newState.globalEntropy);
      setKintsugiActive(newState.kintsugiActive);
      setRepairs(newState.totalRepairs);
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
    let animationFrameId: number;
    const splatCount = 100000;

    const initEngine = async () => {
      try {
        const simulator = new WebGPUSplatSimulator();
        await simulator.init(splatCount);
        simulatorRef.current = simulator;
        setStatus(`C5-REAL ENGINE ACTIVE: Running ${splatCount} splats compute shader at 60fps.`);
        const renderLoop = () => {
          if (simulatorRef.current) {
            simulatorRef.current.step(0, 0, isDownRef.current, splatCount);
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

  const handlePointerDown = () => (isDownRef.current = true);
  const handlePointerUp = () => (isDownRef.current = false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDownRef.current && agent && !kintsugiActive) {
       // Pseudo-throttle para no saturar WebSockets en desarrollo
       if (Math.random() > 0.8) { 
         agent.applyFriction(e.clientX, e.clientY, 2.5).catch(console.error);
       }
    }
  };

  const handleInjectGold = () => {
    if (agent && kintsugiActive) {
      agent.injectGold(15.0).catch(console.error);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0A0A0A] border border-[#2B3BE5] overflow-hidden">
      <div className="absolute top-4 left-4 z-10 font-mono text-xs text-[#2B3BE5] pointer-events-none">
        <p>[SPLAT BENCHMARK - MACRO TO PIGMENT]</p>
        <p className="text-white mt-1">{status}</p>
        <p className="mt-4 text-gray-500 max-w-sm">
          Aplica un tensor de fuerza al Compute Shader interactuando con este plano. La fricción se sincroniza vía Cloudflare Agents SDK.
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
        className="w-full h-full cursor-crosshair mix-blend-screen"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
      />
    </div>
  );
}
