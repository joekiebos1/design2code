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
  /** @deprecated */ imageUrl?: string
  /** @deprecated */ videoUrl?: string
  /** @deprecated */ screenshotUrl?: string
  url?: string
  title?: string
  description?: string
  viewport?: '360' | '1440'
  brand?: string
  whatToSteal?: string
  /** Optimistic pending state — not yet confirmed by the server */
  pending?: boolean
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
