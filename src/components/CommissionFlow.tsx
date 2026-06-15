'use client';

import { useState, useEffect } from 'react';

const SIZES = [
  { id: 'S', label: 'Esencial', dims: '30x40 cm', base: 450, desc: 'Ideal para retratos íntimos.' },
  { id: 'M', label: 'Singular', dims: '50x70 cm', base: 850, desc: 'Impacto visual. Tamaño natural.' },
  { id: 'L', label: 'Monolito', dims: '100x100 cm', base: 1800, desc: 'Presencia absoluta. Formato museo.' }
];

const SUBJECTS = [
  { id: 'individual', label: 'Individual', multiplier: 1 },
  { id: 'dual', label: 'Doble / Pareja', multiplier: 1.6 },
  { id: 'pet', label: 'Mascota', multiplier: 0.8 },
  { id: 'custom', label: 'Composición Compleja', multiplier: 2.0 }
];

export default function CommissionFlow() {
  const [step, setStep] = useState(0);
  const [size, setSize] = useState(SIZES[1]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(size.base * subject.multiplier);
  }, [size, subject]);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailSubject = encodeURIComponent(`Encargo: Retrato ${subject.label} (${size.dims})`);
    const mailBody = encodeURIComponent(
      `DIMENSIONES: ${size.label} - ${size.dims}\nSUJETO: ${subject.label}\nESTIMACIÓN: ${total}€\n\nDETALLES:\n${details}\n\nCONTACTO: ${email}`
    );
    window.location.href = `mailto:naroa@naroa.eu?subject=${mailSubject}&body=${mailBody}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-20 relative z-30 font-sans mix-blend-difference text-white">
      <div className="flex justify-between items-end mb-12 border-b border-white/20 pb-4">
        <h2 className="text-[4vw] sm:text-[2vw] font-serif uppercase tracking-widest leading-none">
          Iniciar Síntesis
        </h2>
        <span className="text-xs tracking-[0.3em] opacity-50 uppercase">0{step + 1} / 04</span>
      </div>

      {/* Step 1: Format */}
      <div className={`transition-all duration-700 ${step === 0 ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-10 absolute pointer-events-none'}`}>
        <h3 className="text-sm tracking-[0.4em] uppercase mb-8 opacity-60">Selecciona la Escala</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SIZES.map(s => (
            <button
              key={s.id}
              onClick={() => { setSize(s); handleNext(); }}
              className={`p-6 border text-left cursor-none transition-all duration-500 hover:bg-white hover:text-black ${size.id === s.id ? 'border-white bg-white/5' : 'border-white/20 bg-transparent'}`}
            >
              <div className="text-xl font-serif mb-2">{s.label}</div>
              <div className="text-xs tracking-widest opacity-60 mb-6">{s.dims}</div>
              <div className="text-sm opacity-80">{s.desc}</div>
              <div className="mt-8 text-xs tracking-widest border-t border-current pt-4 opacity-50">DESDE {s.base}€</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Subject */}
      <div className={`transition-all duration-700 ${step === 1 ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 absolute pointer-events-none'}`}>
        <h3 className="text-sm tracking-[0.4em] uppercase mb-8 opacity-60">Naturaleza de la Obra</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              onClick={() => { setSubject(s); handleNext(); }}
              className={`p-5 border text-left cursor-none transition-all duration-500 hover:border-white ${subject.id === s.id ? 'border-white bg-white/10' : 'border-white/20 bg-transparent'}`}
            >
              <div className="text-lg font-serif">{s.label}</div>
            </button>
          ))}
        </div>
        <div className="mt-12 flex justify-start">
          <button onClick={handlePrev} className="text-xs tracking-[0.3em] uppercase opacity-50 hover:opacity-100 transition-opacity cursor-none">← Atrás</button>
        </div>
      </div>

      {/* Step 3: Details & Calculate */}
      <div className={`transition-all duration-700 ${step === 2 ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 absolute pointer-events-none'}`}>
        <h3 className="text-sm tracking-[0.4em] uppercase mb-8 opacity-60">Coordenadas Finales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-6">
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="TU EMAIL" 
              className="bg-transparent border-b border-white/30 pb-3 text-sm focus:outline-none focus:border-white transition-colors cursor-none uppercase tracking-widest"
            />
            <textarea 
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="DETALLES DE LA VISIÓN (Opcional)" 
              className="bg-transparent border-b border-white/30 pb-3 text-sm focus:outline-none focus:border-white transition-colors h-24 resize-none cursor-none uppercase tracking-widest"
            />
          </div>
          
          <div className="border border-white/20 p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs tracking-widest opacity-50 mb-2">PROYECCIÓN TERMODINÁMICA</div>
              <div className="text-4xl font-serif">~{total}€</div>
              <div className="text-xs tracking-widest opacity-40 mt-4">El valor final se ajustará tras auditar la fotografía y el nivel de detalle requerido.</div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={handlePrev} className="text-xs tracking-[0.3em] uppercase opacity-50 hover:opacity-100 transition-opacity cursor-none">←</button>
              <button 
                onClick={handleSubmit}
                disabled={!email}
                className="flex-1 bg-white text-black text-xs tracking-[0.3em] uppercase py-3 hover:bg-black hover:text-white hover:border hover:border-white transition-all cursor-none disabled:opacity-30"
              >
                Transmitir Visión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}