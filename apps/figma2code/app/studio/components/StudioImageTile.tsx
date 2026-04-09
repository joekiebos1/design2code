'use client'

import { inspirationIsVideo, type InspirationMediaFields } from '../../../lib/studio-inspiration-media'
import { StudioPaddedClippedImage } from './StudioPaddedClippedImage'
import { StudioPaddedClippedMedia } from './StudioPaddedClippedMedia'

/** Grid tile — same padded/clipped treatment as modal preview. */
export function StudioImageTile({ entry }: { entry: InspirationMediaFields }) {
  const url =
    entry.mediaUrl?.trim() ||
    entry.imageUrl?.trim() ||
    entry.videoUrl?.trim() ||
    entry.screenshotUrl?.trim()
  if (!url) {
    return <StudioPaddedClippedImage src={null} />
  }
  const isVideo = inspirationIsVideo(entry)
  if (isVideo) {
    return (
      <StudioPaddedClippedMedia
        src={url}
        kind="video"
        videoMuted
        videoAutoPlay
        videoLoop
        videoControls={false}
      />
    )
  }
  return <StudioPaddedClippedImage src={url} />
}
