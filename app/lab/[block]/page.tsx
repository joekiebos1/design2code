/**
 * Lab block page – /lab/[block-slug]
 * Renders one block type with all layout variants. Data from Sanity (labBlockPage).
 * Always fetches fresh data so settings text reflects current Sanity content.
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { LabBlockPageClient } from './LabBlockPageClient'
import { getClient } from '../../../lib/sanity/client'
import { labBlockPageBySlugQuery, allLabBlockPagesQuery } from '../../../lib/sanity/queries'

type PageProps = { params: Promise<{ block: string }> }

export async function generateStaticParams() {
  const sanity = getClient(false)
  let pages: { slug: string }[] = []
  try {
    pages = (await sanity.fetch<{ slug: string }[]>(allLabBlockPagesQuery)) ?? []
  } catch {
    // No Sanity project or fetch failed
  }
  return pages.map((p) => ({ block: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { block } = await params
  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  let page: { title?: string } | null = null
  try {
    page = await sanity.fetch<{ title?: string } | null>(labBlockPageBySlugQuery, { slug: block })
  } catch {
    page = null
  }
  const title = page?.title ?? 'Lab'
  return { title: `${title} · Lab` }
}

type LabBlockPageData = { _id: string; slug: string; title: string; sections?: unknown[] }

export default async function LabBlockPage({ params }: PageProps) {
  const { block } = await params
  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  let page: LabBlockPageData | null = null
  try {
    page = await sanity.fetch<LabBlockPageData | null>(labBlockPageBySlugQuery, { slug: block })
  } catch {
    page = null
  }
  if (!page) {
    notFound()
  }
  const pageData: LabBlockPageData = page
  return (
    <LabBlockPageClient
      title={pageData.title}
      blocks={pageData.sections ?? []}
    />
  )
}
