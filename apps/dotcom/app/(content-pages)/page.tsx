import Link from 'next/link'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { getClient } from '@design2code/sanity'
import { allPagesQuery, pageByIdQuery } from '@design2code/sanity'
import {
  fetchStrapiPageBySlug,
  fetchStrapiPageSummaries,
  getStrapiConfigFromEnv,
} from '@design2code/strapi'
import { pageHrefFromSlug } from '@design2code/ds'
import { BlockRenderer } from '../components/content/BlockRenderer'
import { StickyNav } from '../components/shared/StickyNav'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const strapiCfg = getStrapiConfigFromEnv()
  if (strapiCfg) {
    try {
      const summaries = await fetchStrapiPageSummaries(strapiCfg)
      const first = summaries[0]
      if (!first) return { title: 'Home' }
      const page = await fetchStrapiPageBySlug(strapiCfg, first.slug)
      return { title: page?.title ?? 'Home' }
    } catch {
      return { title: 'Home' }
    }
  }

  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  let pages: { _id: string; title: string; slug: string }[] = []
  try {
    pages = (await sanity.fetch<{ _id: string; title: string; slug: string }[]>(allPagesQuery)) ?? []
  } catch {
    // No Sanity project configured or fetch failed
  }
  const firstPage = pages[0]
  if (!firstPage) return { title: 'Home' }
  try {
    const pageData = await sanity.fetch<{ title: string } | null>(
      `*[_type == "page" && _id == $id][0]{ title }`,
      { id: firstPage._id }
    )
    return { title: pageData?.title ?? 'Home' }
  } catch {
    return { title: 'Home' }
  }
}

export default async function Home() {
  const strapiCfg = getStrapiConfigFromEnv()
  if (strapiCfg) {
    let summaries: Awaited<ReturnType<typeof fetchStrapiPageSummaries>> = []
    try {
      summaries = await fetchStrapiPageSummaries(strapiCfg)
    } catch {
      summaries = []
    }

    if (!summaries.length) {
      return (
        <main>
          <div className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
            <h1>Page Architect</h1>
            <p>No pages yet. Create a page in Strapi Admin ({strapiCfg.baseUrl}/admin).</p>
            <p>
              Set <code>STRAPI_URL</code> and <code>STRAPI_API_TOKEN</code> in <code>apps/dotcom/.env</code> if the API is
              protected.
            </p>
          </div>
        </main>
      )
    }

    const first = summaries[0]
    let pageData: Awaited<ReturnType<typeof fetchStrapiPageBySlug>> = null
    try {
      pageData = await fetchStrapiPageBySlug(strapiCfg, first.slug)
    } catch {
      pageData = null
    }

    if (!pageData) {
      return (
        <main>
          <div className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
            <h1>Page Architect</h1>
            <p>Could not load page from Strapi. Check <code>STRAPI_URL</code>, API token, and Public permissions.</p>
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

  const { isEnabled: draft } = await draftMode()
  const sanity = getClient(draft)
  let pages: { _id: string; title: string; slug: string }[] = []
  try {
    pages = await sanity.fetch<{ _id: string; title: string; slug: string }[]>(allPagesQuery) ?? []
  } catch {
    // No Sanity project configured or fetch failed
  }

  if (!pages?.length) {
    return (
      <main>
        <div className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
          <h1>Page Architect</h1>
          <p>No pages yet. Create a page in Sanity Studio, or set STRAPI_URL to use Strapi.</p>
          <p>
            Run <code>npm run dev</code> for Sanity Studio, then add a page with blocks.
          </p>
        </div>
      </main>
    )
  }

  const firstPage = pages[0]
  let pageData: {
    _id: string
    title: string
    slug: string
    sections: unknown[]
  } | null = null
  try {
    pageData = await sanity.fetch<{
      _id: string
      title: string
      slug: string
      sections: unknown[]
    }>(pageByIdQuery, { id: firstPage._id })
  } catch {
    pageData = null
  }

  if (!pageData) {
    return (
      <main>
        <div className="ds-container" style={{ paddingBlock: 'var(--ds-spacing-2xl)' }}>
          <h1>Page Architect</h1>
          <p>Could not load page. Check your Sanity project ID and dataset in .env</p>
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
          {pages.map((p) => (
            <Link
              key={p._id}
              href={pageHrefFromSlug(p.slug)}
              style={{ color: 'var(--ds-color-text-medium)', textDecoration: 'none', fontSize: 'var(--ds-typography-label-m)' }}
            >
              {p.title}
            </Link>
          ))}
        </nav>
      </header>
      <StickyNav pageTitle={pageData.title} />
      <BlockRenderer blocks={pageData?.sections} />
    </main>
  )
}
