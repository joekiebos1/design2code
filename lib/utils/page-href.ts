/**
 * Map a Sanity page slug to the site path.
 * Supports nested paths (e.g. stories/the-story-of-jio → /stories/the-story-of-jio).
 */
export function pageHrefFromSlug(slug: string | null | undefined): string {
  if (!slug || slug === 'home') return '/'
  return `/${slug}`
}
