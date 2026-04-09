import {
  inspirationDetailPrimary,
  inspirationGalleryVisual,
  inspirationHasMedia,
  inspirationMediaUrl,
  inspirationIsVideo,
} from '../studio-inspiration-media'

export type BenchmarkEntry = {
  id: string
  mediaUrl?: string
  mimeType?: string | null
  imageUrl?: string
  videoUrl?: string
  screenshotUrl?: string
  url?: string
  title?: string
  brand?: string
  whatToSteal?: string
}

export function benchmarkThumbnailSrc(entry: BenchmarkEntry): string | undefined {
  const u = inspirationMediaUrl(entry)
  if (!u || inspirationIsVideo(entry)) return undefined
  return u
}

export function benchmarkHasMedia(entry: BenchmarkEntry): boolean {
  return inspirationHasMedia(entry)
}

export { inspirationGalleryVisual as benchmarkGalleryVisual, inspirationDetailPrimary as benchmarkDetailPrimary }
