
import { Grid } from '@react-three/drei'

export function EnvironmentLevel() {
  return (
    <group>
      {/* Suelo estilo Cyberpunk / Retro Grid */}
      <Grid
        position={[0, 0, 0]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={1}
        cellColor="#2B3BE5"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#D4AF37"
        fadeDistance={50}
        fadeStrength={1}
      />
      
      {/* Techo Oscuro Limitante (Opcional, para dar sensación de sala cerrada) */}
      <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  )
}
