import type { Metadata } from 'next'
import BlockInspirationClient from './BlockInspirationClient'

export const metadata: Metadata = {
  title: 'Jio Blocks',
}

export default function BlockInspirationPage() {
  return <BlockInspirationClient />
}
