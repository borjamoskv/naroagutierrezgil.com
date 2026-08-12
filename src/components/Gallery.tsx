import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, Environment, Float, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { artworks } from '../data/artworks'

function ArtworkFrame({ position, rotation, texture, onClick, isActive }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1
      
      // Scale on hover
      const targetScale = hovered ? 1.1 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
      
      // Glow effect on active
      if (isActive) {
        meshRef.current.material.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      } else {
        meshRef.current.material.emissiveIntensity = 0
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[3, 4]} />
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        emissive={new THREE.Color('#F59E0B')}
        emissiveIntensity={isActive ? 0.2 : 0}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

function GalleryScene({ setActiveArtworkIndex, activeArtworkIndex, setLoading }) {
  const { viewport } = useThree()
  const textures = useTexture(artworks.map(a => a.src))
  
  useEffect(() => {
    if (textures) {
      setLoading(false)
    }
  }, [textures, setLoading])

  // Arrange artworks in a circle
  const radius = 8
  const angleStep = (Math.PI * 2) / artworks.length

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Environment preset="city" />
      <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />

      {artworks.map((art, i) => {
        const angle = i * angleStep
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        return (
          <ArtworkFrame
            key={art.id}
            position={[x, 0, z]}
            rotation={[0, -angle, 0]} // Face center
            texture={textures[i]}
            onClick={() => setActiveArtworkIndex(i)}
            isActive={activeArtworkIndex === i}
          />
        )
      })}
    </>
  )
}

function CameraRig({ activeArtworkIndex }) {
  const { camera } = useThree()
  
  useFrame((state) => {
    if (activeArtworkIndex !== null) {
      // Calculate target position based on active artwork
      const radius = 8
      const angleStep = (Math.PI * 2) / artworks.length
      const angle = activeArtworkIndex * angleStep
      
      // Position camera slightly offset from the artwork
      const x = Math.sin(angle) * (radius - 3)
      const z = Math.cos(angle) * (radius - 3)
      
      // Smoothly interpolate camera position
      camera.position.lerp(new THREE.Vector3(x, 0, z), 0.05)
      camera.lookAt(Math.sin(angle) * radius, 0, Math.cos(angle) * radius)
    } else {
      // Orbit center slowly
      const time = state.clock.elapsedTime * 0.1
      camera.position.lerp(new THREE.Vector3(Math.sin(time) * 5, 0, Math.cos(time) * 5), 0.05)
      camera.lookAt(0, 0, 0)
    }
  })
  
  return null
}

export function Gallery({ setLoading, setActiveArtworkIndex, activeArtworkIndex, isMounted, setIsMounted }) {
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [setIsMounted])

  if (!isMounted) return null

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 5, 20]} />
      <React.Suspense fallback={null}>
        <GalleryScene 
          setActiveArtworkIndex={setActiveArtworkIndex} 
          activeArtworkIndex={activeArtworkIndex}
          setLoading={setLoading}
        />
      </React.Suspense>
      <CameraRig activeArtworkIndex={activeArtworkIndex} />
    </Canvas>
  )
}
