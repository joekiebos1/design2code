#!/usr/bin/env node
/**
 * Deletes every `labOverview` document in the dataset, then creates a new singleton
 * (`_id` labOverview) with one Media + Text Asymmetric (links) block listing all
 * published lab block pages.
 *
 * Does not touch labBlockPage, pages, or other documents.
 *
 * Run: node --env-file=.env scripts/reset-lab-overview.mjs
 */

import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || projectId === 'your-project-id') {
  console.error('Set SANITY_STUDIO_PROJECT_ID in .env')
  process.exit(1)
}
if (!token) {
  console.error('Set SANITY_API_TOKEN in .env (Editor token)')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

async function main() {
  const ids = await client.fetch(`*[_type == "labOverview"]._id`)
  for (const id of ids || []) {
    try {
      await client.delete(id)
      console.log('Deleted labOverview:', id)
    } catch (err) {
      console.warn('Delete failed for', id, err.message || err)
    }
  }

  const pages =
    (await client.fetch(
      `*[_type == "labBlockPage" && !(_id in path("drafts.**"))] | order(slug asc){ slug, title }`,
    )) ?? []

  const items = pages
    .filter((p) => p?.slug != null && String(p.slug).trim() !== '')
    .map((p) => {
      const slug = String(p.slug).trim()
      return {
        _type: 'mediaTextAsymmetricItem',
        _key: slug.replace(/[^a-zA-Z0-9-]/g, '-') || 'item',
        subtitle: p.title && String(p.title).trim() ? String(p.title).trim() : slug,
        linkUrl: `/lab/${slug}`,
      }
    })

  const doc = {
    _type: 'labOverview',
    _id: 'labOverview',
    sections: [
      {
        _type: 'labMediaTextAsymmetric',
        _key: 'lab-overview-blocks',
        blockTitle: 'Lab blocks',
        variant: 'links',
        emphasis: 'ghost',
        appearance: 'primary',
        spacingTop: 'large',
        spacingBottom: 'large',
        items,
      },
    ],
  }

  await client.createOrReplace(doc)
  console.log(`Created labOverview (${items.length} links to /lab/*). Open Studio → Lab → Homepage.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
