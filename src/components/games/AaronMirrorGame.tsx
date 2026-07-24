'use client';

import React, { useState } from 'react';

interface Question {
  id: number;
  question: string;
  options: { label: string; element: string; color: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "¿Qué tipo de textura resuena con tu estado interno?",
    options: [
      { label: "Pizarra rugosa de tejado vasco", element: "Pizarra Geológica", color: "#1E1E24" },
      { label: "Grietas de cola resquebrajada (Cantinflowers)", element: "Cantinflowers", color: "#D4AF37" },
      { label: "Papel poliéster impregnado de agua de colonia", element: "Poliéster Translúcido", color: "#2B3BE5" },
      { label: "Escamas reflectantes de Mica Mineral", element: "Mica Brillante", color: "#EAEAEA" }
    ]
  },
  {
    id: 2,
    question: "¿Cómo concibes el retrato de tu identidad?",
    options: [
      { label: "Una máscara teatral para explorar libertad", element: "Disfraz Emocional", color: "#E63946" },
      { label: "Un espejo donde sanar las cicatrices (Kintsugi)", element: "Kintsugi Sanador", color: "#FFB703" },
      { label: "Un anagrama alter-ego como Aaron", element: "Alter Ego Fluido", color: "#8338EC" },
      { label: "Una mirada tridimensional con pupilas de cristal", element: "Mirada Tridimensional", color: "#00F5D4" }
    ]
  },
  {
    id: 3,
    question: "¿Cuál es tu herramienta artística preferida?",
    options: [
      { label: "Tarjeta de crédito caducada y espátula", element: "Espátula Insumisa", color: "#FF5964" },
      { label: "Rotulador Posca y Edding dorado 750", element: "Oro Directo", color: "#D4AF37" },
      { label: "Esponja desgastada y pigmentos acrílicos", element: "Pintura Orgánica", color: "#353535" },
      { label: "Barniz cerámico aplicado con palillo", element: "Gota de Cristal", color: "#2B3BE5" }
    ]
  }
];

export default function AaronMirrorGame() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [alterEgoName, setAlterEgoName] = useState<string>('');
  const [resultReady, setResultReady] = useState<boolean>(false);

  const handleSelect = (element: string, color: string) => {
    const nextAnswers = [...answers, element];
    const nextColors = [...selectedColors, color];
    setAnswers(nextAnswers);
    setSelectedColors(nextColors);

    if (currentStep + 1 < QUESTIONS.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      setResultReady(true);
    }
  };

  const generateResult = () => {
    const name = alterEgoName.trim() || 'Aoran';
    return {
      title: `Máscara de ${name}`,
      archetype: answers[1] || 'Disfraz Emocional',
      material: answers[0] || 'Pizarra Geológica',
      technique: answers[2] || 'Kintsugi Mineral',
      palette: selectedColors.length ? selectedColors : ['#2B3BE5', '#D4AF37', '#1E1E24']
    };
  };

  const resetGame = () => {
    setCurrentStep(0);
    setAnswers([]);
    setSelectedColors([]);
    setResultReady(false);
    setAlterEgoName('');
  };

  const result = resultReady ? generateResult() : null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0A0A0A] border border-white/10 rounded-lg p-6 shadow-2xl space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-serif text-white tracking-wide flex items-center gap-2">
          <span className="text-[#2B3BE5]">🪞</span> El Espejo de Aaron (Alter Ego & Máscara)
        </h2>
        <p className="text-xs text-white/50 font-sans mt-1">
          Descubre la composición mineral y la máscara de tu identidad artística secreta.
        </p>
      </div>

      {!resultReady ? (
        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center text-xs font-mono text-white/40 border-b border-white/5 pb-2">
            <span>PASO {currentStep + 1} DE {QUESTIONS.length}</span>
            <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%</span>
          </div>

          {currentStep === 0 && (
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-mono uppercase text-white/60">Introduce tu Nombre o Alter Ego:</label>
              <input
                type="text"
                value={alterEgoName}
                onChange={e => setAlterEgoName(e.target.value)}
                placeholder="Ej. Aaron, Naroart, Kintsugi..."
                className="bg-white/5 border border-white/10 text-white px-4 py-2 text-sm rounded-sm focus:outline-none focus:border-[#2B3BE5]"
              />
            </div>
          )}

          <h3 className="text-lg font-serif text-white font-medium">
            {QUESTIONS[currentStep].question}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {QUESTIONS[currentStep].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt.element, opt.color)}
                className="p-4 text-left border border-white/10 bg-white/[0.02] hover:bg-[#2B3BE5]/10 hover:border-[#2B3BE5] rounded-sm transition-all text-white hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full border border-white/20 group-hover:border-[#2B3BE5]" style={{ backgroundColor: opt.color }} />
                  <span className="text-sm font-sans text-white/90 group-hover:text-white">{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        result && (
          <div className="space-y-6 p-6 bg-white/[0.02] border border-[#2B3BE5]/40 rounded-sm">
            <div className="text-center border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono text-[#2B3BE5] uppercase tracking-widest block mb-1">
                Revelación de Identidad Mineral
              </span>
              <h3 className="text-3xl font-serif text-white uppercase tracking-wider">{result.title}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 border border-white/5 bg-black/40 rounded-sm">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Arquetipo</span>
                <span className="text-sm font-serif text-white font-bold">{result.archetype}</span>
              </div>
              <div className="p-4 border border-white/5 bg-black/40 rounded-sm">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Sustrato</span>
                <span className="text-sm font-serif text-white font-bold">{result.material}</span>
              </div>
              <div className="p-4 border border-white/5 bg-black/40 rounded-sm">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Técnica Dominante</span>
                <span className="text-sm font-serif text-white font-bold">{result.technique}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 pt-2">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Paleta de Resonancia</span>
              <div className="flex gap-3">
                {result.palette.map((c, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: c }} />
                    <span className="text-[9px] font-mono text-white/50 mt-1">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-[#2B3BE5] text-white font-mono text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-white hover:text-black transition-all"
              >
                Volver a Consultar el Espejo 🪞
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
