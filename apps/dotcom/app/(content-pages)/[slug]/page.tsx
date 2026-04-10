import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStrapiConfigFromEnv, fetchStrapiPageBySlug, fetchStrapiPageSummaries } from '@design2code/strapi'
import { pageHrefFromSlug } from '@design2code/ds'
import { BlockRenderer } from '../../components/content/BlockRenderer'
import { StickyNav } from '../../components/shared/StickyNav'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cfg = getStrapiConfigFromEnv()
  if (!cfg) return { title: slug }
  const page = await fetchStrapiPageBySlug(cfg, slug)
  return { title: page?.title ?? slug }
}

export default async function PageBySlug({ params }: Props) {
  const { slug } = await params
  const cfg = getStrapiConfigFromEnv()
  if (!cfg) notFound()

  const [pageData, summaries] = await Promise.all([
    fetchStrapiPageBySlug(cfg, slug),
    fetchStrapiPageSummaries(cfg),
  ])
  if (!pageData) notFound()

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
