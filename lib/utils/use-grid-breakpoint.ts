'use client'

import { useEffect, useState } from 'react'
import {
  getVariableByName,
  createTokenContext,
  getBreakpoints,
  COLLECTION_NAMES,
  PLATFORM_MODES,
  DENSITY_MODES,
} from '@marcelinodzn/ds-tokens'

const bp = getBreakpoints()

// --- Breakpoint constants (single source of truth for layout) ---
/** Grid columns at breakpoint boundaries. Use these for layout decisions. */
export const BREAKPOINT_COLUMNS = {
  mobile: 4,
  tablet: 8,
  desktop: 12,
} as const

/** Breakpoint name from columns. */
export type BreakpointName = 'mobile' | 'tablet' | 'desktop'

/** Pure helpers — use when you have columns but not the hook. */
export function isMobileCols(columns: number): boolean {
  return columns <= BREAKPOINT_COLUMNS.mobile
}

export function isTabletCols(columns: number): boolean {
  return columns > BREAKPOINT_COLUMNS.mobile && columns <= BREAKPOINT_COLUMNS.tablet
}

export function isDesktopCols(columns: number): boolean {
  return columns >= BREAKPOINT_COLUMNS.desktop
}

/** Derive breakpoint name from columns. */
export function getBreakpointName(columns: number): BreakpointName {
  if (columns <= BREAKPOINT_COLUMNS.mobile) return 'mobile'
  if (columns <= BREAKPOINT_COLUMNS.tablet) return 'tablet'
  return 'desktop'
}

/** Carousel card size. */
export type CarouselCardSize = 'compact' | 'medium' | 'large'

/** Responsive visible columns for carousel. Mobile: 1. Tablet: 2 for compact/medium, 1 for large. Desktop: 3/2/1. */
export function getResponsiveCarouselCols(
  columns: number,
  cardSize: CarouselCardSize
): number {
  if (columns <= BREAKPOINT_COLUMNS.mobile) return 1
  if (columns <= BREAKPOINT_COLUMNS.tablet) return cardSize === 'large' ? 1 : 2
  switch (cardSize) {
    case 'compact': return 3
    case 'medium': return 2
    case 'large': return 1
    default: return 2
  }
}

/** Aspect ratios supported for breakpoint switching. */
export type LandscapeAspectRatio = '2:1' | '16:9' | '4:3' | '8:5'
export type PortraitAspectRatio = '4:5' | '3:4'

/** On mobile, landscape ratios become portrait. Desktop/tablet: keep base ratio. */
export function getAspectRatioForBreakpoint(
  baseRatio: LandscapeAspectRatio | PortraitAspectRatio,
  columns: number
): string {
  if (columns > BREAKPOINT_COLUMNS.mobile) return baseRatio
  const landscapeToPortrait: Record<string, PortraitAspectRatio> = {
    '2:1': '4:5',
    '16:9': '4:5',
    '4:3': '3:4',
    '8:5': '4:5',
  }
  return landscapeToPortrait[baseRatio] ?? baseRatio
}

/** Stack on mobile only. Use for Hero, MediaText5050, List. */
export function isStackedLayout(columns: number): boolean {
  return columns < BREAKPOINT_COLUMNS.tablet
}

function getPlatformForWidth(width: number) {
  if (width < bp.tablet) return PLATFORM_MODES.MOBILE_360
  if (width < bp.desktop) return PLATFORM_MODES.TABLET_768
  if (width < bp.desktopLarge) return PLATFORM_MODES.DESKTOP_1440
  return PLATFORM_MODES.DESKTOP_1920
}

function getGridTokenPrefix(platform: string): string {
  if (platform.includes('360')) return 'Grid/S (360)'
  if (platform.includes('768')) return 'Grid/M (768)'
  if (platform.includes('1440')) return 'Grid/L (1440)'
  if (platform.includes('1920')) return 'Grid/XL (1920)'
  return 'Grid/L (1440)'
}

export type GridBreakpoint = {
  columns: number
  gutter: number
  /** Content area between margins: viewport - 2*margin */
  containerWidth: number
  /** Derived: (containerWidth - gutter*(columns-1)) / columns */
  columnWidth: number
  /** XS: 4 cols. Desktop 1440px+. */
  contentMaxXS: string
  /** S: 6 cols. Desktop 1440px+, tablet 768px+. */
  contentMaxS: string
  /** M: 8 cols. Desktop 1440px+. */
  contentMaxM: string
  /** Default: 10 cols. Desktop 1440px+. */
  contentMaxDefault: string
  /** Wide: 12 cols. Desktop 1440px+. */
  contentMaxWide: string
  /** 5 cols. Desktop 1440px+. For Medium carousel cards. */
  contentMax5Cols: string
  /** True when viewport >= 1440 — narrow/default/wide use calculated widths */
  isDesktop: boolean
  /** Max width for grid wrapper (containerWidth + 2*margin) on desktop. Ensures grid respects 1346px cap. */
  gridMaxWidth: string | undefined
  /** Breakpoint name — use instead of ad-hoc columns checks */
  breakpoint: BreakpointName
  /** columns <= 4 */
  isMobile: boolean
  /** 4 < columns <= 8 */
  isTablet: boolean
  /** columns >= 12 (same viewport as isDesktop) */
  isDesktopCols: boolean
  /** columns < 8 — stack layout (Hero, MediaText5050, List) */
  isStacked: boolean
}

const CONTAINER_MAX_TOKEN = 'ContainerWidth/L (1440)/100-100-100'
const CONTAINER_MAX_FALLBACK = 1346

function resolveGridValues(platform: string, viewport: number): GridBreakpoint {
  const ctx = createTokenContext({
    [COLLECTION_NAMES.PLATFORM]: platform,
    [COLLECTION_NAMES.DENSITY]: DENSITY_MODES.DEFAULT,
  })
  const prefix = getGridTokenPrefix(platform)
  const columns = Number(getVariableByName('Grid/columns', ctx)) || 12
  const margin = Number(getVariableByName(`${prefix}/margin`, ctx)) || 47
  const gutter = Number(getVariableByName(`${prefix}/gutter`, ctx)) || 19

  const containerMaxCap =
    Number(getVariableByName(CONTAINER_MAX_TOKEN, ctx)) || CONTAINER_MAX_FALLBACK

  const rawContainerWidth = Math.max(0, viewport - 2 * margin)
  const isDesktop = viewport >= 1440
  const containerWidth = isDesktop
    ? Math.min(rawContainerWidth, containerMaxCap)
    : rawContainerWidth

  const columnWidth =
    columns > 0 ? (containerWidth - gutter * (columns - 1)) / columns : 0

  const spanWide = columns === 12 ? 12 : columns === 8 ? 8 : 4
  const spanDefault = columns === 12 ? 10 : columns === 8 ? 6 : 4
  const spanM = columns === 12 ? 8 : columns === 8 ? 6 : 4
  const spanS = columns === 12 ? 6 : columns === 8 ? 6 : 4
  const spanXS = columns === 12 ? 4 : columns === 8 ? 4 : 4
  const span5 = columns >= 5 ? 5 : 4

  const pxWide = spanWide * columnWidth + (spanWide - 1) * gutter
  const pxDefault = spanDefault * columnWidth + (spanDefault - 1) * gutter
  const pxM = spanM * columnWidth + (spanM - 1) * gutter
  const pxS = spanS * columnWidth + (spanS - 1) * gutter
  const pxXS = spanXS * columnWidth + (spanXS - 1) * gutter
  const px5 = span5 * columnWidth + (span5 - 1) * gutter

  const gridMaxWidth = `${containerWidth + 2 * margin}px`

  const breakpoint = getBreakpointName(columns)

  return {
    columns,
    gutter,
    containerWidth,
    columnWidth,
    contentMaxXS: `${pxXS}px`,
    contentMaxS: `${pxS}px`,
    contentMaxM: `${pxM}px`,
    contentMaxDefault: `${pxDefault}px`,
    contentMaxWide: `${pxWide}px`,
    contentMax5Cols: `${px5}px`,
    isDesktop,
    gridMaxWidth,
    breakpoint,
    isMobile: isMobileCols(columns),
    isTablet: isTabletCols(columns),
    isDesktopCols: isDesktopCols(columns),
    isStacked: isStackedLayout(columns),
  }
}

const DEFAULT_PLATFORM = PLATFORM_MODES.DESKTOP_1440
const DEFAULT_VIEWPORT = 1440
const DEFAULT_VALUES = resolveGridValues(DEFAULT_PLATFORM, DEFAULT_VIEWPORT)

function gridValuesEqual(a: GridBreakpoint, b: GridBreakpoint): boolean {
  return (
    a.columns === b.columns &&
    a.contentMaxDefault === b.contentMaxDefault &&
    a.contentMaxWide === b.contentMaxWide &&
    a.isDesktop === b.isDesktop
  )
}

export function useGridBreakpoint(): GridBreakpoint {
  const [values, setValues] = useState<GridBreakpoint>(DEFAULT_VALUES)

  useEffect(() => {
    const update = () => {
      const w = typeof window !== 'undefined'
        ? document.documentElement.clientWidth
        : DEFAULT_VIEWPORT
      const platform = getPlatformForWidth(w)
      const next = resolveGridValues(platform, w)
      setValues((prev) => (gridValuesEqual(prev, next) ? prev : next))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return values
}
