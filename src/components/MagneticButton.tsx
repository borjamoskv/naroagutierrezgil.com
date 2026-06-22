"use client";

import React, { useRef, useState, useEffect } from "react";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  range?: number;
  strength?: number;
  className?: string;
}

/**
 * MagneticButton component inspired by Dennis Snellenberg.
 * Warps toward the pointer when it gets close.
 * 
 * Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
 */
export default function MagneticButton({
  children,
  range = 65,
  strength = 0.35,
  className = "",
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      const distanceX = e.clientX - buttonCenterX;
      const distanceY = e.clientY - buttonCenterY;
      const distance = Math.hypot(distanceX, distanceY);

      if (distance < range) {
        // Warp button towards the cursor
        setPosition({
          x: distanceX * strength,
          y: distanceY * strength,
        });
      } else {
        // Return to origin
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    buttonRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      buttonRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [range, strength]);

  return (
    <button
      ref={buttonRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" : "transform 0.1s ease-out",
      }}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-all duration-300 ${className}`}
      {...props}
    >
      <span className="relative z-10 block pointer-events-none">{children}</span>
    </button>
  );
}
