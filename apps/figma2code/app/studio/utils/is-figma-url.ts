/** Accepts https Figma file / prototype URLs */
export function isFigmaUrl(s: string): boolean {
  try {
    const u = new URL(s.trim())
    if (u.protocol !== 'https:') return false
    return (
      u.hostname === 'figma.com' ||
      u.hostname === 'www.figma.com' ||
      u.hostname.endsWith('.figma.com')
    )
  } catch {
    return false
  }
}
