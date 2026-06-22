"use client";

import React, { useRef, useEffect } from "react";

interface ScrollMarqueeProps {
  texts: string[];
  baseSpeed?: number;
  className?: string;
  textClassName?: string;
}

/**
 * ScrollMarquee component inspired by Dennis Snellenberg.
 * The marquee text speed and direction synchronize dynamically with the page scroll speed.
 * 
 * Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
 */
export default function ScrollMarquee({
  texts,
  baseSpeed = 1.5,
  className = "",
  textClassName = "",
}: ScrollMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const xPosRef = useRef(0);
  const velocityRef = useRef(0);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      // Adjust velocity based on scroll delta
      velocityRef.current += delta * 0.15;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let rafId: number;

    const updateMarquee = () => {
      const textContainer = textContainerRef.current;
      if (!textContainer) {
        rafId = requestAnimationFrame(updateMarquee);
        return;
      }

      // Add base speed + current velocity (which decays over time)
      xPosRef.current -= baseSpeed + velocityRef.current;

      // Decay velocity towards 0 (damping)
      velocityRef.current *= 0.92;

      // Infinite loop reset. If we translate past 50% of the combined width (since text is duplicated), reset xPos.
      const firstChild = textContainer.children[0] as HTMLElement;
      if (firstChild) {
        const resetWidth = firstChild.getBoundingClientRect().width;
        if (Math.abs(xPosRef.current) >= resetWidth) {
          xPosRef.current = 0;
        }
      }

      textContainer.style.transform = `translate3d(${xPosRef.current}px, 0, 0)`;

      rafId = requestAnimationFrame(updateMarquee);
    };

    rafId = requestAnimationFrame(updateMarquee);
    return () => cancelAnimationFrame(rafId);
  }, [baseSpeed]);

  // Duplicate the text string to support seamless marquee looping
  const combinedText = texts.join("   //   ") + "   //   ";

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden whitespace-nowrap select-none ${className}`}
    >
      <div
        ref={textContainerRef}
        className="flex w-max will-change-transform"
      >
        <span className={`inline-block pr-8 ${textClassName}`}>
          {combinedText}
        </span>
        <span className={`inline-block pr-8 ${textClassName}`}>
          {combinedText}
        </span>
        <span className={`inline-block pr-8 ${textClassName}`}>
          {combinedText}
        </span>
        <span className={`inline-block pr-8 ${textClassName}`}>
          {combinedText}
        </span>
      </div>
    </div>
  );
}
