'use client'

import { useRef } from 'react'
import { isAllowedStudioMediaFile } from '../../../lib/studio-inspiration-allowed-files'
import { StudioPaddedClippedImage } from './StudioPaddedClippedImage'
import { StudioPaddedClippedMedia } from './StudioPaddedClippedMedia'

type StudioPasteThumbnailFieldProps = {
  value: string
  onChange: (dataUrlOrUrlOrBlobUrl: string) => void
  onBinaryFile?: (file: File) => void
  mediaKind: 'image' | 'video'
}

/**
 * Paste, drop, or choose PNG / MP4. Pass `onBinaryFile` so large MP4 is not held as a data URL.
 */
export function StudioPasteThumbnailField({
  value,
  onChange,
  onBinaryFile,
  mediaKind,
}: StudioPasteThumbnailFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function readFileAsDataUrl(file: File) {
    const r = new FileReader()
    r.onload = () => {
      if (typeof r.result === 'string') onChange(r.result)
    }
    r.readAsDataURL(file)
  }

  function handleChosenFile(file: File) {
    if (!isAllowedStudioMediaFile(file)) return
    if (onBinaryFile) {
      onBinaryFile(file)
      onChange(URL.createObjectURL(file))
      return
    }
    readFileAsDataUrl(file)
  }

  function onPaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file' && (item.type === 'image/png' || item.type === 'video/mp4')) {
        const file = item.getAsFile()
        if (file && isAllowedStudioMediaFile(file)) {
          e.preventDefault()
          handleChosenFile(file)
          return
        }
      }
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handleChosenFile(f)
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,video/mp4,.png,.mp4"
        className="hidden"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleChosenFile(f)
          e.target.value = ''
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 cursor-pointer"
        >
          Upload PNG or MP4
        </button>
        <span className="self-center text-xs text-gray-500">Stored in Sanity when you save (max 30 MB)</span>
      </div>
      <div
        className="relative w-full rounded-xl outline-none focus-within:ring-2 focus-within:ring-primary/30"
        tabIndex={0}
        onPaste={onPaste}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {mediaKind === 'video' ? (
          <StudioPaddedClippedMedia
            src={value || null}
            kind="video"
            videoMuted
            videoAutoPlay
            videoLoop
            videoControls={false}
          />
        ) : (
          <StudioPaddedClippedImage src={value || null} />
        )}
        {!value.trim() && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl px-4 text-center">
            <span className="text-sm text-gray-400">
              Paste, drop, or upload PNG or MP4 — then add title and link below
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
