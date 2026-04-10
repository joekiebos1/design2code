import Link from 'next/link'
import type { Metadata } from 'next'
import { getStrapiConfigFromEnv, fetchStrapiPageBySlug, fetchStrapiPageSummaries } from '@design2code/strapi'
import { pageHrefFromSlug } from '@design2code/ds'
import { BlockRenderer } from '../components/content/BlockRenderer'
import { StickyNav } from '../components/shared/StickyNav'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const cfg = getStrapiConfigFromEnv()
  if (!cfg) return { title: 'Home' }
  const summaries = await fetchStrapiPageSummaries(cfg)
  if (!summaries.length) return { title: 'Home' }
  const page = await fetchStrapiPageBySlug(cfg, summaries[0].slug)
  return { title: page?.title ?? 'Home' }
}

export default async function Home() {
  const cfg = getStrapiConfigFromEnv()

  if (!cfg) {
    return (
      <main>
        <div className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
          <h1>Page Architect</h1>
          <p>Set <code>STRAPI_URL</code> and <code>STRAPI_API_TOKEN</code> in your environment.</p>
        </div>
      </main>
    )
  }

  const summaries = await fetchStrapiPageSummaries(cfg)
  if (!summaries.length) {
    return (
      <main>
        <div className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
          <h1>Page Architect</h1>
          <p>No pages yet. Create a page in Strapi Admin.</p>
        </div>
      </main>
    )
  }

  const pageData = await fetchStrapiPageBySlug(cfg, summaries[0].slug)
  if (!pageData) {
    return (
      <main>
        <div className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
          <h1>Page Architect</h1>
          <p>Could not load page from Strapi.</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      <header
        className="ds-container"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingBlock: 'var(--ds-spacing-s)',
          borderBottom: '1px solid var(--ds-color-stroke-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--ds-color-background-subtle)',
        }}
      >
        <Link href="/" style={{ fontWeight: 'var(--ds-typography-weight-high)', color: 'var(--ds-color-text-high)', textDecoration: 'none' }}>
          Page Architect
        </Link>
        <nav style={{ display: 'flex', gap: 'var(--ds-spacing-m)', alignItems: 'center' }}>
          <Link href="/jiokarna" style={{ color: 'var(--ds-color-text-medium)', textDecoration: 'none', fontSize: 'var(--ds-typography-label-m)' }}>
            JioKarna
          </Link>
          {summaries.map((p) => (
            <Link
              key={p.documentId ?? p.slug}
              href={pageHrefFromSlug(p.slug)}
              style={{ color: 'var(--ds-color-text-medium)', textDecoration: 'none', fontSize: 'var(--ds-typography-label-m)' }}
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
