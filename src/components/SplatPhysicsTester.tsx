/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { SplatPhysicsEngine } from '@/lib/splat-physics/SplatPhysicsEngine';

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

export default function SplatPhysicsTester() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'initializing' | 'ready' | 'unsupported' | 'error'>('initializing');
  const [fps, setFps] = useState(0);
  const [particleCount] = useState(100000);
  
  // Physics parameters
  const [force, setForce] = useState(0.08);
  const [elasticity, setElasticity] = useState(0.02);
  const [damping, setDamping] = useState(0.96);
  
  const mousePos = useRef({ x: -10.0, y: -10.0 });
  const isMouseDown = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: SplatPhysicsEngine | null = null;
    let animationId: number;
    let isMounted = true;
    
    // Performance metrics
    let frameCount = 0;
    let lastFpsUpdateTime = performance.now();

    const initWebGPU = async () => {
      engine = new SplatPhysicsEngine();
      const success = await engine.init();
      
      if (!success || !isMounted) {
        setStatus('unsupported');
        return;
      }

      // Configure context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context = canvas.getContext('webgpu') as any;
      if (!context) {
        setStatus('unsupported');
        return;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const presentationFormat = (navigator as any).gpu.getPreferredCanvasFormat();
      context.configure({
        device: engine.device!,
        format: presentationFormat,
        alphaMode: 'opaque'
      });

      // Generate 100k particle positions resembling a textured slate plaque
      // vec4 format: x, y, z, size/alpha
      const positions = new Float32Array(particleCount * 4);
      const gridSide = Math.sqrt(particleCount); // ~316 particles per side
      
      for (let i = 0; i < particleCount; i++) {
        const row = Math.floor(i / gridSide);
        const col = i % gridSide;
        
        // Map grid coordinates to range [-1.5, 1.5]
        const x = ((col / gridSide) - 0.5) * 3.0;
        const y = ((row / gridSide) - 0.5) * 3.0;
        
        // Add subtle natural stone texture / noise
        const z = Math.sin(x * 6.0) * Math.cos(y * 6.0) * 0.08 + (Math.random() - 0.5) * 0.02;
        
        const idx = i * 4;
        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;
        positions[idx + 3] = 1.0; // alpha/size indicator
      }

      engine.setupData(positions);
      setStatus('ready');

      // Main Loop
      const tick = (time: number) => {
        if (!engine || !canvas || !context) return;

        // FPS calculation
        frameCount++;
        const now = performance.now();
        if (now - lastFpsUpdateTime >= 1000) {
          setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdateTime)));
          frameCount = 0;
          lastFpsUpdateTime = now;
        }

        // Adjust mouse coordinates from screen-space to WebGL [-1.5, 1.5] viewport coordinates
        const aspect = canvas.width / canvas.height;
        const mappedX = mousePos.current.x * 1.5 * aspect;
        const mappedY = mousePos.current.y * 1.5;

        // 1. Dispatch Compute Shader for physics deform
        engine.runComputePass(
          mappedX,
          mappedY,
          time * 0.001,
          isMouseDown.current ? force * 2.0 : force, // double force when clicking
          elasticity,
          damping
        );

        // 2. Build View Projection Matrix
        const proj = makePerspectiveMatrix(Math.PI / 4, aspect, 0.1, 100.0);
        
        // View translation matrix (camera pushed back to z = -3.5)
        const viewProj = new Float32Array(16);
        viewProj.set(proj);
        // Apply view translation manually on Z matrix cells
        viewProj[14] = proj[10] * -3.5 + proj[14];
        viewProj[15] = proj[11] * -3.5;

        // Read primary theme color (or default to cobalt)
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue('--primary').trim() || '#2B3BE5';
        
        // Convert primaryColor hex to normalized RGB
        const cleanHex = primaryColor.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

        // 3. Render Pass
        engine.render(context, viewProj, [r, g, b]);

        animationId = requestAnimationFrame(tick);
      };

      animationId = requestAnimationFrame(tick);
    };

    initWebGPU();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
    };
  }, [particleCount, force, elasticity, damping]);

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
    handlePointerMove(e);
  };

  const handlePointerUp = () => {
    isMouseDown.current = false;
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto p-6 bg-black rounded-sm border border-white/5 shadow-2xl">
      {/* Parameters Panel */}
      <div className="flex flex-col w-full lg:w-1/3 gap-6">
        <div>
          <span className="text-primary/70 font-sans tracking-[0.4em] uppercase text-[10px] block mb-2">
            Laboratorio WebGPU
          </span>
          <h2 className="text-3xl font-serif font-light tracking-wide text-foreground uppercase">
            Forja de Splats
          </h2>
          <div className="w-16 h-[1px] bg-primary/40 mt-4"></div>
          <p className="text-xs text-foreground/50 mt-4 leading-relaxed">
            Deformación de 100,000 Gaussianas en tiempo real utilizando WebGPU Compute Shaders. Arrastra el cursor sobre la pizarra de partículas.
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
            <span>Partículas:</span>
            <span className="font-mono text-white/60">100.000 (100k)</span>
          </div>
        </div>

        {/* Physics Controls */}
        <div className="flex flex-col gap-4">
          {/* Force */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/50">
              <span>Presión (Fuerza)</span>
              <span className="text-primary font-mono">{force.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.01" 
              max="0.30" 
              step="0.01"
              value={force}
              onChange={(e) => setForce(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
          </div>

          {/* Elasticity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/50">
              <span>Elasticidad (Retorno)</span>
              <span className="text-primary font-mono">{elasticity.toFixed(3)}</span>
            </div>
            <input 
              type="range" 
              min="0.001" 
              max="0.080" 
              step="0.001"
              value={elasticity}
              onChange={(e) => setElasticity(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
          </div>

          {/* Damping */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/50">
              <span>Amortiguación (Fricción)</span>
              <span className="text-primary font-mono">{damping.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.90" 
              max="0.99" 
              step="0.01"
              value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="w-full lg:w-2/3 flex flex-col items-center justify-center">
        {status === 'unsupported' ? (
          <div className="w-full max-w-[500px] aspect-square bg-[#0c0c0e] border border-white/5 rounded-sm flex flex-col justify-center items-center p-8 text-center gap-4">
            <div className="w-12 h-12 rounded-full border border-rose-500/30 flex items-center justify-center text-rose-500 text-xl font-mono">
              !
            </div>
            <h4 className="text-lg font-serif uppercase tracking-widest text-foreground font-light">
              Navegador Incompatible
            </h4>
            <p className="text-xs text-foreground/40 leading-relaxed max-w-xs">
              WebGPU es una tecnología experimental de acceso directo a la GPU. Para ver este experimento en directo a 60 FPS, utiliza Google Chrome (v113+), Microsoft Edge o activa WebGPU en las opciones experimentales de Safari.
            </p>
          </div>
        ) : (
          <div className="relative w-full max-w-[500px] aspect-square bg-[#050505] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5 rounded-sm overflow-hidden select-none">
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
              BUFFER_LAYOUT: STORAGE_BUFFER_VERTEX
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
