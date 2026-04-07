import { createClient, type SanityClient } from '@sanity/client'
import type { FilterDefault } from '@sanity/client/stega'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'
const apiVersion = '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
})

/** Exclude fields that end up in href/src/attributes - stega chars can cause InvalidCharacterError */
const stegaFilter: FilterDefault = (props) => {
  const segments = [...props.sourcePath, ...props.resultPath].filter(
    (s): s is string => typeof s === 'string'
  )
  const skip = new Set([
    'ctaLink',
    'cta2Link',
    'link',
    'url',
    'image',
    'video',
    'slug',
    'href',
    'src',
    'icon',
  ])
  if (segments.some((s) => skip.has(s))) return false
  return props.filterDefault(props)
}

/** Client configured for draft preview (use when draftMode is enabled) */
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'previewDrafts',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN,
  stega: {
    enabled: true,
    studioUrl: process.env.SANITY_STUDIO_URL || 'http://localhost:3333',
    filter: stegaFilter,
  },
})

/** Returns the appropriate client: previewClient when in draft mode, else client */
export function getClient(draftMode: boolean): SanityClient {
  return draftMode ? previewClient : client
}

/**
 * Server fetch without stega-encoding (safe for `switch (block._type)` in BlockRenderer).
 * Use when a read/write token is available so draft + published documents resolve reliably.
 */
export function getClientWithoutStega(draftMode: boolean): SanityClient {
  const readToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN
  if (!readToken) {
    return getClient(draftMode)
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token: readToken,
    useCdn: false,
    perspective: draftMode ? 'previewDrafts' : 'published',
  })
}
