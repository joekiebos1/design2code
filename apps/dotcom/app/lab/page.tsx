/**
 * Lab – overview page. Strapi-first, Sanity fallback.
 */

import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { LabOverviewClient } from './LabOverviewClient'
import { getStrapiConfigFromEnv, fetchStrapiLabOverview } from '@design2code/strapi'
import { getClient } from '@design2code/sanity'
import { labOverviewQuery } from '@design2code/sanity'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Lab' }
}

export default async function LabPage() {
  const strapiCfg = getStrapiConfigFromEnv()

  // Try Strapi first
  if (strapiCfg) {
    try {
      const overview = await fetchStrapiLabOverview(strapiCfg)
      return <LabOverviewClient sections={overview?.sections ?? []} />
    } catch {
      // fall through to Sanity
    }
  }

  // Sanity fallback
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
