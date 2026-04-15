'use client'

/**
 * Lab shell – shared layout for all lab routes.
 * Top nav + main content area. DsProvider comes from root layout.
 */

import { TopNavBlock } from '@design2code/block-library/lab'

export function LabShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <TopNavBlock />
      {children}
    </div>
  )
}
