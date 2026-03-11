'use client'

import { useRef, useState, useEffect } from 'react'
import { Headline, Text, SurfaceProvider, Button } from '@marcelinodzn/ds-react'
import { BlockRenderer } from '../../components/BlockRenderer'
import { briefToBlocks } from '../briefToBlocks'
import { useImageStream } from '../../hooks/useImageStream'
import type { PageBrief } from '../types'
import type { PreviewImageSource } from '../JioKarnaContext'

type PreviewScreenProps = {
  brief: PageBrief
  imageSource: PreviewImageSource
  onApprove: () => void
  onBack: () => void
}

export function PreviewScreen({ brief, imageSource, onApprove, onBack }: PreviewScreenProps) {
  const jobIdRef = useRef<string | null>(null)
  if (jobIdRef.current === null) {
    jobIdRef.current = crypto.randomUUID()
  }
  const jobId = jobIdRef.current

  const { images, readyCount, totalCount, allReady } = useImageStream(
    imageSource === 'artDirector' ? jobId : null,
    imageSource === 'artDirector' ? brief : null
  )

  const [sanityUrls, setSanityUrls] = useState<string[]>([])
  useEffect(() => {
    if (imageSource !== 'sanityOnly') return
    fetch('/api/jiokarna/images')
      .then((res) => res.json())
      .then((data) => setSanityUrls(data?.urls ?? []))
      .catch(() => setSanityUrls([]))
  }, [imageSource])

  const blocks = briefToBlocks(brief, imageSource === 'sanityOnly' ? sanityUrls : [])

  return (
    <SurfaceProvider level={0}>
      <div style={{ marginBottom: 'var(--ds-spacing-2xl)' }}>
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            paddingBlock: 'var(--ds-spacing-l)',
            paddingInline: 'var(--ds-spacing-m)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--ds-spacing-m)',
          }}
        >
          <div>
            <Headline level={1} style={{ margin: 0, marginBottom: 'var(--ds-spacing-2xs)', fontSize: 'var(--ds-typography-h4)' }}>
              Page preview
            </Headline>
            <Text appearance="secondary" style={{ fontSize: 'var(--ds-typography-body-xs)' }}>
              {brief.meta.pageName} · Preview ({imageSource === 'artDirector' ? 'Art Director' : 'Sanity only'})
            </Text>
          </div>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-m)' }}>
            <Button onPress={onBack} appearance="secondary" contained={false} size="M" attention="high">
              Back to structure
            </Button>
            <Button onPress={onApprove} appearance="neutral" size="M" attention="high">
              Approve & export
            </Button>
          </div>
        </div>

        {imageSource === 'artDirector' && !allReady && totalCount > 0 && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-s)',
              background: 'var(--ds-color-background-ghost)',
              borderBottom: '1px solid var(--ds-color-stroke-subtle)',
            }}
          >
            <Text size="S" appearance="secondary">
              {readyCount} of {totalCount} images ready
            </Text>
          </div>
        )}

        <div
          style={{
            borderTop: '1px solid var(--ds-color-stroke-subtle)',
            background: 'var(--ds-color-background-ghost)',
            minHeight: '60vh',
          }}
        >
          <BlockRenderer blocks={blocks} images={imageSource === 'artDirector' ? images : undefined} />
        </div>
      </div>
    </SurfaceProvider>
  )
}
