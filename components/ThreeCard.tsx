'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

type Stats = {
  energy: number
  creativity: number
  rarity: number
}

export default function ThreeCard({ color, emotion, intensity, stats }: { color: string; emotion: string; intensity: number; stats: Stats }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const glowColor = useMemo(() => new THREE.Color(color), [color])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight || 1, 0.1, 100)
    camera.position.set(0, 0, 4)

    const ambient = new THREE.AmbientLight(0xffffff, 0.4 + intensity * 0.4)
    scene.add(ambient)

    const accent = new THREE.PointLight(glowColor, 1 + intensity)
    accent.position.set(2, 2, 2)
    scene.add(accent)

    const cardGroup = new THREE.Group()
    scene.add(cardGroup)

    const cardMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#111115'),
      metalness: 0.6,
      roughness: 0.2,
      transmission: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.3,
    })

    const card = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.05), cardMaterial)
    card.rotation.set(-0.1, 0.3, 0)
    cardGroup.add(card)

    const glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.41, 2.01),
      new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending }),
    )
    glowPlane.position.z = 0.026
    card.add(glowPlane)

    const ringsGroup = new THREE.Group()
    const ringCount = Math.min(6, 2 + Math.floor(stats.rarity / 2))
    for (let index = 0; index < ringCount; index += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.15 + index * 0.08, 0.01 + stats.energy * 0.01, 16, 128),
        new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: Math.max(0, 0.35 - index * 0.06) }),
      )
      ring.rotation.x = Math.PI / 2
      ringsGroup.add(ring)
    }
    cardGroup.add(ringsGroup)

    const clock = new THREE.Clock()
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.maxPolarAngle = Math.PI / 2.1
    controls.minPolarAngle = Math.PI / 3.2
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5

    let animationFrameId = requestAnimationFrame(function animate() {
      const elapsed = clock.getElapsedTime()
      card.position.y = Math.sin(elapsed * 1.2) * 0.05
      ringsGroup.rotation.z = elapsed * 0.15
      controls.update()
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    })

    const handleResize = () => {
      const { clientWidth, clientHeight } = container
      renderer.setSize(clientWidth, clientHeight)
      camera.aspect = clientWidth / (clientHeight || 1)
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      controls.dispose()
      cardGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const material = object.material
          if (Array.isArray(material)) {
            material.forEach((mat) => mat.dispose?.())
          } else {
            material.dispose?.()
          }
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [glowColor, intensity, stats.energy, stats.rarity])

  const energyPercent = Math.round(stats.energy * 100)
  const creativityPercent = Math.round(stats.creativity * 100)

  return (
    <div ref={containerRef} className="w-full h-[380px] rounded-xl glass relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="text-xs px-3 py-2 rounded-md glass"
          style={{ boxShadow: `0 0 16px ${color}` }}
        >
          <div className="text-[10px] opacity-70">Emotion</div>
          <div className="text-sm font-semibold">{emotion}</div>
          <div className="mt-1 flex gap-3 text-[11px]">
            <span>Rarity {stats.rarity}</span>
            <span>Energy {energyPercent}%</span>
            <span>Creativity {creativityPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
