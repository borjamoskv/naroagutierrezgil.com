'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

function BackgroundParticles() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = 200;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.max(0.2, Math.cos(t));

      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshPhysicalMaterial 
        color="#F59E0B" 
        emissive="#F59E0B"
        emissiveIntensity={2}
        roughness={0.2}
        metalness={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
}

function CinematicEffects() {
  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.9} 
        intensity={2.5} 
        blendFunction={BlendFunction.ADD}
      />
      <DepthOfField 
        focusDistance={0.0} 
        focalLength={0.02} 
        bokehScale={2} 
        height={480} 
      />
      <ChromaticAberration 
        offset={new THREE.Vector2(0.002, 0.002)} 
        blendFunction={BlendFunction.NORMAL} 
        radialModulation={false} modulationOffset={0} 
      />
      <Noise 
        premultiply 
        blendFunction={BlendFunction.ADD} 
        opacity={0.08}
      />
    </EffectComposer>
  );
}

function FloatingMica() {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[30, 30, 64, 64]} />
        <MeshDistortMaterial 
          color="#050505" 
          roughness={0.8} 
          metalness={0.5} 
          distort={0.2} 
          speed={0.5} 
        />
      </mesh>
    </Float>
  );
}

export default function CinematicCanvas() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#0A0A0A]">
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#2B3BE5" />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#F59E0B" />
        
        <Environment preset="city" />
        
        <FloatingMica />
        <BackgroundParticles />
        <CinematicEffects />
      </Canvas>
    </div>
  );
}
