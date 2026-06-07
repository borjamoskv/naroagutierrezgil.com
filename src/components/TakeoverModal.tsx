import Image from "next/image";
import { useEffect } from "react";

interface TakeoverModalProps {
  takeoverArtwork: { src: string; title: string };
  takeoverCountdown: number;
  getImageUrl: (src: string) => string;
  onClose: () => void;
}

export default function TakeoverModal({
  takeoverArtwork,
  takeoverCountdown,
  getImageUrl,
  onClose,
}: TakeoverModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col justify-center items-center overflow-hidden animate-[fadeIn_0.5s_ease-out] cursor-zoom-out"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb,43,59,229),0.12)_0%,transparent_60%)] mix-blend-color-dodge pointer-events-none" />

      {/* Sleek Close Button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-[100000] flex items-center gap-3 px-4 py-2 bg-black/40 hover:bg-black/80 border border-white/10 hover:border-primary/50 text-white/50 hover:text-white rounded-sm backdrop-blur-md transition-all duration-500 group pointer-events-auto select-none cursor-pointer"
        aria-label="Cerrar modal"
      >
        <span className="font-mono text-[9px] tracking-[0.25em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
          Cerrar [ESC]
        </span>
        <svg
          className="w-4 h-4 transform-gpu transition-transform duration-500 group-hover:rotate-90 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="absolute top-[8%] left-[5%] font-mono text-[16vw] leading-none font-black text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.03)] uppercase pointer-events-none select-none z-0">
        CRONOS
      </div>

      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-[85vw] h-[85vh] md:w-[60vw] md:h-[80vh] border border-white/10 rounded-sm overflow-hidden bg-black shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-[pulseScale_4s_linear] z-10 cursor-default"
      >
        <Image
          src={getImageUrl(takeoverArtwork.src)}
          alt={`Vista detallada: ${takeoverArtwork.title}`}
          fill
          className="object-cover contrast-[1.05] brightness-95"
          sizes="(max-width: 768px) 100vw, 80vw"
          quality={80}
          priority
        />
      </div>

      <div className="absolute bottom-8 left-8 right-8 z-[100] flex flex-col md:flex-row md:items-end justify-between pointer-events-none">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary font-bold animate-pulse">
            SISTEMA CRONOS // AMPLIACIÓN DE DETALLE
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-light uppercase tracking-wide text-foreground">
            {takeoverArtwork.title}
          </h2>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] tracking-[0.2em] uppercase text-white/30">
              TEMPORIZADOR CRONOS
            </span>
            <span className="text-4xl font-mono font-light text-primary">
              {takeoverCountdown}.00s
            </span>
          </div>
          <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-[6000ms] ease-linear"
              style={{ height: `${(takeoverCountdown / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

