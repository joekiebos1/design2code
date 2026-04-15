'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type TransitionEvent,
} from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Headline,
  Text,
  Icon,
  IcChevronDown,
  IcChevronUp,
  SurfaceProvider,
  Button,
} from '@marcelinodzn/ds-react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Grid, useCell } from '../../components/blocks/Grid'
import { WidthCap, type ContentWidth } from '../WidthCap'
import { useGridBreakpoint } from '@design2code/ds'
import { VideoWithControls } from '../../components/blocks/VideoWithControls'
import { StreamImage } from '../../components/blocks/StreamImage'
import { getSurfaceProviderProps, useBlockBackgroundColor } from '@design2code/ds'
import { EDGE_TO_EDGE_BREAKOUT } from '@design2code/ds'
import { useCarouselReveal } from '@design2code/ds'
import type {
  MediaText5050AccordionRow,
  MediaText5050BlockProps,
  MediaText5050Item,
  MediaText5050Media,
  MediaText5050Variant,
} from './MediaText5050Block.types'
import {
  labStyleHeadlineAltDefault,
  labStyleHeadlineAltProminent,
} from '@design2code/ds'
import { labHeadlinePresets, labTextPresets } from '@design2code/ds'
import {
  labBlockFramingDescriptionStyle,
  labBlockFramingIntroStackStyle,
  labBlockFramingTitleStyle,
} from '../../lab-utils/lab-block-framing-typography'
import { hasLabBlockFraming } from '../../lab-utils/has-lab-block-framing'
import accordionStyles from './MediaText5050Accordion.module.css'

const ASPECT_RATIOS: Record<string, string> = {
  '5:4': '5 / 4',
  '1:1': '1 / 1',
  '4:5': '4 / 5',
}

function mediaKey(m: MediaText5050Media | undefined): string {
  return m?.src ? `${m.type}:${m.src}` : ''
}

function AccordionItem({
  item,
  isLast,
  open,
  onOpenChange,
  prefersReducedMotion,
  titleContentWidth,
  bodyContentWidth,
  widthCapSideStyle,
  rowRevealStyle,
}: {
  item: MediaText5050Item
  isLast: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  prefersReducedMotion: boolean
  titleContentWidth: ContentWidth
  bodyContentWidth: ContentWidth
  widthCapSideStyle?: CSSProperties
  rowRevealStyle?: CSSProperties
}) {
  const panelId = useId()
  const headerId = useId()
  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  /** Standard accordion motion: animate row track; content moves with the clip (no Base UI). */
  const panelRowTransition = prefersReducedMotion
    ? undefined
    : createTransition('grid-template-rows', 'l', 'transition', motionLevel)

  return (
    <div
      style={{
        borderBottom: isLast ? undefined : '1px solid var(--ds-color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        width: '100%',
      }}
    >
      <div style={rowRevealStyle}>
        <div
          style={{
            padding: 'var(--ds-spacing-m) 0',
            minHeight: 'var(--ds-spacing-2xl)',
            width: '100%',
          }}
        >
          <WidthCap
            contentWidth={titleContentWidth}
            style={{ width: '100%', ...widthCapSideStyle }}
          >
            <button
              type="button"
              id={headerId}
              className={accordionStyles.trigger}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => onOpenChange(!open)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-m)',
                width: '100%',
                border: 'none',
                background: 'none',
                padding: 0,
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                {item.subtitle ? (
                  <Headline
                    size="S"
                    as="span"
                    {...labHeadlinePresets.blockAlt}
                    style={{
                      margin: 0,
                      display: 'block',
                      width: '100%',
                      whiteSpace: 'pre-line',
                      ...labStyleHeadlineAltDefault,
                    }}
                  >
                    {item.subtitle}
                  </Headline>
                ) : null}
              </span>
              <Icon
                asset={open ? <IcChevronUp /> : <IcChevronDown />}
                size="L"
                appearance="secondary"
              />
            </button>
          </WidthCap>
        </div>
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: panelRowTransition,
        }}
      >
        <div style={{ minHeight: 0, overflow: 'hidden' }}>
          <div style={{ paddingBottom: 'var(--ds-spacing-m)' }}>
            {item.body ? (
              <WidthCap contentWidth={bodyContentWidth} style={widthCapSideStyle}>
                <Text as="p" {...labTextPresets.body} style={{ margin: 0, whiteSpace: 'pre-line' }}>
                  {item.body}
                </Text>
              </WidthCap>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

type MediaText5050CrossfadeMediaProps = {
  displayMedia: MediaText5050Media | undefined
  aspectRatio: string | undefined
  prefersReducedMotion: boolean
  useStreamImage: boolean
  imageSlot: string | null | undefined
  imageState: MediaText5050BlockProps['imageState']
}

type CrossfadeSlot = 0 | 1

/**
 * Cross-fades between accordion panel media when `src` changes; instant swap when reduced motion.
 */
function MediaText5050CrossfadeMedia({
  displayMedia,
  aspectRatio,
  prefersReducedMotion,
  useStreamImage,
  imageSlot,
  imageState,
}: MediaText5050CrossfadeMediaProps) {
  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  const fadeTransition = prefersReducedMotion ? undefined : createTransition('opacity', 'l', 'transition', motionLevel)

  const prevKeyRef = useRef(mediaKey(displayMedia))
  const activeSlotRef = useRef<CrossfadeSlot>(0)
  const pendingIncomingRef = useRef<CrossfadeSlot | null>(null)

  const [slotMedia, setSlotMedia] = useState<
    [MediaText5050Media | undefined, MediaText5050Media | undefined]
  >([displayMedia, undefined])
  const [slotOpacity, setSlotOpacity] = useState<[number, number]>([1, 0])

  useLayoutEffect(() => {
    const nextKey = mediaKey(displayMedia)
    if (nextKey === prevKeyRef.current) return
    prevKeyRef.current = nextKey

    if (!displayMedia?.src) {
      pendingIncomingRef.current = null
      setSlotMedia([undefined, undefined])
      setSlotOpacity([1, 0])
      activeSlotRef.current = 0
      return
    }

    if (prefersReducedMotion) {
      pendingIncomingRef.current = null
      setSlotMedia([displayMedia, undefined])
      setSlotOpacity([1, 0])
      activeSlotRef.current = 0
      return
    }

    const idle: CrossfadeSlot = activeSlotRef.current
    const incoming: CrossfadeSlot = idle === 0 ? 1 : 0
    pendingIncomingRef.current = incoming

    setSlotMedia((sm) => {
      const next: [MediaText5050Media | undefined, MediaText5050Media | undefined] = [...sm]
      next[incoming] = displayMedia
      return next
    })
    setSlotOpacity((op) => {
      const next: [number, number] = [...op]
      next[incoming] = 0
      next[idle] = 1
      return next
    })

    requestAnimationFrame(() => {
      setSlotOpacity((op) => {
        const next: [number, number] = [...op]
        next[incoming] = 1
        next[idle] = 0
        return next
      })
    })
  }, [displayMedia, prefersReducedMotion])

  const onOpacityTransitionEnd = (slot: CrossfadeSlot, e: TransitionEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    if (e.propertyName !== 'opacity') return
    if (pendingIncomingRef.current !== slot) return
    pendingIncomingRef.current = null
    activeSlotRef.current = slot
    const other: CrossfadeSlot = slot === 0 ? 1 : 0
    setSlotMedia((sm) => {
      const next: [MediaText5050Media | undefined, MediaText5050Media | undefined] = [...sm]
      next[other] = undefined
      return next
    })
    setSlotOpacity(() => {
      const next: [number, number] = [0, 0]
      next[slot] = 1
      return next
    })
  }

  const renderSlot = (slot: CrossfadeSlot) => {
    const m = slotMedia[slot]
    const opacity = slotOpacity[slot]
    if (!m?.src) return null
    const isVideo = m.type === 'video'
    const boxStyle: CSSProperties = {
      position: 'absolute',
      inset: 0,
      opacity,
      transition: fadeTransition,
      borderRadius: 'var(--ds-radius-card-m)',
      overflow: 'hidden',
    }
    if (isVideo) {
      return (
        <div
          key={`${slot}-v-${m.src}`}
          style={boxStyle}
          onTransitionEnd={(e) => onOpacityTransitionEnd(slot, e)}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%', aspectRatio }}>
            <VideoWithControls src={m.src} poster={m.poster} prefersReducedMotion={prefersReducedMotion} />
          </div>
        </div>
      )
    }
    if (useStreamImage && m.type === 'image' && imageSlot && imageState) {
      return (
        <div
          key={`${slot}-s-${m.src}`}
          style={boxStyle}
          onTransitionEnd={(e) => onOpacityTransitionEnd(slot, e)}
        >
          <div style={{ position: 'relative', width: '100%', aspectRatio }}>
            <StreamImage
              slot={imageSlot}
              imageState={imageState}
              aspectRatio={aspectRatio ? aspectRatio.replace(/\s/g, '') : undefined}
            />
          </div>
        </div>
      )
    }
    return (
      <div
        key={`${slot}-i-${m.src}`}
        style={boxStyle}
        onTransitionEnd={(e) => onOpacityTransitionEnd(slot, e)}
      >
        <div style={{ position: 'relative', width: '100%', aspectRatio }}>
          <Image
            src={m.src}
            alt={m.alt ?? ''}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio }}>
      {renderSlot(0)}
      {renderSlot(1)}
    </div>
  )
}

export function MediaText5050Block({
  variant,
  paragraphColumnLayout,
  imagePosition = 'right',
  emphasis,
  minimalBackgroundStyle,
  appearance,
  spacingTop: _spacingTop,
  spacingBottom: _spacingBottom,
  headline,
  description,
  callToActions,
  blockFramingAlignment = 'left',
  items = [],
  singleSubtitle,
  singleBody,
  accordionItems,
  media,
  imageSlot,
  imageState,
}: MediaText5050BlockProps) {
  const router = useRouter()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  /** `null` = all panels closed — media column uses first panel’s asset (index 0). */
  const [accordionOpenIndex, setAccordionOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const accordionRows: MediaText5050AccordionRow[] =
    variant === 'accordion' ? (accordionItems ?? []) : []

  const mediaIndexForAccordion =
    variant === 'accordion' && accordionRows.length > 0
      ? accordionOpenIndex !== null && accordionOpenIndex >= 0 && accordionOpenIndex < accordionRows.length
        ? accordionOpenIndex
        : 0
      : 0

  const rowMediaForDisplay =
    variant === 'accordion' && accordionRows.length > 0
      ? accordionRows[mediaIndexForAccordion]?.media
      : undefined

  const displayMedia: MediaText5050Media | undefined =
    variant === 'accordion' ? (rowMediaForDisplay ?? media) : media

  const hasMedia = Boolean(displayMedia?.src && displayMedia.src.trim() !== '')
  const mediaFirst = imagePosition === 'left'
  const surfaceProps = getSurfaceProviderProps(emphasis)
  const { isStacked, isMobile } = useGridBreakpoint()

  const aspectRatio = displayMedia?.aspectRatio ? ASPECT_RATIOS[displayMedia.aspectRatio] : undefined
  const isVideo = displayMedia?.type === 'video'
  const isParagraphLikeVariant =
    variant === 'paragraphs' || variant === 'singleParagraph' || variant === 'multiParagraph'

  const useStreamImage =
    isParagraphLikeVariant &&
    Boolean(imageState && imageSlot && displayMedia?.type === 'image' && displayMedia === media)

  const useSingleParagraphColumn =
    variant === 'singleParagraph' ||
    (variant === 'paragraphs' && paragraphColumnLayout === 'single')
  const paragraphItemGap = 'var(--ds-spacing-m)'
  const showBlockFraming = hasLabBlockFraming(headline, description, callToActions)
  const framingTextAlign = blockFramingAlignment === 'center' ? 'center' : 'left'
  const framingTitleContentWidth: ContentWidth = framingTextAlign === 'center' ? 'M' : 'L'
  const framingBodyContentWidth: ContentWidth = framingTextAlign === 'center' ? 'XS' : 'L'
  const framingWidthCapSideStyle: CSSProperties | undefined =
    framingTextAlign === 'center' ? undefined : { marginInline: 0 as const }
  const framingStackStyle: CSSProperties = {
    ...labBlockFramingIntroStackStyle,
    alignItems: framingTextAlign === 'center' ? 'center' : 'flex-start',
    textAlign: framingTextAlign,
  }
  const framingTitleStyleMerged: CSSProperties = {
    ...labBlockFramingTitleStyle(isMobile),
    textAlign: framingTextAlign,
  }
  const framingDescriptionStyleMerged: CSSProperties = {
    ...labBlockFramingDescriptionStyle,
    textAlign: framingTextAlign,
  }
  const hasFramingBodyBand = Boolean(description) || Boolean(callToActions && callToActions.length > 0)

  const textStaggerCount =
    variant === 'accordion'
      ? accordionRows.length
      : useSingleParagraphColumn
        ? (singleSubtitle ? 1 : 0) + (singleBody ? 1 : 0)
        : items.length

  let slot = 0
  const slotHeadline = showBlockFraming && headline ? slot++ : -1
  const slotFramingBand = hasFramingBodyBand ? slot++ : -1
  const slotMedia = hasMedia ? slot++ : -1
  const textSlotsStart = slot
  const rawStagger = slot + textStaggerCount
  const revealN = Math.max(rawStagger, 1)
  const { ref: revealRef, isVisible, prefersReducedMotion: prReveal } = useCarouselReveal(revealN)
  const motionLevel = prReveal ? 'subtle' : 'moderate'
  const entranceTransition = prReveal
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)

  const getRevealStyle = (s: number): CSSProperties => {
    if (rawStagger < 1 || prReveal) return {}
    if (s < 0 || s >= rawStagger) return {}
    return {
      opacity: isVisible(s) ? 1 : 0,
      transform: isVisible(s) ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
      transition: entranceTransition,
    }
  }

  const mediaContent =
    hasMedia &&
    displayMedia &&
    (() => {
      if (variant === 'accordion' && !prefersReducedMotion) {
        return (
          <MediaText5050CrossfadeMedia
            displayMedia={displayMedia}
            aspectRatio={aspectRatio}
            prefersReducedMotion={prefersReducedMotion}
            useStreamImage={false}
            imageSlot={imageSlot}
            imageState={imageState}
          />
        )
      }

      if (isVideo) {
        return (
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio,
              overflow: 'hidden',
              borderRadius: 'var(--ds-radius-card-m)',
            }}
          >
            <VideoWithControls
              src={displayMedia.src}
              poster={displayMedia.poster}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        )
      }

      if (useStreamImage) {
        return (
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio,
              overflow: 'hidden',
              borderRadius: 'var(--ds-radius-card-m)',
            }}
          >
            <StreamImage
              slot={imageSlot!}
              imageState={imageState!}
              aspectRatio={aspectRatio ? aspectRatio.replace(/\s/g, '') : undefined}
            />
          </div>
        )
      }

      return (
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio,
            overflow: 'hidden',
            borderRadius: 'var(--ds-radius-card-m)',
          }}
        >
          <Image
            src={displayMedia.src}
            alt={displayMedia.alt ?? ''}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )
    })()

  const INNER_COLUMN_GAP = 'var(--ds-grid-gutter)'
  const TEXT_COLUMN_INSET = 'var(--ds-spacing-3xl)'
  const textColumnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--ds-spacing-m)',
    alignItems: blockFramingAlignment === 'center' ? 'center' : 'flex-start',
    minWidth: 0,
    ...(!isStacked &&
      (mediaFirst ? { paddingLeft: TEXT_COLUMN_INSET } : { paddingRight: TEXT_COLUMN_INSET })),
  }

  const bgColor = useBlockBackgroundColor(emphasis, appearance)
  const useGradient = emphasis === 'minimal' && minimalBackgroundStyle === 'gradient'
  const background = bgColor
    ? useGradient
      ? `linear-gradient(to bottom, white 0%, ${bgColor} 100%)`
      : bgColor
    : undefined

  const blockBgWrapper = (children: ReactNode) =>
    background ? (
      <div
        style={{
          ...EDGE_TO_EDGE_BREAKOUT,
          background,
          paddingBlockStart: 'var(--ds-spacing-4xl)',
          paddingBlockEnd: 'var(--ds-spacing-4xl)',
          minHeight: 1,
        }}
      >
        {children}
      </div>
    ) : (
      children
    )

  const blockFramingIntro = showBlockFraming ? (
    <div style={framingStackStyle}>
      {headline ? (
        <div style={getRevealStyle(slotHeadline)}>
          <WidthCap contentWidth={framingTitleContentWidth} style={framingWidthCapSideStyle}>
            <Headline
              size="M"
              as="h2"
              {...labHeadlinePresets.block}
              style={{ ...framingTitleStyleMerged, width: '100%' }}
            >
              {headline}
            </Headline>
          </WidthCap>
        </div>
      ) : null}
      {hasFramingBodyBand ? (
        <div style={getRevealStyle(slotFramingBand)}>
          <WidthCap contentWidth={framingBodyContentWidth} style={framingWidthCapSideStyle}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-m)',
                alignItems: framingTextAlign === 'center' ? 'center' : 'flex-start',
                width: '100%',
              }}
            >
              {description ? (
                <Text
                  as="p"
                  {...labTextPresets.framingIntro}
                  size="S"
                  weight="low"
                  style={framingDescriptionStyleMerged}
                >
                  {description}
                </Text>
              ) : null}
              {callToActions?.filter((a) => a?.label?.trim()).length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: blockFramingAlignment === 'center' ? 'center' : 'flex-start', gap: 'var(--ds-spacing-m)' }}>
                  {callToActions.filter((a) => a.label.trim()).map((a) => (
                    <Button
                      key={a.label}
                      appearance={a.style === 'outlined' ? 'secondary' : 'primary'}
                      size="M"
                      attention="high"
                      onPress={() => {
                        const h = (a.link ?? '').trim()
                        if (!h) return
                        if (h.startsWith('/')) router.push(h)
                        else window.location.href = h
                      }}
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </WidthCap>
        </div>
      ) : null}
    </div>
  ) : null

  const paragraphsContent = useSingleParagraphColumn ? (
    <div style={textColumnStyle}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: paragraphItemGap,
          width: '100%',
        }}
      >
        {singleSubtitle ? (
          <div style={getRevealStyle(textSlotsStart)}>
            <WidthCap contentWidth={framingTitleContentWidth} style={framingWidthCapSideStyle}>
              <Headline
                size="M"
                as="h2"
                {...labHeadlinePresets.blockAlt}
                style={{
                  margin: 0,
                  width: '100%',
                  whiteSpace: 'pre-line',
                  ...labStyleHeadlineAltProminent,
                }}
              >
                {singleSubtitle}
              </Headline>
            </WidthCap>
          </div>
        ) : null}
        {singleBody ? (
          <div style={getRevealStyle(textSlotsStart + (singleSubtitle ? 1 : 0))}>
            <WidthCap contentWidth={framingBodyContentWidth} style={framingWidthCapSideStyle}>
              <Text as="p" {...labTextPresets.bodyLead} style={{ margin: 0, whiteSpace: 'pre-line' }}>
                {singleBody}
              </Text>
            </WidthCap>
          </div>
        ) : null}
      </div>
    </div>
  ) : (
    <div style={textColumnStyle}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            ...getRevealStyle(textSlotsStart + i),
            display: 'flex',
            flexDirection: 'column',
            gap: paragraphItemGap,
            paddingTop: i > 0 ? 'var(--ds-spacing-m)' : undefined,
            paddingBottom: i < items.length - 1 ? 'var(--ds-spacing-m)' : undefined,
            borderBottom:
              i < items.length - 1 ? '1px solid var(--ds-color-border-subtle)' : undefined,
            width: '100%',
          }}
        >
          {item.subtitle ? (
            <WidthCap contentWidth={framingTitleContentWidth} style={framingWidthCapSideStyle}>
              <Headline
                size="M"
                as="h3"
                {...labHeadlinePresets.blockAlt}
                style={{
                  margin: 0,
                  width: '100%',
                  whiteSpace: 'pre-line',
                  ...labStyleHeadlineAltDefault,
                }}
              >
                {item.subtitle}
              </Headline>
            </WidthCap>
          ) : null}
          {item.body ? (
            <WidthCap contentWidth={framingBodyContentWidth} style={framingWidthCapSideStyle}>
              <Text as="p" {...labTextPresets.body} style={{ margin: 0, whiteSpace: 'pre-line' }}>
                {item.body}
              </Text>
            </WidthCap>
          ) : null}
        </div>
      ))}
    </div>
  )

  const accordionContent = (
    <div style={{ ...textColumnStyle, gap: 0 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          alignItems: 'stretch',
          minWidth: 0,
          width: '100%',
        }}
      >
        {accordionRows.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            isLast={i === accordionRows.length - 1}
            open={accordionOpenIndex === i}
            onOpenChange={(open) => setAccordionOpenIndex(open ? i : null)}
            prefersReducedMotion={prefersReducedMotion}
            titleContentWidth={framingTitleContentWidth}
            bodyContentWidth={framingBodyContentWidth}
            widthCapSideStyle={framingWidthCapSideStyle}
            rowRevealStyle={getRevealStyle(textSlotsStart + i)}
          />
        ))}
      </div>
    </div>
  )

  const textContentByVariant: Record<MediaText5050Variant, JSX.Element> = {
    paragraphs: paragraphsContent,
    singleParagraph: paragraphsContent,
    multiParagraph: paragraphsContent,
    accordion: accordionContent,
  }

  const textContent = textContentByVariant[variant]

  const textOnlyCell = useCell('L')

  const innerGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: INNER_COLUMN_GAP,
    alignItems: 'center',
    minWidth: 0,
  }

  const mediaWrapStyle: CSSProperties =
    slotMedia >= 0 ? { ...getRevealStyle(slotMedia), position: 'relative', minWidth: 0 } : { position: 'relative', minWidth: 0 }

  const stackedContent = !hasMedia ? (
    <Grid as="section">
      <div style={{ ...textOnlyCell, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {blockFramingIntro != null ? (
          <div style={{ marginBottom: 'var(--ds-spacing-4xl)', width: '100%' }}>{blockFramingIntro}</div>
        ) : null}
        {textContent}
      </div>
    </Grid>
  ) : isStacked ? (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3xl)' }}>
      {blockFramingIntro != null ? (
        <WidthCap
          contentWidth="L"
          style={blockFramingAlignment === 'left' ? { marginInline: 0 } : undefined}
        >
          <div style={{ width: '100%' }}>{blockFramingIntro}</div>
        </WidthCap>
      ) : null}
      {mediaFirst ? (
        <>
          <WidthCap contentWidth="XL">
            <div style={mediaWrapStyle}>{mediaContent}</div>
          </WidthCap>
          <WidthCap contentWidth="L">
            <div style={textColumnStyle}>{textContent}</div>
          </WidthCap>
        </>
      ) : (
        <>
          <WidthCap contentWidth="L">
            <div style={textColumnStyle}>{textContent}</div>
          </WidthCap>
          <WidthCap contentWidth="XL">
            <div style={mediaWrapStyle}>{mediaContent}</div>
          </WidthCap>
        </>
      )}
    </section>
  ) : (
    <Grid as="section">
      <div style={{ ...textOnlyCell, minWidth: 0 }}>
        {blockFramingIntro != null ? (
          <div style={{ marginBottom: 'var(--ds-spacing-4xl)', width: '100%' }}>{blockFramingIntro}</div>
        ) : null}
        <div style={innerGridStyle}>
          {mediaFirst ? (
            <>
              <div style={mediaWrapStyle}>{mediaContent}</div>
              <div style={{ ...textColumnStyle, minWidth: 0 }}>{textContent}</div>
            </>
          ) : (
            <>
              <div style={{ ...textColumnStyle, minWidth: 0 }}>{textContent}</div>
              <div style={mediaWrapStyle}>{mediaContent}</div>
            </>
          )}
        </div>
      </div>
    </Grid>
  )

  return blockBgWrapper(
    <SurfaceProvider {...surfaceProps}>
      <div ref={revealRef} style={{ width: '100%' }}>
        {stackedContent}
      </div>
    </SurfaceProvider>
  )
}
