import type { Metadata } from 'next'
import { LabOverviewClient } from './LabOverviewClient'
import { getStrapiConfigFromEnv, fetchStrapiLabOverview } from '@design2code/strapi'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Lab' }
}

export default async function LabPage() {
  const cfg = getStrapiConfigFromEnv()
  const overview = cfg ? await fetchStrapiLabOverview(cfg) : null
  return <LabOverviewClient sections={overview?.sections ?? []} />
}
