'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursorWrapper() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="w-[20px] h-[20px] border border-white/50 rounded-full fixed pointer-events-none z-[9999] mix-blend-difference transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
    />
  );
}
