import {
  inspirationDetailPrimary,
  inspirationGalleryVisual,
  inspirationHasMedia,
  inspirationIsVideo,
  inspirationMediaUrl,
} from '../studio-inspiration-media'

export type JioDesignEntry = {
  id: string
  mediaUrl?: string
  mimeType?: string | null
  /** @deprecated legacy */
  imageUrl?: string
  videoUrl?: string
  screenshotUrl?: string
  url?: string
  title?: string
  brand?: string
  whatToSteal?: string
}

/** Image URL only — undefined when the entry is video. */
export function jioDesignThumbnailSrc(entry: JioDesignEntry): string | undefined {
  const u = inspirationMediaUrl(entry)
  if (!u || inspirationIsVideo(entry)) return undefined
  return u
}

export function jioDesignHasMedia(entry: JioDesignEntry): boolean {
  return inspirationHasMedia(entry)
}

export { inspirationGalleryVisual as jioDesignGalleryVisual, inspirationDetailPrimary as jioDesignDetailPrimary }
