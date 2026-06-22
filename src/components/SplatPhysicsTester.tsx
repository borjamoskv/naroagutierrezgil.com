// [SOTY Primitive #73]: Fisura kintsugi notes
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
  const zoomRef = useRef(1.0);
  const [hudState, setHudState] = useState({ x: -1.0, y: -1.0, isDown: false });

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
      const context = canvas.getContext('webgpu') as any;
      if (!context) {
        setStatus('unsupported');
        return;
      }
      
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

        // 1. Dispatch Compute Shader for physics deform (with heatRate and zoom and single user agent)
        engine.runComputePass(
          time * 0.001,
          isMouseDown.current ? force * 2.0 : force, // double force when clicking
          elasticity,
          damping,
          isMouseDown.current ? 0.08 : 0.04, // heatRate
          zoomRef.current,
          [{ x: mappedX, y: mappedY, isDrawing: isMouseDown.current }]
        );

        // 2. Build View Projection Matrix with camera distance & Parallax (Cámara Imposible)
        const proj = makePerspectiveMatrix(Math.PI / 4, aspect, 0.1, 100.0);
        
        // Tilt camera slightly based on cursor to simulate volumetric 3D capture parallax
        const parallaxX = mousePos.current.x * 0.25;
        const parallaxY = mousePos.current.y * 0.25;
        const currentDistance = -3.5 / zoomRef.current;
        
        const viewProj = new Float32Array(16);
        viewProj.set(proj);
        
        viewProj[12] = proj[0] * parallaxX + viewProj[12];
        viewProj[13] = proj[5] * parallaxY + viewProj[13];
        viewProj[14] = proj[10] * currentDistance + viewProj[14];
        viewProj[15] = proj[11] * currentDistance;

        // Read primary theme color (or default to cobalt)
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue('--primary').trim() || '#2B3BE5';
        
        // Convert primaryColor hex to normalized RGB
        const cleanHex = primaryColor.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

        // 3. Render Pass (with zoom and light position mapping)
        engine.render(context, viewProj, [r, g, b], zoomRef.current, mappedX, mappedY);

        animationId = requestAnimationFrame(tick);
      };

      // Add wheel zoom handler
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        zoomRef.current = Math.max(1.0, Math.min(5.0, zoomRef.current - e.deltaY * 0.0025));
      };
      canvas.addEventListener('wheel', handleWheel, { passive: false });

      animationId = requestAnimationFrame(tick);

      return () => {
        isMounted = false;
        cancelAnimationFrame(animationId);
        canvas.removeEventListener('wheel', handleWheel);
      };
    };

    initWebGPU();
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
    setHudState((prev) => ({ ...prev, x, y }));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isMouseDown.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2.0 - 1.0;
    const y = -(((e.clientY - rect.top) / rect.height) * 2.0 - 1.0);
    
    mousePos.current = { x, y };
    setHudState({ x, y, isDown: true });
  };

  const handlePointerUp = () => {
    isMouseDown.current = false;
    setHudState((prev) => ({ ...prev, isDown: false }));
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden select-none">
      {/* Industrial CRT Background Layer */}
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-40 mix-blend-overlay" />
      
      {/* Canvas Area (Full Screen) */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        {status === 'unsupported' ? (
          <div className="w-full h-full bg-[#0c0c0e] flex flex-col justify-center items-center p-8 text-center gap-4">
            <div className="w-12 h-12 rounded-full border border-rose-500/30 flex items-center justify-center text-rose-500 text-xl font-mono">
              !
            </div>
            <h4 className="text-lg font-serif uppercase tracking-widest text-foreground font-light">
              Navegador Incompatible
            </h4>
            <p className="text-xs text-foreground/40 leading-relaxed max-w-xs">
              WebGPU es una tecnología experimental. Utiliza Google Chrome (v113+) o activa WebGPU en Safari.
            </p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair touch-none"
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        )}
      </div>

      {/* Decorative LED/HUD corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-primary/50 opacity-50 pointer-events-none z-10" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-primary/50 opacity-50 pointer-events-none z-10" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-primary/50 opacity-50 pointer-events-none z-10" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-primary/50 opacity-50 pointer-events-none z-10" />

      {/* Crosshair target for mouse */}
      <div 
        className="absolute w-8 h-8 pointer-events-none z-20 border border-primary/30 rounded-full transition-transform duration-75"
        style={{
          left: `calc(${(hudState.x + 1.0) / 2.0 * 100}% - 16px)`,
          top: `calc(${-(hudState.y - 1.0) / 2.0 * 100}% - 16px)`,
          transform: hudState.isDown ? 'scale(0.5)' : 'scale(1)'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-primary/80 rounded-full" />
      </div>

      {/* Glassmorphic Sidebar Controls */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col w-64 gap-6 p-6 bg-black/40 backdrop-blur-md border border-primary/20 z-10 pointer-events-auto">
        <div>
          <span className="text-primary/70 font-sans tracking-[0.4em] uppercase text-[8px] block mb-2">
            Motor Cuántico
          </span>
          <h2 className="text-xl font-serif font-light tracking-wide text-foreground uppercase">
            Splat Engine
          </h2>
          <div className="w-8 h-px bg-primary/40 mt-3"></div>
        </div>

        {/* Status Dashboard */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[8px] tracking-widest uppercase">
            <span className="text-white/40">Status:</span>
            {status === 'initializing' && <span className="text-amber-500 animate-pulse">INIT...</span>}
            {status === 'ready' && <span className="text-emerald-500 font-bold">ONLINE</span>}
            {status === 'unsupported' && <span className="text-rose-500 font-bold">OFLINE</span>}
          </div>

          <div className="flex justify-between items-baseline mt-2">
            <span className="text-[8px] tracking-widest text-white/40 uppercase">Rendimiento:</span>
            <span className="text-xl font-mono font-light text-primary">{fps} FPS</span>
          </div>

          <div className="flex justify-between text-[8px] tracking-widest text-white/30 uppercase">
            <span>Masa:</span>
            <span className="font-mono text-white/60">100K SPLATS</span>
          </div>
        </div>

        {/* Physics Controls */}
        <div className="flex flex-col gap-4 mt-2">
          {/* Force */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/50">
              <span>Presión</span>
              <span className="text-primary font-mono">{force.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.01" max="0.30" step="0.01" value={force}
              onChange={(e) => setForce(parseFloat(e.target.value))}
              className="w-full h-[2px] bg-white/10 appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Elasticity */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/50">
              <span>Retorno</span>
              <span className="text-primary font-mono">{elasticity.toFixed(3)}</span>
            </div>
            <input 
              type="range" 
              min="0.001" max="0.080" step="0.001" value={elasticity}
              onChange={(e) => setElasticity(parseFloat(e.target.value))}
              className="w-full h-[2px] bg-white/10 appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Damping */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/50">
              <span>Fricción</span>
              <span className="text-primary font-mono">{damping.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.90" max="0.99" step="0.01" value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-full h-[2px] bg-white/10 appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* HUD Data */}
        <div className="mt-4 flex flex-col gap-1 text-[7px] font-mono tracking-[0.2em] uppercase text-primary/40 border-t border-white/5 pt-4">
          <span>FIELD_X: {hudState.x.toFixed(3)}</span>
          <span>FIELD_Y: {hudState.y.toFixed(3)}</span>
          <span>TENSOR: {hudState.isDown ? 'ACTIVE' : 'IDLE'}</span>
        </div>
      </div>
    </div>
  );
}
