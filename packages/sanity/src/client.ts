import { createClient, type SanityClient } from '@sanity/client'
import type { FilterDefault } from '@sanity/client/stega'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'
const apiVersion = '2024-01-01'

function requireProjectId(): string {
  if (!projectId) throw new Error('Sanity projectId not configured — set NEXT_PUBLIC_SANITY_PROJECT_ID')
  return projectId
}

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

let _client: SanityClient | null = null
let _previewClient: SanityClient | null = null

export function getClient(draftMode: boolean): SanityClient {
  if (draftMode) {
    if (!_previewClient) {
      _previewClient = createClient({
        projectId: requireProjectId(),
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
    }
    return _previewClient
  }
  if (!_client) {
    _client = createClient({
      projectId: requireProjectId(),
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === 'production',
    })
  }
  return _client
}

/** @deprecated Use getClient() directly */
export const client = new Proxy({} as SanityClient, {
  get(_, prop) { return (getClient(false) as Record<string | symbol, unknown>)[prop] },
})

/** @deprecated Use getClient() directly */
export const previewClient = new Proxy({} as SanityClient, {
  get(_, prop) { return (getClient(true) as Record<string | symbol, unknown>)[prop] },
})

export function getClientWithoutStega(draftMode: boolean): SanityClient {
  const readToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN
  if (!readToken) {
    return getClient(draftMode)
  }
  return createClient({
    projectId: requireProjectId(),
    dataset,
    apiVersion,
    token: readToken,
    useCdn: false,
    perspective: draftMode ? 'previewDrafts' : 'published',
  })
}
