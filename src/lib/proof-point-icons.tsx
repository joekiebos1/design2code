'use client'

import type { ComponentType, SVGProps } from 'react'
import {
  IcCheckboxOn,
  IcStar,
  IcStarAdd,
  IcStatusSuccessful,
  IcSuccess,
  IcSuccessColored,
  IcSecured,
  IcSecureLocked,
  IcLock,
  IcWifi,
  IcBulb,
  IcLightbulb,
  IcHeartRate,
  IcHealthy,
  IcConfirm,
  IcProtection,
  IcAddCircle,
  IcAward,
  IcAwardBadge,
  IcCelebration,
  IcThunderstorm,
  IcRocket,
  IcTarget,
  IcComputer,
  IcGlobe,
  IcWifiNetwork,
} from '@marcelinodzn/ds-react/icons'

/** Curated proof point icons from DS - statically imported for reliable rendering */
const PROOF_POINT_ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  IcCheckboxOn,
  IcStar,
  IcStarAdd,
  IcStatusSuccessful,
  IcSuccess,
  IcSuccessColored,
  IcSecured,
  IcSecureLocked,
  IcLock,
  IcWifi,
  IcBulb,
  IcLightbulb,
  IcHeartRate,
  IcHealthy,
  IcConfirm,
  IcProtection,
  IcAddCircle,
  IcAward,
  IcAwardBadge,
  IcCelebration,
  IcThunderstorm,
  IcRocket,
  IcTarget,
  IcComputer,
  IcGlobe,
  IcWifiNetwork,
}

const DEFAULT_ICON = IcCheckboxOn

export function getProofPointIcon(name: string | null | undefined): ComponentType<SVGProps<SVGSVGElement>> {
  if (!name) return DEFAULT_ICON
  return PROOF_POINT_ICON_MAP[name] ?? DEFAULT_ICON
}
