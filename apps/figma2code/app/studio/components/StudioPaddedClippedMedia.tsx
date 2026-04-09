'use client'

/**
 * Framed image or video: media fits inside the frame (object-contain) — nothing is cropped.
 */
export function StudioPaddedClippedMedia({
  src,
  kind,
  className = '',
  variant = 'tile',
  videoControls = false,
  videoMuted = true,
  videoAutoPlay = false,
  videoLoop = false,
  posterSrc,
}: {
  src?: string | null
  kind: 'image' | 'video'
  className?: string
  variant?: 'tile' | 'modal'
  /** Native controls (off for Studio inspiration — use muted autoplay instead). */
  videoControls?: boolean
  videoMuted?: boolean
  videoAutoPlay?: boolean
  videoLoop?: boolean
  posterSrc?: string | null
}) {
  const ok = Boolean(
    src &&
      (src.startsWith('data:') ||
        src.startsWith('http') ||
        src.startsWith('/') ||
        src.startsWith('blob:'))
  )

  const tileOuter = 'aspect-[4/5] w-full min-h-0 flex items-center justify-center'
  const modalOuter =
    'flex h-[min(80vh,900px)] w-full max-w-4xl min-h-0 items-center justify-center'

  const outer = variant === 'modal' ? modalOuter : tileOuter

  const mediaFit = 'h-full w-full min-h-0 min-w-0 shrink object-contain'
  const pointerClass = videoControls
    ? `pointer-events-auto ${mediaFit}`
    : `pointer-events-none ${mediaFit}`

  return (
    <div className={`${outer} rounded-xl bg-gray-100 overflow-hidden ${className}`}>
      {ok && kind === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src!} alt="" className={mediaFit} />
      ) : null}
      {ok && kind === 'video' ? (
        <video
          src={src!}
          poster={posterSrc && posterSrc.trim() ? posterSrc : undefined}
          className={pointerClass}
          muted={videoMuted}
          playsInline
          controls={videoControls}
          autoPlay={videoAutoPlay}
          loop={videoLoop}
          preload="metadata"
          aria-label=""
        />
      ) : null}
      {!ok ? <div className="h-full w-full min-h-[120px] rounded-lg bg-gray-200/80" aria-hidden /> : null}
    </div>
  )
}
