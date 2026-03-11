'use client'

import { useRouter } from 'next/navigation'
import {
  Headline,
  Text,
  Icon,
  IcChevronDown,
  IcChevronUp,
} from '@marcelinodzn/ds-react'
import { Collapsible } from '@base-ui/react/collapsible'
import { GridBlock, useGridCell } from '../../components/GridBlock'
import { BlockSurfaceProvider } from '../../lib/block-surface'
import { useGridBreakpoint } from '../../lib/use-grid-breakpoint'
import {
  getHeadlineSize,
  getChildLevel,
  normalizeHeadingLevel,
  TYPOGRAPHY,
  type HeadingLevel,
} from '../../lib/semantic-headline'
import type {
  ListBlockProps,
  ListBlockTextItem,
  ListBlockFaqItem,
  ListBlockLinkItem,
} from './ListBlock.types'

function handleLinkPress(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith('/')) router.push(href)
  else window.location.href = href
}

function TextListItem({
  item,
  itemLevel,
  router,
  openInNewTab,
}: {
  item: ListBlockTextItem
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
        <Headline
          size="XS"
          weight="high"
          as={itemLevel}
          style={{ margin: 0, fontSize: TYPOGRAPHY.labelM, whiteSpace: 'pre-line' }}
        >
          {item.title}
        </Headline>
      )}
      {item.body && (
        <Text
          size="S"
          weight="low"
          color="medium"
          as="p"
          style={{ margin: 0, whiteSpace: 'pre-line' }}
        >
          {item.body}
        </Text>
      )}
      {hasLink && (
        <a
          href={item.linkUrl!}
          {...linkProps}
          style={{
            fontSize: TYPOGRAPHY.labelM,
            fontWeight: 'var(--ds-typography-weight-medium)',
            color: 'var(--ds-color-text-interactive)',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginTop: 'var(--ds-spacing-xs)',
          }}
        >
          {item.linkText}
        </a>
      )}
    </div>
  )
}

function FaqItem({
  item,
  itemLevel,
}: {
  item: ListBlockFaqItem
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
                <Headline
                  size="XS"
                  weight="high"
                  as={itemLevel}
                  style={{
                    margin: 0,
                    fontSize: TYPOGRAPHY.labelM,
                    whiteSpace: 'pre-line',
                    flex: 1,
                  }}
                >
                  {item.title}
                </Headline>
              )}
              <span style={{ display: 'flex', flexShrink: 0 }}>
                <Icon
                  asset={state?.open ? <IcChevronUp /> : <IcChevronDown />}
                  size="S"
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
              size="S"
              weight="low"
              color="medium"
              as="p"
              style={{ margin: 0, whiteSpace: 'pre-line' }}
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
  item: ListBlockLinkItem
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
        fontSize: TYPOGRAPHY.labelM,
        fontWeight: 'var(--ds-typography-weight-medium)',
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

export function ListBlock({
  blockTitle,
  listVariant = 'textList',
  items,
  size: _size = 'feature',
  blockSurface,
  minimalBackgroundStyle,
  blockAccent,
  openLinksInNewTab,
}: ListBlockProps) {
  const router = useRouter()
  const level = normalizeHeadingLevel('h2')
  const itemLevel = getChildLevel(level)
  const headlineSize = getHeadlineSize(level)
  const cell = useGridCell('Wide')
  const items_ = (items ?? []).filter((i) => i != null) as (ListBlockTextItem | ListBlockFaqItem | ListBlockLinkItem)[]

  if (items_.length === 0 && !blockTitle) return null

  const titleContent = blockTitle ? (
    <Headline
      size={headlineSize}
      weight="high"
      as={level}
      style={{ margin: 0, fontSize: TYPOGRAPHY.h2, whiteSpace: 'pre-line' }}
    >
      {blockTitle}
    </Headline>
  ) : null

  const listContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: listVariant === 'textList' ? 'var(--ds-spacing-l)' : 0,
      }}
    >
      {listVariant === 'textList' &&
        items_.map((item, i) => (
          <TextListItem
            key={i}
            item={item as ListBlockTextItem}
            itemLevel={itemLevel}
            router={router}
            openInNewTab={openLinksInNewTab}
          />
        ))}
      {listVariant === 'faq' &&
        items_.map((item, i) => (
          <FaqItem
            key={i}
            item={item as ListBlockFaqItem}
            itemLevel={itemLevel}
          />
        ))}
      {listVariant === 'links' &&
        items_.map((item, i) => (
          <LinksItem key={i} item={item as ListBlockLinkItem} router={router} openInNewTab={openLinksInNewTab} />
        ))}
    </div>
  )

  const { columns } = useGridBreakpoint()
  const isStacked = columns < 8

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isStacked ? '1fr' : '1fr 1fr',
    gap: isStacked ? 'var(--ds-spacing-2xl)' : 'var(--ds-spacing-3xl)',
    alignItems: 'start',
  }

  return (
    <BlockSurfaceProvider
      blockSurface={blockSurface}
      blockAccent={blockAccent}
      minimalBackgroundStyle={minimalBackgroundStyle ?? 'block'}
      fullWidth
    >
      <GridBlock as="section">
        <div style={{ ...cell, minWidth: 0 }}>
          <div style={gridStyle}>
            <div style={{ minWidth: 0 }}>{titleContent}</div>
            <div style={{ minWidth: 0 }}>{listContent}</div>
          </div>
        </div>
      </GridBlock>
    </BlockSurfaceProvider>
  )
}
