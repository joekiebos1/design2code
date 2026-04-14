import type { Metadata } from 'next'
import { LabOverviewClient } from './LabOverviewClient'

export const metadata: Metadata = { title: 'Lab' }

export default function LabPage() {
  return <LabOverviewClient />
}
