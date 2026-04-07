import { ContentDsProvider } from '@design2code/ds'

/**
 * Route group: production CMS pages (`/`, `/[slug]`, `/stories/*`). Nested DS density for blocks only.
 */
export default function ContentPagesLayout({ children }: { children: React.ReactNode }) {
  return <ContentDsProvider>{children}</ContentDsProvider>
}
