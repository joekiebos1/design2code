import { mapStrapiDynamicZoneToSections, type BlockRendererSection } from './map-blocks'
import type { StrapiClientConfig } from './config'

export type StrapiPageEntry = {
  id?: number | string
  documentId?: string
  title: string
  slug: string
  description?: string | null
  sections: BlockRendererSection[]
}

type StrapiCollectionResponse<T> = {
  data: T[]
  meta?: { pagination?: unknown }
}

function authHeaders(cfg: StrapiClientConfig): HeadersInit {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (cfg.apiToken) {
    h.Authorization = `Bearer ${cfg.apiToken}`
  }
  return h
}

function unwrapEntry(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null
  if (typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if ('attributes' in o && o.attributes && typeof o.attributes === 'object') {
    const a = o.attributes as Record<string, unknown>
    return {
      id: o.id,
      documentId: o.documentId,
      ...a,
    }
  }
  return o
}

function entryToPage(baseUrl: string, raw: unknown): StrapiPageEntry | null {
  const e = unwrapEntry(raw)
  if (!e) return null
  const title = e.title
  const slug = e.slug
  if (typeof title !== 'string' || typeof slug !== 'string') return null
  const blocks = e.blocks
  return {
    id: e.id as number | string | undefined,
    documentId: e.documentId as string | undefined,
    title,
    slug,
    description: (e.description as string | null) ?? null,
    sections: mapStrapiDynamicZoneToSections(baseUrl, blocks),
  }
}

export type StrapiPageSummary = {
  documentId?: string
  id?: number | string
  title: string
  slug: string
}

function unwrapSummary(raw: unknown): StrapiPageSummary | null {
  const e = unwrapEntry(raw)
  if (!e) return null
  const title = e.title
  const slug = e.slug
  if (typeof title !== 'string' || typeof slug !== 'string') return null
  return {
    id: e.id as number | string | undefined,
    documentId: e.documentId as string | undefined,
    title,
    slug,
  }
}

/** List pages (title, slug, ids) without block payload — use `fetchStrapiPageBySlug` for sections. */
export async function fetchStrapiPageSummaries(cfg: StrapiClientConfig): Promise<StrapiPageSummary[]> {
  const qs = new URLSearchParams()
  qs.set('pagination[pageSize]', '100')
  qs.set('publicationState', 'live')
  const url = `${cfg.baseUrl}/api/pages?${qs.toString()}`
  const res = await fetch(url, { headers: authHeaders(cfg), next: { revalidate: 0 } })
  if (!res.ok) {
    throw new Error(`Strapi fetch pages failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as StrapiCollectionResponse<unknown>
  const rows = json.data ?? []
  const out: StrapiPageSummary[] = []
  for (const row of rows) {
    const s = unwrapSummary(row)
    if (s) out.push(s)
  }
  return out
}

export async function fetchStrapiPageBySlug(
  cfg: StrapiClientConfig,
  slug: string
): Promise<StrapiPageEntry | null> {
  const qs = new URLSearchParams()
  qs.set('filters[slug][$eq]', slug)
  qs.append('populate[blocks][populate]', '*')
  qs.set('publicationState', 'live')
  const url = `${cfg.baseUrl}/api/pages?${qs.toString()}`
  const res = await fetch(url, { headers: authHeaders(cfg), next: { revalidate: 0 } })
  if (!res.ok) {
    throw new Error(`Strapi fetch page failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as StrapiCollectionResponse<unknown>
  const first = json.data?.[0]
  if (!first) return null
  return entryToPage(cfg.baseUrl, first)
}

// ---------------------------------------------------------------------------
// Lab block pages
// ---------------------------------------------------------------------------

export async function fetchStrapiLabBlockPageSummaries(cfg: StrapiClientConfig): Promise<StrapiPageSummary[]> {
  const qs = new URLSearchParams()
  qs.set('pagination[pageSize]', '100')
  const url = `${cfg.baseUrl}/api/lab-block-pages?${qs.toString()}`
  const res = await fetch(url, { headers: authHeaders(cfg), next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`Strapi fetch lab pages failed: ${res.status}`)
  const json = (await res.json()) as StrapiCollectionResponse<unknown>
  return (json.data ?? []).map(unwrapSummary).filter(Boolean) as StrapiPageSummary[]
}

export async function fetchStrapiLabBlockPageBySlug(
  cfg: StrapiClientConfig,
  slug: string
): Promise<StrapiPageEntry | null> {
  const qs = new URLSearchParams()
  qs.set('filters[slug][$eq]', slug)
  qs.append('populate[blocks][populate]', '*')
  const url = `${cfg.baseUrl}/api/lab-block-pages?${qs.toString()}`
  const res = await fetch(url, { headers: authHeaders(cfg), next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`Strapi fetch lab page failed: ${res.status}`)
  const json = (await res.json()) as StrapiCollectionResponse<unknown>
  const first = json.data?.[0]
  if (!first) return null
  return entryToPage(cfg.baseUrl, first)
}

export async function fetchStrapiLabOverview(cfg: StrapiClientConfig): Promise<StrapiPageEntry | null> {
  return fetchStrapiLabBlockPageBySlug(cfg, 'overview')
}

export async function fetchStrapiPageByDocumentId(
  cfg: StrapiClientConfig,
  documentId: string
): Promise<StrapiPageEntry | null> {
  const qs = new URLSearchParams()
  qs.set('filters[documentId][$eq]', documentId)
  qs.append('populate[blocks][populate]', '*')
  qs.set('publicationState', 'live')
  const url = `${cfg.baseUrl}/api/pages?${qs.toString()}`
  const res = await fetch(url, { headers: authHeaders(cfg), next: { revalidate: 0 } })
  if (!res.ok) {
    throw new Error(`Strapi fetch page by id failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as StrapiCollectionResponse<unknown>
  const first = json.data?.[0]
  if (!first) return null
  return entryToPage(cfg.baseUrl, first)
}
