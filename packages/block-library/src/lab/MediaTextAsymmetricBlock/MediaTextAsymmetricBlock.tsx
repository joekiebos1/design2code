'use client'

import { useId, useState, type CSSProperties, type MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Headline, Text, Icon, IcChevronDown, IcChevronUp } from '@marcelinodzn/ds-react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import accordionStyles from '../../production/MediaText5050Block/MediaText5050Accordion.module.css'
import { Grid, useCell } from '../../components/blocks/Grid'
import { useGridBreakpoint } from '@design2code/ds'
import { useCarouselReveal } from '@design2code/ds'
import {
  getHeadlineSize,
  getChildLevel,
  normalizeHeadingLevel,
  type HeadingLevel,
} from '@design2code/ds'
import {
  labPlainBodyStyle,
  labStyleHeadlineVariantRail,
  labStyleTextInteractiveLink,
  labStyleTextSubtitleTokenH5,
} from '@design2code/ds'
import { labHeadlinePresets, labTextPresets } from '@design2code/ds'
import type {
  LabMediaTextAsymmetricBlockProps,
  LabMediaTextAsymmetricImageAspectRatio,
  LabMediaTextAsymmetricParagraphRow,
} from './LabMediaTextAsymmetricBlock.types'
import type {
  MediaTextAsymmetricFaqItem,
  MediaTextAsymmetricLinkItem,
} from '../../shared/media-text-asymmetric-shared.types'

const MAIN_IMAGE_ASPECT_CSS: Record<LabMediaTextAsymmetricImageAspectRatio, string> = {
  '5:4': '5 / 4',
  '1:1': '1 / 1',
  '4:5': '4 / 5',
}

function handleLinkPress(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith('/')) router.push(href)
  else window.location.href = href
}

function MainColumnImage({
  src,
  alt,
  aspectRatio,
}: {
  src: string
  alt: string
  aspectRatio: LabMediaTextAsymmetricImageAspectRatio
}) {
  const ar = MAIN_IMAGE_ASPECT_CSS[aspectRatio]
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: ar,
        overflow: 'hidden',
        borderRadius: 'var(--ds-radius-card-m)',
      }}
    >
      <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 40vw" />
    </div>
  )
}

function ParagraphRow({
  row,
  itemLevel,
  router,
  openInNewTab,
  revealStyle,
}: {
  row: LabMediaTextAsymmetricParagraphRow & { body: string }
  itemLevel: HeadingLevel
  router: ReturnType<typeof useRouter>
  openInNewTab?: boolean
  revealStyle?: CSSProperties
}) {
  const hasLink = row.linkText && row.linkUrl
  const linkProps = hasLink
    ? openInNewTab
      ? { target: '_blank' as const, rel: 'noopener noreferrer' }
      : {
          onClick: (e: MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault()
            handleLinkPress(row.linkUrl!, router)
          },
        }
    : {}
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-xs)',
        ...revealStyle,
      }}
    >
      {row.title && String(row.title).trim().length > 0 && (
        <Text
          as={itemLevel}
          {...labTextPresets.subtitle}
          style={{
            margin: 0,
            whiteSpace: 'pre-line',
            ...labStyleTextSubtitleTokenH5,
          }}
        >
          {row.title}
        </Text>
      )}
      <Text
        as="p"
        {...labTextPresets.body}
        style={{
          margin: 0,
          whiteSpace: 'pre-line',
        }}
      >
        {row.body}
      </Text>
      {hasLink && (
        <a
          href={row.linkUrl!}
          {...linkProps}
          style={labPlainBodyStyle({
            marginTop: 'var(--ds-spacing-xs)',
            textDecoration: 'underline',
            cursor: 'pointer',
          })}
        >
          {row.linkText}
        </a>
      )}
    </div>
  )
}

function FaqItem({
  item,
  itemLevel: _itemLevel,
  prefersReducedMotion,
  open,
  onOpenChange,
  rowRevealStyle,
}: {
  item: MediaTextAsymmetricFaqItem
  itemLevel: HeadingLevel
  prefersReducedMotion: boolean
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  rowRevealStyle?: CSSProperties
}) {
  const panelId = useId()
  const headerId = useId()
  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  const panelRowTransition = prefersReducedMotion
    ? undefined
    : createTransition('grid-template-rows', 'l', 'transition', motionLevel)

  return (
    <div
      style={{
        borderBottom: '1px solid var(--ds-color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        width: '100%',
        ...rowRevealStyle,
      }}
    >
      <div style={{ padding: 'var(--ds-spacing-m) 0' }}>
        <button
          type="button"
          id={headerId}
          className={accordionStyles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onOpenChange(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: 'var(--ds-spacing-m)',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
            padding: 0,
          }}
        >
          <span style={{ flex: 1, minWidth: 0 }}>
            {item.title && (
              <Text
                as="span"
                {...labTextPresets.subtitle}
                style={{
                  margin: 0,
                  whiteSpace: 'pre-line',
                  display: 'block',
                  ...labStyleTextSubtitleTokenH5,
                }}
              >
                {item.title}
              </Text>
            )}
          </span>
          <Icon
            asset={open ? <IcChevronUp /> : <IcChevronDown />}
            size="L"
            appearance="secondary"
          />
        </button>
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
            {item.body && (
              <Text
                as="p"
                {...labTextPresets.body}
                style={{
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {item.body}
              </Text>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LinksItem({
  item,
  router,
  openInNewTab,
  revealStyle,
}: {
  item: MediaTextAsymmetricLinkItem
  router: ReturnType<typeof useRouter>
  openInNewTab?: boolean
  revealStyle?: CSSProperties
}) {
  const hasLink = item.subtitle && item.linkUrl
  if (!hasLink) return null
  const linkProps = openInNewTab
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {
        onClick: (e: MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault()
          handleLinkPress(item.linkUrl!, router)
        },
      }
  return (
    <a
      href={item.linkUrl!}
      {...linkProps}
      style={{
        display: 'block',
        textDecoration: 'underline',
        cursor: 'pointer',
        paddingBlock: 'var(--ds-spacing-xs)',
        whiteSpace: 'pre-line',
        ...labStyleTextInteractiveLink,
        ...revealStyle,
      }}
    >
      {item.subtitle}
    </a>
  )
}

function paragraphRowsWithBody(rows: LabMediaTextAsymmetricParagraphRow[] | null | undefined) {
  if (rows == null || !Array.isArray(rows)) return []
  return rows.filter(
    (r): r is LabMediaTextAsymmetricParagraphRow & { body: string } =>
      r != null && typeof r.body === 'string' && r.body.trim().length > 0,
  )
}

export function LabMediaTextAsymmetricBlock({
  blockTitle,
  variant: contentVariant = 'paragraphs',
  paragraphLayout,
  singleColumnBody,
  paragraphRows,
  items,
  mainImageSrc,
  imageAspectRatio,
  imageAlt,
  size: _size = 'feature',
  openLinksInNewTab,
}: LabMediaTextAsymmetricBlockProps) {
  const router = useRouter()
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null)
  const blockTitleLevel = normalizeHeadingLevel('h3')
  const itemLevel = getChildLevel(blockTitleLevel)
  const headlineSize = getHeadlineSize(blockTitleLevel)
  const cell = useCell('L')
  const { isStacked } = useGridBreakpoint()
  const items_ = (items ?? []).filter((i) => i != null) as (MediaTextAsymmetricFaqItem | MediaTextAsymmetricLinkItem)[]
  const isParagraphs = contentVariant === 'paragraphs'
  const isImage = contentVariant === 'image'
  const resolvedParagraphLayout =
    paragraphLayout === 'single' ? 'single' : 'multi'
  const singleBodyTrimmed =
    typeof singleColumnBody === 'string' ? singleColumnBody.trim() : ''
  const rows_ = paragraphRowsWithBody(paragraphRows)
  const imageSrc = typeof mainImageSrc === 'string' && mainImageSrc.trim().length > 0 ? mainImageSrc.trim() : ''
  const resolvedAspect: LabMediaTextAsymmetricImageAspectRatio =
    imageAspectRatio === '5:4' || imageAspectRatio === '1:1' || imageAspectRatio === '4:5' ? imageAspectRatio : '4:5'
  const showTitleColumn = typeof blockTitle === 'string' && blockTitle.trim().length > 0

  const linksForRender: MediaTextAsymmetricLinkItem[] =
    contentVariant === 'links'
      ? items_.filter((i): i is MediaTextAsymmetricLinkItem => {
          if (i == null || !('linkUrl' in i)) return false
          const li = i as MediaTextAsymmetricLinkItem
          const sub = typeof li.subtitle === 'string' ? li.subtitle.trim() : ''
          const url = typeof li.linkUrl === 'string' ? li.linkUrl.trim() : ''
          return sub.length > 0 && url.length > 0
        })
      : []

  let staggerCount = 0
  if (showTitleColumn) staggerCount++
  if (isParagraphs && resolvedParagraphLayout === 'single' && singleBodyTrimmed.length > 0) staggerCount++
  if (isParagraphs && resolvedParagraphLayout === 'multi') staggerCount += rows_.length
  if (isImage && imageSrc) staggerCount++
  if (contentVariant === 'faq') staggerCount += items_.length
  if (contentVariant === 'links') staggerCount += linksForRender.length

  let slot = 0
  const titleRevealSlot = showTitleColumn ? slot++ : -1
  const mainBaseSlot = slot

  const rawStagger = staggerCount
  const revealN = Math.max(rawStagger, 1)
  const { ref: revealRef, isVisible, prefersReducedMotion: prReveal } = useCarouselReveal(revealN)
  const motionLevelScroll = prReveal ? 'subtle' : 'moderate'
  const entranceTransition = prReveal
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevelScroll)

  const getRevealStyle = (s: number): CSSProperties => {
    if (rawStagger < 1 || prReveal) return {}
    if (s < 0 || s >= rawStagger) return {}
    return {
      opacity: isVisible(s) ? 1 : 0,
      transform: isVisible(s) ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
      transition: entranceTransition,
    }
  }

  if (
    isParagraphs &&
    resolvedParagraphLayout === 'single' &&
    singleBodyTrimmed.length === 0 &&
    !showTitleColumn
  ) {
    return null
  }
  if (isParagraphs && resolvedParagraphLayout === 'multi' && rows_.length === 0 && !showTitleColumn) return null
  if (isImage && !imageSrc && !showTitleColumn) return null
  if (!isParagraphs && !isImage && items_.length === 0 && !showTitleColumn) return null

  const titleContent = showTitleColumn ? (
    <Headline
      size={headlineSize}
      as={blockTitleLevel}
      {...labHeadlinePresets.blockAlt}
      style={{
        margin: 0,
        whiteSpace: 'pre-line',
        ...labStyleHeadlineVariantRail,
      }}
    >
      {blockTitle}
    </Headline>
  ) : null

  const mainColumnContent = isParagraphs ? (
    resolvedParagraphLayout === 'single' ? (
      <div style={getRevealStyle(mainBaseSlot)}>
        <Text
          as="div"
          {...labTextPresets.bodyMedium}
          style={{
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {singleBodyTrimmed}
        </Text>
      </div>
    ) : (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-l)',
        }}
      >
        {rows_.map((row, i) => {
          const key = row._key != null && row._key !== '' ? row._key : `pr-${i}`
          return (
            <ParagraphRow
              key={key}
              row={row}
              itemLevel={itemLevel}
              router={router}
              openInNewTab={openLinksInNewTab}
              revealStyle={getRevealStyle(mainBaseSlot + i)}
            />
          )
        })}
      </div>
    )
  ) : isImage ? (
    imageSrc ? (
      <div style={getRevealStyle(mainBaseSlot)}>
        <MainColumnImage
          src={imageSrc}
          alt={(imageAlt != null && String(imageAlt).trim()) || ''}
          aspectRatio={resolvedAspect}
        />
      </div>
    ) : null
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {contentVariant === 'faq' &&
        items_.map((item, i) => (
          <FaqItem
            key={i}
            item={item as MediaTextAsymmetricFaqItem}
            itemLevel={itemLevel}
            prefersReducedMotion={prReveal}
            open={faqOpenIndex === i}
            onOpenChange={(nextOpen) => setFaqOpenIndex(nextOpen ? i : null)}
            rowRevealStyle={getRevealStyle(mainBaseSlot + i)}
          />
        ))}
      {contentVariant === 'links' &&
        linksForRender.map((item, j) => (
          <LinksItem
            key={item.linkUrl != null ? `${item.linkUrl}-${j}` : `link-${j}`}
            item={item}
            router={router}
            openInNewTab={openLinksInNewTab}
            revealStyle={getRevealStyle(mainBaseSlot + j)}
          />
        ))}
    </div>
  )

  /**
   * Lab: inner grid — 10 tracks + DS gutter when side-by-side. Title 1–4 (optional);
   * main always 5 / span 6 so layout matches with or without visible title.
   */
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isStacked ? '1fr' : 'repeat(10, minmax(0, 1fr))',
    columnGap: !isStacked ? 'var(--ds-grid-gutter)' : 0,
    rowGap: isStacked && showTitleColumn ? 'var(--ds-spacing-3xl)' : 0,
    alignItems: 'start',
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  }

  const titleColumnStyle: CSSProperties = {
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
    ...(!isStacked && showTitleColumn
      ? { gridColumn: '1 / span 4', paddingInlineEnd: 'var(--ds-spacing-4xl)' }
      : {}),
  }

  const mainColumnStyle: CSSProperties = {
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
    paddingInline: 0,
    marginInline: 0,
    justifySelf: 'stretch',
    width: '100%',
    ...(!isStacked ? { gridColumn: '5 / span 6' } : {}),
  }

  const cellWrapperStyle: CSSProperties = {
    ...cell,
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
  }

  return (
    <Grid as="section">
      <div ref={revealRef} style={cellWrapperStyle}>
        <div style={gridStyle}>
          {showTitleColumn && (
            <div style={{ ...titleColumnStyle, ...getRevealStyle(titleRevealSlot) }}>{titleContent}</div>
          )}
          <div style={mainColumnStyle}>{mainColumnContent}</div>
        </div>
      </div>
    </Grid>
  )
}
