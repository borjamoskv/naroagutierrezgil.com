'use client';

import React, { useState } from 'react';

interface Square {
  id: number;
  title: string;
  desc: string;
  type: 'artwork' | 'special' | 'kintsugi' | 'finish';
}

const SQUARES: Square[] = [
  { id: 1, title: "Inicio: Taller Bilbao", desc: "Eliges la pizarra de tejado vasco recuperada.", type: "special" },
  { id: 2, title: "Cantinflowers", desc: "Mezcla de cola blanca y acrílico. ¡Avanzas a casilla 5!", type: "kintsugi" },
  { id: 3, title: "Retrato: Marilyn Rocks", desc: "Cincelado inicial en pizarra.", type: "artwork" },
  { id: 4, title: "Papel Poliéster", desc: "Uso de agua de colonia para tintas.", type: "special" },
  { id: 5, title: "Kintsugi Accidental", desc: "Rellenas la grieta con polvo dorados.", type: "kintsugi" },
  { id: 6, title: "Colección DiviNos VaiVenes", desc: "Exposición Politena 2026. ¡Tiras otra vez!", type: "special" },
  { id: 7, title: "Retrato: Amy Winehouse", desc: "Escamas de Mica Mineral agregadas.", type: "artwork" },
  { id: 8, title: "Reverso Oculto", desc: "Inyectas un audio QR en la trasera.", type: "special" },
  { id: 9, title: "Alter Ego: Aaron", desc: "Anagrama conceptual y libertad fluida.", type: "special" },
  { id: 10, title: "Retrato: Paul Newmum", desc: "Basado en el error poético de la IA.", type: "artwork" },
  { id: 11, title: "La Oca del Arte", desc: "De Oca a Oca y tiro porque me toca. Avanzas a la 15.", type: "kintsugi" },
  { id: 12, title: "La Famiglia", desc: "Retrato colectivo estilo Don Vito Corleone.", type: "artwork" },
  { id: 13, title: "Bwall Collective GIRLS", desc: "Dock Bilbao 2026.", type: "special" },
  { id: 14, title: "Customización Textil", desc: "Chaqueta de autor en alta cocina.", type: "special" },
  { id: 15, title: "Cincuenta Cinceladas", desc: "Pulido extremo con resina epoxi.", type: "kintsugi" },
  { id: 16, title: "Retrato: Johnny Depp", desc: "Mirada tridimensional de barniz cerámico.", type: "artwork" },
  { id: 17, title: "Azoka Lataska", desc: "Encuentro directo con coleccionistas en Sopela.", type: "special" },
  { id: 18, title: "Retrato: Freddie Mercury", desc: "Relieve de oro y textura salvaje.", type: "artwork" },
  { id: 19, title: "Kintsugi Pedagógico", desc: "El ReCreo: Sanar a través del fallo.", type: "kintsugi" },
  { id: 20, title: "Cámara de Aire Logística", desc: "Envío seguro en caja de madera.", type: "special" },
  { id: 21, title: "Bóveda SOTA 2026", desc: "¡Victoria! Tu obra entra en el Archivo de Naroa.", type: "finish" },
];

export default function OcaGame() {
  const [position, setPosition] = useState<number>(1);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>(["¡Comienza el juego de la Oca de las Artes!"]);

  const rollDice = () => {
    if (isRolling || position >= 21) return;
    setIsRolling(true);

    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 8) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalDice);
        setIsRolling(false);

        let newPos = position + finalDice;
        if (newPos > 21) {
          const bounce = newPos - 21;
          newPos = 21 - bounce;
        }

        let extraMsg = '';
        if (newPos === 2) {
          newPos = 5;
          extraMsg = ' (¡Cantinflowers te impulsa a la casilla 5!)';
        } else if (newPos === 11) {
          newPos = 15;
          extraMsg = ' (¡De Oca a Oca! Avanzas a la 15)';
        }

        setPosition(newPos);
        const sq = SQUARES.find(s => s.id === newPos);
        setHistory(prev => [
          `🎲 Sacaste un ${finalDice}. Avanzas a la casilla ${newPos}: "${sq?.title}"${extraMsg}`,
          ...prev.slice(0, 9)
        ]);
      }
    }, 80);
  };

  const currentSquare = SQUARES.find(s => s.id === position);

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0A0A0A] border border-white/10 rounded-lg p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide flex items-center gap-2">
            <span className="text-[#2B3BE5]">🦆</span> La Oca de las Artes (DiviNos VaiVenes)
          </h2>
          <p className="text-xs text-white/50 font-sans mt-1">
            Recorre las 21 casillas de la trayectoria artística, técnicas y obras clave de Naroa.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-[10px] font-mono text-white/40 uppercase block">Dado</span>
            <div className="w-12 h-12 bg-white/10 border border-[#2B3BE5] rounded-md flex items-center justify-center font-mono text-2xl font-bold text-white shadow-[0_0_15px_rgba(43,59,229,0.3)]">
              {diceValue ?? '-'}
            </div>
          </div>
          <button
            onClick={rollDice}
            disabled={isRolling || position >= 21}
            className="px-6 py-3 bg-[#2B3BE5] hover:bg-white hover:text-black disabled:opacity-50 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-sm transition-all shadow-lg"
          >
            {isRolling ? 'Lanzando...' : position >= 21 ? '¡Completado!' : 'Tirar Dado 🎲'}
          </button>
        </div>
      </div>

      {/* CURRENT SQUARE DISPLAY */}
      {currentSquare && (
        <div className="p-4 bg-white/[0.03] border border-[#2B3BE5]/40 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#2B3BE5] uppercase tracking-widest block">
              Casilla {currentSquare.id} / 21
            </span>
            <h3 className="text-lg font-serif text-white font-bold">{currentSquare.title}</h3>
            <p className="text-xs text-white/70 font-sans">{currentSquare.desc}</p>
          </div>
          {position >= 21 && (
            <button
              onClick={() => { setPosition(1); setDiceValue(null); setHistory(["¡Juego reinventado!"]); }}
              className="px-4 py-2 bg-emerald-600 text-white font-mono text-xs uppercase tracking-wider rounded-sm hover:bg-emerald-500"
            >
              Jugar de Nuevo
            </button>
          )}
        </div>
      )}

      {/* BOARD GRID */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {SQUARES.map((sq) => {
          const isPlayer = position === sq.id;
          return (
            <div
              key={sq.id}
              className={`relative p-3 rounded-sm border flex flex-col justify-between h-24 transition-all ${
                isPlayer
                  ? 'border-[#D4AF37] bg-[#2B3BE5]/20 shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105 z-10'
                  : sq.type === 'kintsugi'
                  ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5'
                  : sq.type === 'finish'
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-white/10 bg-white/[0.01]'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                <span>#{sq.id}</span>
                <span>{sq.type === 'kintsugi' ? '✨' : sq.type === 'finish' ? '🏆' : '🎨'}</span>
              </div>
              <span className="text-[11px] font-serif text-white leading-tight font-medium line-clamp-2">
                {sq.title}
              </span>
              {isPlayer && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold text-xs flex items-center justify-center animate-bounce shadow-lg">
                  📍
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GAME LOG */}
      <div className="p-4 bg-black/40 border border-white/5 rounded-sm">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-2">Historial de Turnos</span>
        <div className="space-y-1 max-h-24 overflow-y-auto text-xs font-mono text-white/70">
          {history.map((log, idx) => (
            <div key={idx} className="border-b border-white/5 pb-0.5">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
