import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [hoverType, setHoverType] = useState<'link' | 'artwork' | null>(null);
  const [isActive, setIsActive] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const mousePos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable on desktop devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isActive) setIsActive(true);
    };

    const updateCursor = () => {
      // Linear interpolation (Lerp) for smooth trailing effect
      setPosition((prev) => {
        const dx = mousePos.current.x - prev.x;
        const dy = mousePos.current.y - prev.y;
        return {
          x: prev.x + dx * 0.25,
          y: prev.y + dy * 0.25,
        };
      });
      requestRef.current = requestAnimationFrame(updateCursor);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Look up the DOM tree for a clickable element
      let el: HTMLElement | null = target;
      let isArtwork = false;
      let isLink = false;
      
      while (el && el !== document.body) {
        if (el.tagName.toLowerCase() === 'a' || el.tagName.toLowerCase() === 'button' || el.classList.contains('clickable') || el.classList.contains('nav-btn')) {
          isLink = true;
          if (el.classList.contains('artwork-card')) {
            isArtwork = true;
          }
          break;
        }
        el = el.parentElement;
      }
      
      if (isArtwork) {
        setHoverType('artwork');
      } else if (isLink) {
        setHoverType('link');
      } else {
        setHoverType(null);
      }
    };

    const onMouseLeave = () => {
      setIsActive(false);
    };
    
    const onMouseEnter = () => {
      setIsActive(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    
    requestRef.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive]);

  const classes = [
    'custom-cursor',
    isActive ? 'active' : '',
    hoverType === 'link' ? 'hovering-link' : '',
    hoverType === 'artwork' ? 'hovering-artwork' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`
      }}
    >
      <span className="custom-cursor-text">VER</span>
    </div>
  );
};
