'use client'

import { DsProvider } from '@marcelinodzn/ds-react'
import { getContentDsDensity } from '../config/content-ds-density'

/**
 * Nested DS provider for **block pages and lab only**. Overrides `density`; Studio / JioKarna stay on
 * root `Providers` (`Default` density).
 */
export function ContentDsProvider({ children }: { children: React.ReactNode }) {
  const density = getContentDsDensity()
  return (
    <DsProvider platform="Desktop (1440)" colorMode="Light" density={density} theme="MyJio">
      {children}
    </DsProvider>
  )
}
