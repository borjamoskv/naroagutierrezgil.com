import Image from 'next/image';

interface TakeoverModalProps {
  artwork: { src: string; title: string } | null;
  countdown: number;
  getImageUrl: (src: string) => string;
}

export default function TakeoverModal({ artwork, countdown, getImageUrl }: TakeoverModalProps) {
  if (!artwork) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col justify-center items-center overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      {/* Grain texture overlay with CRT scanlines */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-50 mix-blend-overlay" />
      
      {/* Chromatic aberration background aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb,43,59,229),0.25)_0%,transparent_70%)] mix-blend-color-dodge pointer-events-none" />

      {/* Outlined CRONOS Watermark */}
      <div className="absolute top-[5%] left-[5%] font-serif italic text-[18vw] leading-none font-black text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.05)] uppercase pointer-events-none select-none z-0">
        CRONOS
      </div>

      {/* Amplified Artwork container with brutalist glitch border */}
      <div className="relative w-[90vw] h-[80vh] md:w-[70vw] md:h-[85vh] border-2 border-primary/40 bg-black shadow-[0_0_120px_rgba(43,59,229,0.3)] z-10 overflow-hidden group">
        <Image
          src={getImageUrl(artwork.src)}
          alt={artwork.title}
          fill
          className="object-cover contrast-[1.1] brightness-[0.85] saturate-0 transition-all duration-[4000ms] scale-[1.02] group-hover:scale-110 group-hover:saturate-100 ease-in-out"
          sizes="(max-width: 768px) 100vw, 80vw"
          quality={100}
          priority
        />
        {/* Dynamic Glitch Overlay */}
        <div className="absolute inset-0 bg-primary mix-blend-color opacity-20 group-hover:opacity-0 transition-opacity duration-1000" />
      </div>

      {/* HUD info overlays */}
      <div className="absolute bottom-8 left-8 right-8 z-[100] flex flex-col md:flex-row md:items-end justify-between pointer-events-none">
        <div className="flex flex-col gap-1 backdrop-blur-md bg-black/40 border border-primary/20 p-6 rounded-sm">
          <span className="text-[11px] tracking-[0.5em] uppercase text-primary font-bold animate-pulse flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            SYSTEM OVERRIDE // ACTIVE
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-black uppercase tracking-tighter text-white mt-2 drop-shadow-[0_2px_20px_rgba(43,59,229,0.8)]">
            {artwork.title}
          </h2>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-8 backdrop-blur-md bg-black/40 border border-primary/20 p-6 rounded-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-1">TERMINATION IN</span>
            <span className="text-5xl font-mono font-bold text-primary tracking-tighter">{countdown}.00<span className="text-2xl text-primary/50">s</span></span>
          </div>
          <div className="w-[2px] h-16 bg-white/10 relative overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 w-full bg-red-500 transition-all duration-[4000ms] ease-linear shadow-[0_0_15px_rgba(239,68,68,1)]"
              style={{ height: `${(countdown / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
