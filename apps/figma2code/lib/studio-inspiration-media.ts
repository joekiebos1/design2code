/** Shared helpers for Benchmark + Jio Design entries backed by `studioInspiration` in Sanity. */

export type InspirationMediaFields = {
  /** Unified asset URL from API (or legacy fields below). */
  mediaUrl?: string
  mimeType?: string | null
  /** @deprecated legacy documents */
  imageUrl?: string
  /** @deprecated legacy documents */
  videoUrl?: string
  /** @deprecated */
  screenshotUrl?: string
}

export function inspirationMediaUrl(entry: InspirationMediaFields): string | undefined {
  const raw =
    entry.mediaUrl?.trim() ||
    entry.imageUrl?.trim() ||
    entry.videoUrl?.trim() ||
    entry.screenshotUrl?.trim()
  if (!raw) return undefined
  const u = raw.trim()
  if (u.startsWith('data:') || u.startsWith('http') || u.startsWith('/') || u.startsWith('blob:')) return u
  return undefined
}

export function inspirationIsVideo(entry: InspirationMediaFields): boolean {
  if (entry.mimeType?.startsWith('video/')) return true
  if (entry.videoUrl && !entry.mediaUrl && !entry.imageUrl) return true
  const url = inspirationMediaUrl(entry)
  if (url?.toLowerCase().split(/[?#]/)[0].endsWith('.mp4')) return true
  return false
}

export function inspirationHasMedia(entry: InspirationMediaFields): boolean {
  return Boolean(inspirationMediaUrl(entry))
}

/** Gallery tile/strip — branch on format. */
export function inspirationGalleryVisual(
  entry: InspirationMediaFields
): { kind: 'image'; src: string } | { kind: 'video'; src: string } | null {
  const src = inspirationMediaUrl(entry)
  if (!src) return null
  return inspirationIsVideo(entry) ? { kind: 'video', src } : { kind: 'image', src }
}

/** Detail / lightbox — same branching (single asset, no separate poster). */
export function inspirationDetailPrimary(
  entry: InspirationMediaFields
): { kind: 'image'; src: string } | { kind: 'video'; src: string } | null {
  return inspirationGalleryVisual(entry)
}
