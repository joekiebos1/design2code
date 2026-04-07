'use client'

import type { ComponentType, SVGProps } from 'react'
import * as AllIcons from '@marcelinodzn/ds-react/icons'

const iconMap = AllIcons as unknown as Record<string, ComponentType<SVGProps<SVGSVGElement>>>
const DEFAULT_ICON = AllIcons.IcCheckboxOn

export function getProofPointIcon(name: string | null | undefined): ComponentType<SVGProps<SVGSVGElement>> {
  if (!name) return DEFAULT_ICON
  return iconMap[name] ?? DEFAULT_ICON
}
