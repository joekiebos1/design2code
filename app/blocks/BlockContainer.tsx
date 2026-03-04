'use client'

import { useGridBreakpoint } from '../lib/use-grid-breakpoint'

type BlockContainerElement = 'div' | 'section' | 'article' | 'main'

/**
 * Content width options. Column spans: XS=4, S=6, M=8, Default=10, Wide=12.
 * Desktop (12 cols): XS=4, S=6, M=8, Default=10, Wide=12.
 * Tablet (8 cols): XS=4, S=6, M=6, Default=6, Wide=8.
 * Mobile (4 cols): all=4.
 * - edgeToEdge: 100vw, no padding (uncapped)
 * - full: 100% width, no max-width (for block wrapper)
 *
 * Above 1440px, all content widths cap at ContainerWidth/L (1440)/100-100-100 (1346px).
 */
export type ContentWidth = 'XS' | 'S' | 'M' | 'Default' | 'Wide' | 'edgeToEdge' | 'full'

/** Spacing values from DS block-gap tokens. Controls padding-top on block wrapper. */
export type BlockSpacing = 'small' | 'medium' | 'large'

/** Block spacing – DS tokens (same load order as background colours) */
export const SPACING_VAR: Record<BlockSpacing, string> = {
  small: 'var(--ds-spacing-2xl)',
  medium: 'var(--ds-spacing-3xl)',
  large: 'var(--ds-spacing-4xl)',
}

type BlockContainerProps = React.HTMLAttributes<HTMLElement> & {
  as?: BlockContainerElement
  contentWidth?: ContentWidth
  /** Padding above block (paddingBlockStart). Fallback when spacingTop not set. */
  spacingTop?: BlockSpacing
  /** Padding below block (paddingBlockEnd). Fallback when spacingBottom not set. */
  spacingBottom?: BlockSpacing
  /** @deprecated Use spacingTop and spacingBottom. Fallback for both when new fields not set. */
  spacing?: BlockSpacing
  /** When true, also apply spacing as padding-bottom (for blocks with coloured background). Aligns with SurfaceProvider hasBoldBackground. */
  hasColouredBackground?: boolean
  /** When true, skip paddingBlockStart (block handles top internally, e.g. overflow); still add paddingBlockEnd. */
  spacingOnlyOnContent?: boolean
}

/**
 * Shared container for blocks. All margin, gutter, column values from ds-tokens.
 * narrow/default/wide are centered with auto margins. Content fills the width (no padding).
 * When spacing is set, adds padding-block-start (and padding-block-end when colouredSurface).
 */
export function BlockContainer({
  children,
  style,
  as: Component = 'div',
  contentWidth = 'Default',
  spacingTop,
  spacingBottom,
  spacing,
  hasColouredBackground = false,
  spacingOnlyOnContent = false,
  ...props
}: BlockContainerProps) {
  const fallback = spacing ? (SPACING_VAR[spacing] ?? SPACING_VAR.large) : undefined
  const topValue = spacingTop ? (SPACING_VAR[spacingTop] ?? SPACING_VAR.large) : fallback
  const bottomValue = spacingBottom ? (SPACING_VAR[spacingBottom] ?? SPACING_VAR.large) : fallback
  /** spacingOnlyOnContent (overflow): block handles top internally; BlockContainer adds paddingBlockEnd like other blocks. */
  const paddingBlockStart = spacingOnlyOnContent ? undefined : topValue
  const paddingBlockEnd = bottomValue

  const {
    marginPx,
    contentMaxXS,
    contentMaxS,
    contentMaxM,
    contentMaxDefault,
    contentMaxWide,
  } = useGridBreakpoint()

  const paddingStyle = {
    ...(paddingBlockStart && { paddingBlockStart }),
    ...(paddingBlockEnd && { paddingBlockEnd }),
  }

  if (contentWidth === 'edgeToEdge') {
    return (
      <Component
        style={{
          width: '100vw',
          maxWidth: '100vw',
          marginLeft: `-${marginPx}`,
          marginRight: 0,
          paddingInline: 0,
          boxSizing: 'border-box',
          ...paddingStyle,
          ...style,
        }}
        {...props}
      >
        {children}
      </Component>
    )
  }

  if (contentWidth === 'full') {
    return (
      <Component
        style={{
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          ...paddingStyle,
          ...style,
        }}
        {...props}
      >
        {children}
      </Component>
    )
  }

  const maxWidth =
    contentWidth === 'XS'
      ? contentMaxXS
      : contentWidth === 'S'
        ? contentMaxS
        : contentWidth === 'M'
          ? contentMaxM
          : contentWidth === 'Wide'
            ? contentMaxWide
            : contentMaxDefault

  return (
    <Component
      style={{
        width: '100%',
        maxWidth,
        marginInline: 'auto',
        boxSizing: 'border-box',
        ...paddingStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}
