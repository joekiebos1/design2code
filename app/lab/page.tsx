/**
 * Lab – Block experiments
 *
 * Fetches content from Sanity (Lab page). Images from Image Library.
 */

import { draftMode } from 'next/headers'
import { getClient } from '../../lib/sanity/client'
import { labPageQuery } from '../../lib/sanity/queries'
import { LabPageClient } from './LabPageClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LabPage() {
  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  let labData: {
    title?: string | null
    description?: string | null
    hero?: {
      productName?: string | null
      headline?: string | null
      subheadline?: string | null
      ctaText?: string | null
      ctaLink?: string | null
      cta2Text?: string | null
      cta2Link?: string | null
      image?: string | null
      imagePosition?: 'left' | 'right'
    } | null
  } | null = null

  try {
    labData = await sanity.fetch(labPageQuery)
  } catch {
    // Sanity not configured or fetch failed
  }

  const heroData = labData?.hero
  const hero = heroData
    ? {
        productName: heroData.productName ?? null,
        headline: heroData.headline ?? null,
        subheadline: heroData.subheadline ?? null,
        ctaText: heroData.ctaText ?? null,
        ctaLink: heroData.ctaLink ?? null,
        cta2Text: heroData.cta2Text ?? null,
        cta2Link: heroData.cta2Link ?? null,
        image: heroData.image ?? null,
        imagePosition: (heroData.imagePosition ?? 'right') as 'left' | 'right',
      }
    : null

  return (
    <LabPageClient
      title={labData?.title ?? 'Lab'}
      description={labData?.description ?? null}
      hero={hero}
    />
  )
}
