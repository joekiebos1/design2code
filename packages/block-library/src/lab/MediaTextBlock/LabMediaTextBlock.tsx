'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Display,
  Headline,
  Title,
  Text,
  Label,
  Button,
  SurfaceProvider,
} from '@marcelinodzn/ds-react'
import { Grid, useCell } from '../../components/blocks/Grid'
import { WidthCap, SPACING_VAR } from '../../production/WidthCap'
import { BlockReveal } from '../../production/BlockReveal'
import { VideoWithControls } from '../../components/blocks/VideoWithControls'
import { StreamImage } from '../../components/blocks/StreamImage'
import { getSurfaceProviderProps, useBlockBackgroundColor } from '@design2code/ds'
import { EDGE_TO_EDGE_BREAKOUT, useEdgeToEdgeMediaStyles } from '@design2code/ds'
import type { MediaTextBlockProps } from './MediaTextBlock.types'
import {
  LAB_TYPOGRAPHY_VARS,
  labPlainBodyStyle,
  labPlainSubtitleStyle,
  labStyleTextStackedMediaBody,
} from '@design2code/ds'
import {
  labDisplayPreset,
  labHeadlinePresets,
  labLabelPreset,
  labTextPresets,
} from '@design2code/ds'

const ASPECT_RATIOS: Record<string, string> = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '3:4': '3 / 4',
  '2:1': '2 / 1',
  auto: 'auto',
}

export function LabMediaTextBlock({
  size,
  variant,
  width,
  mediaStyle,
  emphasis,
  minimalBackgroundStyle,
  appearance,
  spacing: _spacing,
  spacingTop: _spacingTop,
  spacingBottom: _spacingBottom,
  align,
  eyebrow,
  headline,
  subhead,
  body,
  descriptionTitle,
  descriptionBody,
  cta,
  ctaSecondary,
  media,
  imageSlot,
  imageState,
}: MediaTextBlockProps) {
  const router = useRouter()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const hasMedia = media?.src && media.src.trim() !== ''
  const isNarrow = width === 'M'
  const edgeStyles = useEdgeToEdgeMediaStyles()
  const isFullBleed = variant === 'full-bleed'
  const isEdgeToEdge = width === 'edgeToEdge'
  /** Edge to edge: no emphasis (ghost surface, no bold). */
  const surfaceProps = isEdgeToEdge
    ? { level: 0 as const, hasBoldBackground: false }
    : isFullBleed
      ? { level: 1 as const, hasBoldBackground: true }
      : getSurfaceProviderProps(emphasis)

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  /** Text alignment must match container alignment. When align is set, use it; otherwise default center. */
  const textAlign = (align === 'center' || align === 'left') ? align : 'center'
  /** DS Display / Headline use `align` for layout; CSS textAlign alone is not always enough. */
  const dsTextAlign = textAlign === 'center' ? 'center' : 'left'

  /** Left = L grid width. Center = M (title) / XS (body) for centered content. */
  const titleContentWidth = align === 'left' ? 'L' : 'M'
  const bodyContentWidth =
    align === 'left'
      ? (variant === 'text-only' ? 'S' : 'L')
      : 'XS'

  /** Text-only left: WidthCaps align to start of Default grid (no center margin). */
  const textOnlyLeftContainerStyle =
    variant === 'text-only' && align === 'left' ? { marginInline: 0 as const } : undefined

  const titleContent = (
    <WidthCap contentWidth={titleContentWidth} style={textOnlyLeftContainerStyle}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-m)',
          alignItems: textAlign === 'center' ? 'center' : 'flex-start',
          textAlign,
          width: '100%',
        }}
      >
        {eyebrow && (
          <Label {...labLabelPreset}>
            {eyebrow}
          </Label>
        )}
        {size === 'hero' && (
          <Display as="h1" align={dsTextAlign} {...labDisplayPreset} style={{ textAlign, whiteSpace: 'pre-line' }}>
            {headline}
          </Display>
        )}
        {size === 'feature' && (
          <Headline
            size="L"
            as="h2"
            align={dsTextAlign}
            {...labHeadlinePresets.block}
            style={{
              fontSize:
                variant === 'text-only'
                  ? LAB_TYPOGRAPHY_VARS.h2
                  : textAlign === 'center' || variant === 'full-bleed'
                    ? LAB_TYPOGRAPHY_VARS.h1
                    : LAB_TYPOGRAPHY_VARS.h2,
              textAlign,
              whiteSpace: 'pre-line',
            }}
          >
            {headline}
          </Headline>
        )}
        {size === 'editorial' && (
          <Title
            size="M"
            as="h2"
            style={{
              textAlign,
              whiteSpace: 'pre-line',
              fontWeight: LAB_TYPOGRAPHY_VARS.weightHigh,
            }}
          >
            {headline}
          </Title>
        )}
        {size !== 'hero' && subhead && (
          <Title
            size="S"
            as="h3"
            style={{
              textAlign,
              fontSize: LAB_TYPOGRAPHY_VARS.h5,
              fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
              lineHeight: 1.4,
            }}
          >
            {subhead}
          </Title>
        )}
      </div>
    </WidthCap>
  )

  /** Stacked layout: optional text above image (eyebrow, title, subhead, body) + optional image description below (card-style). */
  const stackedBlockStyle = variant === 'centered-media-below' && align === 'left' ? { marginInline: 0 } : undefined
  const hasTextAbove = Boolean(eyebrow || headline || subhead || body)
  const hasTextBelow = Boolean(descriptionTitle || descriptionBody)
  const stackedTitleContent =
    variant === 'centered-media-below' ? (
      <WidthCap contentWidth={titleContentWidth} style={stackedBlockStyle}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-m)',
            alignItems: textAlign === 'center' ? 'center' : 'flex-start',
            textAlign,
            width: '100%',
          }}
        >
          {eyebrow && (
            <Label {...labLabelPreset}>
              {eyebrow}
            </Label>
          )}
          {headline && (
            <>
              {size === 'hero' && (
                <Display as="h1" align={dsTextAlign} {...labDisplayPreset} style={{ textAlign, whiteSpace: 'pre-line' }}>
                  {headline}
                </Display>
              )}
              {size === 'feature' && (
                <Headline
                  size="L"
                  as="h2"
                  align={dsTextAlign}
                  {...labHeadlinePresets.block}
                  style={{
                    fontSize: LAB_TYPOGRAPHY_VARS.h2,
                    textAlign,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {headline}
                </Headline>
              )}
              {size === 'editorial' && (
                <Title
                  size="M"
                  as="h2"
                  style={{
                    textAlign,
                    fontSize: LAB_TYPOGRAPHY_VARS.h3,
                    whiteSpace: 'pre-line',
                    fontWeight: LAB_TYPOGRAPHY_VARS.weightHigh,
                  }}
                >
                  {headline}
                </Title>
              )}
            </>
          )}
          {size !== 'hero' && subhead && (
            <Title
              size="S"
              as="h3"
              style={{
                textAlign,
                whiteSpace: 'pre-line',
                fontSize: LAB_TYPOGRAPHY_VARS.h5,
                fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
                lineHeight: 1.4,
              }}
            >
              {subhead}
            </Title>
          )}
        </div>
      </WidthCap>
    ) : null

  const bodyContent =
    (size !== 'hero' && body) || (cta || ctaSecondary) ? (
        <WidthCap contentWidth={bodyContentWidth} style={{ ...(variant === 'centered-media-below' ? stackedBlockStyle : undefined), ...textOnlyLeftContainerStyle }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-l)',
            alignItems: textAlign === 'center' ? 'center' : 'flex-start',
            textAlign,
            width: '100%',
          }}
        >
          {size !== 'hero' && body && (
            <Text
              as="p"
              {...labTextPresets.body}
              style={{
                textAlign,
                whiteSpace: 'pre-line',
                ...labStyleTextStackedMediaBody,
              }}
            >
              {body}
            </Text>
          )}
          {(cta || ctaSecondary) && (
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-s)', flexWrap: 'wrap', marginTop: 'var(--ds-spacing-l)' }}>
              {cta && (() => {
                const appearance = cta.appearance ?? 'primary'
                const isGhost = appearance === 'ghost'
                return (
                  <Button
                    appearance={isGhost ? 'secondary' : appearance}
                    contained={!isGhost}
                    size="S"
                    onPress={() => handleCtaPress(cta.href)}
                  >
                    {cta.label}
                  </Button>
                )
              })()}
              {ctaSecondary && (
                <Button appearance="secondary" contained={false} size="S" onPress={() => handleCtaPress(ctaSecondary.href)}>
                  {ctaSecondary.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </WidthCap>
    ) : null

  const textContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-m)',
        alignItems: textAlign === 'center' ? 'center' : 'flex-start',
        paddingRight: 'var(--ds-spacing-l)',
      }}
    >
      {titleContent}
      {bodyContent}
    </div>
  )

  const useStreamImage = imageState && imageSlot && media?.type === 'image'
  const isStackedEdgeToEdge = variant === 'centered-media-below' && width === 'edgeToEdge'
  const mediaContent = hasMedia && media && (() => {
    const rawRatio = media.aspectRatio ?? '16:9'
    const ratio = rawRatio
    const aspectRatio = ASPECT_RATIOS[ratio] ?? '16 / 9'
    const isVideo = media.type === 'video'
    /** Stacked edge-to-edge: no rounded corners. */
    const useBorderRadius = mediaStyle === 'contained' && !isStackedEdgeToEdge

    if (isVideo) {
      return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: ratio === 'auto' ? undefined : aspectRatio, overflow: 'hidden', borderRadius: useBorderRadius ? 'var(--ds-radius-card-m)' : 0 }}>
          <VideoWithControls
            src={media.src}
            poster={media.poster}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      )
    }

    if (useStreamImage) {
      return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: ratio === 'auto' ? undefined : aspectRatio, overflow: 'hidden', borderRadius: useBorderRadius ? 'var(--ds-radius-card)' : 0 }}>
          <StreamImage
            slot={imageSlot}
            imageState={imageState}
            aspectRatio={aspectRatio.replace(/\s/g, '')}
          />
        </div>
      )
    }

    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: ratio === 'auto' ? undefined : aspectRatio, overflow: 'hidden', borderRadius: useBorderRadius ? 'var(--ds-radius-card)' : 0 }}>
        <Image
          src={media.src}
          alt={media.alt ?? ''}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    )
  })()

  /** Internal vertical padding for background colour: always Large (4xl) per spec. */
  const internalPaddingLarge = SPACING_VAR.large
  const cellMedia = useCell('L')
  const cellWide = useCell('XL')

  const bgColor = useBlockBackgroundColor(emphasis, appearance)
  const useGradient =
    emphasis === 'minimal' && minimalBackgroundStyle === 'gradient'
  /** Edge to edge: no emphasis (no background colour). */
  const background = isEdgeToEdge
    ? undefined
    : bgColor
      ? useGradient
        ? `linear-gradient(to bottom, white 0%, ${bgColor} 100%)`
        : bgColor
      : undefined

  /** Full-width background band. Band spans full viewport (100vw); content inside capped at 1920px. */
  const blockBgWrapper = (children: ReactNode) =>
    background ? (
      <div
        style={{
          ...EDGE_TO_EDGE_BREAKOUT,
          background,
          paddingBlockStart: internalPaddingLarge,
          paddingBlockEnd: internalPaddingLarge,
          minHeight: 1,
        }}
      >
        <div style={edgeStyles.inner}>
          {children}
        </div>
      </div>
    ) : (
      children
    )

  /** Edge-to-edge overlay/stacked media: wrap in capped container when no band (so media caps at 1920px). */
  const edgeToEdgeCappedWrapper = (children: ReactNode) =>
    !background && ((variant === 'full-bleed' && width === 'edgeToEdge') || (variant === 'centered-media-below' && width === 'edgeToEdge'))
      ? (
          <div style={EDGE_TO_EDGE_BREAKOUT}>
            <div style={edgeStyles.inner}>{children}</div>
          </div>
        )
      : children

  if (isNarrow) {
    return blockBgWrapper(
      <BlockReveal>
        <SurfaceProvider {...surfaceProps}>
          <Grid as="section">
            <div style={{ ...cellMedia, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ds-spacing-3xl)' }}>
              {titleContent}
              <WidthCap contentWidth="L">
                {mediaContent}
              </WidthCap>
              {bodyContent}
            </div>
          </Grid>
        </SurfaceProvider>
      </BlockReveal>
    )
  }

  if (variant === 'full-bleed' && hasMedia && media) {
    const ratio = media.aspectRatio ?? '16:9'
    const aspectRatio = ASPECT_RATIOS[ratio] ?? '16 / 9'
    const isVideo = media.type === 'video'
    const isOverlayContained = width === 'L'

    if (isOverlayContained) {
      return blockBgWrapper(
        <BlockReveal>
          <SurfaceProvider {...surfaceProps}>
            <Grid as="section">
              <div style={{ ...cellWide }}>
                <WidthCap contentWidth="XL">
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio,
                      overflow: 'hidden',
                      borderRadius: 'var(--ds-radius-card-m)',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0 }}>
                      {isVideo ? (
                        <VideoWithControls
                          src={media.src}
                          poster={media.poster}
                          prefersReducedMotion={prefersReducedMotion}
                        />
                      ) : (
                        <Image src={media.src} alt={media.alt ?? ''} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 80vw" />
                      )}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, var(--local-color-overlay-dark) 0%, transparent 60%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        paddingBlock: 'var(--ds-spacing-3xl)',
                        paddingInline: 0,
                      }}
                    >
                      {align === 'left' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)', alignItems: 'flex-start', paddingInlineStart: 'var(--ds-spacing-3xl)' }}>
                          {textContent}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)', alignItems: 'center', width: '100%' }}>
                          {textContent}
                        </div>
                      )}
                    </div>
                  </div>
                </WidthCap>
              </div>
            </Grid>
          </SurfaceProvider>
        </BlockReveal>
      )
    }

    return edgeToEdgeCappedWrapper(
      blockBgWrapper(
        <BlockReveal>
          <SurfaceProvider {...surfaceProps}>
            <section style={{ position: 'relative', aspectRatio, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                {isVideo ? (
                  <VideoWithControls
                    src={media.src}
                    poster={media.poster}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ) : (
                  <Image src={media.src} alt={media.alt ?? ''} fill style={{ objectFit: 'cover' }} sizes="100vw" />
                )}
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, var(--local-color-overlay-dark) 0%, transparent 60%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  paddingBlock: 'var(--ds-spacing-3xl)',
                  paddingInline: 0,
                }}
              >
                {align === 'left' ? (
                  <Grid as="div">
                    <div style={{ ...cellMedia, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)', alignItems: 'flex-start', paddingInlineStart: 'var(--ds-spacing-3xl)' }}>
                      {textContent}
                    </div>
                  </Grid>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)', alignItems: 'center', width: '100%' }}>
                    {textContent}
                  </div>
                )}
              </div>
            </section>
          </SurfaceProvider>
        </BlockReveal>
      )
    )
  }

  if (variant === 'text-only') {
    const textOnlyAlignItems = textAlign === 'center' ? 'center' : 'flex-start'
    return blockBgWrapper(
      <BlockReveal>
        <SurfaceProvider {...surfaceProps}>
          <Grid as="section">
            <div style={{ ...cellMedia, display: 'flex', flexDirection: 'column', alignItems: textOnlyAlignItems, gap: 'var(--ds-spacing-l)' }}>
              {titleContent}
              {bodyContent}
            </div>
          </Grid>
        </SurfaceProvider>
      </BlockReveal>
    )
  }

  if (variant === 'centered-media-below' && hasMedia) {
    const stackedIsEdgeToEdge = width === 'edgeToEdge'
    /** Must match `textAlign` (default centre when CMS align is unset), not raw `align`. */
    const stackedAlignItems = textAlign === 'center' ? 'center' : 'flex-start'
    const textAlignStacked = textAlign

    /** Text above image: eyebrow, title, subhead, body. */
    const stackedTextAbove = hasTextAbove && (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: stackedAlignItems,
          gap: 'var(--ds-spacing-l)',
        }}
      >
        {stackedTitleContent}
        {bodyContent}
      </div>
    )

    const showStackedTextAbove = Boolean(stackedTextAbove)

    /** Image description below: card-style typography (h5 + label-s). Same width as production stacked (WidthCap S). */
    const stackedTextBelow = hasTextBelow ? (
      <WidthCap
        contentWidth="S"
        style={{
          ...(stackedAlignItems === 'flex-start' ? { marginInline: 0 } : {}),
          textAlign: textAlignStacked,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: stackedAlignItems === 'center' ? 'center' : 'flex-start',
            gap: 'var(--ds-spacing-m)',
            width: '100%',
            minWidth: 0,
          }}
        >
          {descriptionTitle ? (
            <p
              style={{
                margin: 0,
                width: '100%',
                whiteSpace: 'pre-line',
                ...labPlainSubtitleStyle(),
              }}
            >
              {descriptionTitle}
            </p>
          ) : null}
          {descriptionBody ? (
            <p
              style={{
                margin: 0,
                width: '100%',
                whiteSpace: 'pre-line',
                ...labPlainBodyStyle(),
              }}
            >
              {descriptionBody}
            </p>
          ) : null}
        </div>
      </WidthCap>
    ) : null

    const stackedMediaBlock = stackedIsEdgeToEdge ? (
      <div style={EDGE_TO_EDGE_BREAKOUT}>
        <div style={edgeStyles.inner}>
          {mediaContent}
        </div>
      </div>
    ) : (
      <div style={{ width: '100%' }}>{mediaContent}</div>
    )

    const gridWrappedSection = (children: React.ReactNode) => (
      <Grid as="div">
        <div
          style={{
            ...cellMedia,
            display: 'flex',
            flexDirection: 'column',
            alignItems: stackedAlignItems,
            gap: 'var(--ds-spacing-l)',
          }}
        >
          {children}
        </div>
      </Grid>
    )

    return blockBgWrapper(
      <BlockReveal>
        <SurfaceProvider {...surfaceProps}>
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: stackedAlignItems,
              gap: 0,
            }}
          >
            {stackedIsEdgeToEdge ? (
              <>
                {stackedTextAbove &&
                  (textAlign !== 'center'
                    ? gridWrappedSection(stackedTextAbove)
                    : stackedTextAbove)}
                <div
                  style={{
                    marginBlockStart: showStackedTextAbove ? 'var(--ds-spacing-4xl)' : 0,
                    width: '100%',
                  }}
                >
                  {stackedMediaBlock}
                </div>
                {hasTextBelow &&
                  gridWrappedSection(
                    <div style={{ marginBlockStart: 'var(--ds-spacing-l)', width: '100%' }}>{stackedTextBelow}</div>,
                  )}
              </>
            ) : (
              <Grid as="div">
                <div style={{ ...cellMedia }}>
                  <WidthCap contentWidth="L">
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: stackedAlignItems,
                        gap: 0,
                      }}
                    >
                      {stackedTextAbove}
                      <div
                        style={{
                          marginBlockStart: showStackedTextAbove ? 'var(--ds-spacing-4xl)' : 0,
                          width: '100%',
                        }}
                      >
                        {stackedMediaBlock}
                      </div>
                      {hasTextBelow ? (
                        <div style={{ marginBlockStart: 'var(--ds-spacing-l)', width: '100%' }}>{stackedTextBelow}</div>
                      ) : null}
                    </div>
                  </WidthCap>
                </div>
              </Grid>
            )}
          </section>
        </SurfaceProvider>
      </BlockReveal>
    )
  }

  return blockBgWrapper(
    <BlockReveal>
      <SurfaceProvider {...surfaceProps}>
        <Grid as="section">
          <div style={{ ...cellMedia, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'center', gap: 'var(--ds-spacing-l)' }}>
            {titleContent}
            {bodyContent}
          </div>
        </Grid>
      </SurfaceProvider>
    </BlockReveal>
  )
}
