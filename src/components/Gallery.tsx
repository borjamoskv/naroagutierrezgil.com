import * as THREE from 'three'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Image, useScroll, Sparkles } from '@react-three/drei'
import { easing } from 'maath'
import { ARTWORKS } from '../artworks'
import { sound } from '../utils/audio'

interface GalleryItemProps {
  position: [number, number, number]
  rotation: [number, number, number]
  url: string
  href: string
  scale: [number, number, number]
  index: number
  reducedMotion: boolean
  isSelected: boolean
  onSelect: (index: number) => void
  onInspect: (index: number) => void
}

function GalleryItem({
  position,
  scale,
  url,
  index,
  rotation,
  reducedMotion,
  isSelected,
  onInspect
}: GalleryItemProps) {
  const meshRef = useRef<any>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const pointerOffset = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    if (meshRef.current && groupRef.current) {
      // Flotación sutil sincronizada
      const floatY = reducedMotion
        ? position[1]
        : position[1] + Math.sin(state.clock.elapsedTime * 1.5 + index * 0.8) * 0.09

      groupRef.current.position.y = floatY

      // Inclinación 3D reactiva al cursor del usuario
      const targetRotX = hovered ? pointerOffset.current.y * 0.25 : 0
      const targetRotY = hovered ? pointerOffset.current.x * 0.25 : 0
      easing.damp(meshRef.current.rotation, 'x', targetRotX, 0.15, delta)
      easing.damp(meshRef.current.rotation, 'y', targetRotY, 0.15, delta)

      // Escala y matiz al pasar cursor o ser seleccionada
      const targetScale: [number, number, number] = hovered
        ? [scale[0] * 1.08, scale[1] * 1.08, 1]
        : isSelected
        ? [scale[0] * 1.03, scale[1] * 1.03, 1]
        : scale

      easing.damp3(meshRef.current.scale, targetScale, 0.2, delta)
      easing.damp(meshRef.current.material, 'grayscale', hovered || isSelected ? 0 : 0.85, 0.2, delta)
      easing.dampC(
        meshRef.current.material.color,
        hovered ? '#ffffff' : isSelected ? '#e0e5ff' : '#555555',
        0.2,
        delta
      )
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Marco sutil 3D posterior (Glass Backplate con Neón Emisivo) */}
      <mesh position={[0, 0, -0.05]} scale={[scale[0] + 0.18, scale[1] + 0.18, 0.02]}>
        <boxGeometry />
        <meshPhysicalMaterial
          color={isSelected ? '#2B3BE5' : '#111115'}
          emissive={isSelected ? '#2B3BE5' : hovered ? '#1b26a1' : '#000000'}
          emissiveIntensity={isSelected ? 0.6 : hovered ? 0.35 : 0}
          roughness={0.2}
          metalness={0.8}
          clearcoat={0.6}
          transmission={0.3}
          transparent
          opacity={hovered ? 0.95 : isSelected ? 0.8 : 0.45}
        />
      </mesh>

      {/* Imagen WebGL principal */}
      <Image
        ref={meshRef}
        url={url}
        transparent
        side={THREE.DoubleSide}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          setHovered(true)
          sound.playHover()
          document.body.style.cursor = 'pointer'
        }}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          if (e.uv) {
            pointerOffset.current = {
              x: (e.uv.x - 0.5) * 2,
              y: -(e.uv.y - 0.5) * 2
            }
          }
        }}
        onPointerOut={() => {
          setHovered(false)
          pointerOffset.current = { x: 0, y: 0 }
          document.body.style.cursor = 'auto'
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          sound.playTick()
          onInspect(index)
        }}
        toneMapped={false}
      />
    </group>
  )
}

// Control por Teclado (Flechas izquierda/derecha/arriba/abajo, Enter, Espacio, 'I')
function KeyboardNav({
  count,
  selectedIndex,
  onInspect
}: {
  count: number
  selectedIndex: number
  onInspect: (index: number) => void
}) {
  const scroll = useScroll()

  useEffect(() => {
    const el = scroll.el
    const step = () => (el.scrollHeight - el.clientHeight) / count
    const onKey = (e: KeyboardEvent) => {
      // Evitar interceptar teclas si un modal u otro input tiene foco activo
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        sound.playTick()
        el.scrollBy({ top: step(), behavior: 'smooth' })
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        sound.playTick()
        el.scrollBy({ top: -step(), behavior: 'smooth' })
      } else if (e.key === 'Enter' || e.key === ' ' || e.code === 'KeyI') {
        e.preventDefault()
        onInspect(selectedIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scroll, count, selectedIndex, onInspect])

  return null
}

interface GalleryProps {
  onCurrentChange?: (index: number) => void
  onInspectArtwork: (index: number) => void
  targetIndex?: number | null
  reducedMotion: boolean
}

export function Gallery({
  onCurrentChange,
  onInspectArtwork,
  targetIndex,
  reducedMotion
}: GalleryProps) {
  const group = useRef<THREE.Group>(null)
  const scroll = useScroll()
  const lastCurrent = useRef(-1)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const numItems = ARTWORKS.length
  const radius = 5.4

  const items = useMemo(() => {
    return ARTWORKS.map((artwork, i) => {
      const angle = (i / numItems) * Math.PI * 2
      return {
        position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius] as [number, number, number],
        rotation: [0, angle, 0] as [number, number, number],
        url: artwork.url,
        href: artwork.href,
        scale: [3.1, 4.1, 1] as [number, number, number],
      }
    })
  }, [numItems, radius])

  // Desplazamiento programático al seleccionar un índice directo
  useEffect(() => {
    if (targetIndex !== undefined && targetIndex !== null && scroll.el) {
      const el = scroll.el
      const targetScroll = (targetIndex / numItems) * (el.scrollHeight - el.clientHeight)
      el.scrollTo({ top: targetScroll, behavior: 'smooth' })
    }
  }, [targetIndex, numItems, scroll.el])

  useFrame((_, delta) => {
    if (group.current) {
      const targetRotation = scroll.offset * Math.PI * 2
      easing.damp(group.current.rotation, 'y', targetRotation, 0.22, delta)

      // Determina cuál es la obra orientada frontalmente a la cámara
      const currentRot = group.current.rotation.y
      let best = 0
      let bestCos = -Infinity
      for (let i = 0; i < numItems; i++) {
        const c = Math.cos((i / numItems) * Math.PI * 2 + currentRot)
        if (c > bestCos) {
          bestCos = c
          best = i
        }
      }
      if (best !== lastCurrent.current) {
        lastCurrent.current = best
        setSelectedIndex(best)
        onCurrentChange?.(best)
        sound.playTick()
      }
    }
  })

  return (
    <group ref={group} position={[0, -0.15, -4.2]}>
      {/* Luz focal sobre la obra seleccionada */}
      <spotLight
        position={[0, 6, 2]}
        intensity={2.5}
        angle={0.6}
        penumbra={0.8}
        color="#2B3BE5"
      />
      <ambientLight intensity={0.6} />

      {/* Campo dual de partículas WebGL (Mica Mineral Gold + Electric Indigo) */}
      {!reducedMotion && (
        <>
          <Sparkles
            count={90}
            scale={[16, 10, 16]}
            size={2.2}
            speed={0.35}
            opacity={0.4}
            color="#2B3BE5"
          />
          <Sparkles
            count={60}
            scale={[12, 8, 12]}
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
          onSelect={(idx) => {
            setSelectedIndex(idx)
          }}
          onInspect={onInspectArtwork}
          {...item}
        />
      ))}
      <KeyboardNav count={numItems} selectedIndex={selectedIndex} onInspect={onInspectArtwork} />
    </group>
  )
}
