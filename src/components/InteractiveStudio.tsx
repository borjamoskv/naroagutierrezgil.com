/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/immutability, prefer-const */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const ARTWORKS = [
  { src: 'hq-james-CjsTrO7r.webp', title: 'James Dean' },
  { src: 'hq-amy-BRTriASV.webp', title: 'Amy Winehouse' },
  { src: 'hq-portrait-1-bV-_WHlX.webp', title: 'Retrato I' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari' },
  { src: 'hq-johnny-5ueL8eU0.webp', title: 'Johnny Depp' },
  { src: 'marilyn-rocks--qPeLHxE.webp', title: 'Marilyn Rocks' },
  { src: 'audrey-hepburn-DbIBTtIp.webp', title: 'Audrey Hepburn' },
  { src: 'geisha-MfRtKWdu.webp', title: 'Geisha' },
  { src: 'lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro' },
  { src: 'love-DA7L_L5F.webp', title: 'Love' },
  { src: 'la-pensadora-CFHSnMA0.webp', title: 'La Pensadora' }
];

export default function InteractiveStudio() {
  const [activeTab, setActiveTab] = useState<'scratch' | 'puzzle' | 'memory'>('scratch');

  return (
    <section id="taller-interactivo" className="relative z-10 py-32 px-4 sm:px-12 bg-[#080809] border-t border-white/5">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-20 text-center flex flex-col items-center">
          <span className="text-primary/70 font-sans tracking-[0.4em] uppercase text-[10px] mb-4 block">
            Pizarra y Alquimia
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-light tracking-wide text-foreground uppercase">
            El Taller Interactivo
          </h2>
          <div className="w-px h-12 bg-gradient-to-b from-primary/30 to-transparent mt-8"></div>
          <p className="max-w-2xl text-foreground/50 font-sans text-sm tracking-wide mt-6 leading-relaxed">
            Experimenta de manera lúdica con la obra original de Naroa Gutiérrez Gil. Descubre la textura de la pizarra, recompón retratos fragmentados o empareja los espejos de la identidad.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center gap-2 sm:gap-6 mb-16 border-b border-white/5 pb-6">
          {[
            { id: 'scratch', label: 'Cincelar la Pizarra' },
            { id: 'puzzle', label: 'Rayuela de Retratos' },
            { id: 'memory', label: 'Espejos del Alma' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 sm:px-8 py-3 rounded-sm font-sans text-[11px] uppercase tracking-[0.2em] transition-all duration-500 relative ${
                activeTab === tab.id
                  ? 'text-primary border border-primary/30 bg-primary/5 shadow-[0_0_20px_rgba(198,168,124,0.1)]'
                  : 'text-foreground/40 border border-transparent hover:text-foreground/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Game Container */}
        <div className="bg-[#0c0c0e] rounded-sm ring-1 ring-white/5 shadow-2xl p-6 sm:p-12 min-h-[600px] flex items-center justify-center">
          {activeTab === 'scratch' && <ScratchGame />}
          {activeTab === 'puzzle' && <PuzzleGame />}
          {activeTab === 'memory' && <MemoryGame />}
        </div>
      </div>
    </section>
  );
}

/* ==========================================
   GAME 1: SCRATCH & REVEAL (Slate Carver)
   ========================================== */
function ScratchGame() {
  const [selectedArt, setSelectedArt] = useState(ARTWORKS[1]); // Default to Amy Winehouse
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealedPercent, setRevealedPercent] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const isDrawing = useRef(false);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset game state
    setRevealedPercent(0);
    setIsWon(false);

    // Fill with slate background (dark textured stone)
    ctx.fillStyle = '#1e1e20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some organic slate vein lines
    ctx.strokeStyle = '#2b2b2f';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, 0);
      ctx.lineTo(Math.random() * canvas.width, canvas.height);
      ctx.stroke();
    }
    
    // Add slate horizontal micro-veins
    ctx.strokeStyle = '#151517';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y + (Math.random() * 20 - 10));
      ctx.stroke();
    }
  };

  useEffect(() => {
    initCanvas();
  }, [selectedArt]);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const scratch = (pos: { x: number; y: number } | null) => {
    if (!pos || isWon) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 35, 0, Math.PI * 2);
    ctx.fill();

    // Check revealed percentage
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] === 0) cleared++;
    }
    
    const percent = Math.round((cleared / (imgData.length / 4)) * 100);
    setRevealedPercent(percent);

    if (percent > 85) {
      setIsWon(true);
      // Fade out the rest of the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    scratch(getMousePos(e));
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    scratch(getMousePos(e));
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-5xl">
      {/* Sidebar - Art List */}
      <div className="flex flex-col w-full lg:w-1/3 gap-4 order-2 lg:order-1">
        <h3 className="text-xl font-serif text-primary tracking-wider uppercase mb-2">Escoge una obra</h3>
        <div className="max-h-[300px] overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin border-r border-white/5">
          {ARTWORKS.map((art) => (
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
        
        <div className="mt-6 p-4 rounded-sm border border-white/5 bg-[#080809]">
          <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 block mb-1">Cincelado</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-serif font-light text-foreground">{revealedPercent}%</span>
            <span className="text-[10px] text-primary tracking-widest uppercase">Meta: 85%</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${Math.min(revealedPercent, 100)}%` }}
            />
          </div>
        </div>

        <button 
          onClick={initCanvas}
          className="mt-2 py-3 border border-white/10 hover:border-primary/30 hover:text-primary transition-all duration-500 uppercase tracking-widest text-[9px] font-sans rounded-sm"
        >
          Reiniciar Pizarra
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex flex-col items-center justify-center w-full lg:w-2/3 order-1 lg:order-2">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-serif font-light text-foreground uppercase tracking-wide">
            {selectedArt.title}
          </h4>
          <span className="text-[9px] tracking-[0.3em] uppercase text-primary/70 mt-1 block">
            Cincela con el ratón o dedo para revelar el lienzo
          </span>
        </div>

        <div className="relative w-full max-w-[450px] aspect-[4/5] bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 rounded-sm overflow-hidden select-none">
          {/* Base Artwork Image (Underneath) */}
          <div className="absolute inset-0 z-0">
            <Image
              src={`https://naroa.online/assets/${selectedArt.src}`}
              alt={selectedArt.title}
              fill
              className="object-cover"
              sizes="450px"
              quality={100}
            />
          </div>

          {/* Slate Scratch Canvas */}
          <canvas
            ref={canvasRef}
            width={450}
            height={562}
            className="absolute inset-0 z-10 cursor-crosshair touch-none mix-blend-normal"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />

          {/* Victory overlay */}
          {isWon && (
            <div className="absolute inset-0 bg-[#0a0a0cd8] z-20 flex flex-col justify-center items-center p-8 text-center animate-[fadeIn_0.8s_ease-out]">
              <span className="text-primary font-hand text-5xl rotate-6 mb-2">Espectacular</span>
              <h5 className="text-2xl font-serif uppercase tracking-widest text-foreground font-light mb-4">
                Obra Revelada
              </h5>
              <p className="text-xs text-foreground/50 max-w-[280px] leading-relaxed mb-6">
                Has retirado la pizarra para liberar los colores y el alma del retrato hiperrealista.
              </p>
              <button
                onClick={initCanvas}
                className="px-6 py-3 bg-primary text-black hover:bg-white transition-colors duration-500 font-sans text-[10px] tracking-[0.2em] uppercase rounded-sm font-semibold"
              >
                Cincelar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   GAME 2: SLIDING PUZZLE (15-Puzzle)
   ========================================== */
function PuzzleGame() {
  const [selectedArt, setSelectedArt] = useState(ARTWORKS[0]); // Default to James Dean
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
          {ARTWORKS.slice(0, 8).map((art) => (
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

        <div className="flex justify-between items-center p-4 rounded-sm border border-white/5 bg-[#080809] mt-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 block mb-1">Movimientos</span>
            <span className="text-2xl font-serif font-light text-foreground">{moves}</span>
          </div>
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border border-white/10 hover:border-primary/30 text-[9px] tracking-widest uppercase text-foreground/70 transition-all duration-500 rounded-sm"
          >
            {showPreview ? 'Ocultar Guía' : 'Ver Guía'}
          </button>
        </div>

        <button 
          onClick={initPuzzle}
          className="mt-2 py-3 border border-white/10 hover:border-primary/30 hover:text-primary transition-all duration-500 uppercase tracking-widest text-[9px] font-sans rounded-sm"
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
        <div className="relative w-full max-w-[400px] aspect-square bg-[#08080a] shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 rounded-sm overflow-hidden p-2">
          {showPreview ? (
            <div className="absolute inset-0 z-20 animate-[fadeIn_0.5s_ease-out]">
              <Image
                src={`https://naroa.online/assets/${selectedArt.src}`}
                alt={selectedArt.title}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute bottom-4 right-4 bg-black/80 text-[8px] text-primary tracking-widest uppercase px-3 py-1 ring-1 ring-white/10">
                Guía Visual Activa
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full relative z-10">
            {tiles.map((val, idx) => {
              if (val === 8) {
                // Empty slot
                return <div key="empty" className="bg-transparent" />;
              }

              // Calculate background offset for slicing image using styles
              const row = Math.floor(val / 3);
              const col = val % 3;

              return (
                <button
                  key={val}
                  onClick={() => handleTileClick(idx)}
                  className="relative overflow-hidden w-full h-full bg-[#111113] active:scale-[0.98] transition-transform duration-300 ring-1 ring-white/5 rounded-sm"
                >
                  <div
                    className="absolute w-[300%] h-[300%]"
                    style={{
                      left: `-${col * 100}%`,
                      top: `-${row * 100}%`,
                      backgroundImage: `url(https://naroa.online/assets/${selectedArt.src})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors duration-300" />
                </button>
              );
            })}
          </div>

          {/* Victory overlay */}
          {isWon && (
            <div className="absolute inset-0 bg-[#0a0a0cd8] z-30 flex flex-col justify-center items-center p-8 text-center animate-[fadeIn_0.8s_ease-out]">
              <span className="text-primary font-hand text-5xl rotate-6 mb-2">Espectacular</span>
              <h5 className="text-2xl font-serif uppercase tracking-widest text-foreground font-light mb-4">
                Retrato Resuelto
              </h5>
              <p className="text-xs text-foreground/50 max-w-[280px] leading-relaxed mb-6">
                Has colocado todas las piezas de {selectedArt.title} en perfecta armonía en {moves} movimientos.
              </p>
              <button
                onClick={initPuzzle}
                className="px-6 py-3 bg-primary text-black hover:bg-white transition-colors duration-500 font-sans text-[10px] tracking-[0.2em] uppercase rounded-sm font-semibold"
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

/* ==========================================
   GAME 3: MEMORY MATCH (Espejos del Alma)
   ========================================== */
interface Card {
  id: number;
  val: number;
  src: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initMemory = () => {
    // Select 6 random artworks
    const shuffledArt = [...ARTWORKS].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    // Duplicate them to make 12 cards (6 pairs)
    const initialCards: Card[] = [];
    shuffledArt.forEach((art, i) => {
      initialCards.push({ id: i * 2, val: i, src: art.src, isFlipped: false, isMatched: false });
      initialCards.push({ id: i * 2 + 1, val: i, src: art.src, isFlipped: false, isMatched: false });
    });

    // Shuffle the final deck
    initialCards.sort(() => 0.5 - Math.random());
    setCards(initialCards);
    setSelected([]);
    setTurns(0);
    setIsWon(false);
  };

  useEffect(() => {
    initMemory();
  }, []);

  const handleCardClick = (id: number) => {
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched || selected.length >= 2) return;

    // Flip clicked card
    const updatedCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(updatedCards);

    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setTurns(prev => prev + 1);
      const [firstId, secondId] = newSelected;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = cards.find(c => c.id === secondId)!;

      if (firstCard.src === secondCard.src) {
        // MATCHED
        setTimeout(() => {
          setCards(prevCards => {
            const temp = prevCards.map(c => 
              (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true } : c
            );
            // Check win condition
            if (temp.every(c => c.isMatched)) {
              setIsWon(true);
            }
            return temp;
          });
          setSelected([]);
        }, 600);
      } else {
        // NOT MATCHED - Flip back
        setTimeout(() => {
          setCards(prevCards => prevCards.map(c => 
            (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c
          ));
          setSelected([]);
        }, 1200);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-5xl">
      {/* Sidebar - Controls */}
      <div className="flex flex-col w-full lg:w-1/3 gap-4 order-2 lg:order-1">
        <h3 className="text-xl font-serif text-primary tracking-wider uppercase mb-2">Emparejar</h3>
        
        <p className="text-xs text-foreground/40 leading-relaxed font-sans pr-4">
          Los retratos actúan como espejos del alma. Encuentra las identidades gemelas ocultas detrás del metal y la pizarra.
        </p>

        <div className="flex justify-between items-center p-4 rounded-sm border border-white/5 bg-[#080809] mt-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 block mb-1">Intentos</span>
            <span className="text-2xl font-serif font-light text-foreground">{turns}</span>
          </div>
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 block mb-1">Completado</span>
            <span className="text-2xl font-serif font-light text-primary">
              {cards.filter(c => c.isMatched).length / 2} / 6
            </span>
          </div>
        </div>

        <button 
          onClick={initMemory}
          className="mt-2 py-3 border border-white/10 hover:border-primary/30 hover:text-primary transition-all duration-500 uppercase tracking-widest text-[9px] font-sans rounded-sm"
        >
          Reiniciar Tablero
        </button>
      </div>

      {/* Main Memory Area */}
      <div className="flex flex-col items-center justify-center w-full lg:w-2/3 order-1 lg:order-2">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-serif font-light text-foreground uppercase tracking-wide">
            Espejos Ocultos
          </h4>
          <span className="text-[9px] tracking-[0.3em] uppercase text-primary/70 mt-1 block">
            Selecciona dos cartas para buscar su identidad gemela
          </span>
        </div>

        {/* Card Deck Grid */}
        <div className="relative w-full max-w-[500px] aspect-[4/3] bg-[#08080a] shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 rounded-sm p-4">
          <div className="grid grid-cols-4 grid-rows-3 gap-3 w-full h-full">
            {cards.map((card) => {
              const showFace = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className="relative w-full h-full [perspective:1000px] bg-transparent group focus:outline-none select-none"
                >
                  <div
                    className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
                      showFace ? '[transform:rotateY(180deg)]' : ''
                    }`}
                  >
                    {/* Back Side (Slate Cover) */}
                    <div className="absolute inset-0 w-full h-full bg-[#161618] border border-primary/20 hover:border-primary/50 rounded-sm shadow-xl flex flex-col justify-center items-center [backface-visibility:hidden] overflow-hidden">
                      <div className="absolute inset-0 bg-slate-texture opacity-30" />
                      {/* Artistic minimalist monogram inside the back */}
                      <span className="text-[9px] font-sans font-light tracking-[0.4em] text-primary/40 uppercase relative z-10">
                        N A R O A
                      </span>
                      <div className="w-6 h-6 border-t border-b border-primary/10 rounded-full animate-pulse mt-2"></div>
                    </div>

                    {/* Front Side (Artwork Revealed) */}
                    <div className="absolute inset-0 w-full h-full rounded-sm overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] border border-primary/30 shadow-2xl">
                      <Image
                        src={`https://naroa.online/assets/${card.src}`}
                        alt="front"
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                      {card.isMatched && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="w-full py-1 bg-black/80 border-t border-b border-primary/30 text-[8px] text-primary font-sans tracking-[0.3em] uppercase text-center font-semibold animate-pulse">
                            Emparejado
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Victory overlay */}
          {isWon && (
            <div className="absolute inset-0 bg-[#0a0a0cd8] z-30 flex flex-col justify-center items-center p-8 text-center animate-[fadeIn_0.8s_ease-out]">
              <span className="text-primary font-hand text-5xl rotate-6 mb-2">Espectacular</span>
              <h5 className="text-2xl font-serif uppercase tracking-widest text-foreground font-light mb-4">
                Identidades Resueltas
              </h5>
              <p className="text-xs text-foreground/50 max-w-[280px] leading-relaxed mb-6">
                Has reflejado con éxito todas las miradas de los espejos en {turns} intentos.
              </p>
              <button
                onClick={initMemory}
                className="px-6 py-3 bg-primary text-black hover:bg-white transition-colors duration-500 font-sans text-[10px] tracking-[0.2em] uppercase rounded-sm font-semibold"
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
