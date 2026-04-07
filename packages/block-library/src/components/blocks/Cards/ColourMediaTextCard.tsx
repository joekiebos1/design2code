'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@marcelinodzn/ds-react'

export type ColourMediaTextCardProps = {
  title: string
  description?: string | null
  image?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  cardSize?: 'large' | 'medium' | 'small'
}

const TYPOGRAPHY = {
  large:  { title: 'var(--ds-typography-h4)', desc: 'var(--ds-typography-body-m)' },
  medium: { title: 'var(--ds-typography-h5)', desc: 'var(--ds-typography-body-s)' },
  small:  { title: 'var(--ds-typography-body-l)', desc: 'var(--ds-typography-body-s)' },
} as const

function isValidImageSrc(s: string | null | undefined): boolean {
  if (!s || typeof s !== 'string' || !s.trim()) return false
  const t = s.trim()
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/')
}

export function ColourMediaTextCard({
  title,
  description,
  image,
  ctaText,
  ctaLink,
  cardSize = 'medium',
}: ColourMediaTextCardProps) {
  const router = useRouter()
  const typography = TYPOGRAPHY[cardSize]
  const hasValidImage = isValidImageSrc(image)

  const handleCtaPress = () => {
    if (!ctaLink?.trim()) return
    const href = ctaLink.trim()
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  return (
    <div
      style={{
        background: 'var(--ds-color-background-minimal)',
        borderRadius: 'var(--ds-radius-card-m)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '5/4', width: '100%', overflow: 'hidden', flexShrink: 0 }}>
        {hasValidImage ? (
          <Image
            src={image!.trim()}
            alt=""
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 33vw"
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
              fontSize: 'var(--ds-typography-body-xs)',
              color: 'var(--ds-color-text-medium)',
            }}
          >
            Preview
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-s)',
          padding: 'var(--ds-spacing-m) var(--ds-spacing-m) 0',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: typography.title,
            fontWeight: 'var(--ds-typography-weight-medium)',
            color: 'var(--ds-color-text-high)',
            lineHeight: 1.3,
            whiteSpace: 'pre-line',
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              margin: 0,
              fontSize: typography.desc,
              fontWeight: 'var(--ds-typography-weight-low)',
              color: 'var(--ds-color-text-medium)',
              lineHeight: 1.5,
              whiteSpace: 'pre-line',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {ctaText && (
        <div style={{ padding: 'var(--ds-spacing-m)' }}>
          <Button
            size="S"
            attention="low"
            appearance="primary"
            onPress={ctaLink?.trim() ? handleCtaPress : () => {}}
          >
            {ctaText}
          </Button>
        </div>
      )}

      {!ctaText && <div style={{ height: 'var(--ds-spacing-m)' }} />}
    </div>
  )
}
