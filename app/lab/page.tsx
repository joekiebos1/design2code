/**
 * Lab – Overview page. Content from Sanity (labOverview with List block).
 */

import { draftMode } from 'next/headers'
import { LabOverviewClient } from './LabOverviewClient'
import { getClient } from '../../lib/sanity/client'
import { labOverviewQuery } from '../../lib/sanity/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LabPage() {
  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  let overview: { sections?: unknown[] } | null = null
  try {
    overview = await sanity.fetch(labOverviewQuery)
  } catch {
    // No Sanity project or fetch failed
  }

  return <LabOverviewClient sections={overview?.sections ?? []} />
}
