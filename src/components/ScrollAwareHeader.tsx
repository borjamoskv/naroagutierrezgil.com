"use client";

import { useEffect, useState, ReactNode } from "react";

interface ScrollAwareHeaderProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
}

export default function ScrollAwareHeader({
  children,
  className = '',
  threshold = 20,
}: ScrollAwareHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Check initial scroll position
    onScroll();
    
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return (
    <header
      className={`${className} transition-all duration-300 ease-out`}
      style={{
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'blur(4px)',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'blur(4px)',
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.85)' : 'rgba(10, 10, 10, 0.4)',
        borderColor: scrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {children}
    </header>
  );
}

