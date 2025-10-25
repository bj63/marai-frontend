'use client'

import { useEffect, useRef } from 'react'
import type { Personality } from '@/lib/store'

interface CharacterProps {
  personality: Personality
  size?: number
  emotionColor?: string
  intensity?: number
  animated?: boolean
}

interface Palette {
  main: string
  light: string
  dark: string
  accent: string
}

export default function MiraiCharacter({
  personality,
  size = 300,
  emotionColor,
  intensity = 0.6,
  animated = false,
}: CharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrame: number
    let startTime: number | null = null

    const palette = getPalette(personality, emotionColor)

    const render = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000
      drawCharacter(ctx, size, personality, palette, intensity, elapsed)
      animationFrame = window.requestAnimationFrame(render)
    }

    if (animated) {
      animationFrame = window.requestAnimationFrame(render)
    } else {
      drawCharacter(ctx, size, personality, palette, intensity, 0)
    }

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [personality, size, emotionColor, intensity, animated])

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-2xl" />
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  size: number,
  personality: Personality,
  palette: Palette,
  intensity: number,
  time: number
) {
  const { empathy, creativity, confidence, curiosity, humor, energy } = personality

  ctx.clearRect(0, 0, size, size)

  const wiggle = Math.sin(time * (1.5 + energy)) * size * 0.01 * (animatedEase(intensity))

  // Background gradient
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.2,
    size / 2,
    size / 2,
    size * 0.45
  )
  gradient.addColorStop(0, palette.light)
  gradient.addColorStop(1, palette.dark)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Body & head
  drawBlobBody(ctx, size / 2 + wiggle, size * 0.6, size * 0.25, palette.main, intensity)
  drawBlobHead(ctx, size / 2 + wiggle, size * 0.35, size * 0.2, palette.main)

  const hairStyle = getHairStyle(creativity, humor)
  if (hairStyle === 'flame') {
    drawFlameHair(ctx, size / 2 + wiggle, size * 0.2, size * 0.12, palette.accent)
  } else if (hairStyle === 'water') {
    drawWaterDropHair(ctx, size / 2 + wiggle, size * 0.18, size * 0.1, palette.accent)
  }

  if (confidence > 0.7) {
    drawWitchHat(ctx, size / 2 + wiggle, size * 0.25, size * 0.15, palette.dark)
  }

  if (empathy > 0.7) {
    drawScarf(ctx, size / 2 + wiggle, size * 0.45, size * 0.18, palette.accent)
  }

  if (curiosity > 0.7) {
    drawAntennae(ctx, size / 2 + wiggle, size * 0.15, size * 0.08, palette.accent)
  }

  drawEyes(ctx, size / 2 + wiggle, size * 0.35, size * 0.04, humor, intensity, time)
  drawMouth(ctx, size / 2 + wiggle, size * 0.42, size * 0.06, energy)
}

function animatedEase(intensity: number) {
  return 0.5 + intensity * 0.8
}

function getPalette(personality: Personality, overrideColor?: string): Palette {
  const base = getPersonalityColor(personality)
  if (!overrideColor) return base
  return {
    ...base,
    main: overrideColor,
  }
}

function getPersonalityColor(p: Personality): Palette {
  const { empathy, energy, creativity } = p

  if (empathy > 0.7 && energy < 0.5) {
    return {
      main: '#4FB3D4',
      light: '#E3F5F9',
      dark: '#2B5F73',
      accent: '#7CC9E0',
    }
  }

  if (energy > 0.7) {
    return {
      main: '#FF9F4A',
      light: '#FFE5CC',
      dark: '#B85C1C',
      accent: '#FFBF7F',
    }
  }

  if (creativity > 0.7) {
    return {
      main: '#6BAF6F',
      light: '#E0F2E1',
      dark: '#3D6B3F',
      accent: '#8FC493',
    }
  }

  return {
    main: '#FF6B9D',
    light: '#FFE5EF',
    dark: '#C7386B',
    accent: '#FF9ABF',
  }
}

function getHairStyle(creativity: number, humor: number) {
  if (creativity > 0.7 && humor > 0.6) return 'flame'
  if (creativity < 0.4) return 'water'
  return 'none'
}

function drawBlobBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity: number
) {
  ctx.save()
  ctx.fillStyle = color
  ctx.shadowColor = 'rgba(0,0,0,0.2)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 6

  ctx.beginPath()
  const points = 8
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2
    const nextAngle = ((i + 1) / points) * Math.PI * 2

    const variance = 0.85 + Math.sin(i + intensity) * 0.15
    const r1 = radius * variance
    const r2 = radius * (0.85 + Math.cos(i + 1 + intensity) * 0.15)

    const x1 = x + Math.cos(angle) * r1
    const y1 = y + Math.sin(angle) * r1
    const x2 = x + Math.cos(nextAngle) * r2
    const y2 = y + Math.sin(nextAngle) * r2

    if (i === 0) {
      ctx.moveTo(x1, y1)
    }

    const cpx = (x1 + x2) / 2 + Math.sin(angle) * radius * 0.1
    const cpy = (y1 + y2) / 2 + Math.cos(angle) * radius * 0.1

    ctx.quadraticCurveTo(cpx, cpy, x2, y2)
  }

  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawBlobHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  const highlightGradient = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    0,
    x,
    y,
    radius
  )
  highlightGradient.addColorStop(0, 'rgba(255,255,255,0.4)')
  highlightGradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = highlightGradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawFlameHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - size * 1.5)
  ctx.quadraticCurveTo(x - size * 0.5, y - size, x - size * 0.3, y)
  ctx.quadraticCurveTo(x, y - size * 0.5, x + size * 0.3, y)
  ctx.quadraticCurveTo(x + size * 0.5, y - size, x, y - size * 1.5)
  ctx.fill()
}

function drawWaterDropHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.moveTo(x, y - size)
  ctx.quadraticCurveTo(x - size * 0.7, y - size * 1.8, x, y - size * 2)
  ctx.quadraticCurveTo(x + size * 0.7, y - size * 1.8, x, y - size)
  ctx.fill()
}

function drawWitchHat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(x, y, size * 1.2, size * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(x - size * 0.6, y)
  ctx.lineTo(x, y - size * 1.5)
  ctx.lineTo(x + size * 0.6, y)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.arc(x + size * 0.3, y - size * 1.4, size * 0.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawScarf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.fillRect(x - width, y - width * 0.2, width * 2, width * 0.4)

  ctx.beginPath()
  ctx.moveTo(x - width * 0.5, y + width * 0.2)
  ctx.lineTo(x - width * 0.4, y + width * 0.8)
  ctx.lineTo(x - width * 0.6, y + width * 0.8)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      x - width + i * width * 0.6,
      y - width * 0.15,
      width * 0.2,
      width * 0.3
    )
  }
}

function drawAntennae(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.strokeStyle = color
  ctx.lineWidth = size * 0.15
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x - size * 0.5, y)
  ctx.quadraticCurveTo(x - size * 0.8, y - size, x - size * 0.6, y - size * 1.5)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + size * 0.5, y)
  ctx.quadraticCurveTo(x + size * 0.8, y - size, x + size * 0.6, y - size * 1.5)
  ctx.stroke()

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x - size * 0.6, y - size * 1.5, size * 0.3, 0, Math.PI * 2)
  ctx.arc(x + size * 0.6, y - size * 1.5, size * 0.3, 0, Math.PI * 2)
  ctx.fill()
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  humor: number,
  intensity: number,
  time: number
) {
  ctx.fillStyle = '#000'

  const eyeWidth = size * (humor > 0.7 ? 1.2 : 1)
  const eyeHeight = size * (humor > 0.7 ? 0.8 : 1)
  const blink = Math.abs(Math.sin(time * (1.5 + intensity * 2))) * 0.25 * intensity

  ctx.beginPath()
  ctx.ellipse(x - size * 1.5, y, eyeWidth, eyeHeight * (1 - blink), 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x + size * 1.5, y, eyeWidth, eyeHeight * (1 - blink), 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.beginPath()
  ctx.arc(x - size * 1.3, y - size * 0.3, size * 0.3, 0, Math.PI * 2)
  ctx.arc(x + size * 1.7, y - size * 0.3, size * 0.3, 0, Math.PI * 2)
  ctx.fill()
}

function drawMouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  energy: number
) {
  ctx.strokeStyle = '#000'
  ctx.lineWidth = size * 0.3
  ctx.lineCap = 'round'

  const curve = energy * size * 2 - size

  ctx.beginPath()
  ctx.moveTo(x - size, y)
  ctx.quadraticCurveTo(x, y + curve, x + size, y)
  ctx.stroke()
}
