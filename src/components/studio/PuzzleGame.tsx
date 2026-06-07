'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Artwork {
  src: string;
  title: string;
}

interface PuzzleGameProps {
  artworks: Artwork[];
}

export default function PuzzleGame({ artworks }: PuzzleGameProps) {
  const [selectedArt, setSelectedArt] = useState(artworks[0]); // Default to James Dean
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const initPuzzle = () => {
    // 3x3 grid: 0 to 7 are tiles, 8 is the empty space
    const initial = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    // Shuffle with valid moves to ensure solvability
    let emptyIdx = 8;
    const size = 3;
    setMoves(0);
    setIsWon(false);

    for (let k = 0; k < 100; k++) {
      const row = Math.floor(emptyIdx / size);
      const col = emptyIdx % size;
      const possibleMoves: number[] = [];

      if (row > 0) possibleMoves.push(emptyIdx - size); // UP
      if (row < size - 1) possibleMoves.push(emptyIdx + size); // DOWN
      if (col > 0) possibleMoves.push(emptyIdx - 1); // LEFT
      if (col < size - 1) possibleMoves.push(emptyIdx + 1); // RIGHT

      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      initial[emptyIdx] = initial[randomMove];
      initial[randomMove] = 8;
      emptyIdx = randomMove;
    }

    setTiles(initial);
  };

  useEffect(() => {
    // eslint-disable-next-line
    initPuzzle();
  }, [selectedArt]);

  const handleTileClick = (index: number) => {
    if (isWon) return;
    const size = 3;
    const emptyIndex = tiles.indexOf(8);
    
    const tileRow = Math.floor(index / size);
    const tileCol = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    // Check if clicked tile is adjacent to empty spot
    const isAdjacent = 
      (Math.abs(tileRow - emptyRow) === 1 && tileCol === emptyCol) ||
      (Math.abs(tileCol - emptyCol) === 1 && tileRow === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      newTiles[emptyIndex] = tiles[index];
      newTiles[index] = 8;
      setTiles(newTiles);
      setMoves(moves + 1);

      // Check win condition
      const won = newTiles.every((val, i) => val === i);
      if (won) {
        setIsWon(true);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-5xl">
      {/* Sidebar - Controls */}
      <div className="flex flex-col w-full lg:w-1/3 gap-4 order-2 lg:order-1">
        <h3 className="text-xl font-serif text-primary tracking-wider uppercase mb-2">Recomponer</h3>
        <div className="max-h-[200px] overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin border-r border-white/5">
          {artworks.slice(0, 8).map((art) => (
            <button
              key={art.title}
              onClick={() => setSelectedArt(art)}
              className={`p-3 text-left font-sans text-xs tracking-wider uppercase border rounded-sm transition-all duration-300 ${
                selectedArt.title === art.title
                  ? 'border-primary/40 text-primary bg-primary/5'
                  : 'border-white/5 text-foreground/40 hover:text-foreground/80 hover:border-white/10'
              }`}
            >
              {art.title}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center p-4 rounded-sm border border-white/5 bg-black mt-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 block mb-1">Movimientos</span>
            <span className="text-2xl font-serif font-light text-foreground">{moves}</span>
          </div>
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border border-white/10 hover:border-primary/30 text-[9px] tracking-widest uppercase text-foreground/70 transition-all duration-500 rounded-sm cursor-pointer"
          >
            {showPreview ? 'Ocultar Guía' : 'Ver Guía'}
          </button>
        </div>

        <button 
          onClick={initPuzzle}
          className="mt-2 py-3 border border-white/10 hover:border-primary/30 hover:text-primary transition-all duration-500 uppercase tracking-widest text-[9px] font-sans rounded-sm cursor-pointer"
        >
          Reiniciar Rayuela
        </button>
      </div>

      {/* Main Puzzle Area */}
      <div className="flex flex-col items-center justify-center w-full lg:w-2/3 order-1 lg:order-2">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-serif font-light text-foreground uppercase tracking-wide">
            {selectedArt.title}
          </h4>
          <span className="text-[9px] tracking-[0.3em] uppercase text-primary/70 mt-1 block">
            Desliza las fichas para resolver el retrato
          </span>
        </div>

        {/* Puzzle Grid */}
        <div className="relative w-full max-w-[400px] aspect-square bg-[#0A0A0A] shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 rounded-sm overflow-hidden p-2">
          {showPreview ? (
            <div className="absolute inset-0 z-20 animate-[fadeIn_0.5s_ease-out]">
              <Image
                src={`/assets/${selectedArt.src}`}
                alt={selectedArt.title}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute bottom-4 right-4 bg-black/80 text-[8px] text-primary tracking-widest uppercase px-3 py-1 ring-1 ring-white/10">
                Guía Visual Activa
              </div>
            </div>
          ) : null}

          <div className="relative w-full h-full z-10">
            {Array.from({ length: 8 }).map((_, val) => {
              const idx = tiles.indexOf(val);
              if (idx === -1) return null;
              const row = Math.floor(idx / 3);
              const col = idx % 3;

              const bgRow = Math.floor(val / 3);
              const bgCol = val % 3;

              return (
                <button
                  key={val}
                  onClick={() => handleTileClick(idx)}
                  className="absolute w-1/3 h-1/3 p-1 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                  style={{
                    transform: `translate3d(${col * 100}%, ${row * 100}%, 0)`
                  }}
                >
                  <div className="relative w-full h-full overflow-hidden bg-[#111113] active:scale-[0.98] transition-transform duration-300 ring-1 ring-white/5 rounded-sm">
                    <div
                      className="absolute w-[300%] h-[300%]"
                      style={{
                        left: `-${bgCol * 100}%`,
                        top: `-${bgRow * 100}%`,
                        backgroundImage: `url(/assets/${selectedArt.src})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Victory overlay */}
          {isWon && (
            <div className="absolute inset-0 bg-[#0A0A0Ad8] z-30 flex flex-col justify-center items-center p-8 text-center animate-[fadeIn_0.8s_ease-out]">
              <span className="text-primary font-hand text-5xl rotate-6 mb-2">Espectacular</span>
              <h5 className="text-2xl font-serif uppercase tracking-widest text-foreground font-light mb-4">
                Retrato Resuelto
              </h5>
              <p className="text-xs text-foreground/50 max-w-[280px] leading-relaxed mb-6">
                Has colocado todas las piezas de {selectedArt.title} en perfecta armonía en {moves} movimientos.
              </p>
              <button
                onClick={initPuzzle}
                className="px-6 py-3 bg-primary text-black hover:bg-white transition-colors duration-500 font-sans text-[10px] tracking-[0.2em] uppercase rounded-sm font-semibold cursor-pointer"
              >
                Jugar otra vez
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
