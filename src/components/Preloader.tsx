"use client";

import { useState, useEffect, useCallback } from "react";

const WORDS = ["PIZARRA", "KINTSUGI", "MICA", "ARTIVISMO", "NAROA"];

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    document.body.style.overflow = '';
    setTimeout(() => setVisible(false), 1200);
  }, [exiting]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Progress counter with easing
    let frame: number;
    let start: number | null = null;
    const duration = 2800;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const raw = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - raw, 3);
      setProgress(Math.round(eased * 100));

      if (raw < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        dismiss();
      }
    };

    frame = requestAnimationFrame(animate);

    // Cycle words
    const wordTimer = setInterval(() => {
      setWordIndex(prev => (prev + 1) % WORDS.length);
    }, 560);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(wordTimer);
      document.body.style.overflow = '';
    };
  }, [dismiss]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030303] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        exiting ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
      }`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(43,59,229,0.08)_0%,transparent_60%)] pointer-events-none" />

      {/* Top-left system tag */}
      <div className="absolute top-8 left-8 flex flex-col gap-1">
        <span className="font-mono text-[8px] tracking-[0.5em] text-white/20 uppercase">
          SYS_BOOT: NAROA_KERN
        </span>
        <span className="font-mono text-[8px] tracking-[0.3em] text-[#2B3BE5]/40 uppercase">
          C5-REAL // borjamoskv
        </span>
      </div>

      {/* Morphing word */}
      <div className="relative h-24 flex items-center justify-center overflow-hidden mb-8">
        <span
          key={wordIndex}
          className="font-serif text-5xl sm:text-7xl tracking-[0.15em] text-white/10 uppercase animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both] select-none"
        >
          {WORDS[wordIndex]}
        </span>
      </div>

      {/* Counter */}
      <div className="flex items-baseline gap-4 mb-16">
        <span className="font-mono text-6xl sm:text-8xl font-extralight text-white/90 tabular-nums tracking-tight">
          {String(progress).padStart(3, '0')}
        </span>
        <span className="font-mono text-sm text-white/30 tracking-widest">%</span>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-[#2B3BE5] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-0 left-0 h-full bg-[#2B3BE5] blur-[8px] opacity-60"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bottom label */}
      <span className="absolute bottom-8 font-sans text-[8px] tracking-[0.6em] text-white/15 uppercase">
        Cargando Yacimiento Digital
      </span>
    </div>
  );
}
