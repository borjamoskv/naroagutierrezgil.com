import { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Float, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { sound } from '../utils/audio'
import { FACEBOOK_PHOTOS } from '../facebook_artworks'

// Metadata for the 6 Faces of the Monolith
const CUBE_FACES = [
  {
    id: 0,
    title: 'DiviNos VaiVenes (2026)',
    subtitle: 'Politena Espacio de Arte • Bilbao',
    description: 'Retratos pop sobre pizarra de tejado vasco con mineral de mica y reverso acústico.',
    photoIdx: 0,
    color: '#3B82F6',
    rot: [0, 0, 0] as [number, number, number]
  },
  {
    id: 1,
    title: 'Repóker de Reinas (2022)',
    subtitle: 'Siarte Leku • Bilbao',
    description: '5 piezas monumentales sobre la fragilidad femenina con técnica Cantinflowers.',
    photoIdx: 12,
    color: '#EC4899',
    rot: [0, Math.PI / 2, 0] as [number, number, number]
  },
  {
    id: 2,
    title: 'Espejos del Alma (2010 - 2024)',
    subtitle: 'Galería Vanguardia • Madrid / Bilbao',
    description: 'Retrospectiva continua sobre el primer disfraz, la mirada y la psique humana.',
    photoIdx: 24,
    color: '#8B5CF6',
    rot: [0, Math.PI, 0] as [number, number, number]
  },
  {
    id: 3,
    title: 'Walking Gallery Bilbao',
    subtitle: 'Arte Itinerante en la Calle (2011 - 2015)',
    description: 'Muestra urbana de libertad artística, desvelando obras vivas en el Casco Viejo.',
    photoIdx: 36,
    color: '#10B981',
    rot: [0, -Math.PI / 2, 0] as [number, number, number]
  },
  {
    id: 4,
    title: 'El Reverso Acústico',
    subtitle: 'Colaboración Transmedia con Borja Moskv',
    description: 'Sintetizadores modulares, sub-basses y paisajes sonoros enlazados por código QR.',
    photoIdx: 48,
    color: '#F59E0B',
    rot: [-Math.PI / 2, 0, 0] as [number, number, number]
  },
  {
    id: 5,
    title: 'Arqueología Industrial',
    subtitle: 'Latas Vintage & Madera de Deriva (Sopela)',
    description: 'Recuperación de desechos industriales erosionados por la salinidad del Cantábrico.',
    photoIdx: 60,
    color: '#EF4444',
    rot: [Math.PI / 2, 0, 0] as [number, number, number]
  }
]

// Single Monolith Cube Mesh
function MonolithMesh({ activeFace, setActiveFace }: { activeFace: number; setActiveFace: (idx: number) => void }) {
  const meshRef = useRef<THREE.Group>(null)
  const targetRotation = useRef<THREE.Euler>(new THREE.Euler(...CUBE_FACES[activeFace].rot))

  // Load textures for all 6 faces
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return CUBE_FACES.map(face => {
      const photo = FACEBOOK_PHOTOS[face.photoIdx % FACEBOOK_PHOTOS.length]
      return loader.load(photo ? photo.url : '/assets/marilyn-rocks--qPeLHxE.webp')
    })
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const targetRot = CUBE_FACES[activeFace].rot
    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, targetRot[0], 5, delta)
    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetRot[1], 5, delta)
    meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, targetRot[2], 5, delta)
  })

  return (
    <group ref={meshRef}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          sound.playClick()
          setActiveFace((activeFace + 1) % 6)
        }}
      >
        <boxGeometry args={[3.2, 3.2, 3.2]} />
        {textures.map((tex, i) => (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            map={tex}
            roughness={0.25}
            metalness={0.4}
            emissive={activeFace === i ? CUBE_FACES[i].color : '#000000'}
            emissiveIntensity={activeFace === i ? 0.2 : 0.0}
          />
        ))}
      </mesh>

      {/* Mica Mineral Particle Cloud surrounding the monolith */}
      <Sparkles
        count={80}
        scale={6}
        size={4}
        speed={0.4}
        color={CUBE_FACES[activeFace].color}
      />
    </group>
  )
}

export function AcousticCube3D() {
  const [activeFace, setActiveFace] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentInfo = CUBE_FACES[activeFace]

  return (
    <section className="relative w-full min-h-[85vh] bg-[#05070e] text-white overflow-hidden py-16 px-4 flex flex-col justify-center items-center border-y border-white/10">
      {/* Background Ambient Glow */}
      <div 
        className="absolute inset-0 opacity-20 transition-all duration-700 pointer-events-none blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${currentInfo.color} 0%, transparent 70%)`
        }}
      />

      {/* Header Info */}
      <div className="relative z-10 text-center max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs tracking-widest uppercase font-mono text-blue-400 mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          Monolito Acústico 3D • 237 Fotos de Archivo
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          El Cubo Acústico de 6 Caras
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed font-light">
          Gira el monolito de pizarra vasca para espacializar el sonido y explorar la arqueología matérica de cada época.
        </p>
      </div>

      {/* 3D Canvas viewport */}
      <div className="relative w-full max-w-4xl h-[420px] sm:h-[500px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.8} color="#ffffff" />
          <pointLight position={[-5, -5, -5]} intensity={1.0} color={currentInfo.color} />
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <MonolithMesh activeFace={activeFace} setActiveFace={setActiveFace} />
          </Float>
        </Canvas>

        {/* Overlay Overlay Info Box */}
        <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono tracking-wider uppercase text-blue-400 font-semibold">
              Cara {activeFace + 1} de 6 • {currentInfo.subtitle}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">{currentInfo.title}</h3>
            <p className="text-xs text-slate-300 line-clamp-1 max-w-xl font-light">{currentInfo.description}</p>
          </div>
          <button
            onClick={() => {
              sound.playOpen()
              setIsModalOpen(true)
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-blue-500/25 shrink-0"
          >
            🔍 Ver Fotos ({FACEBOOK_PHOTOS.length})
          </button>
        </div>
      </div>

      {/* Face Selector Buttons */}
      <div className="relative z-10 flex flex-wrap justify-center items-center gap-2 mt-6 max-w-4xl">
        {CUBE_FACES.map((face, idx) => (
          <button
            key={face.id}
            onClick={() => {
              sound.playClick()
              setActiveFace(idx)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              activeFace === idx
                ? 'bg-white text-black border-white shadow-lg scale-105 font-bold'
                : 'bg-black/40 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {idx + 1}. {face.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Modal Viewport for full 237 Facebook photos grid */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl p-4 sm:p-8 flex flex-col justify-start items-center overflow-y-auto"
          >
            <div className="w-full max-w-6xl flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Archivo Histórico Completo • {currentInfo.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Mostrando {FACEBOOK_PHOTOS.length} imágenes en alta definición extraídas de Facebook (2010 - 2026)
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider transition-all"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Photo Grid */}
            <div className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {FACEBOOK_PHOTOS.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.015, 0.3) }}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-slate-900/60"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                    <span className="text-[10px] font-mono text-blue-400 font-bold">#{photo.id}</span>
                    <span className="text-[11px] text-white font-medium truncate">{photo.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
