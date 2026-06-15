"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const bootLogs = [
      "INIT CORE KERNEL...",
      "BYPASSING SECURITY SANDBOX...",
      "INJECTING EXERGIA [1300_LEVEL]...",
      "SYNCHRONIZING VISUAL NODES...",
      "CRONOS OVERRIDE ACTIVE."
    ];

    let current = 0;
    let logIndex = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 1;
      
      if (current % 20 < 10 && logIndex < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[logIndex++]]);
      }

      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          window.scrollTo(0, 0);
          setIsLoaded(true);
          document.body.style.overflow = "";
        }, 1200);
      }
      setProgress(current);
    }, 100);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col justify-between bg-[#030303] transition-transform duration-[1s] ease-[cubic-bezier(0.87,0,0.13,1)] ${
        isLoaded ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.1)_0%,transparent_70%)] pointer-events-none mix-blend-screen" />
      
      {/* Glitch CRT Overlay */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none z-50 mix-blend-overlay opacity-80" />

      {/* Top Bar */}
      <div className="p-6 md:p-12 w-full flex justify-between items-start z-10 relative mix-blend-difference">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#2B3BE5] flex flex-col gap-1">
          <span>OS: MOSKV-L5</span>
          <span>SYSTEM: NAROAGUTIERREZGIL.COM</span>
        </span>
        <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
      </div>

      {/* Center Block */}
      <div className="flex flex-col items-center gap-6 mix-blend-difference z-10 relative">
        <h1 className="font-serif font-black text-6xl md:text-9xl text-white tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(43,59,229,0.5)] chromatic-text">
          Naroa
        </h1>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm tracking-[0.4em] text-white">
            BOOT_SEQ
          </span>
          <span className="font-mono text-xl font-bold text-[#2B3BE5]">
            {progress.toString().padStart(3, "0")}%
          </span>
        </div>
      </div>

      {/* Bottom Terminal Block */}
      <div className="p-6 md:p-12 w-full z-10 relative mix-blend-difference flex flex-col justify-end h-[30vh]">
        <div className="flex flex-col gap-1 mb-8 opacity-50 font-mono text-[9px] uppercase tracking-widest text-[#2B3BE5]">
          {logs.map((log, i) => (
            <div key={i} className="animate-[fadeIn_0.2s_ease-out]">> {log}</div>
          ))}
          {progress < 100 && <div className="animate-pulse">> _</div>}
        </div>
        
        {/* Massive Progress Bar */}
        <div className="w-full h-[2px] bg-white/5 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-[#2B3BE5] transition-all duration-100 ease-out shadow-[0_0_20px_rgba(43,59,229,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    </div>
  );
}
