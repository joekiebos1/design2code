#!/usr/bin/env node
/**
 * Analyze current Sanity lab content before updating seed.
 * Run: node --env-file=.env scripts/analyze-sanity-lab.mjs
 */
import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!projectId || projectId === 'your-project-id') {
  console.error('Set SANITY_STUDIO_PROJECT_ID in .env')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function main() {
  console.log('Fetching lab block pages from Sanity...\n')

  const pages = await client.fetch(
    `*[_type == "labBlockPage"] | order(slug asc){
      _id,
      slug,
      title,
      sections[]{
        _type,
        _key,
        contentLayout,
        template,
        blockSurface,
        blockBackground,
        surface,
        variant,
        variant,
        columns,
        slug,
        title
      }
    }`
  )

  if (!pages?.length) {
    console.log('No lab block pages found.')
    return
  }

  for (const page of pages) {
    console.log(`## ${page.title} (/${page.slug})`)
    console.log(`   _id: ${page._id}`)
    if (page.sections?.length) {
      console.log(`   Sections (${page.sections.length}):`)
      for (const s of page.sections) {
        const layout = s.contentLayout ?? s.template ?? s.surface ?? s.variant ?? s._type
        const key = s._key ?? '(no key)'
        console.log(`     - ${s._type} [${key}] ${layout ? `· ${layout}` : ''}`)
      }
    } else {
      console.log('   (no sections)')
    }
    console.log('')
  }

  // Hero-specific: list contentLayout values
  const heroPage = pages.find((p) => p.slug === 'hero')
  if (heroPage?.sections) {
    const heroLayouts = heroPage.sections
      .filter((s) => s._type === 'hero')
      .map((s) => ({ _key: s._key, contentLayout: s.contentLayout }))
    console.log('Hero variants (contentLayout):')
    heroLayouts.forEach((h) => console.log(`  ${h._key}: ${h.contentLayout}`))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
