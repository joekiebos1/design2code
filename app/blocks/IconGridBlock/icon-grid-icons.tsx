'use client'

import type { ComponentType, SVGProps } from 'react'
import {
  IcWifiNetwork,
  IcHome,
  IcEntertainment,
  IcEntertainmentPlay,
  IcWallet,
  IcMoneybag,
  IcPayment,
  IcShopping,
  IcShoppingBag,
  IcBusinessman,
  IcWork,
  IcHealthy,
  IcHealthProtection,
  IcEducation,
  IcSeedling,
  IcPlantGrowth,
  IcEnergyTotal,
  IcEnergyOthers,
  IcCarSide,
  IcBusFront,
  IcCity,
  IcFort,
  IcGlobe,
  IcComputer,
} from '@marcelinodzn/ds-react/icons'

/** Icons for IconGridBlock – statically imported for reliable rendering */
const ICON_GRID_ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  IcWifiNetwork,
  IcHome,
  IcEntertainment,
  IcEntertainmentPlay,
  IcWallet,
  IcMoneybag,
  IcPayment,
  IcShopping,
  IcShoppingBag,
  IcBusinessman,
  IcWork,
  IcHealthy,
  IcHealthProtection,
  IcEducation,
  IcSeedling,
  IcPlantGrowth,
  IcEnergyTotal,
  IcEnergyOthers,
  IcCarSide,
  IcBusFront,
  IcCity,
  IcFort,
  IcGlobe,
  IcComputer,
}

const DEFAULT_ICON = IcGlobe

export function getIconGridIcon(name: string | null | undefined): ComponentType<SVGProps<SVGSVGElement>> {
  if (!name) return DEFAULT_ICON
  return ICON_GRID_ICON_MAP[name] ?? DEFAULT_ICON
}
