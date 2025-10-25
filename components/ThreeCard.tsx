'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

type Stats = {
  energy: number
  creativity: number
  rarity: number
}

function ResonanceRings({ color, rings = 3, intensity = 0.5 }: { color: string; rings?: number; intensity?: number }) {
  const group = useRef<THREE.Group>(null)
  const tone = new THREE.Color(color)

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.z = clock.getElapsedTime() * 0.15
  })

  return (
    <group ref={group}>
      {Array.from({ length: rings }).map((_, index) => (
        <mesh key={index} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15 + index * 0.08, 0.01 + intensity * 0.01, 16, 128]} />
          <meshBasicMaterial color={tone} transparent opacity={0.35 - index * 0.06} />
        </mesh>
      ))}
    </group>
  )
}

function CardMesh({ color, emotion, rarity, energy, creativity }: { color: string; emotion: string; rarity: number; energy: number; creativity: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#111115'),
        metalness: 0.6,
        roughness: 0.2,
        transmission: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.3,
      }),
    [],
  )
  const glow = new THREE.Color(color)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const time = clock.getElapsedTime()
    ref.current.position.y = Math.sin(time * 1.2) * 0.05
  })

  return (
    <group>
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
        <mesh ref={ref} rotation={[-0.1, 0.3, 0]}>
          <boxGeometry args={[1.4, 2.0, 0.05]} />
          <meshPhysicalMaterial {...material} />
          <mesh>
            <planeGeometry args={[1.41, 2.01]} />
            <meshBasicMaterial color={glow} transparent opacity={0.12} blending={THREE.AdditiveBlending} />
          </mesh>
        </mesh>
        <ResonanceRings color={color} rings={Math.min(6, 2 + Math.floor(rarity / 2))} intensity={energy} />
        <Html center distanceFactor={8} transform>
          <div className="text-xs px-3 py-2 rounded-md glass" style={{ boxShadow: `0 0 16px ${color}` }}>
            <div className="text-[10px] opacity-70">Emotion</div>
            <div className="text-sm font-semibold">{emotion}</div>
            <div className="mt-1 flex gap-3 text-[11px]">
              <span>Rarity {rarity}</span>
              <span>Energy {Math.round(energy * 100)}%</span>
              <span>Creativity {Math.round(creativity * 100)}%</span>
            </div>
          </div>
        </Html>
      </Float>
    </group>
  )
}

export default function ThreeCard({ color, emotion, intensity, stats }: { color: string; emotion: string; intensity: number; stats: Stats }) {
  return (
    <div className="w-full h-[380px] rounded-xl glass relative">
      <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
        <ambientLight intensity={0.4 + intensity * 0.4} />
        <pointLight position={[2, 2, 2]} intensity={1 + intensity} color={color} />
        <CardMesh color={color} emotion={emotion} rarity={stats.rarity} energy={stats.energy} creativity={stats.creativity} />
        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 3.2} />
      </Canvas>
    </div>
  )
}
