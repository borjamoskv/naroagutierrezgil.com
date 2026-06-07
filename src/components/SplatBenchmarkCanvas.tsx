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
  const [scars, setScars] = useState<Array<{ x: number; y: number; depth: number; timestamp: number }>>([]);

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
        className="w-full h-full cursor-crosshair mix-blend-screen absolute inset-0"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
      />
      {/* Kintsugi Overlay - Cicatrices de Estado Persistente */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-80 z-20">
        {scars.map((scar, i) => (
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
