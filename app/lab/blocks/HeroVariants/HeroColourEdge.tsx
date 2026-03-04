'use client'

/**
 * Lab: HeroColourEdge – Full image with gradient overlay
 *
 * Image fills the hero. A soft gradient from one edge holds the text.
 * Blended, elegant. The image feels lighter as it emerges from the colour.
 */

import { useRouter } from 'next/navigation'
import { Display, Text, Button, SurfaceProvider } from '@marcelinodzn/ds-react'
import { GridBlock, useGridCell } from '../../../components/GridBlock'
import { useGridBreakpoint } from '../../../lib/use-grid-breakpoint'
import type { HeroLabProps } from './HeroLab.types'

export function HeroColourEdge({
  productName,
  headline,
  subheadline,
  ctaText,
  ctaLink,
  cta2Text,
  cta2Link,
  image,
  imagePosition = 'right',
}: HeroLabProps) {
  const router = useRouter()
  const { columns } = useGridBreakpoint()
  const isStacked = columns < 8
  const cell = useGridCell('Wide')

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  const gradientDir = imagePosition === 'right' ? 'to right' : 'to left'
  const gradient = `linear-gradient(${gradientDir}, var(--ds-color-block-background-bold) 0%, var(--ds-color-block-background-bold) 35%, transparent 70%)`

  return (
    <SurfaceProvider level={0}>
      <GridBlock as="section">
        <div
          style={{
            ...cell,
            position: 'relative',
            aspectRatio: isStacked ? '16 / 9' : '21 / 9',
            overflow: 'hidden',
            borderRadius: 'var(--ds-radius-card-m)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              background: image ? undefined : 'var(--ds-color-background-subtle)',
            }}
          >
            {image ? (
              <img
                src={image}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text size="M" weight="medium" color="low" as="span">
                  Image
                </Text>
              </div>
            )}
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: gradient,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: imagePosition === 'right' ? 'flex-start' : 'flex-end',
              padding: 'var(--ds-spacing-2xl)',
            }}
          >
            <SurfaceProvider level={1} hasBoldBackground>
              <div
                style={{
                  maxWidth: 'min(480px, 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-l)',
                  textAlign: imagePosition === 'right' ? 'left' : 'right',
                  alignItems: imagePosition === 'right' ? 'flex-start' : 'flex-end',
                }}
              >
                {productName && (
                  <Text size="L" weight="high" color="on-bold-high" as="span">
                    {productName}
                  </Text>
                )}
                {headline && (
                  <Display size="L" as="h1" color="on-bold-high" style={{ lineHeight: 1.1 }}>
                    {headline}
                  </Display>
                )}
                {subheadline && (
                  <Text size="M" weight="low" color="on-bold-high" as="p" style={{ margin: 0, lineHeight: 1.5, opacity: 0.95, whiteSpace: 'pre-line' }}>
                    {subheadline}
                  </Text>
                )}
                {(ctaText || cta2Text) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)', justifyContent: imagePosition === 'right' ? 'flex-start' : 'flex-end' }}>
                    {ctaText && ctaLink && (
                      <Button appearance="primary" size="M" attention="high" onPress={() => handleCtaPress(ctaLink)}>
                        {ctaText}
                      </Button>
                    )}
                    {cta2Text && cta2Link && (
                      <Button appearance="primary" size="M" attention="medium" onPress={() => handleCtaPress(cta2Link)}>
                        {cta2Text}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </SurfaceProvider>
          </div>
        </div>
      </GridBlock>
    </SurfaceProvider>
  )
}
