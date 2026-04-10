export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LabBlockDetailClient } from './LabBlockDetailClient'
import {
  getStrapiConfigFromEnv,
  fetchStrapiLabBlockPageBySlug,
  fetchStrapiLabBlockPageSummaries,
} from '@design2code/strapi'

type PageProps = { params: Promise<{ block: string }> }

export async function generateStaticParams() {
  try {
    const cfg = getStrapiConfigFromEnv()
    if (!cfg) return []
    const pages = await fetchStrapiLabBlockPageSummaries(cfg)
    return pages.map((p) => ({ block: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { block } = await params
  const cfg = getStrapiConfigFromEnv()
  if (!cfg) return { title: 'Lab' }
  const page = await fetchStrapiLabBlockPageBySlug(cfg, block)
  return { title: page ? `${page.title} · Lab` : 'Lab' }
}

export default async function LabBlockPage({ params }: PageProps) {
  const { block } = await params
  const cfg = getStrapiConfigFromEnv()
  if (!cfg) notFound()
  const page = await fetchStrapiLabBlockPageBySlug(cfg, block)
  if (!page) notFound()
  return <LabBlockDetailClient title={page.title} blocks={page.sections} />
}
