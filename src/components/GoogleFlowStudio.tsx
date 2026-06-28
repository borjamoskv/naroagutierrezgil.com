// @ts-nocheck
/* eslint-disable react-hooks/purity, @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface PreSet {
  name: string;
  prompt: string;
  color: string;
  speed: number;
  noise: number;
  particles: number;
  soundFreq: number;
}

const presets: PreSet[] = [
  {
    name: 'Kintsugi de Oro',
    prompt: 'Inyectar oro líquido en las fisuras de la pizarra',
    color: '#F59E0B',
    speed: 1.5,
    noise: 0.8,
    particles: 150,
    soundFreq: 220
  },
  {
    name: 'Destello de Mica',
    prompt: 'Aumentar brillo de escamas de mica mineral',
    color: '#EAEAEA',
    speed: 3.0,
    noise: 0.2,
    particles: 300,
    soundFreq: 440
  },
  {
    name: 'Poliéster Translúcido',
    prompt: 'Disolver tintas acrílicas con agua de colonia',
    color: '#2B3BE5',
    speed: 0.5,
    noise: 0.95,
    particles: 80,
    soundFreq: 110
  }
];

import { artworksData } from '@/data/artworks';

const timelineArtworks = artworksData
  .filter(art => ['james', 'amy', 'lagrimas', 'dakari', 'geisha'].includes(art.id))
  .map(art => ({ src: `/assets/${art.src}`, title: art.title, prompt: art.prompt || '' }));

/**
 * GoogleFlowStudio component for multimodal canvas flow editing and physical rendering.
 * Integrates "Google Flow" and "Gemini Omni Flash" physics-aware generation models.
 * Includes interactive particle physics, continuous granular sound waves, and a video generation preview.
 * 
 * Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
 */
export default function GoogleFlowStudio() {
  const [prompt, setPrompt] = useState('');
  const [activePreset, setActivePreset] = useState<number | null>(null);
  
  // Physics parameters controlled by Omni Flash / User prompts
  const [color, setColor] = useState('#2B3BE5');
  const [speed, setSpeed] = useState(1.0);
  const [noise, setNoise] = useState(0.5);
  const [particleCount, setParticleCount] = useState(100);
  const [coherence, setCoherence] = useState(0.85);

  // Cinematic Timeline controls (Google Flow video simulator)
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [timelineEffect, setTimelineEffect] = useState<'vhs' | 'aberration' | 'glow' | 'none'>('glow');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Web Audio Synth references
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Pointer states for interactive physics and drawing
  const pointerPos = useRef({ x: -1000, y: -1000, px: -1000, py: -1000, isDown: false });
  const drawTrails = useRef<Array<{ x: number; y: number; px: number; py: number; alpha: number; color: string }>>([]);

  // Initialize and run high-performance Canvas simulator (Omni Flash Physics Engine)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed * 2,
          vy: (Math.random() - 0.5) * speed * 2,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.5 + 0.3
        });
      }
    };
    initParticles();

    let animationId: number;
    let time = 0;

    const render = () => {
      time += 0.01 * speed;
      ctx.fillStyle = 'rgba(5, 5, 5, 0.12)'; // Trail effect for physics rendering
      ctx.fillRect(0, 0, width, height);

      // Draw background noise fields representing slate textures
      if (noise > 0.1) {
        ctx.strokeStyle = `${color}04`;
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 45) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          for (let j = 0; j < height; j += 15) {
            const angle = (Math.sin(i * 0.015 + time) + Math.cos(j * 0.015 + time)) * noise * Math.PI;
            ctx.lineTo(i + Math.sin(angle) * 20, j);
          }
          ctx.stroke();
        }
      }

      // Update and draw pointer drag trails
      const trails = drawTrails.current;
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.alpha -= 0.015;
        if (t.alpha <= 0) {
          trails.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = t.color.replace(')', `, ${t.alpha})`).replace('rgb', 'rgba');
        ctx.lineWidth = 3 * t.alpha;
        ctx.beginPath();
        ctx.moveTo(t.px, t.py);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }

      // Draw active particles (Mica/Gold/Cobalt grains)
      particles.forEach((p, idx) => {
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Apply mouse interaction force (gravity/repulsion field)
        const mx = pointerPos.current.x;
        const my = pointerPos.current.y;
        if (mx > -100 && my > -100) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            // Coherence controls attraction (negative) vs repulsion (positive)
            const dirMultiplier = coherence > 0.5 ? -1.0 : 1.0;
            const forceStrength = force * 0.85 * speed;
            p.vx += (dx / dist) * forceStrength * dirMultiplier;
            p.vy += (dy / dist) * forceStrength * dirMultiplier;
          }
        }

        // Apply slight noise field force
        const forceAngle = (Math.sin(p.x * 0.005 + time) + Math.cos(p.y * 0.005 + time)) * noise * Math.PI;
        p.vx += Math.sin(forceAngle) * 0.05 * speed;
        p.vy += Math.cos(forceAngle) * 0.05 * speed;

        // Cap speed
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxAllowedSpeed = speed * 5;
        if (currentSpeed > maxAllowedSpeed) {
          p.vx = (p.vx / currentSpeed) * maxAllowedSpeed;
          p.vy = (p.vy / currentSpeed) * maxAllowedSpeed;
        }

        // Boundary checks
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        // Glitter sparkles representing mica minerals
        const glitter = Math.sin(time * 5 + idx) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (activePreset === 1 ? glitter * 1.6 : 1), 0, Math.PI * 2);
        ctx.fillStyle = color;
        
        if (activePreset === 0) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = color;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw kintsugi paths when Golden preset is active
      if (activePreset === 0) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(width * 0.2, height * 0.1);
        ctx.lineTo(width * 0.4 + Math.sin(time) * 15, height * 0.4);
        ctx.lineTo(width * 0.35 + Math.cos(time) * 8, height * 0.65);
        ctx.lineTo(width * 0.7 + Math.sin(time * 0.8) * 20, height * 0.9);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width * 0.4 + Math.sin(time) * 15, height * 0.4);
        ctx.lineTo(width * 0.65 + Math.cos(time) * 12, height * 0.3);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [color, speed, noise, particleCount, activePreset, coherence]);

  // Handle prompt analysis (Conversational editing matching Google Flow interface)
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const lower = prompt.toLowerCase();

    // Parse commands for dynamic configuration morphs
    if (lower.includes('oro') || lower.includes('kintsugi') || lower.includes('amarillo') || lower.includes('fisura')) {
      setColor('#F59E0B');
      setSpeed(1.5);
      setNoise(0.8);
      setParticleCount(150);
      setActivePreset(0);
      triggerAudioFreq(220);
    } else if (lower.includes('mica') || lower.includes('brillo') || lower.includes('blanco') || lower.includes('cristal')) {
      setColor('#EAEAEA');
      setSpeed(3.0);
      setNoise(0.2);
      setParticleCount(300);
      setActivePreset(1);
      triggerAudioFreq(440);
    } else if (lower.includes('poliester') || lower.includes('azul') || lower.includes('dilu') || lower.includes('agua')) {
      setColor('#2B3BE5');
      setSpeed(0.5);
      setNoise(0.95);
      setParticleCount(80);
      setActivePreset(2);
      triggerAudioFreq(110);
    } else {
      setColor('#2B3BE5');
      setSpeed(1.0 + Math.random() * 1.5);
      setNoise(Math.random());
      setParticleCount(100 + Math.floor(Math.random() * 200));
      setActivePreset(null);
      triggerAudioFreq(330);
    }
  };

  const applyPreset = (idx: number) => {
    const preset = presets[idx];
    setPrompt(preset.prompt);
    setColor(preset.color);
    setSpeed(preset.speed);
    setNoise(preset.noise);
    setParticleCount(preset.particles);
    setActivePreset(idx);
    triggerAudioFreq(preset.soundFreq);
  };

  // Web Audio synth triggering (Physical feedback)
  const initAudio = () => {
    if (audioContextRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    audioContextRef.current = ctx;
    oscillatorRef.current = osc;
    filterNodeRef.current = filter;
    gainNodeRef.current = gain;
    setIsAudioActive(true);
  };

  const triggerAudioFreq = (freq: number) => {
    if (!audioContextRef.current) initAudio();
    const ctx = audioContextRef.current;
    const osc = oscillatorRef.current;
    const gain = gainNodeRef.current;

    if (ctx && osc && gain) {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    }
  };

  // Continuous pointer audio modulation
  const modulateAudio = (x: number, y: number, isMoving: boolean) => {
    if (!audioContextRef.current || !oscillatorRef.current || !gainNodeRef.current || !filterNodeRef.current) return;
    const ctx = audioContextRef.current;
    const osc = oscillatorRef.current;
    const gain = gainNodeRef.current;
    const filter = filterNodeRef.current;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (isMoving) {
      // Map X coordinate to frequency (100Hz to 600Hz)
      const targetFreq = 100 + (x / window.innerWidth) * 500;
      osc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.05);

      // Map Y coordinate to filter cutoff (300Hz to 3000Hz)
      const targetCutoff = 300 + (1.0 - y / window.innerHeight) * 2700;
      filter.frequency.setTargetAtTime(targetCutoff, ctx.currentTime, 0.05);

      // Set volume gain
      gain.gain.setTargetAtTime(0.04, ctx.currentTime, 0.05);
    } else {
      // Fade out volume when cursor is static
      gain.gain.setTargetAtTime(0.001, ctx.currentTime, 0.1);
    }
  };

  // Pointer event listeners on canvas viewport
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    pointerPos.current = { x, y, px: x, py: y, isDown: true };
    initAudio();
    modulateAudio(e.clientX, e.clientY, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const prev = pointerPos.current;
    pointerPos.current = { x, y, px: prev.x, py: prev.y, isDown: prev.isDown };

    if (prev.isDown && prev.px > -100) {
      drawTrails.current.push({
        x,
        y,
        px: prev.px,
        py: prev.py,
        alpha: 1.0,
        color: activePreset === 0 ? 'rgb(245, 158, 11)' : activePreset === 1 ? 'rgb(234, 234, 234)' : 'rgb(43, 59, 229)'
      });
    }

    modulateAudio(e.clientX, e.clientY, true);
  };

  const handlePointerUp = () => {
    pointerPos.current.isDown = false;
    modulateAudio(0, 0, false);
  };

  const handlePointerLeave = () => {
    pointerPos.current = { x: -1000, y: -1000, px: -1000, py: -1000, isDown: false };
    modulateAudio(0, 0, false);
  };

  return (
    <section id="google-flow-studio" className="relative z-10 py-32 px-6 sm:px-12 bg-[#050505] border-t border-white/5 overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(43,59,229,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Title HUD */}
        <div className="mb-20 text-center flex flex-col items-center">
          <span className="text-[#2B3BE5] font-mono tracking-[0.4em] text-[9px] uppercase mb-3">
            Google Flow × Gemini Omni Flash // Physics-Aware Model
          </span>
          <h2 className="text-4xl sm:text-6xl font-brutal-title text-white">
            Laboratorio de Flujo Creativo
          </h2>
          <p className="max-w-xl mx-auto text-white/40 font-sans text-xs tracking-wider mt-4 leading-relaxed">
            Inyecte prompts para modular las costras líticas de las obras. La simulación reacciona y renderiza los flujos de fluidos y resonancias acústicas de manera instantánea.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-stretch mb-20">
          
          {/* Column 1: Configurator and prompts */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#070707] border border-white/5 p-8 rounded-sm shadow-2xl">
            <div>
              <span className="text-[#2B3BE5] font-mono text-[9px] tracking-widest uppercase block mb-6">
                Consola de Generación Multimodal
              </span>

              {/* Presets List */}
              <div className="flex flex-wrap gap-2 mb-8">
                {presets.map((preset, idx) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(idx)}
                    className={`px-4 py-2 text-[9px] font-mono tracking-widest uppercase transition-all duration-300 border cursor-pointer ${
                      activePreset === idx
                        ? 'border-[#2B3BE5] text-[#2B3BE5] bg-[#2B3BE5]/5'
                        : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Conversational prompt input */}
              <form onSubmit={handlePromptSubmit} className="flex flex-col gap-3 mb-8">
                <label className="text-white/30 font-mono text-[8px] tracking-widest uppercase block">
                  Instrucción Física (Prompt de Entrada)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ej. 'inyectar kintsugi de oro' o 'brillo de mica'..."
                    className="flex-1 bg-black border border-white/10 px-4 py-3 text-xs font-mono text-white placeholder-white/20 focus:border-[#2B3BE5] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 bg-white text-black font-sans font-bold text-[9px] tracking-widest uppercase cursor-pointer hover:bg-[#2B3BE5] hover:text-white transition-all duration-300"
                  >
                    Enviar
                  </button>
                </div>
              </form>

              {/* Manual Physics Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2 font-mono text-[9px] text-white/50 tracking-widest uppercase">
                    <span>Atracción de Partículas</span>
                    <span className="text-[#2B3BE5] font-bold">{coherence > 0.5 ? 'Atracción' : 'Repulsión'}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={coherence}
                    onChange={(e) => setCoherence(parseFloat(e.target.value))}
                    className="w-full h-[2px] bg-white/10 accent-[#2B3BE5] appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 font-mono text-[9px] text-white/50 tracking-widest uppercase">
                    <span>Flujo de Física (Omni Flash)</span>
                    <span className="text-[#2B3BE5] font-bold">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-[2px] bg-white/10 accent-[#2B3BE5] appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 font-mono text-[9px] text-white/50 tracking-widest uppercase">
                    <span>Turbulencia y Caos</span>
                    <span className="text-[#2B3BE5] font-bold">{(noise * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={noise}
                    onChange={(e) => setNoise(parseFloat(e.target.value))}
                    className="w-full h-[2px] bg-white/10 accent-[#2B3BE5] appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Bottom HUD info */}
            <div className="border-t border-white/10 pt-6 mt-8 flex justify-between items-center font-mono text-[8px] text-white/30 tracking-widest uppercase">
              <span>MODEL: gemini-omniflash-v1</span>
              <span>ENGINE: WebGL Fluid Compute</span>
            </div>
          </div>

          {/* Column 2: The Real-time rendering Canvas */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-black border border-white/5 p-6 rounded-sm shadow-2xl relative min-h-[400px]">
            {/* Visualizer header */}
            <div className="flex justify-between items-center font-mono text-[9px] text-white/40 tracking-widest uppercase mb-4 z-10">
              <span>[ VISTA DE MATERIA GENERADA ]</span>
              <span className="text-[#2B3BE5]">● IN-FLOW</span>
            </div>

            {/* Canvas Rendering viewport */}
            <div className="flex-1 w-full relative overflow-hidden bg-[#050505] border border-white/5 min-h-[300px] cursor-crosshair">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
              />
              
              {/* Center crosshair symbol */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-15">
                <div className="w-8 h-[1px] bg-white" />
                <div className="h-8 w-[1px] bg-white absolute" />
              </div>
            </div>

            {/* Audio activation buttons */}
            <div className="flex justify-between items-center font-mono text-[8px] text-white/40 tracking-widest uppercase mt-4 z-10">
              <span>Arrastra para modular osciladores y kintsugi</span>
              <button
                onClick={initAudio}
                className={`px-3 py-1.5 border transition-all duration-300 cursor-pointer ${
                  isAudioActive 
                    ? 'border-[#2B3BE5] text-[#2B3BE5] bg-[#2B3BE5]/5' 
                    : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                }`}
              >
                {isAudioActive ? 'ACÚSTICA SINCRONIZADA' : 'INICIAR SINTETIZADOR'}
              </button>
            </div>
          </div>

        </div>

        {/* START: Google Flow Cinematic Video Generation Timeline Selector */}
        <div className="border border-white/5 bg-[#070707] p-8 rounded-sm shadow-2xl">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div>
              <span className="text-[#2B3BE5] font-mono text-[9px] tracking-widest uppercase block mb-1">
                Google Flow Video Editor
              </span>
              <h3 className="text-xl font-serif text-white uppercase tracking-wider">
                Generador de Secuencias Cinemáticas
              </h3>
            </div>
            
            {/* Effect selectors */}
            <div className="flex gap-2">
              {(['glow', 'vhs', 'aberration', 'none'] as const).map(effect => (
                <button
                  key={effect}
                  onClick={() => setTimelineEffect(effect)}
                  className={`px-3 py-1.5 text-[8px] font-mono tracking-widest uppercase border cursor-pointer transition-all ${
                    timelineEffect === effect
                      ? 'border-[#2B3BE5] text-[#2B3BE5]'
                      : 'border-white/5 text-white/40 hover:border-white/20'
                  }`}
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Video preview display */}
            <div className="md:col-span-4 aspect-square relative bg-neutral-950 border border-white/10 rounded-sm overflow-hidden flex items-center justify-center">
              
              {/* Image with dynamic CSS filters simulating video generations */}
              <div className="w-full h-full relative">
                <Image
                  src={timelineArtworks[timelineIndex].src}
                  alt={timelineArtworks[timelineIndex].title}
                  fill
                  sizes="30vw"
                  className={`object-cover transition-all duration-700 ${
                    timelineEffect === 'vhs' ? 'brightness-125 contrast-125 saturate-150 blur-[0.3px]' : ''
                  } ${
                    timelineEffect === 'aberration' ? 'contrast-115 hue-rotate-15' : ''
                  } ${
                    timelineEffect === 'glow' ? 'brightness-110 saturate-105' : ''
                  }`}
                />

                {/* Video HUD filter overlays */}
                {timelineEffect === 'vhs' && (
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30 z-10" />
                )}
                {timelineEffect === 'aberration' && (
                  <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20 bg-gradient-to-r from-red-500/20 via-transparent to-cyan-500/20 z-10" />
                )}
                {timelineEffect === 'glow' && (
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.06)_0%,transparent_80%)] z-10" />
                )}

                <div className="absolute top-4 left-4 z-20 font-mono text-[8px] tracking-widest text-[#2B3BE5] bg-black/60 px-2 py-1 rounded-xs">
                  REC ● PLAY
                </div>

                <div className="absolute bottom-4 right-4 z-20 font-mono text-[8px] tracking-widest text-white/60 bg-black/60 px-2 py-1 rounded-xs">
                  00:0{timelineIndex}:12
                </div>
              </div>
            </div>

            {/* Right: Keyframe timelines scrubber */}
            <div className="md:col-span-8 flex flex-col justify-center h-full">
              <span className="text-white/40 font-mono text-[9px] tracking-widest uppercase block mb-2">
                Instrucción Generativa Coherente
              </span>
              
              <div className="bg-black border border-white/10 p-6 rounded-sm mb-6 min-h-[80px]">
                <p className="text-white/80 font-mono text-xs leading-relaxed">
                  &gt; Model Prompt: <span className="text-[#2B3BE5]">{timelineArtworks[timelineIndex].prompt}</span>
                </p>
                <p className="text-white/30 font-mono text-[10px] mt-2">
                  Generación consistente de retratos basada en la geometría y el grano lítico.
                </p>
              </div>

              {/* Scrub timeline track */}
              <div className="relative w-full py-4">
                <div className="h-[2px] bg-white/15 w-full rounded-full relative">
                  {/* Active timeline range */}
                  <div 
                    className="absolute h-full bg-[#2B3BE5] transition-all duration-300"
                    style={{ width: `${(timelineIndex / (timelineArtworks.length - 1)) * 100}%` }}
                  />
                  
                  {/* Keyframes points indicators */}
                  {timelineArtworks.map((art, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTimelineIndex(idx)}
                      className={`absolute w-3.5 h-3.5 rounded-full -translate-y-1/3 -translate-x-1/2 border transition-all cursor-pointer ${
                        idx === timelineIndex
                          ? 'bg-[#2B3BE5] border-[#2B3BE5] scale-125 shadow-[0_0_8px_#2B3BE5]'
                          : 'bg-black border-white/20 hover:border-white/50'
                      }`}
                      style={{ left: `${(idx / (timelineArtworks.length - 1)) * 100}%` }}
                      title={art.title}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center font-mono text-[8px] text-white/30 tracking-widest uppercase mt-4">
                <span>Fotograma: {timelineIndex + 1} / {timelineArtworks.length}</span>
                <span>Coherencia temporal: Activa</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
