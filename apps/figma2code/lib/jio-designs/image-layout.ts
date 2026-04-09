/**
 * Gallery and detail sizing for Jio Design thumbnails from Sanity.
 * Mobile exports: 360px or 720px (@2x). Desktop: 1440px or 2880px (@2x).
 */

/** Mobile asset vs desktop asset (split at 1440 — desktop 1× width). */
export function isJioDesignMobileAssetWidth(naturalWidth: number): boolean {
  return naturalWidth < 1440
}

/** Horizontal gallery: 50% of logical size → 180px mobile, 720px desktop. */
export function jioDesignGalleryThumbWidthPx(naturalWidth: number): 180 | 720 {
  return isJioDesignMobileAssetWidth(naturalWidth) ? 180 : 720
}

/** Detail view: full logical width — 360px mobile, 1440px desktop. */
export function jioDesignDetailDisplayWidthPx(naturalWidth: number): 360 | 1440 {
  return isJioDesignMobileAssetWidth(naturalWidth) ? 360 : 1440
}
