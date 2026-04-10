'use client'

import { useCallback, useEffect, useState } from 'react'
import { StudioPaddedClippedImage } from '../components/StudioPaddedClippedImage'
import { StudioPaddedClippedMedia } from '../components/StudioPaddedClippedMedia'
import { inspirationHasMedia, inspirationIsVideo } from '../../../lib/studio-inspiration-media'
import type { BenchmarkEntry } from '../../../lib/benchmarks/types'
import { extractDomain } from '../utils/extract-domain'

type Props = {
  entry: BenchmarkEntry
  onClose: () => void
}

export function BenchmarkDetailView({ entry, onClose }: Props) {
  const [loadFailed, setLoadFailed] = useState(false)

  const hasMedia = inspirationHasMedia(entry)
  const isVideo = hasMedia && inspirationIsVideo(entry)
  const hasUrl = !hasMedia && !!entry.url

  const domain = extractDomain(entry.url)

  useEffect(() => { setLoadFailed(false) }, [entry.url])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  const proxyUrl = entry.url ? `/api/web-proxy?url=${encodeURIComponent(entry.url)}` : null
  const iframeWidth = entry.viewport === '360' ? 360 : 1440

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-white p-4 sm:p-8 cursor-pointer"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="studio-lightbox-panel relative flex h-full w-full flex-col items-center gap-5 cursor-auto"
        style={{ maxWidth: hasUrl ? iframeWidth : '56rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {hasMedia ? (
          <div className={`w-full ${isVideo ? '' : 'cursor-pointer'}`}
            onClick={isVideo ? undefined : onClose}
            role={isVideo ? undefined : 'button'}
            tabIndex={isVideo ? undefined : 0}
            aria-label={isVideo ? undefined : 'Close preview'}
            onKeyDown={isVideo ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') onClose() }}
          >
            {isVideo ? (
              <StudioPaddedClippedMedia
                src={entry.mediaUrl}
                kind="video"
                variant="modal"
                videoControls={false}
                videoMuted
                videoAutoPlay
                videoLoop
              />
            ) : (
              <StudioPaddedClippedImage src={entry.mediaUrl} variant="modal" />
            )}
          </div>
        ) : hasUrl && proxyUrl ? (
          <div className="flex-1 overflow-auto rounded-2xl shadow-2xl" style={{ width: iframeWidth }}>
            {loadFailed ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
                <p className="m-0 text-sm font-medium text-gray-700">Could not load {domain}</p>
                <p className="m-0 text-xs text-gray-400">The site failed to respond.</p>
              </div>
            ) : (
              <iframe
                key={proxyUrl}
                src={proxyUrl}
                title={entry.title ?? domain}
                onError={() => setLoadFailed(true)}
                style={{ width: iframeWidth, height: '100%', minHeight: '100%', border: 'none', display: 'block', backgroundColor: '#fff' }}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
