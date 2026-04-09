'use client'

/**
 * Framed image: media is scaled to fit inside the frame (object-contain) — nothing is cropped.
 */
export function StudioPaddedClippedImage({
  src,
  className = '',
  variant = 'tile',
}: {
  src?: string | null
  className?: string
  variant?: 'tile' | 'modal'
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

  return (
    <div className={`${outer} rounded-xl bg-gray-100 overflow-hidden ${className}`}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src!} alt="" className={mediaFit} />
      ) : (
        <div className="h-full w-full min-h-[120px] rounded-lg bg-gray-200/80" aria-hidden />
      )}
    </div>
  )
}
