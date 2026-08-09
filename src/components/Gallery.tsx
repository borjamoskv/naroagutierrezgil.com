import * as THREE from 'three'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Image, Sparkles, useTexture, Html } from '@react-three/drei'
import { easing } from 'maath'
import { ARTWORKS } from '../artworks'
import { sound } from '../utils/audio'

if (typeof window !== 'undefined') {
  ARTWORKS.forEach((a) => {
    try {
      useTexture.preload(a.url)
    } catch {
      // Ignore preloader fail
    }
  })
}

interface GalleryItemProps {
  position: [number, number, number]
  rotation: [number, number, number]
  url: string
  scale: [number, number, number]
  index: number
  reducedMotion: boolean
  isSelected: boolean
  splatUrl?: string
}

function GalleryItem({
  position,
  scale,
  url,
  index,
  rotation,
  reducedMotion,
  isSelected,
  splatUrl
}: GalleryItemProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (meshRef.current && groupRef.current) {
      const floatY = reducedMotion
        ? position[1]
        : position[1] + Math.sin(state.clock.elapsedTime * 1.5 + index * 0.8) * 0.09

      groupRef.current.position.y = floatY

      const targetScale: [number, number, number] = isSelected
        ? [scale[0] * 1.05, scale[1] * 1.05, 1]
        : scale

      easing.damp3(meshRef.current.scale, targetScale, 0.2, delta)
      const material = meshRef.current.material as any
      easing.damp(material, 'grayscale', isSelected ? 0 : 0.4, 0.2, delta)
      easing.dampC(
        material.color,
        isSelected ? '#ffffff' : '#aaaaaa',
        0.2,
        delta
      )
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} userData={{ isArtwork: true, index }}>
      {splatUrl && (
        <Html position={[0, scale[1] / 2 + 0.35, 0.1]} center distanceFactor={8}>
          <div
            style={{
              padding: '3px 10px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.9) 0%, rgba(43,59,229,0.9) 100%)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 900,
              fontFamily: 'monospace',
              letterSpacing: '1px',
              borderRadius: '12px',
              border: '1px solid #D4AF37',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.6)',
              pointerEvents: 'none', // Desactivado para no interferir con FPS
            }}
          >
            ✨ 3DGS 360°
          </div>
        </Html>
      )}

      <mesh position={[0, 0, -0.08]} scale={[scale[0] + 0.35, scale[1] + 0.35, 0.06]}>
        <boxGeometry />
        <meshStandardMaterial
          color={isSelected ? '#D4AF37' : '#1c1b18'}
          metalness={0.9}
          roughness={0.25}
          emissive={isSelected ? '#D4AF37' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>

      <mesh position={[0, 0, -0.04]} scale={[scale[0] + 0.16, scale[1] + 0.16, 0.04]}>
        <boxGeometry />
        <meshPhysicalMaterial
          color={isSelected ? '#2B3BE5' : '#0a0a0d'}
          emissive={isSelected ? '#2B3BE5' : '#000000'}
          emissiveIntensity={isSelected ? 0.7 : 0}
          roughness={0.15}
          metalness={0.85}
          clearcoat={0.8}
          transmission={0.25}
          transparent
          opacity={isSelected ? 0.85 : 0.6}
        />
      </mesh>

      {isSelected && (
        <pointLight
          position={[0, scale[1] * 0.6, 0.8]}
          intensity={4.5}
          distance={6}
          color="#D4AF37"
        />
      )}

      <Image
        ref={meshRef}
        url={url}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </group>
  )
}

interface GalleryProps {
  onInspectArtwork: (index: number) => void
  reducedMotion: boolean
  setInteractionPrompt: (prompt: string | null) => void
  isStarted: boolean
}

export function Gallery({
  onInspectArtwork,
  reducedMotion,
  setInteractionPrompt,
  isStarted
}: GalleryProps) {
  const group = useRef<THREE.Group>(null)
  const { camera, scene } = useThree()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  const numItems = ARTWORKS.length
  const radius = 10 // Radio más grande para poder caminar dentro
  
  const items = useMemo(() => {
    return ARTWORKS.map((artwork, i) => {
      const angle = (i / numItems) * Math.PI * 2
      return {
        // Elevamos las obras para que estén a la altura de los ojos (1.7)
        position: [Math.sin(angle) * radius, 1.7, Math.cos(angle) * radius] as [number, number, number],
        rotation: [0, angle + Math.PI, 0] as [number, number, number], // Mirando hacia adentro del círculo
        url: artwork.url,
        href: artwork.href,
        splatUrl: artwork.splatUrl,
        scale: [3.1, 4.1, 1] as [number, number, number],
      }
    })
  }, [numItems, radius])

  // Raycaster logic for FPS interaction
  useEffect(() => {
    if (!isStarted) return;
    
    const raycaster = new THREE.Raycaster()
    const center = new THREE.Vector2(0, 0)
    
    let currentHoveredIndex: number | null = null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && currentHoveredIndex !== null) {
        sound.playOpen()
        onInspectArtwork(currentHoveredIndex)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)

    // Poll raycaster every frame would be heavy, but we can do it in a fast interval or useFrame
    const interval = setInterval(() => {
      raycaster.setFromCamera(center, camera)
      // Buscar intersecciones solo en los grupos de obras
      const intersects = raycaster.intersectObjects(scene.children, true)
      
      let foundIndex: number | null = null
      
      for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object
        // Subir en la jerarquía hasta encontrar userData.isArtwork
        let parent: THREE.Object3D | null = obj
        while (parent && parent.userData) {
          if (parent.userData.isArtwork) {
            // Check distance (interaction range)
            if (intersects[i].distance < 6.0) {
              foundIndex = parent.userData.index
            }
            break
          }
          parent = parent.parent
        }
        if (foundIndex !== null) break
      }
      
      if (foundIndex !== currentHoveredIndex) {
        currentHoveredIndex = foundIndex
        setSelectedIndex(foundIndex)
        if (foundIndex !== null) {
          setInteractionPrompt(`[E] INSPECCIONAR: ${ARTWORKS[foundIndex].title.toUpperCase()}`)
          sound.playHover()
        } else {
          setInteractionPrompt(null)
        }
      }
      
    }, 100) // 10 ticks per second is enough for UI prompts

    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [camera, scene, onInspectArtwork, isStarted])

  return (
    <group ref={group} position={[0, 0, 0]}>
      <ambientLight intensity={0.6} />

      {!reducedMotion && (
        <>
          <Sparkles
            count={200}
            scale={[30, 10, 30]}
            size={2.2}
            speed={0.35}
            opacity={0.4}
            color="#2B3BE5"
          />
          <Sparkles
            count={100}
            scale={[25, 8, 25]}
            size={2.8}
            speed={0.25}
            opacity={0.45}
            color="#D4AF37"
          />
        </>
      )}

      {items.map((item, i) => (
        <GalleryItem
          key={i}
          index={i}
          isSelected={selectedIndex === i}
          reducedMotion={reducedMotion}
          {...item}
        />
      ))}
    </group>
  )
}
