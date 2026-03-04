'use client'

/**
 * Lab: HeroSplit50 – 50/50 split layout
 *
 * Text and image side by side. Reduces visual weight by giving the image only half the space.
 * Clean, minimal. Works well with lifestyle photography.
 */

import { useRouter } from 'next/navigation'
import { Display, Text, Button, SurfaceProvider } from '@marcelinodzn/ds-react'
import { GridBlock, useGridCell } from '../../../components/GridBlock'
import { useGridBreakpoint } from '../../../lib/use-grid-breakpoint'
import type { HeroLabProps } from './HeroLab.types'

export function HeroSplit50({
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

  const textContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 'var(--ds-spacing-l)',
        padding: 'var(--ds-spacing-2xl)',
        minHeight: isStacked ? undefined : 'min(70vh, 560px)',
      }}
    >
      {productName && (
        <Text size="L" weight="high" color="high" as="span">
          {productName}
        </Text>
      )}
      {headline && (
        <Display size="L" as="h1" color="high" style={{ lineHeight: 1.1 }}>
          {headline}
        </Display>
      )}
      {subheadline && (
        <Text size="M" weight="low" color="medium" as="p" style={{ margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
          {subheadline}
        </Text>
      )}
      {(ctaText || cta2Text) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)' }}>
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
  )

  const imageContent = (
    <div
      style={{
        position: 'relative',
        aspectRatio: isStacked ? '16 / 9' : '4 / 5',
        overflow: 'hidden',
        borderRadius: 'var(--ds-radius-card-m)',
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
            background: 'var(--ds-color-background-subtle)',
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
  )

  const textFirst = imagePosition === 'right'

  return (
    <SurfaceProvider level={0}>
      <GridBlock as="section">
        <div
          style={{
            ...cell,
            display: 'grid',
            gridTemplateColumns: isStacked ? '1fr' : '1fr 1fr',
            gap: 0,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              ...(textFirst && { background: 'var(--ds-color-background-subtle)' }),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {textFirst ? textContent : imageContent}
          </div>
          <div
            style={{
              ...(!textFirst && { background: 'var(--ds-color-background-subtle)' }),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {textFirst ? imageContent : textContent}
          </div>
        </div>
      </GridBlock>
    </SurfaceProvider>
  )
}
