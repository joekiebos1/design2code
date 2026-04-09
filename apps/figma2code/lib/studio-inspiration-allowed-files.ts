/** Studio inspiration uploads: PNG stills and MP4 video only. */

export function isAllowedStudioMediaFile(file: File): boolean {
  const name = file.name.toLowerCase()
  const t = file.type
  const png = t === 'image/png' || name.endsWith('.png')
  const mp4 = t === 'video/mp4' || name.endsWith('.mp4')
  return png || mp4
}
