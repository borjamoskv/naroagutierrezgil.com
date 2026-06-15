"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Disable native scrolling and lock viewport to top to prevent Lenis virtual drift
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    // Simulate loading progress
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 10) + 1;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          window.scrollTo(0, 0); // Enforce top anchor before releasing the scroll
          setIsLoaded(true);
          document.body.style.overflow = ""; // Restore scrolling
        }, 800);
      }
      setProgress(current);
    }, 120);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050505] transition-transform duration-[1.5s] ease-[cubic-bezier(0.87,0,0.13,1)] ${
        isLoaded ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.05)_0%,transparent_60%)] pointer-events-none mix-blend-screen" />
      
      <div className="flex flex-col items-center gap-6 mix-blend-difference opacity-80">
        <span className="font-serif italic text-primary/80 tracking-widest text-[10px] uppercase animate-pulse">
          Secuencia de Inicio
        </span>
        
        <div className="relative overflow-hidden h-[80px] flex items-center justify-center">
          <h1 className="font-serif font-light text-5xl md:text-7xl text-foreground tracking-tighter uppercase chromatic-text">
            Naroa
          </h1>
        </div>

        <div className="flex flex-col items-center gap-2 mt-4">
          <span className="font-mono text-xs tracking-[0.3em] text-foreground/50">
            {progress.toString().padStart(3, "0")}%
          </span>
          <div className="w-48 h-px bg-white/10 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(43,59,229,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* CRT Scanline Overlay specifically for preloader */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
    </div>
  );
}
