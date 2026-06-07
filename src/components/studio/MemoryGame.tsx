'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Artwork {
  src: string;
  title: string;
}

interface Card {
  id: number;
  val: number;
  src: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  artworks: Artwork[];
}

export default function MemoryGame({ artworks }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initMemory = () => {
    // Select 6 random artworks
    const shuffledArt = [...artworks].sort(() => 0.5 - Math.random()).slice(0, 6);
    
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initMemory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        <div className="flex justify-between items-center p-4 rounded-sm border border-white/5 bg-black mt-4">
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
          className="mt-2 py-3 border border-white/10 hover:border-primary/30 hover:text-primary transition-all duration-500 uppercase tracking-widest text-[9px] font-sans rounded-sm cursor-pointer"
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
        <div className="relative w-full max-w-[500px] aspect-[4/3] bg-[#0A0A0A] shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 rounded-sm p-4">
          <div className="grid grid-cols-4 grid-rows-3 gap-3 w-full h-full">
            {cards.map((card) => {
              const showFace = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className="relative w-full h-full [perspective:1000px] bg-transparent group focus:outline-none select-none cursor-pointer"
                >
                  <div
                    className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
                      showFace ? '[transform:rotateY(180deg)]' : ''
                    }`}
                  >
                    {/* Back Side (Slate Cover) */}
                    <div className="absolute inset-0 w-full h-full bg-[#050505] border border-primary/20 hover:border-primary/50 rounded-sm shadow-xl flex flex-col justify-center items-center [backface-visibility:hidden] overflow-hidden">
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
            <div className="absolute inset-0 bg-[#0A0A0Ad8] z-30 flex flex-col justify-center items-center p-8 text-center animate-[fadeIn_0.8s_ease-out]">
              <span className="text-primary font-hand text-5xl rotate-6 mb-2">Espectacular</span>
              <h5 className="text-2xl font-serif uppercase tracking-widest text-foreground font-light mb-4">
                Identidades Resueltas
              </h5>
              <p className="text-xs text-foreground/50 max-w-[280px] leading-relaxed mb-6">
                Has reflejado con éxito todas las miradas de los espejos en {turns} intentos.
              </p>
              <button
                onClick={initMemory}
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
