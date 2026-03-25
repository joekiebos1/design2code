/**
 * Block Inspiration – Next.js Studio tool (not a Sanity document). Block list lives in code.
 */

import BlockInspirationClient from './BlockInspirationClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BlockInspirationPage() {
  return <BlockInspirationClient thumbnailsMap={{}} />
}
