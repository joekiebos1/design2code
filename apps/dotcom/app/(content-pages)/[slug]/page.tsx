import Link from 'next/link'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { getClient } from '@design2code/sanity'
import { pageBySlugQuery, allPagesQuery } from '@design2code/sanity'
import { fetchStrapiPageBySlug, fetchStrapiPageSummaries, getStrapiConfigFromEnv } from '@design2code/strapi'
import { pageHrefFromSlug } from '@design2code/ds'
import { BlockRenderer } from '../../components/content/BlockRenderer'
import { StickyNav } from '../../components/shared/StickyNav'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const strapiCfg = getStrapiConfigFromEnv()
  if (strapiCfg) {
    try {
      const pageData = await fetchStrapiPageBySlug(strapiCfg, slug)
      if (!pageData) return { title: slug }
      return { title: pageData.title }
    } catch {
      return { title: slug }
    }
  }

  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  const pageData = await sanity.fetch<{ title: string } | null>(pageBySlugQuery, { slug })
  if (!pageData) return { title: slug }
  return { title: pageData.title }
}

export default async function PageBySlug({ params }: Props) {
  const { slug } = await params
  const strapiCfg = getStrapiConfigFromEnv()
  if (strapiCfg) {
    let pageData: Awaited<ReturnType<typeof fetchStrapiPageBySlug>> = null
    try {
      pageData = await fetchStrapiPageBySlug(strapiCfg, slug)
    } catch {
      pageData = null
    }
    if (!pageData) notFound()

    let summaries: Awaited<ReturnType<typeof fetchStrapiPageSummaries>> = []
    try {
      summaries = await fetchStrapiPageSummaries(strapiCfg)
    } catch {
      summaries = []
    }

    return (
      <main>
        <header
          className="ds-container"
          style={{
            paddingBlock: 'var(--ds-spacing-m)',
            borderBottom: '1px solid var(--ds-color-stroke-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link href="/" style={{ fontWeight: 'var(--ds-typography-weight-high)', color: 'var(--ds-color-text-high)', textDecoration: 'none' }}>
            Page Architect
          </Link>
          <nav style={{ display: 'flex', gap: 'var(--ds-spacing-m)' }}>
            {summaries.map((p) => (
              <Link
                key={p.documentId ?? p.slug}
                href={pageHrefFromSlug(p.slug)}
                style={{
                  color: p.slug === slug ? 'var(--ds-color-text-high)' : 'var(--ds-color-text-medium)',
                  textDecoration: 'none',
                  fontSize: 'var(--ds-typography-label-m)',
                  fontWeight: p.slug === slug ? 600 : 400,
                }}
              >
                {p.title}
              </Link>
            ))}
          </nav>
        </header>
        <StickyNav pageTitle={pageData.title} />
        <BlockRenderer blocks={pageData.sections} />
      </main>
    )
  }

  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  const pageData = await sanity.fetch<{
    _id: string
    title: string
    slug: string
    sections: unknown[]
  } | null>(pageBySlugQuery, { slug })

  if (!pageData) notFound()

  const pages = await sanity.fetch<{ _id: string; title: string; slug: string }[]>(allPagesQuery)

  return (
    <main>
      <header
        className="ds-container"
        style={{
          paddingBlock: 'var(--ds-spacing-m)',
          borderBottom: '1px solid var(--ds-color-stroke-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link href="/" style={{ fontWeight: 'var(--ds-typography-weight-high)', color: 'var(--ds-color-text-high)', textDecoration: 'none' }}>
          Page Architect
        </Link>
        <nav style={{ display: 'flex', gap: 'var(--ds-spacing-m)' }}>
          {pages?.map((p) => (
            <Link
              key={p._id}
              href={pageHrefFromSlug(p.slug)}
              style={{
                color: p.slug === slug ? 'var(--ds-color-text-high)' : 'var(--ds-color-text-medium)',
                textDecoration: 'none',
                fontSize: 'var(--ds-typography-label-m)',
                fontWeight: p.slug === slug ? 600 : 400,
              }}
            >
              {p.title}
            </Link>
          ))}
        </nav>
      </header>
      <StickyNav pageTitle={pageData.title} />
      <BlockRenderer blocks={pageData.sections} />
    </main>
  )
}
