'use client';

import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  useEffect(() => {
    gsap.to('.custom-cursor-dot', {
      x: position.x,
      y: position.y,
      duration: 0.1,
      ease: 'power2.out',
    });
    gsap.to('.custom-cursor-ring', {
      x: position.x,
      y: position.y,
      duration: 0.5,
      ease: 'power3.out',
    });
  }, [position]);

  // Hide default cursor globally
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <>
      <div 
        className="custom-cursor-dot fixed top-0 left-0 w-2 h-2 bg-[#F59E0B] rounded-full pointer-events-none z-[9999] mix-blend-screen"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div 
        className={`custom-cursor-ring fixed top-0 left-0 w-10 h-10 border-2 rounded-full pointer-events-none z-[9998] transition-all duration-300 mix-blend-screen ${isHovering ? 'border-[#F59E0B] scale-150 bg-[#F59E0B]/20' : 'border-[#2B3BE5] scale-100'}`}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </>
  );
}
