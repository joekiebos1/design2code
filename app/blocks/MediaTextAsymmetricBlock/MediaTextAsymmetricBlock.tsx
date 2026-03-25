'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Headline, Text, Icon, IcChevronDown, IcChevronUp } from '@marcelinodzn/ds-react'
import { Collapsible } from '@base-ui/react/collapsible'
import { Grid, useCell } from '../../components/blocks/Grid'
import { useGridBreakpoint } from '../../../lib/utils/use-grid-breakpoint'
import {
  getHeadlineSize,
  getChildLevel,
  normalizeHeadingLevel,
  type HeadingLevel,
} from '../../../lib/utils/semantic-headline'
import { LAB_TYPOGRAPHY_VARS, labPlainBodyStyle } from '../../../lib/typography/block-typography'
import { labHeadlinePresets, labTextPresets } from '../../../lib/typography/lab-typography-presets'
import type {
  MediaTextAsymmetricBlockProps,
  MediaTextAsymmetricTextItem,
  MediaTextAsymmetricFaqItem,
  MediaTextAsymmetricLinkItem,
  MediaTextAsymmetricLongFormParagraph,
  MediaTextAsymmetricParagraphRow,
  MediaTextAsymmetricImageAspectRatio,
} from './MediaTextAsymmetricBlock.types'

const MAIN_IMAGE_ASPECT_CSS: Record<MediaTextAsymmetricImageAspectRatio, string> = {
  '5:4': '5 / 4',
  '1:1': '1 / 1',
  '4:5': '4 / 5',
}

function handleLinkPress(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith('/')) router.push(href)
  else window.location.href = href
}

/** Classic paragraph rows (CMS `textList`). */
function ParagraphRow({
  item,
  itemLevel,
  router,
  openInNewTab,
}: {
  item: MediaTextAsymmetricTextItem
  itemLevel: HeadingLevel
  router: ReturnType<typeof useRouter>
  openInNewTab?: boolean
}) {
  const hasLink = item.linkText && item.linkUrl
  const linkProps = hasLink
    ? openInNewTab
      ? { target: '_blank' as const, rel: 'noopener noreferrer' }
      : { onClick: (e: React.MouseEvent) => { e.preventDefault(); handleLinkPress(item.linkUrl!, router) } }
    : {}
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-xs)',
      }}
    >
      {item.title && (
        <Text
          as={itemLevel}
          {...labTextPresets.subtitle}
          style={{
            margin: 0,
            whiteSpace: 'pre-line',
            fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
          }}
        >
          {item.title}
        </Text>
      )}
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
      {hasLink && (
        <a
          href={item.linkUrl!}
          {...linkProps}
          style={labPlainBodyStyle({
            marginTop: 'var(--ds-spacing-xs)',
            textDecoration: 'underline',
            cursor: 'pointer',
          })}
        >
          {item.linkText}
        </a>
      )}
    </div>
  )
}

/** Merged paragraph pattern (CMS `paragraphs`). */
function MergedParagraphRow({
  row,
  itemLevel,
  router,
  openLinksInNewTab,
}: {
  row: MediaTextAsymmetricParagraphRow & { body: string }
  itemLevel: HeadingLevel
  router: ReturnType<typeof useRouter>
  openLinksInNewTab?: boolean
}) {
  const bodyTextProps =
    row.bodyTypography === 'large' ? labTextPresets.bodyLead : labTextPresets.body
  const hasLink = row.linkText && row.linkUrl
  const linkProps = hasLink
    ? openLinksInNewTab
      ? { target: '_blank' as const, rel: 'noopener noreferrer' }
      : { onClick: (e: React.MouseEvent) => { e.preventDefault(); handleLinkPress(row.linkUrl!, router) } }
    : {}
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-xs)',
      }}
    >
      {row.title && String(row.title).trim().length > 0 && (
        <Text
          as={itemLevel}
          {...labTextPresets.subtitle}
          style={{
            margin: 0,
            whiteSpace: 'pre-line',
            fontSize: LAB_TYPOGRAPHY_VARS.h5,
            fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
          }}
        >
          {row.title}
        </Text>
      )}
      <Text
        as="p"
        {...bodyTextProps}
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

function MainColumnImage({
  src,
  alt,
  aspectRatio,
}: {
  src: string
  alt: string
  aspectRatio: MediaTextAsymmetricImageAspectRatio
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

function FaqItem({
  item,
  itemLevel,
}: {
  item: MediaTextAsymmetricFaqItem
  itemLevel: HeadingLevel
}) {
  return (
    <Collapsible.Root defaultOpen={false}>
      <div
        style={{
          borderBottom: '1px solid var(--ds-color-border-subtle)',
        }}
      >
        <Collapsible.Trigger
          render={(props, state) => (
            <button
              {...props}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: 'var(--ds-spacing-m)',
                padding: 'var(--ds-spacing-m) 0',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              {item.title && (
                <Text
                  as={itemLevel}
                  {...labTextPresets.subtitle}
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-line',
                    flex: 1,
                    fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
                  }}
                >
                  {item.title}
                </Text>
              )}
              <span style={{ display: 'flex', flexShrink: 0 }}>
                <Icon
                  asset={state?.open ? <IcChevronUp /> : <IcChevronDown />}
                  size="L"
                  appearance="secondary"
                />
              </span>
            </button>
          )}
        />
        <Collapsible.Panel
          style={{
            paddingBottom: 'var(--ds-spacing-m)',
          }}
        >
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
        </Collapsible.Panel>
      </div>
    </Collapsible.Root>
  )
}

function LinksItem({
  item,
  router,
  openInNewTab,
}: {
  item: MediaTextAsymmetricLinkItem
  router: ReturnType<typeof useRouter>
  openInNewTab?: boolean
}) {
  const hasLink = item.subtitle && item.linkUrl
  if (!hasLink) return null
  const linkProps = openInNewTab
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {
        onClick: (e: React.MouseEvent) => {
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
        fontSize: LAB_TYPOGRAPHY_VARS.labelM,
        fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
        color: 'var(--ds-color-text-interactive)',
        textDecoration: 'underline',
        cursor: 'pointer',
        paddingBlock: 'var(--ds-spacing-xs)',
        whiteSpace: 'pre-line',
      }}
    >
      {item.subtitle}
    </a>
  )
}

function longFormParagraphsWithText(paragraphs: MediaTextAsymmetricLongFormParagraph[] | null | undefined) {
  if (paragraphs == null || !Array.isArray(paragraphs)) return []
  return paragraphs.filter(
    (p): p is MediaTextAsymmetricLongFormParagraph & { text: string } =>
      p != null && typeof p.text === 'string' && p.text.trim().length > 0,
  )
}

function paragraphRowsWithBody(rows: MediaTextAsymmetricParagraphRow[] | null | undefined) {
  if (rows == null || !Array.isArray(rows)) return []
  return rows.filter(
    (r): r is MediaTextAsymmetricParagraphRow & { body: string } =>
      r != null && typeof r.body === 'string' && r.body.trim().length > 0,
  )
}

export function MediaTextAsymmetricBlock({
  blockTitle,
  variant: contentVariant = 'textList',
  longFormParagraphs,
  paragraphRows,
  items,
  mainImageSrc,
  imageAspectRatio,
  imageAlt,
  size: _size = 'feature',
  openLinksInNewTab,
}: MediaTextAsymmetricBlockProps) {
  const router = useRouter()
  const blockTitleLevel = normalizeHeadingLevel('h3')
  const itemLevel = getChildLevel(blockTitleLevel)
  const headlineSize = getHeadlineSize(blockTitleLevel)
  const cell = useCell('L')
  const { isStacked } = useGridBreakpoint()
  const items_ = (items ?? []).filter((i) => i != null) as (
    | MediaTextAsymmetricTextItem
    | MediaTextAsymmetricFaqItem
    | MediaTextAsymmetricLinkItem
  )[]
  const isLongForm = contentVariant === 'longForm'
  const isParagraphs = contentVariant === 'paragraphs'
  const isImage = contentVariant === 'image'
  const longFormParas_ = longFormParagraphsWithText(longFormParagraphs)
  const rows_ = paragraphRowsWithBody(paragraphRows)
  const imageSrc = typeof mainImageSrc === 'string' && mainImageSrc.trim().length > 0 ? mainImageSrc.trim() : ''
  const resolvedAspect: MediaTextAsymmetricImageAspectRatio =
    imageAspectRatio === '5:4' || imageAspectRatio === '1:1' || imageAspectRatio === '4:5' ? imageAspectRatio : '4:5'
  const showTitleColumn = typeof blockTitle === 'string' && blockTitle.trim().length > 0

  if (isParagraphs && rows_.length === 0 && !showTitleColumn) return null
  if (isLongForm && longFormParas_.length === 0 && !showTitleColumn) return null
  if (isImage && !imageSrc && !showTitleColumn) return null
  if (!isLongForm && !isParagraphs && !isImage && items_.length === 0 && !showTitleColumn) return null

  const titleContent = showTitleColumn ? (
    <Headline
      size={headlineSize}
      as={blockTitleLevel}
      {...labHeadlinePresets.blockAlt}
      style={{ margin: 0, fontSize: LAB_TYPOGRAPHY_VARS.h3, whiteSpace: 'pre-line' }}
    >
      {blockTitle}
    </Headline>
  ) : null

  const mainColumnContent = isLongForm ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-l)',
      }}
    >
      {longFormParas_.map((para, i) => {
        const textProps =
          para.bodyTypography === 'large'
            ? labTextPresets.bodyLead
            : { ...labTextPresets.body, size: 'M' as const, color: 'medium' as const }
        const key = para._key != null && para._key !== '' ? para._key : `lfp-${i}`
        return (
          <Text
            key={key}
            as="p"
            {...textProps}
            style={{
              margin: 0,
              whiteSpace: 'pre-line',
            }}
          >
            {para.text}
          </Text>
        )
      })}
    </div>
  ) : isParagraphs ? (
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
          <MergedParagraphRow
            key={key}
            row={row}
            itemLevel={itemLevel}
            router={router}
            openLinksInNewTab={openLinksInNewTab}
          />
        )
      })}
    </div>
  ) : isImage ? (
    imageSrc ? (
      <MainColumnImage
        src={imageSrc}
        alt={(imageAlt != null && String(imageAlt).trim()) || ''}
        aspectRatio={resolvedAspect}
      />
    ) : null
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: contentVariant === 'textList' ? 'var(--ds-spacing-l)' : 0,
      }}
    >
      {contentVariant === 'textList' &&
        items_.map((item, i) => (
          <ParagraphRow
            key={i}
            item={item as MediaTextAsymmetricTextItem}
            itemLevel={itemLevel}
            router={router}
            openInNewTab={openLinksInNewTab}
          />
        ))}
      {contentVariant === 'faq' &&
        items_.map((item, i) => (
          <FaqItem key={i} item={item as MediaTextAsymmetricFaqItem} itemLevel={itemLevel} />
        ))}
      {contentVariant === 'links' &&
        items_.map((item, i) => (
          <LinksItem key={i} item={item as MediaTextAsymmetricLinkItem} router={router} openInNewTab={openLinksInNewTab} />
        ))}
    </div>
  )

  /**
   * Inner grid — 10 tracks + DS gutter when side-by-side. Title 1–4 (optional);
   * main always 5 / span 6 with or without visible title (aligned with lab).
   */
  const gridStyle: React.CSSProperties = {
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

  const titleColumnStyle: React.CSSProperties = {
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
    ...(!isStacked && showTitleColumn
      ? { gridColumn: '1 / span 4', paddingInlineEnd: 'var(--ds-spacing-4xl)' }
      : {}),
  }

  const mainColumnStyle: React.CSSProperties = {
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
    paddingInline: 0,
    marginInline: 0,
    justifySelf: 'stretch',
    width: '100%',
    ...(!isStacked ? { gridColumn: '5 / span 6' } : {}),
  }

  const cellWrapperStyle: React.CSSProperties = {
    ...cell,
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
  }

  return (
    <Grid as="section">
      <div style={cellWrapperStyle}>
        <div style={gridStyle}>
          {showTitleColumn && <div style={titleColumnStyle}>{titleContent}</div>}
          <div style={mainColumnStyle}>{mainColumnContent}</div>
        </div>
      </div>
    </Grid>
  )
}
