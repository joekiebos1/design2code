/**
 * Lab block page – /lab/[block-slug]
 * Strapi-first, Sanity fallback.
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { LabBlockDetailClient } from './LabBlockDetailClient'
import { getStrapiConfigFromEnv, fetchStrapiLabBlockPageBySlug, fetchStrapiLabBlockPageSummaries } from '@design2code/strapi'
import { getClient } from '@design2code/sanity'
import { labBlockPageBySlugQuery, allLabBlockPagesQuery } from '@design2code/sanity'

type PageProps = { params: Promise<{ block: string }> }

export async function generateStaticParams() {
  const strapiCfg = getStrapiConfigFromEnv()
  if (strapiCfg) {
    try {
      const pages = await fetchStrapiLabBlockPageSummaries(strapiCfg)
      return pages.map((p) => ({ block: p.slug }))
    } catch {
      // fall through
    }
  }
  const sanity = getClient(false)
  try {
    const pages = (await sanity.fetch<{ slug: string }[]>(allLabBlockPagesQuery)) ?? []
    return pages.map((p) => ({ block: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { block } = await params
  const strapiCfg = getStrapiConfigFromEnv()
  if (strapiCfg) {
    try {
      const page = await fetchStrapiLabBlockPageBySlug(strapiCfg, block)
      if (page) return { title: `${page.title} · Lab` }
    } catch {
      // fall through
    }
  }
  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  try {
    const page = await sanity.fetch<{ title?: string } | null>(labBlockPageBySlugQuery, { slug: block })
    return { title: `${page?.title ?? 'Lab'} · Lab` }
  } catch {
    return { title: 'Lab' }
  }
}

export default async function LabBlockPage({ params }: PageProps) {
  const { block } = await params
  const strapiCfg = getStrapiConfigFromEnv()

  // Try Strapi first
  if (strapiCfg) {
    try {
      const page = await fetchStrapiLabBlockPageBySlug(strapiCfg, block)
      if (page) {
        return <LabBlockDetailClient title={page.title} blocks={page.sections} />
      }
    } catch {
      // fall through
    }
  }

  // Sanity fallback
  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  type LabBlockPageData = { _id: string; slug: string; title: string; sections?: unknown[] }
  let page: LabBlockPageData | null = null
  try {
    page = await sanity.fetch<LabBlockPageData | null>(labBlockPageBySlugQuery, { slug: block })
  } catch {
    page = null
  }
  if (!page) notFound()
  return <LabBlockDetailClient title={page.title} blocks={page.sections ?? []} />
}
