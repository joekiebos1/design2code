'use client'

import { useCallback, useState, useRef } from 'react'
import { Card, Stack, Text, Box } from '@sanity/ui'
import { useClient } from 'sanity'

function isImageFile(f: File): boolean {
  return f.type.startsWith('image/')
}

function isVideoFile(f: File): boolean {
  return f.type.startsWith('video/')
}

export function MediaLibraryUpload() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => isImageFile(f) || isVideoFile(f))
      if (fileArray.length === 0) {
        setMessage({ type: 'error', text: 'No image or video files selected' })
        return
      }
      setUploading(true)
      setMessage(null)
      let imageCount = 0
      let videoCount = 0
      try {
        for (const file of fileArray) {
          if (isImageFile(file)) {
            await client.assets.upload('image', file, { filename: file.name })
            imageCount += 1
          } else if (isVideoFile(file)) {
            await client.assets.upload('file', file, { filename: file.name })
            videoCount += 1
          }
        }
        const parts: string[] = []
        if (imageCount > 0) {
          parts.push(`${imageCount} image${imageCount > 1 ? 's' : ''}`)
        }
        if (videoCount > 0) {
          parts.push(`${videoCount} video${videoCount > 1 ? 's' : ''}`)
        }
        setMessage({
          type: 'success',
          text: `Uploaded ${parts.join(' and ')}`,
        })
      } catch (err) {
        setMessage({
          type: 'error',
          text: err instanceof Error ? err.message : 'Upload failed',
        })
      } finally {
        setUploading(false)
      }
    },
    [client]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
    },
    [uploadFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files?.length) uploadFiles(files)
      e.target.value = ''
    },
    [uploadFiles]
  )

  return (
    <Stack space={4}>
      <Card
        padding={4}
        radius={2}
        tone={isDragging ? 'primary' : 'default'}
        style={{
          border: `2px dashed ${isDragging ? 'var(--card-fg-color)' : 'var(--card-border-color)'}`,
          cursor: uploading ? 'wait' : 'pointer',
          opacity: uploading ? 0.7 : 1,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={uploading ? undefined : handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Stack space={3}>
          <Text size={2} weight="semibold" align="center">
            {uploading
              ? 'Uploading…'
              : isDragging
                ? 'Drop files here'
                : 'Drag & drop images or videos, or click to upload'}
          </Text>
          <Text size={1} muted align="center">
            Images go to the image library; videos become file assets for video fields in blocks
          </Text>
        </Stack>
      </Card>
      {message && (
        <Box padding={2}>
          <Text
            size={1}
            style={{
              color:
                message.type === 'error'
                  ? 'var(--card-status-error-fg-color)'
                  : 'var(--card-status-success-fg-color)',
            }}
          >
            {message.text}
          </Text>
        </Box>
      )}
    </Stack>
  )
}
