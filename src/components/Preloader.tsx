"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [entropy, setEntropy] = useState(100);

  useEffect(() => {
    // Disable native scrolling and lock viewport to top to prevent Lenis virtual drift
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    let current = 0;
    const interval = setInterval(() => {
      // Exponential convergence (entropy reduction algorithm)
      current += (100 - current) * 0.12;
      if (current > 99.8) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          window.scrollTo(0, 0); // Enforce top anchor
          setIsLoaded(true);
          setTimeout(() => {
             document.body.style.overflow = ""; // Restore scrolling after curtain drop
          }, 1200);
        }, 500);
      }
      setProgress(current);
      setEntropy(100 - current);
    }, 50);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#030303] transition-[clip-path,transform] duration-[1.2s] ease-[cubic-bezier(0.87,0,0.13,1)] ${
        isLoaded ? "clip-path-bottom" : "clip-path-full"
      }`}
      style={{
        clipPath: isLoaded ? 'polygon(0 0, 100% 0, 100% 0, 0 0)' : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        transform: isLoaded ? 'translateY(-10vh)' : 'translateY(0)'
      }}
    >
      {/* Thermodynamic Volume Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.05)_0%,transparent_60%)] pointer-events-none mix-blend-screen" />
      
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg">
        {/* Kinetic Typographic Core */}
        <div className="relative overflow-hidden h-[120px] flex items-center justify-center perspective-[1000px]">
          {/* Red Channel Divergence */}
          <h1 
            className="font-serif font-light text-6xl md:text-8xl tracking-tighter uppercase absolute mix-blend-screen"
            style={{ 
              transform: `translate3d(${entropy * 0.6}px, 0, 0) skewX(${-entropy * 0.3}deg)`,
              opacity: progress / 100,
              filter: `blur(${entropy * 0.15}px)`,
              color: 'rgba(255,51,102,0.9)'
            }}
          >
            Naroa
          </h1>
          {/* Blue Channel Divergence */}
          <h1 
            className="font-serif font-light text-6xl md:text-8xl tracking-tighter uppercase absolute mix-blend-screen"
            style={{ 
              transform: `translate3d(${-entropy * 0.6}px, 0, 0) skewX(${entropy * 0.3}deg)`,
              opacity: progress / 100,
              filter: `blur(${entropy * 0.15}px)`,
              color: 'rgba(43,59,229,0.9)'
            }}
          >
            Naroa
          </h1>
          {/* Solid Core */}
          <h1 
            className="font-serif font-light text-6xl md:text-8xl text-white tracking-tighter uppercase relative z-10"
            style={{
               opacity: 1 - (entropy / 100),
               transform: `scale(${1 + (entropy / 300)})`,
               textShadow: `0 0 ${entropy}px rgba(255,255,255,1)`
            }}
          >
            Naroa
          </h1>
        </div>

        {/* HUD Data Matrix */}
        <div className="absolute bottom-[-80px] flex w-full justify-between items-end px-8 opacity-60 font-mono text-[9px] tracking-[0.4em] text-white">
          <div className="flex flex-col gap-1">
            <span className="text-primary/70">ENTROPY</span>
            <span>{entropy.toFixed(4)} J/K</span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-primary/70">SYNC</span>
            <span>{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>
      
      {/* Mathematical Precision Loading Line */}
      <div className="absolute bottom-16 w-[80%] max-w-sm h-[1px] bg-white/10 overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-75 ease-out shadow-[0_0_15px_rgba(255,255,255,1)]"
          style={{ 
            width: `${progress}%`,
            transform: `translateX(${entropy > 5 ? (Math.random() * 4 - 2) * (entropy/100) : 0}px)`
          }}
        />
      </div>

      {/* Extreme CRT Scanline Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"/>
    </div>
  );
}