'use client';

// C5-REAL: WebGPU Canvas Provider for Naroa.online
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
// Replaces all R3F <Canvas> instances with WebGPURenderer initialization.
// Automatic WebGL2 fallback on unsupported browsers.

import { Canvas, type CanvasProps } from '@react-three/fiber';
import { forwardRef, type ReactNode } from 'react';

type WebGPUCanvasProps = Omit<CanvasProps, 'gl'> & {
  children: ReactNode;
  /** Force WebGL fallback (skip WebGPU) */
  forceWebGL?: boolean;
};

/**
 * Drop-in replacement for R3F <Canvas> that initializes WebGPURenderer.
 * Uses dynamic import to avoid SSR issues with 'three/webgpu'.
 * Falls back to standard WebGLRenderer if WebGPU is unavailable.
 */
const WebGPUCanvas = forwardRef<HTMLCanvasElement, WebGPUCanvasProps>(
  function WebGPUCanvas({ children, forceWebGL = false, ...props }, ref) {
    return (
      <Canvas
        ref={ref}
        gl={async (canvasProps) => {
          if (forceWebGL) {
            // Explicit fallback: use standard WebGLRenderer
            const THREE = await import('three');
            return new THREE.WebGLRenderer(canvasProps);
          }

          try {
            // Dynamic import to avoid SSR bundling issues
            const THREE_WEBGPU = await import('three/webgpu');
            const renderer = new THREE_WEBGPU.WebGPURenderer(canvasProps as any);
            await renderer.init();
            return renderer;
          } catch {
            // WebGPU unavailable — fall back to WebGL
            const THREE = await import('three');
            return new THREE.WebGLRenderer(canvasProps);
          }
        }}
        {...props}
      >
        {children}
      </Canvas>
    );
  }
);

export default WebGPUCanvas;
