interface ColorDockProps {
  activeColor: string;
  onColorSelect: (hex: string) => void;
}

export default function ColorDock({ activeColor, onColorSelect }: ColorDockProps) {
  const palettes = ['#2B3BE5', '#C6A87C', '#10B981', '#D9383A', '#D97706', '#8B5CF6', '#06B6D4'];

  return (
    <div className="fixed bottom-8 left-8 z-[130] flex gap-2.5 items-center bg-[#0c0c0e]/80 border border-white/5 px-4 py-2.5 rounded-sm backdrop-blur-md select-none">
      <span className="font-sans text-[8px] tracking-[0.25em] uppercase text-white/40 mr-1">Muta</span>
      {palettes.map((color) => (
        <button
          key={color}
          onClick={() => onColorSelect(color)}
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 relative cursor-pointer ${
            activeColor === color 
              ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]' 
              : 'border-white/10 hover:scale-125'
          }`}
          style={{ backgroundColor: color }}
          aria-label={`Mutar color a ${color}`}
        />
      ))}
    </div>
  );
}
