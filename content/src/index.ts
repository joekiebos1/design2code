import type { Core } from '@strapi/strapi'

const LAB_BLOCK_PAGES = [
  { title: 'Overview', slug: 'overview' },
  { title: 'Hero', slug: 'hero' },
  { title: 'Card Grid', slug: 'card-grid' },
  { title: 'Media Text Stacked', slug: 'media-text-stacked' },
  { title: 'Media Text Block', slug: 'media-text-block' },
  { title: 'Media Text 50/50', slug: 'media-text-5050' },
  { title: 'Carousel', slug: 'carousel' },
  { title: 'Proof Points', slug: 'proof-points' },
  { title: 'Icon Grid', slug: 'icon-grid' },
  { title: 'Media Text Asymmetric', slug: 'media-text-asymmetric' },
  { title: 'Full Bleed Vertical Carousel', slug: 'full-bleed-vertical-carousel' },
  { title: 'Rotating Media', slug: 'rotating-media' },
  { title: 'Media Zoom Out On Scroll', slug: 'media-zoom-out-on-scroll' },
  { title: 'Editorial Block', slug: 'editorial-block' },
]

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedLabBlockPages(strapi)
    await seedPages(strapi)
  },
}

async function seedLabBlockPages(strapi: Core.Strapi) {
  for (const page of LAB_BLOCK_PAGES) {
    const existing = await strapi.documents('api::lab-block-page.lab-block-page').findFirst({
      filters: { slug: page.slug },
    })
    if (!existing) {
      await strapi.documents('api::lab-block-page.lab-block-page').create({
        data: { title: page.title, slug: page.slug, blocks: [] },
        status: 'published',
      })
      strapi.log.info(`[seed] Created lab block page: ${page.title}`)
    }
  }
}


async function seedPages(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::page.page').findFirst({
    filters: { slug: 'pixel-pro-10' },
  })
  if (!existing) {
    await strapi.documents('api::page.page').create({
      data: { title: 'Pixel Pro 10', slug: 'pixel-pro-10', blocks: [] },
      status: 'published',
    })
    strapi.log.info('[seed] Created page: Pixel Pro 10')
  }
}
