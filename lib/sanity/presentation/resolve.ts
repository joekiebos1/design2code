import { defineLocations } from 'sanity/presentation'

export const resolve = {
  locations: {
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'Untitled',
            href: doc?.slug === 'home' ? '/' : `/${doc?.slug ?? ''}`,
          },
          { title: 'Home', href: '/' },
          { title: 'JioKarna', href: '/jiokarna' },
        ],
      }),
    }),
    labBlockPage: defineLocations({
      select: { title: 'title', slug: 'slug' },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || 'Block page', href: doc?.slug ? `/lab/${doc.slug}` : '/lab' },
          { title: 'All blocks', href: '/lab' },
        ],
      }),
    }),
  },
}
