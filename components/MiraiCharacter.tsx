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
  highlight: string
  shadow: string
  accent: string
  glow: string
  outline: string
}

type Outfit = 'sweater' | 'plain' | 'adventurer' | 'dress'
type HairStyle = 'sprout' | 'flame' | 'none'

type Theme = 'calm' | 'energetic' | 'wise' | 'playful'

interface CharacterStyle {
  palette: Palette
  outfit: Outfit
  hair: HairStyle
  accessories: {
    scarf: boolean
    hat: boolean
    antennae: boolean
  }
}

interface CharacterStylePreset {
  palette: Palette
  outfit: Outfit
  hair: HairStyle
  accessories: {
    scarf: boolean
    hat: boolean
    antennae: boolean
  }
}

const STYLE_PRESETS: Record<Theme, CharacterStylePreset> = {
  calm: {
    palette: {
      main: '#45A6FF',
      highlight: '#7FC4FF',
      shadow: '#1D4D7A',
      accent: '#2F7FD6',
      glow: '#2E7DE8',
      outline: '#123659',
    },
    outfit: 'sweater',
    hair: 'sprout',
    accessories: {
      scarf: true,
      hat: false,
      antennae: false,
    },
  },
  energetic: {
    palette: {
      main: '#FF8A2B',
      highlight: '#FFB36C',
      shadow: '#B4551C',
      accent: '#FFD19A',
      glow: '#FF8F38',
      outline: '#7A3512',
    },
    outfit: 'plain',
    hair: 'flame',
    accessories: {
      scarf: false,
      hat: false,
      antennae: false,
    },
  },
  wise: {
    palette: {
      main: '#3BA866',
      highlight: '#78D29C',
      shadow: '#1F6B3B',
      accent: '#BFE8CB',
      glow: '#3FBF75',
      outline: '#184D2E',
    },
    outfit: 'adventurer',
    hair: 'none',
    accessories: {
      scarf: true,
      hat: true,
      antennae: false,
    },
  },
  playful: {
    palette: {
      main: '#FF78B0',
      highlight: '#FFABD2',
      shadow: '#B74676',
      accent: '#FFD9EA',
      glow: '#FF7CC0',
      outline: '#812750',
    },
    outfit: 'dress',
    hair: 'none',
    accessories: {
      scarf: false,
      hat: false,
      antennae: true,
    },
  },
}

export default function MiraiCharacter({
  personality,
  size = 320,
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

    let animationFrame: number | null = null
    let startTime: number | null = null
    const style = getCharacterStyle(personality, emotionColor)

    const render = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000
      drawCharacter(ctx, size, personality, style, intensity, elapsed)
      animationFrame = window.requestAnimationFrame(render)
    }

    if (animated) {
      animationFrame = window.requestAnimationFrame(render)
    } else {
      drawCharacter(ctx, size, personality, style, intensity, 0)
    }

    return () => {
      if (animationFrame !== null) {
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
  style: CharacterStyle,
  intensity: number,
  time: number
) {
  const { humor, energy } = personality
  ctx.clearRect(0, 0, size, size)

  const wiggle = Math.sin(time * (1.3 + energy * 0.7)) * size * 0.012 * intensity
  const bob = Math.sin(time * 1.1) * size * 0.01 * intensity

  drawBackground(ctx, size, style.palette)
  drawGlow(ctx, size, style.palette, intensity)

  const centerX = size / 2 + wiggle
  const bodyBaseY = size * 0.64 + bob
  const bodyWidth = size * 0.24
  const bodyHeight = size * 0.36
  const headCenterY = size * 0.34 + bob
  const headRadius = size * 0.18

  drawBody(ctx, centerX, bodyBaseY, bodyWidth, bodyHeight, style.palette)
  drawFeet(ctx, centerX, bodyBaseY, bodyWidth, style.palette)
  drawOutfit(ctx, style.outfit, centerX, bodyBaseY, bodyWidth, bodyHeight, style.palette)
  drawArms(ctx, centerX, bodyBaseY, bodyWidth, bodyHeight, style.palette)
  drawHead(ctx, centerX, headCenterY, headRadius, style.palette)

  if (style.accessories.scarf) {
    drawScarf(ctx, centerX, headCenterY + headRadius * 0.35, bodyWidth, style.palette)
  }

  if (style.hair === 'sprout') {
    drawSproutHair(ctx, centerX, headCenterY - headRadius * 1.05, headRadius * 0.85, style.palette)
  } else if (style.hair === 'flame') {
    drawFlameHair(ctx, centerX, headCenterY - headRadius * 1.1, headRadius, style.palette)
  }

  if (style.accessories.antennae) {
    drawAntennae(ctx, centerX, headCenterY - headRadius * 0.9, headRadius, style.palette)
  }

  if (style.accessories.hat) {
    drawHat(ctx, centerX, headCenterY - headRadius * 0.2, headRadius, style.palette)
  }

  drawFace(ctx, centerX, headCenterY, headRadius, humor, energy, style.palette, time, intensity)
}

function drawBackground(ctx: CanvasRenderingContext2D, size: number, palette: Palette) {
  const gradient = ctx.createRadialGradient(size / 2, size * 0.6, size * 0.15, size / 2, size * 0.55, size * 0.48)
  gradient.addColorStop(0, hexToRgba(palette.glow, 0.8))
  gradient.addColorStop(1, hexToRgba(palette.shadow, 0.1))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const vignette = ctx.createLinearGradient(0, 0, 0, size)
  vignette.addColorStop(0, hexToRgba(palette.outline, 0.2))
  vignette.addColorStop(0.5, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, hexToRgba(palette.outline, 0.35))
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, size, size)
}

function drawGlow(ctx: CanvasRenderingContext2D, size: number, palette: Palette, intensity: number) {
  const glowRadius = size * (0.35 + intensity * 0.12)
  const gradient = ctx.createRadialGradient(size / 2, size * 0.6, glowRadius * 0.1, size / 2, size * 0.6, glowRadius)
  gradient.addColorStop(0, hexToRgba(palette.glow, 0.35 + intensity * 0.25))
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(size / 2, size * 0.6, glowRadius, 0, Math.PI * 2)
  ctx.fill()
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  height: number,
  palette: Palette
) {
  const gradient = ctx.createLinearGradient(x, baseY - height, x, baseY + height * 0.6)
  gradient.addColorStop(0, palette.highlight)
  gradient.addColorStop(0.55, palette.main)
  gradient.addColorStop(1, palette.shadow)

  ctx.save()
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(x - width, baseY - height * 0.6)
  ctx.quadraticCurveTo(x - width * 1.2, baseY - height * 1.05, x, baseY - height * 1.1)
  ctx.quadraticCurveTo(x + width * 1.2, baseY - height * 1.05, x + width, baseY - height * 0.6)
  ctx.quadraticCurveTo(x + width * 1.25, baseY + height * 0.55, x, baseY + height * 0.65)
  ctx.quadraticCurveTo(x - width * 1.25, baseY + height * 0.55, x - width, baseY - height * 0.6)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  height: number,
  palette: Palette
) {
  const armGradient = ctx.createLinearGradient(x, baseY - height * 0.4, x, baseY + height * 0.4)
  armGradient.addColorStop(0, palette.highlight)
  armGradient.addColorStop(1, palette.main)

  ctx.save()
  ctx.fillStyle = armGradient

  ctx.beginPath()
  ctx.moveTo(x - width * 1.1, baseY - height * 0.3)
  ctx.quadraticCurveTo(x - width * 1.5, baseY + height * 0.1, x - width * 1.1, baseY + height * 0.55)
  ctx.quadraticCurveTo(x - width * 0.9, baseY + height * 0.45, x - width * 0.95, baseY + height * 0.1)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(x + width * 1.1, baseY - height * 0.3)
  ctx.quadraticCurveTo(x + width * 1.5, baseY + height * 0.1, x + width * 1.1, baseY + height * 0.55)
  ctx.quadraticCurveTo(x + width * 0.9, baseY + height * 0.45, x + width * 0.95, baseY + height * 0.1)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawFeet(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  palette: Palette
) {
  ctx.save()
  ctx.fillStyle = palette.shadow

  const footWidth = width * 0.7
  const footHeight = width * 0.4

  ctx.beginPath()
  ctx.ellipse(x - width * 0.55, baseY + footHeight * 0.6, footWidth * 0.5, footHeight * 0.6, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x + width * 0.55, baseY + footHeight * 0.6, footWidth * 0.5, footHeight * 0.6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  palette: Palette
) {
  const gradient = ctx.createLinearGradient(x, y - radius, x, y + radius)
  gradient.addColorStop(0, palette.highlight)
  gradient.addColorStop(0.6, palette.main)
  gradient.addColorStop(1, palette.shadow)

  ctx.save()
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  const highlight = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.3, radius * 0.1, x, y, radius)
  highlight.addColorStop(0, hexToRgba('#FFFFFF', 0.35))
  highlight.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = highlight
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawOutfit(
  ctx: CanvasRenderingContext2D,
  outfit: Outfit,
  x: number,
  baseY: number,
  width: number,
  height: number,
  palette: Palette
) {
  switch (outfit) {
    case 'sweater':
      drawSweater(ctx, x, baseY, width, height, palette)
      break
    case 'adventurer':
      drawAdventurerCoat(ctx, x, baseY, width, height, palette)
      break
    case 'dress':
      drawDress(ctx, x, baseY, width, height, palette)
      break
    case 'plain':
    default:
      drawSimpleBellyHighlight(ctx, x, baseY, width, height, palette)
      break
  }
}

function drawSweater(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  height: number,
  palette: Palette
) {
  ctx.save()
  ctx.fillStyle = palette.accent

  const top = baseY - height * 0.55
  const bottom = baseY + height * 0.25

  ctx.beginPath()
  ctx.moveTo(x - width * 1.05, top)
  ctx.lineTo(x + width * 1.05, top)
  ctx.quadraticCurveTo(x + width * 1.2, bottom, x, bottom + width * 0.2)
  ctx.quadraticCurveTo(x - width * 1.2, bottom, x - width * 1.05, top)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = palette.highlight
  ctx.beginPath()
  ctx.moveTo(x - width * 0.6, top + width * 0.2)
  ctx.lineTo(x, top + width * 0.95)
  ctx.lineTo(x + width * 0.6, top + width * 0.2)
  ctx.quadraticCurveTo(x, top + width * 0.65, x - width * 0.6, top + width * 0.2)
  ctx.fill()
  ctx.restore()
}

function drawDress(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  height: number,
  palette: Palette
) {
  ctx.save()
  const skirtTop = baseY - height * 0.4
  const skirtBottom = baseY + height * 0.45

  const gradient = ctx.createLinearGradient(x, skirtTop, x, skirtBottom)
  gradient.addColorStop(0, palette.accent)
  gradient.addColorStop(1, palette.main)
  ctx.fillStyle = gradient

  ctx.beginPath()
  ctx.moveTo(x - width * 1.1, skirtTop)
  ctx.quadraticCurveTo(x - width * 1.35, baseY + height * 0.1, x - width * 0.8, skirtBottom)
  ctx.quadraticCurveTo(x, skirtBottom + width * 0.3, x + width * 0.8, skirtBottom)
  ctx.quadraticCurveTo(x + width * 1.35, baseY + height * 0.1, x + width * 1.1, skirtTop)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = palette.highlight
  ctx.beginPath()
  ctx.moveTo(x, skirtTop + width * 0.3)
  ctx.quadraticCurveTo(x - width * 0.15, skirtBottom, x, skirtBottom)
  ctx.quadraticCurveTo(x + width * 0.15, skirtBottom, x, skirtTop + width * 0.3)
  ctx.fill()
  ctx.restore()
}

function drawAdventurerCoat(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  height: number,
  palette: Palette
) {
  ctx.save()
  const coatTop = baseY - height * 0.6
  const coatBottom = baseY + height * 0.4
  const gradient = ctx.createLinearGradient(x, coatTop, x, coatBottom)
  gradient.addColorStop(0, palette.accent)
  gradient.addColorStop(1, palette.main)
  ctx.fillStyle = gradient

  ctx.beginPath()
  ctx.moveTo(x - width * 1.05, coatTop)
  ctx.lineTo(x + width * 1.05, coatTop)
  ctx.lineTo(x + width * 0.8, coatBottom)
  ctx.lineTo(x - width * 0.8, coatBottom)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = palette.shadow
  ctx.fillRect(x - width * 0.1, coatTop + width * 0.2, width * 0.2, coatBottom - coatTop - width * 0.4)

  ctx.fillStyle = palette.outline
  ctx.fillRect(x - width * 0.7, baseY + height * 0.1, width * 1.4, width * 0.15)
  ctx.restore()
}

function drawSimpleBellyHighlight(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  height: number,
  palette: Palette
) {
  ctx.save()
  const bellyGradient = ctx.createRadialGradient(x, baseY - height * 0.2, width * 0.2, x, baseY, width)
  bellyGradient.addColorStop(0, hexToRgba('#FFFFFF', 0.35))
  bellyGradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = bellyGradient
  ctx.beginPath()
  ctx.ellipse(x, baseY - height * 0.1, width * 0.8, height * 0.8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSproutHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  palette: Palette
) {
  ctx.save()
  ctx.fillStyle = palette.accent
  ctx.beginPath()
  ctx.moveTo(x, y - size * 0.8)
  ctx.quadraticCurveTo(x - size * 0.4, y - size * 1.2, x - size * 0.2, y)
  ctx.quadraticCurveTo(x, y - size * 0.4, x + size * 0.2, y)
  ctx.quadraticCurveTo(x + size * 0.4, y - size * 1.2, x, y - size * 0.8)
  ctx.fill()
  ctx.restore()
}

function drawFlameHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  palette: Palette
) {
  ctx.save()
  const gradient = ctx.createLinearGradient(x, y - size * 1.6, x, y + size * 0.2)
  gradient.addColorStop(0, palette.highlight)
  gradient.addColorStop(1, palette.accent)
  ctx.fillStyle = gradient

  ctx.beginPath()
  ctx.moveTo(x, y - size * 1.5)
  ctx.quadraticCurveTo(x - size * 0.7, y - size, x - size * 0.3, y)
  ctx.quadraticCurveTo(x, y - size * 0.6, x + size * 0.3, y)
  ctx.quadraticCurveTo(x + size * 0.7, y - size, x, y - size * 1.5)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawHat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  palette: Palette
) {
  ctx.save()
  ctx.fillStyle = palette.outline
  ctx.beginPath()
  ctx.ellipse(x, y + size * 0.25, size * 1.35, size * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()

  const gradient = ctx.createLinearGradient(x, y - size * 1.2, x, y + size * 0.2)
  gradient.addColorStop(0, palette.outline)
  gradient.addColorStop(1, palette.shadow)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(x - size * 0.8, y + size * 0.2)
  ctx.lineTo(x, y - size * 1.4)
  ctx.lineTo(x + size * 0.8, y + size * 0.2)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = palette.highlight
  ctx.beginPath()
  ctx.arc(x + size * 0.35, y - size * 1.1, size * 0.25, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawScarf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  palette: Palette
) {
  ctx.save()
  const scarfHeight = width * 0.7
  const gradient = ctx.createLinearGradient(x, y - scarfHeight * 0.4, x, y + scarfHeight)
  gradient.addColorStop(0, palette.accent)
  gradient.addColorStop(1, palette.highlight)
  ctx.fillStyle = gradient

  ctx.beginPath()
  ctx.ellipse(x, y, width * 1.2, scarfHeight * 0.7, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(x - width * 0.4, y + scarfHeight * 0.2)
  ctx.lineTo(x - width * 0.15, y + scarfHeight * 1.1)
  ctx.lineTo(x - width * 0.55, y + scarfHeight * 1.1)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = hexToRgba('#FFFFFF', 0.25)
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(x + i * width * 0.35 - width * 0.1, y - scarfHeight * 0.2, width * 0.2, scarfHeight * 0.6)
  }
  ctx.restore()
}

function drawAntennae(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  palette: Palette
) {
  ctx.save()
  ctx.strokeStyle = palette.accent
  ctx.lineWidth = size * 0.18
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x - size * 0.8, y)
  ctx.quadraticCurveTo(x - size * 1.2, y - size * 0.8, x - size * 0.9, y - size * 1.6)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + size * 0.8, y)
  ctx.quadraticCurveTo(x + size * 1.2, y - size * 0.8, x + size * 0.9, y - size * 1.6)
  ctx.stroke()

  ctx.fillStyle = palette.highlight
  ctx.beginPath()
  ctx.arc(x - size * 0.9, y - size * 1.6, size * 0.35, 0, Math.PI * 2)
  ctx.arc(x + size * 0.9, y - size * 1.6, size * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  humor: number,
  energy: number,
  palette: Palette,
  time: number,
  intensity: number
) {
  const blink = Math.pow(Math.abs(Math.sin(time * (1.6 + intensity))) , 2) * 0.6
  const eyeSeparation = radius * 0.85
  const eyeWidth = radius * 0.28 * (humor > 0.7 ? 1.1 : 1)
  const eyeHeight = radius * 0.32 * (1 - blink)

  ctx.save()
  ctx.fillStyle = '#1F1F1F'

  ctx.beginPath()
  ctx.ellipse(x - eyeSeparation, y, eyeWidth, eyeHeight, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x + eyeSeparation, y, eyeWidth, eyeHeight, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = hexToRgba('#FFFFFF', 0.7)
  ctx.beginPath()
  ctx.ellipse(x - eyeSeparation + eyeWidth * 0.3, y - eyeHeight * 0.2, eyeWidth * 0.35, eyeHeight * 0.35, 0, 0, Math.PI * 2)
  ctx.ellipse(x + eyeSeparation + eyeWidth * 0.1, y - eyeHeight * 0.2, eyeWidth * 0.35, eyeHeight * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = hexToRgba(palette.highlight, 0.25)
  ctx.beginPath()
  ctx.ellipse(x - eyeSeparation, y + radius * 0.35, radius * 0.28, radius * 0.18, 0, 0, Math.PI * 2)
  ctx.ellipse(x + eyeSeparation, y + radius * 0.35, radius * 0.28, radius * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()

  const smileCurve = energy * radius * 0.8 - radius * 0.25
  ctx.strokeStyle = '#1F1F1F'
  ctx.lineWidth = radius * 0.18
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - radius * 0.55, y + radius * 0.45)
  ctx.quadraticCurveTo(x, y + radius * 0.45 + smileCurve, x + radius * 0.55, y + radius * 0.45)
  ctx.stroke()
  ctx.restore()
}

function getCharacterStyle(personality: Personality, overrideColor?: string): CharacterStyle {
  const theme = determineTheme(personality)
  const preset = STYLE_PRESETS[theme]
  const palette = overrideColor
    ? createPaletteFromColor(overrideColor, preset.palette)
    : { ...preset.palette }

  return {
    palette,
    outfit: preset.outfit,
    hair: preset.hair,
    accessories: { ...preset.accessories },
  }
}

function determineTheme(personality: Personality): Theme {
  const { empathy, energy, creativity, confidence, humor } = personality

  if (empathy > 0.7 && energy < 0.55) {
    return 'calm'
  }

  if (energy > 0.75 && humor > 0.55) {
    return 'energetic'
  }

  if (creativity > 0.7 && confidence > 0.6) {
    return 'wise'
  }

  return 'playful'
}

function createPaletteFromColor(color: string, fallback: Palette): Palette {
  const rgb = parseColor(color)
  if (!rgb) {
    return { ...fallback }
  }

  const main = rgbToHex(rgb)
  const highlight = rgbToHex(mixColor(rgb, WHITE, 0.45))
  const shadow = rgbToHex(mixColor(rgb, BLACK, 0.55))
  const glow = rgbToHex(mixColor(rgb, WHITE, 0.3))

  return {
    main,
    highlight,
    shadow,
    accent: fallback.accent,
    glow,
    outline: fallback.outline,
  }
}

interface RGB {
  r: number
  g: number
  b: number
}

const WHITE: RGB = { r: 255, g: 255, b: 255 }
const BLACK: RGB = { r: 0, g: 0, b: 0 }

function parseColor(color: string): RGB | null {
  if (!color) return null
  if (color.startsWith('#')) {
    const normalized = color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color

    const value = normalized.replace('#', '')
    const bigint = parseInt(value, 16)
    if (Number.isNaN(bigint) || (value.length !== 6 && value.length !== 3)) {
      return null
    }
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    }
  }

  const hslMatch = color.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/i)
  if (hslMatch) {
    const h = Number(hslMatch[1])
    const s = Number(hslMatch[2]) / 100
    const l = Number(hslMatch[3]) / 100
    return hslToRgb(h, s, l)
  }

  return null
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const hueToRgb = (p: number, q: number, t: number) => {
    let temp = t
    if (temp < 0) temp += 1
    if (temp > 1) temp -= 1
    if (temp < 1 / 6) return p + (q - p) * 6 * temp
    if (temp < 1 / 2) return q
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6
    return p
  }

  const normalizedHue = ((h % 360) + 360) / 360

  if (s === 0) {
    const value = Math.round(l * 255)
    return { r: value, g: value, b: value }
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const r = Math.round(hueToRgb(p, q, normalizedHue + 1 / 3) * 255)
  const g = Math.round(hueToRgb(p, q, normalizedHue) * 255)
  const b = Math.round(hueToRgb(p, q, normalizedHue - 1 / 3) * 255)

  return { r, g, b }
}

function mixColor(base: RGB, target: RGB, ratio: number): RGB {
  return {
    r: Math.round(base.r + (target.r - base.r) * ratio),
    g: Math.round(base.g + (target.g - base.g) * ratio),
    b: Math.round(base.b + (target.b - base.b) * ratio),
  }
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (value: number) => value.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToRgba(hex: string, alpha: number): string {
  const rgb = parseColor(hex)
  if (!rgb) {
    return `rgba(0,0,0,${alpha})`
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}
