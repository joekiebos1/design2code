#!/usr/bin/env node
/**
 * One-shot migration: Sanity → Strapi
 *
 * Run from the repo root or content/ dir:
 *   node content/scripts/migrate-from-sanity.mjs
 *
 * Reads credentials from env (falls back to hardcoded values for convenience).
 */

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || 'oaxzfi7n'
const SANITY_DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production'
const SANITY_TOKEN      = process.env.SANITY_API_TOKEN?.trim() || ''
const STRAPI_URL        = process.env.STRAPI_URL?.trim() || 'http://localhost:1337'
const STRAPI_TOKEN      = process.env.STRAPI_API_TOKEN?.trim() || ''

// ---------------------------------------------------------------------------
// Sanity HTTP client
// ---------------------------------------------------------------------------

async function querySanity(groq, params = {}) {
  const base = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}`
  const url = new URL(base)
  url.searchParams.set('query', groq)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(`$${k}`, JSON.stringify(v))
  }
  const headers = SANITY_TOKEN ? { Authorization: `Bearer ${SANITY_TOKEN}` } : {}
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return json.result
}

// ---------------------------------------------------------------------------
// Strapi HTTP client
// ---------------------------------------------------------------------------

function strapiHeaders(json = false) {
  const h = { Authorization: `Bearer ${STRAPI_TOKEN}` }
  if (json) h['Content-Type'] = 'application/json'
  return h
}

async function strapiGet(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, { headers: strapiHeaders() })
  if (!res.ok) throw new Error(`Strapi GET ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function strapiPost(path, body) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: 'POST',
    headers: strapiHeaders(true),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Strapi POST ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function strapiPut(path, body) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: 'PUT',
    headers: strapiHeaders(true),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Strapi PUT ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function strapiDelete(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: 'DELETE',
    headers: strapiHeaders(),
  })
  if (!res.ok) throw new Error(`Strapi DELETE ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function strapiUpload(buffer, filename, mimeType) {
  const form = new FormData()
  form.append('files', new File([buffer], filename, { type: mimeType }))
  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    body: form,
  })
  if (!res.ok) throw new Error(`Strapi upload failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return json[0] // returns array
}

// ---------------------------------------------------------------------------
// Block type mapping: Sanity _type → Strapi __component
// ---------------------------------------------------------------------------

const TYPE_MAP = {
  hero:                           'blocks.hero',
  labHero:                        'blocks.hero',
  cardGrid:                       'blocks.card-grid',
  labCardGrid:                    'blocks.card-grid',
  mediaTextStacked:               'blocks.media-text-stacked',
  labMediaTextStacked:            'blocks.media-text-stacked',
  mediaTextBlock:                 'blocks.media-text-block',
  mediaText5050:                  'blocks.media-text-5050',
  labMediaText5050:               'blocks.media-text-5050',
  carousel:                       'blocks.carousel',
  labCarousel:                    'blocks.carousel',
  proofPoints:                    'blocks.proof-points',
  labProofPoints:                 'blocks.proof-points',
  iconGrid:                       'blocks.icon-grid',
  labIconGrid:                    'blocks.icon-grid',
  mediaTextAsymmetric:            'blocks.media-text-asymmetric',
  labMediaTextAsymmetric:         'blocks.media-text-asymmetric',
  fullBleedVerticalCarousel:      'blocks.full-bleed-vertical-carousel',
  labFullBleedVerticalCarousel:   'blocks.full-bleed-vertical-carousel',
  rotatingMedia:                  'blocks.rotating-media',
  labRotatingMedia:               'blocks.rotating-media',
  mediaZoomOutOnScroll:           'blocks.media-zoom-out-on-scroll',
  labMediaZoomOutOnScroll:        'blocks.media-zoom-out-on-scroll',
  editorialBlock:                 'blocks.editorial-block',
  labEditorialBlock:              'blocks.editorial-block',
}

// ---------------------------------------------------------------------------
// Block field transformers
// ---------------------------------------------------------------------------

/**
 * Strip Sanity internal fields (_key, _type) from an item and rename
 * media fields: image → imageUrl, video → videoUrl.
 */
function cleanItem(item) {
  if (!item || typeof item !== 'object') return item
  const { _key, _type, image, video, backgroundImage, ...rest } = item
  const out = { ...rest }
  if (image != null)           out.imageUrl = image
  if (video != null)           out.videoUrl = video
  if (backgroundImage != null) out.backgroundImageUrl = backgroundImage
  return out
}

function cleanItems(arr) {
  if (!Array.isArray(arr)) return undefined
  return arr.map(cleanItem).filter(Boolean)
}

function cleanCallToActions(arr) {
  if (!Array.isArray(arr)) return undefined
  return arr.map(({ _key, ...rest }) => rest).filter(Boolean)
}

// Boolean fields that Sanity sometimes stores as strings or unexpected values
const BOOLEAN_FIELDS = new Set(['minimalBackgroundStyle', 'textInFront'])

function coerceBooleans(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const out = { ...obj }
  for (const key of BOOLEAN_FIELDS) {
    if (key in out) {
      const v = out[key]
      if (typeof v === 'boolean') continue
      // "block", "true", 1, etc. → true; null, undefined, false, 0, "" → null (omit)
      out[key] = v ? true : null
      if (out[key] === null) delete out[key]
    }
  }
  return out
}

/**
 * Transform a single Sanity section/block into a Strapi dynamic-zone entry.
 * Returns null for unknown types (will be filtered out).
 */
function transformBlock(sanityBlock) {
  const sanityType = sanityBlock._type
  const component = TYPE_MAP[sanityType]
  if (!component) {
    console.warn(`  ⚠  Unknown block type "${sanityType}" — skipping`)
    return null
  }

  // Destructure Sanity fields, rename as needed
  const {
    _type, _key,
    image,
    video,
    backgroundImage,
    callToActions,
    items,
    accordionItems,
    longFormParagraphs,
    paragraphRows,
    ...rest
  } = sanityBlock

  const out = {
    __component: component,
    ...rest,
  }

  // Top-level media renames
  if (image != null)           out.imageUrl = image
  if (video != null)           out.videoUrl = video
  if (backgroundImage != null) out.backgroundImageUrl = backgroundImage

  // Nested repeatable components — strip _key
  if (callToActions)      out.callToActions = cleanCallToActions(callToActions)
  if (items)              out.items = cleanItems(items)
  if (accordionItems)     out.accordionItems = cleanItems(accordionItems)
  if (longFormParagraphs) out.longFormParagraphs = cleanItems(longFormParagraphs)
  if (paragraphRows)      out.paragraphRows = cleanItems(paragraphRows)

  // Component-specific fixups
  if (component === 'blocks.editorial-block') {
    // rows is a number in Sanity, string in Strapi
    if (out.rows != null && typeof out.rows !== 'string') out.rows = String(out.rows)
    // textArea and imageArea are grid-spec objects in Sanity, stored as JSON string in Strapi
    if (out.textArea != null && typeof out.textArea !== 'string') out.textArea = JSON.stringify(out.textArea)
    if (out.imageArea != null && typeof out.imageArea !== 'string') out.imageArea = JSON.stringify(out.imageArea)
  }

  return coerceBooleans(out)
}

function transformBlocks(sections) {
  if (!Array.isArray(sections)) return []
  return sections.map(transformBlock).filter(Boolean)
}

// ---------------------------------------------------------------------------
// Helpers: Strapi list all entries (paginated)
// ---------------------------------------------------------------------------

async function strapiListAll(collection) {
  const qs = 'pagination[pageSize]=200&pagination[page]=1'
  const json = await strapiGet(`/api/${collection}?${qs}`)
  return json.data ?? []
}

// ---------------------------------------------------------------------------
// STUDIO INSPIRATIONS
// ---------------------------------------------------------------------------

async function migrateStudioInspirations() {
  console.log('\n=== Studio Inspirations ===')

  // Fetch from Sanity — both types in one query
  const sanityItems = await querySanity(`
    *[_type == "studioInspiration" && !(_id in path("drafts.**"))] | order(_updatedAt desc) {
      _id,
      title,
      inspirationType,
      linkUrl,
      "mediaUrl": coalesce(media.asset->url, thumbnail.asset->url, mediaVideo.asset->url),
      "mimeType": coalesce(media.asset->mimeType, thumbnail.asset->mimeType, mediaVideo.asset->mimeType)
    }
  `)
  console.log(`  Sanity: found ${sanityItems.length} items`)

  // Delete all existing Strapi entries first (clean slate)
  const existing = await strapiListAll('studio-inspirations')
  console.log(`  Strapi: deleting ${existing.length} existing entries`)
  for (const entry of existing) {
    await strapiDelete(`/api/studio-inspirations/${entry.documentId}`)
  }

  // Re-create from Sanity
  let created = 0
  let skipped = 0
  for (const item of sanityItems) {
    const category = item.inspirationType // benchmark | jioDesign
    if (category !== 'benchmark' && category !== 'jioDesign') {
      console.warn(`  ⚠  Unknown inspirationType "${category}" for "${item.title}" — skipping`)
      skipped++
      continue
    }

    let mediaId = null
    let mimeType = item.mimeType ?? ''

    if (item.mediaUrl) {
      try {
        console.log(`  ↓  Downloading media for "${item.title}"…`)
        const mediaRes = await fetch(item.mediaUrl)
        if (!mediaRes.ok) throw new Error(`HTTP ${mediaRes.status}`)
        const buffer = await mediaRes.arrayBuffer()

        const ext = mimeType.includes('video') ? 'mp4'
          : mimeType.includes('png') ? 'png'
          : mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg'
          : mimeType.includes('gif') ? 'gif'
          : mimeType.includes('webp') ? 'webp'
          : 'bin'
        const filename = `${item._id.replace(/[^a-z0-9]/gi, '-')}.${ext}`

        const uploaded = await strapiUpload(buffer, filename, mimeType || 'application/octet-stream')
        mediaId = uploaded?.id ?? null
        if (!mimeType && uploaded?.mime) mimeType = uploaded.mime
        console.log(`  ↑  Uploaded as ${filename} (id=${mediaId})`)
      } catch (err) {
        console.warn(`  ⚠  Media upload failed for "${item.title}": ${err.message}`)
      }
    }

    await strapiPost('/api/studio-inspirations', {
      data: {
        title: item.title ?? '',
        category,
        linkUrl: item.linkUrl ?? '',
        media: mediaId,
        mimeType,
      },
    })
    created++
    console.log(`  ✓  Created: "${item.title}" (${category})`)
  }

  console.log(`  Done: ${created} created, ${skipped} skipped`)
}

// ---------------------------------------------------------------------------
// PAGES (dotcom production pages)
// ---------------------------------------------------------------------------

const PAGE_SECTIONS_GROQ = `{
  _type, _key,
  _type == "hero" => {
    contentLayout, containerLayout, imageAnchor, textAlign, emphasis,
    "appearance": coalesce(appearance, surfaceColour),
    spacingTop, spacingBottom,
    "eyebrow": coalesce(eyebrow, productName),
    "title": coalesce(title, headline),
    "body": coalesce(body, subheadline),
    ctaText, ctaLink, cta2Text, cta2Link,
    "image": coalesce(imageUrl, image.asset->url),
    "videoUrl": coalesce(videoUrl, video.asset->url)
  },
  _type == "cardGrid" => {
    spacingTop, spacingBottom, interaction, columns, title, emphasis, minimalBackgroundStyle,
    "appearance": coalesce(appearance, surfaceColour),
    items[]{ _key, cardType, title, description, "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url), ctaText, ctaLink, link, icon, "iconImage": iconImage.asset->url, backgroundColor, aspectRatio }
  },
  _type == "mediaTextStacked" => {
    spacingTop, spacingBottom, eyebrow, subhead, title, body, ctaText, ctaLink, cta2Text, cta2Link,
    "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url),
    template, imagePosition, alignment, overlayAlignment, textOnlyAlignment, stackAlignment,
    mediaSize, descriptionTitle, descriptionBody, stackedMediaWidth, imageAspectRatio,
    emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour)
  },
  _type == "mediaTextBlock" => {
    spacingTop, spacingBottom, eyebrow, subhead, title, body, ctaText, ctaLink, cta2Text, cta2Link,
    "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url),
    template, imagePosition, alignment, overlayAlignment, textOnlyAlignment, stackAlignment,
    mediaSize, descriptionTitle, descriptionBody, stackedMediaWidth, imageAspectRatio,
    emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour)
  },
  _type == "mediaText5050" => {
    spacingTop, spacingBottom, headline, description,
    callToActions[]{ _key, label, link, style },
    variant, paragraphColumnLayout, singleSubtitle, singleBody, imagePosition,
    headingAlignment, blockFramingAlignment,
    items[]{ _key, subtitle, body },
    accordionItems[]{ _key, subtitle, body, "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url) },
    "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url),
    imageAspectRatio, emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour)
  },
  _type == "carousel" => {
    spacingTop, spacingBottom, interaction, title, description,
    callToActions[]{ _key, label, link, style },
    cardSize, emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour),
    items[]{ cardType, title, description, backgroundColor, "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url), link, ctaText, aspectRatio }
  },
  _type == "proofPoints" => {
    spacingTop, spacingBottom, title, description,
    callToActions[]{ _key, label, link, style },
    variant, emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour),
    items[]{ title, description, icon }
  },
  _type == "iconGrid" => {
    spacingTop, spacingBottom, title, description,
    callToActions[]{ _key, label, link, style },
    emphasis, "appearance": coalesce(appearance, surfaceColour), minimalBackgroundStyle, columns,
    items[]{ title, body, icon, accentColor, spectrum }
  },
  _type == "mediaTextAsymmetric" => {
    spacingTop, spacingBottom, blockTitle, description,
    callToActions[]{ _key, label, link, style },
    variant, paragraphLayout, singleColumnBody,
    longFormParagraphs[]{ _key, text, bodyTypography },
    emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour),
    imageAspectRatio, imageAlt, "image": coalesce(imageUrl, image.asset->url),
    paragraphRows[]{ _key, title, body, bodyTypography, linkText, linkUrl },
    items[]{ title, body, linkText, linkUrl, subtitle }
  }
}`

async function migratePages() {
  console.log('\n=== Pages ===')

  const sanityPages = await querySanity(`
    *[_type == "page" && !(_id in path("drafts.**"))] | order(slug.current asc) {
      _id,
      title,
      "slug": slug.current,
      sections[]${PAGE_SECTIONS_GROQ}
    }
  `)
  console.log(`  Sanity: found ${sanityPages.length} pages`)

  // Build slug → documentId map from Strapi
  const existing = await strapiListAll('pages')
  const slugMap = {}
  for (const e of existing) {
    if (e.slug) slugMap[e.slug] = e.documentId
  }
  console.log(`  Strapi: ${existing.length} existing pages`)

  for (const page of sanityPages) {
    if (!page.slug) {
      console.warn(`  ⚠  Page "${page.title}" has no slug — skipping`)
      continue
    }

    // Strapi uid disallows slashes — flatten path slugs
    const slug = page.slug.replace(/\//g, '-')
    if (slug !== page.slug) {
      console.log(`  ⚡  Slug sanitized: "${page.slug}" → "${slug}"`)
    }

    const blocks = transformBlocks(page.sections)
    const payload = { data: { title: page.title, slug, blocks } }

    if (slugMap[slug]) {
      await strapiPut(`/api/pages/${slugMap[slug]}`, payload)
      console.log(`  ✎  Updated: "${page.title}" (/${slug}) — ${blocks.length} blocks`)
    } else {
      await strapiPost('/api/pages', payload)
      console.log(`  ✓  Created: "${page.title}" (/${slug}) — ${blocks.length} blocks`)
    }
  }
}

// ---------------------------------------------------------------------------
// LAB BLOCK PAGES
// ---------------------------------------------------------------------------

// Sanity "media-text" page maps to Strapi "media-text-block"
// Sanity "editorial" page maps to Strapi "editorial-block"
// Sanity "top-nav" has no Strapi equivalent — skip
const LAB_SLUG_MAP = {
  'media-text':  'media-text-block',
  'editorial':   'editorial-block',
}
const LAB_SLUG_SKIP = new Set(['top-nav'])

const LAB_SECTIONS_GROQ = `{
  _type, _key,
  _type in ["mediaTextStacked","labMediaTextStacked"] => {
    spacingTop, spacingBottom, eyebrow, subhead, title, body, ctaText, ctaLink, cta2Text, cta2Link,
    "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url),
    template, imagePosition, alignment, overlayAlignment, textOnlyAlignment, stackAlignment,
    mediaSize, descriptionTitle, descriptionBody, stackedMediaWidth, imageAspectRatio,
    emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour)
  },
  _type in ["mediaTextBlock"] => {
    spacingTop, spacingBottom, eyebrow, subhead, title, body, ctaText, ctaLink, cta2Text, cta2Link,
    "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url),
    template, imagePosition, alignment, overlayAlignment, textOnlyAlignment, stackAlignment,
    mediaSize, descriptionTitle, descriptionBody, stackedMediaWidth, imageAspectRatio,
    emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour)
  },
  _type in ["mediaText5050","labMediaText5050"] => {
    spacingTop, spacingBottom, headline, description,
    callToActions[]{ _key, label, link, style },
    variant, paragraphColumnLayout, singleSubtitle, singleBody, imagePosition,
    headingAlignment, blockFramingAlignment,
    items[]{ _key, subtitle, body },
    accordionItems[]{ _key, subtitle, body, "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url) },
    "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url),
    imageAspectRatio, emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour)
  },
  _type in ["cardGrid","labCardGrid"] => {
    spacingTop, spacingBottom, interaction, columns, cardSurface, title, description,
    callToActions[]{ _key, label, link, style },
    emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour),
    items[]{ _key, cardType, title, description, backgroundColor, "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url), ctaText, ctaLink, link, aspectRatio, icon, "iconImage": iconImage.asset->url }
  },
  _type in ["labCarousel","carousel"] => {
    spacingTop, spacingBottom, interaction, cardSurface, eyebrow, title, description,
    callToActions[]{ _key, label, link, style },
    cardSize, emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour),
    items[]{ _key, cardType, title, description, backgroundColor, "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url), link, ctaText, aspectRatio }
  },
  _type in ["hero","labHero"] => {
    "eyebrow": coalesce(eyebrow, productName),
    "title": coalesce(title, headline),
    "body": coalesce(body, subheadline),
    ctaText, ctaLink, cta2Text, cta2Link,
    "image": coalesce(imageUrl, image.asset->url),
    "videoUrl": coalesce(videoUrl, video.asset->url),
    contentLayout, containerLayout, imageAnchor, textAlign, emphasis,
    "appearance": coalesce(appearance, surfaceColour)
  },
  _type in ["fullBleedVerticalCarousel","labFullBleedVerticalCarousel"] => {
    spacingTop, spacingBottom, emphasis, "appearance": coalesce(appearance, surfaceColour), minimalBackgroundStyle,
    title, description,
    callToActions[]{ _key, label, link, style },
    items[]{ title, description, "image": coalesce(imageUrl, image.asset->url), "video": coalesce(videoUrl, video.asset->url) }
  },
  _type in ["rotatingMedia","labRotatingMedia"] => {
    spacingTop, spacingBottom, variant, emphasis, "appearance": coalesce(appearance, surfaceColour), minimalBackgroundStyle,
    title, description,
    callToActions[]{ _key, label, link, style },
    items[]{ "image": coalesce(imageUrl, image.asset->url), title, label }
  },
  _type in ["mediaZoomOutOnScroll","labMediaZoomOutOnScroll"] => {
    spacingTop, spacingBottom, title, description,
    callToActions[]{ _key, label, link, style },
    "image": coalesce(imageUrl, image.asset->url),
    videoUrl, alt
  },
  _type in ["editorialBlock","labEditorialBlock"] => {
    spacingTop, spacingBottom, rows, emphasis, "appearance": coalesce(appearance, surfaceColour),
    textArea, headlineSize, textAlign, textVerticalAlign, textInFront,
    headline, description,
    callToActions[]{ _key, label, link, style },
    body, ctaText, ctaLink, imageArea,
    "backgroundImage": coalesce(backgroundImageUrl, backgroundImage.asset->url),
    backgroundImagePositionX, backgroundImagePositionY,
    "image": coalesce(imageUrl, image.asset->url), imageUrl, videoUrl, imageFit
  },
  _type in ["iconGrid","labIconGrid"] => {
    spacingTop, spacingBottom, title, description,
    callToActions[]{ _key, label, link, style },
    emphasis, "appearance": coalesce(appearance, surfaceColour), minimalBackgroundStyle, columns,
    items[]{ title, body, icon, accentColor, spectrum }
  },
  _type in ["proofPoints","labProofPoints"] => {
    spacingTop, spacingBottom, title, description,
    callToActions[]{ _key, label, link, style },
    variant, emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour),
    items[]{ title, description, icon }
  },
  _type in ["mediaTextAsymmetric","labMediaTextAsymmetric"] => {
    spacingTop, spacingBottom, blockTitle, description,
    callToActions[]{ _key, label, link, style },
    variant, paragraphLayout, singleColumnBody,
    longFormParagraphs[]{ _key, text, bodyTypography },
    emphasis, minimalBackgroundStyle, "appearance": coalesce(appearance, surfaceColour),
    imageAspectRatio, imageAlt, "image": coalesce(imageUrl, image.asset->url),
    paragraphRows[]{ _key, title, body, bodyTypography, linkText, linkUrl },
    items[]{ title, body, linkText, linkUrl, subtitle }
  }
}`

async function migrateLabBlockPages() {
  console.log('\n=== Lab Block Pages ===')

  const sanityPages = await querySanity(`
    *[_type == "labBlockPage" && !(_id in path("drafts.**"))] | order(slug asc) {
      _id,
      slug,
      title,
      sections[]${LAB_SECTIONS_GROQ}
    }
  `)
  console.log(`  Sanity: found ${sanityPages.length} lab block pages`)

  // Build slug → documentId map from Strapi
  const existing = await strapiListAll('lab-block-pages')
  const slugMap = {}
  for (const e of existing) {
    if (e.slug) slugMap[e.slug] = e.documentId
  }
  console.log(`  Strapi: ${existing.length} existing lab block pages`)

  for (const page of sanityPages) {
    if (!page.slug) {
      console.warn(`  ⚠  Lab page "${page.title}" has no slug — skipping`)
      continue
    }

    if (LAB_SLUG_SKIP.has(page.slug)) {
      console.log(`  ✗  Skipping "${page.slug}" (no Strapi equivalent)`)
      continue
    }

    // Map slug if needed
    const strapiSlug = LAB_SLUG_MAP[page.slug] ?? page.slug

    const blocks = transformBlocks(page.sections)
    const payload = { data: { title: page.title, slug: strapiSlug, blocks } }

    if (slugMap[strapiSlug]) {
      await strapiPut(`/api/lab-block-pages/${slugMap[strapiSlug]}`, payload)
      console.log(`  ✎  Updated: "${page.title}" (/${strapiSlug}) — ${blocks.length} blocks`)
    } else {
      await strapiPost('/api/lab-block-pages', payload)
      console.log(`  ✓  Created: "${page.title}" (/${strapiSlug}) — ${blocks.length} blocks`)
    }
  }
}

// ---------------------------------------------------------------------------
// Lab overview
// ---------------------------------------------------------------------------

async function migrateLabOverview() {
  console.log('\n=== Lab Overview ===')

  const overview = await querySanity(`
    *[_type == "labOverview" && _id == "labOverview"][0]{
      _id,
      sections[]${LAB_SECTIONS_GROQ}
    }
  `)

  if (!overview) {
    console.log('  No lab overview found in Sanity — skipping')
    return
  }

  const blocks = transformBlocks(overview.sections)
  console.log(`  Sanity: found overview with ${blocks.length} blocks`)

  // Find the Strapi "overview" lab-block-page
  const existing = await strapiListAll('lab-block-pages')
  const overviewEntry = existing.find(e => e.slug === 'overview')

  if (overviewEntry) {
    await strapiPut(`/api/lab-block-pages/${overviewEntry.documentId}`, {
      data: { title: 'Overview', slug: 'overview', blocks },
    })
    console.log(`  ✎  Updated overview — ${blocks.length} blocks`)
  } else {
    await strapiPost('/api/lab-block-pages', {
      data: { title: 'Overview', slug: 'overview', blocks },
    })
    console.log(`  ✓  Created overview — ${blocks.length} blocks`)
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🚀 Sanity → Strapi migration')
  console.log(`   Sanity: ${SANITY_PROJECT_ID}/${SANITY_DATASET}`)
  console.log(`   Strapi: ${STRAPI_URL}`)

  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN is not set. Aborting.')
    process.exit(1)
  }

  // Parse CLI args to allow running individual sections
  const args = process.argv.slice(2)
  const runAll = args.length === 0
  const run = (name) => runAll || args.includes(name)

  if (run('studio'))   await migrateStudioInspirations()
  if (run('pages'))    await migratePages()
  if (run('lab'))      await migrateLabBlockPages()
  if (run('overview')) await migrateLabOverview()

  console.log('\n✅ Migration complete')
}

main().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
