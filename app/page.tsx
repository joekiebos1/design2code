import Link from 'next/link'
import { draftMode } from 'next/headers'
import { getClient } from '../lib/sanity/client'
import { allPagesQuery } from '../lib/sanity/queries'
import { BlockRenderer } from './components/BlockRenderer'
import { StickyNav } from './components/StickyNav'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
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
        <p>No pages yet. Create a page in Sanity Studio.</p>
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
  }>(
    `*[_type == "page" && _id == $id][0]{
    _id,
    title,
    "slug": slug.current,
    sections[]{
      _type,
      _key,
      _type == "hero" => {
        variant,
        spacing,
        productName,
        headline,
        subheadline,
        ctaText,
        ctaLink,
        cta2Text,
        cta2Link,
        "image": coalesce(imageUrl, image.asset->url)
      },
      _type == "cardGrid" => {
        spacing,
        columns,
        title,
        titleLevel,
        items[]{
          cardStyle,
          title,
          description,
          "image": coalesce(imageUrl, image.asset->url),
          surface
        }
      },
      _type == "mediaTextBlock" => {
        spacing,
        eyebrow,
        subhead,
        title,
        titleLevel,
        body,
        bulletList,
        ctaText,
        ctaLink,
        cta2Text,
        cta2Link,
        "image": coalesce(imageUrl, image.asset->url),
        "video": coalesce(videoUrl, video.asset->url),
        size,
        template,
        contentWidth,
        imagePosition,
        overlayAlignment,
        stackImagePosition,
        stackAlignment,
        imageAspectRatio,
        mediaStyle,
        blockBackground
      },
      _type == "fullBleedVerticalCarousel" => {
        spacing,
        items[]{
          title,
          description,
          "image": coalesce(imageUrl, image.asset->url),
          "video": coalesce(videoUrl, video.asset->url)
        }
      },
      _type == "carousel" => {
        spacing,
        variant,
        title,
        titleLevel,
        cardSize,
        items[]{
          title,
          description,
          "image": coalesce(imageUrl, image.asset->url),
          "video": coalesce(videoUrl, video.asset->url),
          link,
          ctaText,
          aspectRatio
        }
      },
      _type == "proofPoints" => {
        spacing,
        title,
        titleLevel,
        items[]{
          title,
          description,
          icon
        }
      }
    }
  }`,
      { id: firstPage._id }
    )
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
              href={p.slug === 'home' ? '/' : `/${p.slug}`}
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
