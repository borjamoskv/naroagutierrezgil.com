"use client";

import { useEffect, useState, useRef, ReactNode } from "react";

interface ScrollAwareHeaderProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
}

export default function ScrollAwareHeader({
  children,
  className = '',
  threshold = 80,
}: ScrollAwareHeaderProps) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollY.current;

          // Only trigger after threshold
          if (currentY > threshold) {
            setScrolled(true);
            if (delta > 5) {
              setHidden(true); // scrolling down
            } else if (delta < -5) {
              setHidden(false); // scrolling up
            }
          } else {
            setScrolled(false);
            setHidden(false);
          }

          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return (
    <header
      className={className}
      style={{
        transform: hidden ? 'translateY(-110%)' : 'translateY(0)',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.3s ease',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        willChange: 'transform',
      }}
    >
      {children}
    </header>
  );
}
