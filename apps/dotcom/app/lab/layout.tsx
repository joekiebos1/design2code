/**
 * Lab layout – shared shell for all lab routes.
 * Nested ContentDsProvider overrides density for lab blocks; root layout keeps Default for tools.
 */

import { ContentDsProvider } from '@design2code/ds'
import { LabShell } from './LabShell'

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContentDsProvider>
      <LabShell>{children}</LabShell>
    </ContentDsProvider>
  )
}
