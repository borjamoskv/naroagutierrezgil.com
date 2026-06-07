"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    let rafId: number;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const animate = () => {
      // Lerp for the follower (physics based smooth follow)
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("mouseover", handleMouseOver);
    animate();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Hide default cursor globally when this component mounts
  useEffect(() => {
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);
    return () => {
      document.body.style.cursor = "auto";
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {/* Core Dot */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#EAEAEA] rounded-full pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2"
      />
      {/* Physics Follower */}
      <div 
        ref={followerRef} 
        className={`fixed top-0 left-0 border rounded-full pointer-events-none z-[9998] mix-blend-difference -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out`}
        style={{
          borderColor: 'var(--primary, #2B3BE5)',
          backgroundColor: isHovering ? 'rgba(var(--primary-rgb, 43, 59, 229), 0.2)' : 'transparent',
          width: isHovering ? '48px' : '24px',
          height: isHovering ? '48px' : '24px'
        }}
      />
    </>
  );
}
