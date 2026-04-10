/** Studio inspiration uploads: images and videos (no PDFs or documents). */

const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
])

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

export function isAllowedStudioMediaFile(file: File): boolean {
  const t = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  if (ALLOWED_IMAGE_TYPES.has(t)) return true
  if (ALLOWED_VIDEO_TYPES.has(t)) return true
  // Fallback: check extension
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') ||
      name.endsWith('.gif') || name.endsWith('.webp') || name.endsWith('.avif') ||
      name.endsWith('.svg')) return true
  if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov')) return true
  return false
}

export function isMediaMimeType(mime: string): boolean {
  const t = mime.toLowerCase()
  return ALLOWED_IMAGE_TYPES.has(t) || ALLOWED_VIDEO_TYPES.has(t)
}

export const ALLOWED_MEDIA_ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml,video/mp4,video/webm,video/quicktime'
