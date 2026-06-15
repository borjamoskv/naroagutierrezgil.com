'use client'

import { useEffect } from 'react'

export function useInertialScroll() {
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let scrollFrame: number;
    
    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      
      scrollVelocity = scrollVelocity + (delta - scrollVelocity) * 0.12;
      
      const speed = Math.min(Math.abs(scrollVelocity) / 30, 1);
      const direction = Math.sign(scrollVelocity);
      
      document.documentElement.style.setProperty('--scroll-velocity', speed.toString());
      document.documentElement.style.setProperty('--scroll-direction', direction.toString());
      
      lastScrollY = currentScrollY;
      scrollFrame = requestAnimationFrame(updateScroll);
    };
    
    updateScroll();

    return () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
    };
  }, []);
}