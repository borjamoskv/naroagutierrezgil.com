'use client';

import { useState } from 'react';

export default function InteractiveStudio() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    size: '',
    material: '',
    subject: '',
    exergy: ''
  });

  const handleSelect = (key: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const calculateEnergy = () => {
    let base = 0;
    if (config.size === 'IMMERSIVE') base += 500;
    if (config.size === 'LARGE') base += 300;
    if (config.size === 'STANDARD') base += 100;

    if (config.material === 'PIZARRA NEGRA PROFUNDA') base += 200;
    if (config.material === 'PIZARRA CÁRDENA') base += 150;

    if (config.exergy === 'MAXIMUM (1300)') base += 600;
    if (config.exergy === 'HIGH (1000)') base += 300;
    if (config.exergy === 'BASE (500)') base += 100;

    return base;
  };

  const energy = calculateEnergy();

  return (
    <section id="configurador" className="relative z-10 py-40 px-6 sm:px-12 bg-[#030303] border-t border-white/5 overflow-hidden group">
      
      {/* Background Matrix */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(43,59,229,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(43,59,229,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2B3BE5] to-transparent opacity-50" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Header HUD */}
        <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/10 pb-8">
          <div>
            <span className="text-[#2B3BE5] font-mono tracking-[0.5em] text-[10px] uppercase mb-4 flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              COMMISSION PROTOCOL // INITIALIZED
            </span>
            <h2 className="text-5xl sm:text-7xl font-brutal-huge text-white chromatic-text">
              Configurador
            </h2>
          </div>
          <div className="text-right">
            <span className="text-white/30 font-mono text-[10px] uppercase tracking-widest block mb-1">
              CURRENT EXERGY LOAD
            </span>
            <span className="text-4xl font-mono text-[#2B3BE5] tracking-tighter font-bold">
              {energy === 0 ? '---' : energy}<span className="text-lg text-white/50 ml-1">EXG</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Configurator Area */}
          <div className="lg:col-span-8">
            {/* Step 1: Size */}
            <div className={`transition-all duration-700 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none hidden'}`}>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-serif font-black text-[#2B3BE5]">01</span>
                <h3 className="text-xl font-mono tracking-widest uppercase text-white/90">Parámetros Dimensionales</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
                {['STANDARD', 'LARGE', 'IMMERSIVE'].map(size => (
                  <button 
                    key={size}
                    onClick={() => { handleSelect('size', size); setStep(Math.max(step, 2)); }}
                    className={`p-6 border text-left transition-all duration-300 ${config.size === size ? 'border-[#2B3BE5] bg-[#2B3BE5]/10 shadow-[0_0_20px_rgba(43,59,229,0.2)]' : 'border-white/10 hover:border-white/30 bg-black'}`}
                  >
                    <span className={`block font-mono text-sm tracking-widest mb-2 ${config.size === size ? 'text-[#2B3BE5]' : 'text-white/50'}`}>{size}</span>
                    <span className="text-white/30 text-[10px] uppercase tracking-widest block">
                      {size === 'STANDARD' && 'Formato clásico. Presencia directa.'}
                      {size === 'LARGE' && 'Gravedad expandida. Dominio espacial.'}
                      {size === 'IMMERSIVE' && 'Absorción total de la luz y el entorno.'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Material */}
            <div className={`transition-all duration-700 ${step >= 2 ? 'opacity-100 translate-y-0 block' : 'opacity-0 translate-y-10 hidden'}`}>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-serif font-black text-[#2B3BE5]">02</span>
                <h3 className="text-xl font-mono tracking-widest uppercase text-white/90">Sustrato Matérico</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
                {['PIZARRA CÁRDENA', 'PIZARRA NEGRA PROFUNDA'].map(mat => (
                  <button 
                    key={mat}
                    onClick={() => { handleSelect('material', mat); setStep(Math.max(step, 3)); }}
                    className={`p-6 border text-left transition-all duration-300 ${config.material === mat ? 'border-[#2B3BE5] bg-[#2B3BE5]/10 shadow-[0_0_20px_rgba(43,59,229,0.2)]' : 'border-white/10 hover:border-white/30 bg-black'}`}
                  >
                    <span className={`block font-mono text-sm tracking-widest mb-2 ${config.material === mat ? 'text-[#2B3BE5]' : 'text-white/50'}`}>{mat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Exergy */}
            <div className={`transition-all duration-700 ${step >= 3 ? 'opacity-100 translate-y-0 block' : 'opacity-0 translate-y-10 hidden'}`}>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-serif font-black text-[#2B3BE5]">03</span>
                <h3 className="text-xl font-mono tracking-widest uppercase text-white/90">Densidad de Exergía</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 mb-16">
                {['BASE (500)', 'HIGH (1000)', 'MAXIMUM (1300)'].map(exg => (
                  <button 
                    key={exg}
                    onClick={() => { handleSelect('exergy', exg); setStep(4); }}
                    className={`p-6 border text-left transition-all duration-300 ${config.exergy === exg ? 'border-[#2B3BE5] bg-[#2B3BE5]/10 shadow-[0_0_20px_rgba(43,59,229,0.2)]' : 'border-white/10 hover:border-white/30 bg-black'}`}
                  >
                    <span className={`block font-mono text-sm tracking-widest mb-2 ${config.exergy === exg ? 'text-[#2B3BE5]' : 'text-white/50'}`}>{exg}</span>
                    <div className="w-full h-[2px] bg-white/10 mt-4 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 h-full bg-[#2B3BE5] transition-all duration-1000 ${exg.includes('500') ? 'w-1/3' : exg.includes('1000') ? 'w-2/3' : 'w-full shadow-[0_0_10px_#2B3BE5]'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Receipt / Output */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 border border-white/10 bg-[#050505] p-8">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <span className="text-white/50 font-mono text-[10px] tracking-widest uppercase">OUTPUT HASH</span>
                <span className="text-[#2B3BE5] font-mono text-[10px]">{Math.random().toString(16).substring(2, 10)}</span>
              </div>
              
              <ul className="space-y-6 mb-12">
                <li className="flex flex-col">
                  <span className="text-white/30 font-mono text-[9px] tracking-widest uppercase mb-1">DIMENSIONES</span>
                  <span className={`font-mono text-sm ${config.size ? 'text-white' : 'text-white/20'}`}>{config.size || 'PENDING...'}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-white/30 font-mono text-[9px] tracking-widest uppercase mb-1">SUSTRATO</span>
                  <span className={`font-mono text-sm ${config.material ? 'text-white' : 'text-white/20'}`}>{config.material || 'PENDING...'}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-white/30 font-mono text-[9px] tracking-widest uppercase mb-1">EXERGÍA</span>
                  <span className={`font-mono text-sm ${config.exergy ? 'text-[#2B3BE5]' : 'text-white/20'}`}>{config.exergy || 'PENDING...'}</span>
                </li>
              </ul>

              <button 
                disabled={step < 4}
                className={`w-full py-6 font-mono text-[11px] tracking-[0.3em] uppercase transition-all duration-500 border ${step === 4 ? 'border-[#2B3BE5] text-[#2B3BE5] hover:bg-[#2B3BE5] hover:text-white shadow-[0_0_30px_rgba(43,59,229,0.3)]' : 'border-white/5 text-white/20 cursor-not-allowed bg-black'}`}
              >
                {step === 4 ? 'INICIAR TRANSMISIÓN' : 'ESPERANDO PARÁMETROS'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
