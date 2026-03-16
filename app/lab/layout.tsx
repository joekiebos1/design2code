/**
 * Lab layout – shared shell for all lab routes.
 * Top nav + content area. DsProvider comes from root layout.
 */

import { LabShell } from './LabShell'

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <LabShell>{children}</LabShell>
}
