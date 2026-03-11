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

function getPlatformForWidth(width: number) {
  if (width < bp.tablet) return PLATFORM_MODES.MOBILE_360
  if (width < bp.desktop) return PLATFORM_MODES.TABLET_768
  if (width < bp.desktopLarge) return PLATFORM_MODES.DESKTOP_1440
  return PLATFORM_MODES.DESKTOP_1920
}

function getBreakpointWidth(platform: string): number {
  if (platform.includes('360')) return bp.mobile
  if (platform.includes('768')) return bp.tablet
  if (platform.includes('1440')) return bp.desktop
  if (platform.includes('1920')) return bp.desktopLarge
  return bp.desktop
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
  margin: number
  gutter: number
  marginPx: string
  gutterPx: string
  breakpointWidth: number
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
  const breakpointWidth = getBreakpointWidth(platform)

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

  const gridMaxWidth = isDesktop ? `${containerWidth + 2 * margin}px` : undefined

  return {
    columns,
    margin,
    gutter,
    marginPx: `${margin}px`,
    gutterPx: `${gutter}px`,
    breakpointWidth,
    containerWidth,
    columnWidth,
    contentMaxXS: isDesktop ? `${pxXS}px` : '100%',
    contentMaxS: isDesktop ? `${pxS}px` : '100%',
    contentMaxM: isDesktop ? `${pxM}px` : '100%',
    contentMaxDefault: isDesktop ? `${pxDefault}px` : '100%',
    contentMaxWide: isDesktop ? `${pxWide}px` : '100%',
    contentMax5Cols: isDesktop ? `${px5}px` : '100%',
    isDesktop,
    gridMaxWidth,
  }
}

const DEFAULT_PLATFORM = PLATFORM_MODES.DESKTOP_1440
const DEFAULT_VIEWPORT = 1440
const DEFAULT_VALUES = resolveGridValues(DEFAULT_PLATFORM, DEFAULT_VIEWPORT)

export function useGridBreakpoint(): GridBreakpoint {
  const [values, setValues] = useState<GridBreakpoint>(DEFAULT_VALUES)

  useEffect(() => {
    const update = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : DEFAULT_VIEWPORT
      const platform = getPlatformForWidth(w)
      setValues(resolveGridValues(platform, w))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return values
}
