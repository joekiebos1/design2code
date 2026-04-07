import Link from 'next/link'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { getClientWithoutStega } from '@design2code/sanity'
import { figmaDesignBySlugQuery } from '@design2code/sanity'
import { BlockRenderer } from '../../components/content/BlockRenderer'
import { StickyNav } from '../../components/shared/StickyNav'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const sanity = getClientWithoutStega(draft)
  const data = await sanity.fetch<{ title: string } | null>(figmaDesignBySlugQuery, { slug })
  if (!data) return { title: slug }
  return { title: `${data.title} · Figma → code` }
}

export default async function Figma2CodePage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const sanity = getClientWithoutStega(draft)
  const data = await sanity.fetch<{
    _id: string
    title: string
    slug: string
    figmaFileUrl?: string | null
    sections: unknown[]
  } | null>(figmaDesignBySlugQuery, { slug })

  if (!data) notFound()

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
          flexWrap: 'wrap',
          gap: 'var(--ds-spacing-m)',
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 'var(--ds-typography-weight-high)',
            color: 'var(--ds-color-text-high)',
            textDecoration: 'none',
          }}
        >
          Page Architect
        </Link>
        <span
          style={{
            fontSize: 'var(--ds-typography-label-m)',
            color: 'var(--ds-color-text-medium)',
          }}
        >
          Figma → code preview
        </span>
        {data.figmaFileUrl ? (
          <a
            href={data.figmaFileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 'var(--ds-typography-label-m)',
              color: 'var(--ds-color-text-link)',
            }}
          >
            Open in Figma
          </a>
        ) : null}
      </header>
      <StickyNav pageTitle={data.title} />
      {Array.isArray(data.sections) && data.sections.length > 0 ? (
        <BlockRenderer blocks={data.sections} />
      ) : (
        <div
          className="ds-container"
          style={{
            padding: 'var(--ds-spacing-xl)',
            color: 'var(--ds-color-text-medium)',
            maxWidth: '40rem',
          }}
        >
          <p style={{ margin: 0, fontSize: 'var(--ds-typography-body-m)' }}>
            This Figma2Code document has no page sections yet. In Sanity Studio, open it under{' '}
            <strong>Figma2Code</strong> and add blocks to <strong>Page sections</strong>, or re-run the import
            script.
          </p>
          <p style={{ marginTop: 'var(--ds-spacing-m)', marginBottom: 0, fontSize: 'var(--ds-typography-label-m)' }}>
            URL slug must match <strong>Slug</strong> in Studio (e.g. <code>test-page</code> →{' '}
            <code>/figma2code/test-page</code>).
          </p>
        </div>
      )}
    </main>
  )
}
