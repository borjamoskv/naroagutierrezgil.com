import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture, OrbitControls, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'
import type { Artwork } from '../artworks'

interface SplatModelProps {
  artwork: Artwork
}

function SplatModel({ artwork }: SplatModelProps) {
  const texture = useTexture(artwork.url)
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <planeGeometry args={[4, 5]} />
          <meshStandardMaterial 
            map={texture} 
            side={THREE.DoubleSide}
            roughness={0.2}
            metalness={0.8}
            envMapIntensity={2}
          />
        </mesh>
      </Float>
      <pointLight position={[2, 2, 2]} intensity={2} color="#F59E0B" />
    </group>
  )
}

interface SplatViewerModalProps {
  isOpen: boolean
  onClose: () => void
  artwork: Artwork | null
}

export function SplatViewerModal({ isOpen, onClose, artwork }: SplatViewerModalProps) {
  if (!artwork) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(5, 5, 8, 0.95)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#FFF', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
              {artwork.title} — Splat 3D
            </h2>
            <button 
              onClick={onClose}
              className="premium-btn"
              style={{ padding: '8px 16px' }}
            >
              Cerrar
            </button>
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <Environment preset="city" />
              <SplatModel artwork={artwork} />
              <OrbitControls enableZoom={true} enablePan={false} />
            </Canvas>
            
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.8rem',
              pointerEvents: 'none'
            }}>
              Arrastra para rotar · Scroll para zoom
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
