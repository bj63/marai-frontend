export function buildEmojiAvatar(emoji: string, accent: string): string {
  const sanitizedAccent = accent && /^#([0-9A-Fa-f]{3}){1,2}$/.test(accent) ? accent : '#6366F1'
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="32" ry="32" fill="${sanitizedAccent}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="64">${emoji}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function resolveAvatarImage(rawAvatar: string | null | undefined, accent: string): string | null {
  if (!rawAvatar) {
    return null
  }

  const trimmed = rawAvatar.trim()
  if (!trimmed) {
    return null
  }

  const isUrl = /^(https?:)?\//.test(trimmed) || trimmed.startsWith('data:')
  if (isUrl) {
    return trimmed
  }

  if (trimmed.length <= 3) {
    return buildEmojiAvatar(trimmed, accent)
  }

  return trimmed
}
