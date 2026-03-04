'use client'

import { useRouter } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'
import { Display, Text, Button, SurfaceProvider } from '@marcelinodzn/ds-react'
import { GridBlock, useGridCell } from '../components/GridBlock'
import { BlockContainer } from './BlockContainer'
import { BlockReveal } from './BlockReveal'

/**
 * Variant options:
 * - category | product: Hero with purple background above content
 * - ghost: Same layout/typography/CTAs but no coloured background (transparent/neutral).
 * - fullscreen: Full-screen image as background, content overlaid (product title, headline, primary + optional secondary CTA).
 */
type HeroBlockProps = {
  variant?: 'category' | 'product' | 'ghost' | 'fullscreen' | null
  productName?: string | null
  headline?: string | null
  subheadline?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  cta2Text?: string | null
  cta2Link?: string | null
  image?: string | null
}

export function HeroBlock({
  variant = 'category',
  productName,
  headline,
  subheadline,
  ctaText,
  ctaLink,
  cta2Text,
  cta2Link,
  image,
}: HeroBlockProps) {
  const isFullscreen = variant === 'fullscreen'
  const hasColouredBg = !isFullscreen && variant !== 'ghost'
  const textColour = hasColouredBg || isFullscreen ? 'on-bold-high' : 'high'
  const subheadlineColour = hasColouredBg ? 'on-bold-high' : 'medium'
  const router = useRouter()
  const cell = useGridCell('Wide')
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [purpleHeight, setPurpleHeight] = useState<string>('100%')

  useEffect(() => {
    if (isFullscreen) return
    const updateHeight = () => {
      const section = sectionRef.current
      const image = imageRef.current
      if (!section || !image) return
      const sectionRect = section.getBoundingClientRect()
      const imageRect = image.getBoundingClientRect()
      const centerOfImage = imageRect.top + imageRect.height / 2
      setPurpleHeight(`${Math.max(0, centerOfImage - sectionRect.top)}px`)
    }
    let cleanup: (() => void) | undefined
    const raf = requestAnimationFrame(() => {
      updateHeight()
      window.addEventListener('resize', updateHeight)
      const ro = new ResizeObserver(updateHeight)
      if (sectionRef.current) ro.observe(sectionRef.current)
      cleanup = () => {
        window.removeEventListener('resize', updateHeight)
        ro.disconnect()
      }
    })
    return () => {
      cancelAnimationFrame(raf)
      cleanup?.()
    }
  }, [isFullscreen, productName, headline, subheadline, image])

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  if (isFullscreen) {
    return (
      <BlockReveal>
        <section
          ref={sectionRef}
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
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
            {image && (
              <img
                src={image}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, color-mix(in srgb, var(--ds-color-neutral-bold) 70%, transparent) 0%, color-mix(in srgb, var(--ds-color-neutral-bold) 30%, transparent) 50%, transparent 100%)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
          <SurfaceProvider level={0} hasBoldBackground={true}>
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--ds-spacing-3xl) var(--ds-spacing-xl)',
                gap: 'var(--ds-spacing-2xl)',
              }}
            >
              <BlockContainer contentWidth="Default">
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)' }}>
                  {productName && <Text size="L" weight="high" color="on-bold-high" align="center" as="span">{productName}</Text>}
                  {headline && <Display size="L" as="h1" color="on-bold-high" align="center" style={{ lineHeight: 1.1 }}>{headline}</Display>}
                </div>
              </BlockContainer>
              {(ctaText || cta2Text) && (
                <BlockContainer contentWidth="Default">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)', justifyContent: 'center' }}>
                    {ctaText && ctaLink && <Button appearance="primary" size="M" attention="high" onPress={() => handleCtaPress(ctaLink)}>{ctaText}</Button>}
                    {cta2Text && cta2Link && <Button appearance="primary" size="M" attention="medium" onPress={() => handleCtaPress(cta2Link)}>{cta2Text}</Button>}
                  </div>
                </BlockContainer>
              )}
            </div>
          </SurfaceProvider>
        </section>
      </BlockReveal>
    )
  }

  return (
    <BlockReveal>
    <section ref={sectionRef} style={{ width: '100%', position: 'relative' }}>
      {hasColouredBg && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100vw',
            height: purpleHeight,
            background: 'var(--ds-color-block-background-bold)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
      <SurfaceProvider level={0} hasBoldBackground={hasColouredBg}>
        <div style={{ position: 'relative', zIndex: 1 }}>
        <GridBlock as="div">
          <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-xl)' }}>
            {(productName || headline) && (
              <BlockContainer contentWidth="Default">
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
                  {productName && <Text size="L" weight="high" color={textColour} align="center" as="span">{productName}</Text>}
                  {headline && <Display size="L" as="h1" color={textColour} align="center" style={{ lineHeight: 1.1 }}>{headline}</Display>}
                </div>
              </BlockContainer>
            )}
            {subheadline && (
              <BlockContainer contentWidth="XS">
                <Text size="S" weight="low" color={subheadlineColour} align="center" as="p" style={{ margin: 0, lineHeight: 1.4, textAlign: 'center', whiteSpace: 'pre-line' }}>{subheadline}</Text>
              </BlockContainer>
            )}
            {(ctaText || cta2Text) && (
              <BlockContainer contentWidth="Default">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)', justifyContent: 'center' }}>
                  {ctaText && ctaLink && <Button appearance="primary" size="M" attention="high" onPress={() => handleCtaPress(ctaLink)}>{ctaText}</Button>}
                  {cta2Text && cta2Link && <Button appearance="primary" size="M" attention="medium" onPress={() => handleCtaPress(cta2Link)}>{cta2Text}</Button>}
                </div>
              </BlockContainer>
            )}
            <BlockContainer contentWidth="Wide" style={{ marginTop: 'var(--ds-spacing-xl)' }}>
              <div ref={imageRef} style={{ aspectRatio: '2 / 1', overflow: 'hidden', borderRadius: 'var(--ds-radius-card)' }}>
                {image ? (
                  <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--ds-color-background-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text size="M" weight="medium" color="low" as="span">Image 2:1</Text>
                  </div>
                )}
              </div>
            </BlockContainer>
          </div>
        </GridBlock>
        </div>
      </SurfaceProvider>
    </section>
    </BlockReveal>
  )
}
