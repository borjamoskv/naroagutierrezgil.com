/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { WebGPUFluidSimulator } from '@/lib/splat-physics/WebGPUFluidDynamics';
import { SplatAudioEngine } from '@/lib/audio/SplatAudioEngine';

export default function SplatPhysicsTester() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'initializing' | 'ready' | 'unsupported' | 'error'>('initializing');
  const [fps, setFps] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Physics parameters
  const [force, setForce] = useState(15.0);
  const [auraActive, setAuraActive] = useState(false);
  
  const mousePos = useRef({ x: -10.0, y: -10.0 });
  const lastMousePos = useRef({ x: -10.0, y: -10.0 });
  const isMouseDown = useRef(false);
  const audioEngineRef = useRef<SplatAudioEngine | null>(null);

  // Initialize audio engine on mount
  useEffect(() => {
    audioEngineRef.current = new SplatAudioEngine();
  }, []);

  // Ensure AudioContext resumes upon interaction (browser policy)
  const enableAudio = async () => {
    if (!audioEngineRef.current) return;
    await audioEngineRef.current.init();
    await audioEngineRef.current.resume();
    setAudioEnabled(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: WebGPUFluidSimulator | null = null;
    let animationId: number;
    let isMounted = true;
    
    // Performance metrics
    let frameCount = 0;
    let lastFpsUpdateTime = performance.now();

    const initWebGPU = async () => {
      engine = new WebGPUFluidSimulator();
      const success = await engine.init(256, 256);
      
      if (!success || !isMounted) {
        setStatus('unsupported');
        return;
      }

      // Configure context
      const context = canvas.getContext('webgpu') as any;
      if (!context) {
        setStatus('unsupported');
        return;
      }
      
      const presentationFormat = (navigator as any).gpu.getPreferredCanvasFormat();
      context.configure({
        device: (engine as any).device,
        format: presentationFormat,
        alphaMode: 'opaque'
      });

      setStatus('ready');

      // Main Loop
      const tick = () => {
        if (!engine || !canvas || !context) return;

        // Exergy Optimization (C5-REAL): Si el usuario ha scrolleado más allá de la pantalla inicial,
        // pausamos el WebGPU Compute Shader para ahorrar batería y recursos.
        if (window.scrollY > window.innerHeight) {
          animationId = requestAnimationFrame(tick);
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

        const currentX = mousePos.current.x;
        const currentY = mousePos.current.y;

        if (isMouseDown.current) {
          const gridX = ((currentX + 1.0) / 2.0) * engine.gridWidth;
          const gridY = ((1.0 - currentY) / 2.0) * engine.gridHeight;

          const dirX = (currentX - lastMousePos.current.x) * engine.gridWidth;
          const dirY = -(currentY - lastMousePos.current.y) * engine.gridHeight; // Y is flipped

          // Calculate magnitude of movement
          const dist = Math.sqrt(dirX * dirX + dirY * dirY);
          
          if (dist > 0.1) {
            engine.step(gridX, gridY, dirX, dirY, force);
            
            // SYNTHESIZE GRAIN!
            if (audioEngineRef.current && audioEnabled) {
              audioEngineRef.current.playGrain(dist, force);
            }
          } else {
            // Constant injection if mouse is still
            engine.step(gridX, gridY, (Math.random() - 0.5) * 5.0, (Math.random() - 0.5) * 5.0, force * 0.5);
          }
        } else {
          // Keep fluid flowing even without mouse interaction (ambient advection)
          engine.step(-1000, -1000, 0, 0, 0); 
        }

        lastMousePos.current = { x: currentX, y: currentY };

        // 3. Render Pass
        engine.render(context);

        animationId = requestAnimationFrame(tick);
      };

      animationId = requestAnimationFrame(tick);
    };

    initWebGPU();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
    };
  }, [force, audioEnabled]);

  // Handle pointer interactions
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Normalize coordinates to [-1.0, 1.0] range
    const x = ((e.clientX - rect.left) / rect.width) * 2.0 - 1.0;
    const y = -(((e.clientY - rect.top) / rect.height) * 2.0 - 1.0);
    
    mousePos.current = { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isMouseDown.current = true;
    lastMousePos.current = mousePos.current;
    handlePointerMove(e);
    if (!audioEnabled) {
      enableAudio();
    }
  };

  const handlePointerUp = () => {
    isMouseDown.current = false;
  };

  const triggerKintsugiAura = () => {
    if (auraActive) return;
    setAuraActive(true);
    const oldForce = force;
    setForce(150.0); // Massive injection of fluid pressure
    
    setTimeout(() => {
      setForce(oldForce);
      setAuraActive(false);
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto p-6 bg-[#050505] rounded-sm border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
      
      {/* Parameters Panel */}
      <div className="flex flex-col w-full lg:w-1/3 gap-6 relative z-10">
        <div>
          <span className="text-primary/70 font-sans tracking-[0.4em] uppercase text-[10px] block mb-2">
            Laboratorio WebGPU Fluidos
          </span>
          <h2 className="text-3xl font-serif font-light tracking-wide text-foreground uppercase">
            Fluidodinámica (Navier-Stokes)
          </h2>
          <div className="w-16 h-[1px] bg-primary/40 mt-4"></div>
          <p className="text-xs text-foreground/50 mt-4 leading-relaxed">
            Simulación Euleriana incompresible en tiempo real mediante Compute Shaders. Interactúa con el lienzo para generar vórtices.
          </p>
        </div>

        {/* Status Dashboard */}
        <div className="p-4 rounded-sm border border-white/5 bg-white/[0.02] flex flex-col gap-3">
          <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
            <span className="text-white/40">Motor:</span>
            {status === 'initializing' && <span className="text-amber-500 animate-pulse">Inicializando...</span>}
            {status === 'ready' && <span className="text-emerald-500 font-bold">WEBGPU COMPUTE OK</span>}
            {status === 'unsupported' && <span className="text-rose-500 font-bold">WEBGPU NO SOPORTADO</span>}
            {status === 'error' && <span className="text-rose-500 font-bold">ERROR</span>}
          </div>

          <div className="flex justify-between items-baseline mt-2">
            <span className="text-[10px] tracking-widest text-white/40 uppercase">Rendimiento:</span>
            <span className="text-3xl font-mono font-light text-primary">{fps} FPS</span>
          </div>

          <div className="flex justify-between text-[10px] tracking-widest text-white/30 uppercase mt-1">
            <span>Resolución:</span>
            <span className="font-mono text-white/60">256x256 Grid</span>
          </div>
        </div>

        {/* Physics Controls */}
        <div className="flex flex-col gap-4">
          {/* Force */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/50">
              <span>Inyección de Tinta (Presión)</span>
              <span className="text-primary font-mono">{force.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="1.0" 
              max="150.0" 
              step="0.5"
              value={force}
              onChange={(e) => setForce(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none hover:bg-white/20 transition-colors"
              aria-label="Ajustar presión de inyección de tinta"
            />
          </div>

          <button
            onClick={triggerKintsugiAura}
            disabled={auraActive || status !== 'ready'}
            className={`w-full relative overflow-hidden group border transition-all duration-700 mt-6 py-4 rounded-sm flex items-center justify-center gap-4 ${
              auraActive ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5'
            }`}
          >
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,transparent_100%)] transition-opacity duration-1000 ${auraActive ? 'opacity-100' : 'opacity-0'}`} />
            <span className={`w-2 h-2 rounded-full ${auraActive ? 'bg-amber-400 animate-ping' : 'bg-primary group-hover:bg-amber-500 transition-colors duration-500'}`} />
            <span className={`font-sans text-[11px] tracking-[0.4em] uppercase transition-colors duration-500 ${auraActive ? 'text-amber-500 font-bold' : 'text-white/60 group-hover:text-amber-400'}`}>
              Detonación Kintsugi
            </span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="w-full lg:w-2/3 flex flex-col items-center justify-center">
        {status === 'unsupported' ? (
          <div className="w-full max-w-[500px] aspect-square bg-[#0c0c0e] border border-white/5 rounded-sm flex flex-col justify-center items-center p-8 text-center gap-4">
            <h3 className="text-lg font-serif uppercase tracking-widest text-foreground font-light">
              Navegador Incompatible
            </h3>
            <p className="text-xs text-foreground/40 leading-relaxed max-w-xs">
              WebGPU es una tecnología experimental de acceso directo a la GPU. Para ver este experimento en directo a 60 FPS, utiliza Google Chrome (v113+), Microsoft Edge o activa WebGPU en las opciones experimentales de Safari.
            </p>
          </div>
        ) : (
          <div className={`relative w-full max-w-[500px] aspect-square bg-[#050505] shadow-[0_0_80px_rgba(0,0,0,0.8)] border rounded-sm overflow-hidden select-none transition-colors duration-1000 ${auraActive ? 'border-amber-500/50 shadow-[0_0_120px_rgba(245,158,11,0.3)]' : 'border-white/5'}`}>
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="w-full h-full cursor-crosshair touch-none bg-[#0a0a0a]"
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
            
            {/* Hover guidance HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none text-[8px] font-mono tracking-widest uppercase text-white/30">
              PIPELINE: EULERIAN_NAVIER_STOKES
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
