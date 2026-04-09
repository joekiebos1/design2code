'use client'

import { useEffect, useCallback } from 'react'
import { StudioPaddedClippedImage } from './StudioPaddedClippedImage'
import { StudioPaddedClippedMedia } from './StudioPaddedClippedMedia'

type StudioInspirationLightboxProps = {
  open: boolean
  mediaUrl: string | undefined
  /** When true, `mediaUrl` is treated as MP4 (autoplay, no controls). */
  isVideo: boolean
  title?: string
  /** Required for new items; omit only for legacy entries */
  href?: string | null
  linkLabel: string
  onClose: () => void
  /**
   * `panel` — overlay only covers the positioned parent (studio main column). Parent must be `relative` with a defined height.
   * `viewport` — full browser overlay.
   */
  overlay?: 'panel' | 'viewport'
}

/**
 * Lightbox: semi-transparent white overlay dims content behind the preview; video autoplays (muted).
 * Prefer `overlay="panel"` in Studio so the sidebar/header stay untouched.
 */
export function StudioInspirationLightbox({
  open,
  mediaUrl,
  isVideo,
  title,
  href,
  linkLabel,
  onClose,
  overlay = 'viewport',
}: StudioInspirationLightboxProps) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', onKeyDown)
    if (overlay === 'viewport') {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', onKeyDown)
        document.body.style.overflow = prev
      }
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onKeyDown, overlay])

  if (!open) return null

  const hasVideo = isVideo && mediaUrl != null && mediaUrl !== ''

  const media = hasVideo ? (
    <StudioPaddedClippedMedia
      src={mediaUrl}
      kind="video"
      variant="modal"
      videoControls={false}
      videoMuted
      videoAutoPlay
      videoLoop
    />
  ) : (
    <StudioPaddedClippedImage src={mediaUrl} variant="modal" />
  )

  const rootPosition =
    overlay === 'panel'
      ? 'absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8'
      : 'fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8'

  return (
    <div
      className={rootPosition}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Preview: ${title}` : 'Preview'}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer border-0 bg-white/70 p-0 transition-opacity duration-200"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="studio-lightbox-panel relative z-10 flex w-full max-w-4xl flex-col items-center gap-5">
        <div
          className={hasVideo ? 'w-full' : 'w-full cursor-pointer'}
          onClick={hasVideo ? undefined : onClose}
          onKeyDown={
            hasVideo
              ? undefined
              : (e) => {
                  if (e.key === 'Enter' || e.key === ' ') onClose()
                }
          }
          role={hasVideo ? undefined : 'button'}
          tabIndex={hasVideo ? undefined : 0}
          aria-label={hasVideo ? undefined : 'Close preview'}
        >
          {media}
        </div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="relative z-[11] inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-primary-hover"
          >
            {linkLabel}
          </a>
        ) : (
          <p className="relative z-[11] m-0 text-sm text-gray-400">No link on file</p>
        )}
      </div>
    </div>
  )
}
