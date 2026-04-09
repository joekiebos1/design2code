import type { Metadata } from 'next'
import { ImporterClient } from './ImporterClient'

export const metadata: Metadata = {
  title: 'Figma2CMS',
}

export default function ImporterPage() {
  return <ImporterClient />
}
