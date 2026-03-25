/**
 * Lab – overview from Sanity `labOverview` document (`_id` labOverview).
 */

import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { LabOverviewClient } from './LabOverviewClient'
import { getClient } from '../../lib/sanity/client'
import { labOverviewQuery } from '../../lib/sanity/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Lab' }
}

export default async function LabPage() {
  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  let overview: { sections?: unknown[] } | null = null
  try {
    overview = await sanity.fetch(labOverviewQuery)
  } catch {
    overview = null
  }

  return <LabOverviewClient sections={overview?.sections ?? []} />
}
