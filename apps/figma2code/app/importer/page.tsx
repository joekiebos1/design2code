import type { Metadata } from 'next'
import { ImporterClient } from './ImporterClient'

export const metadata: Metadata = {
  title: 'Figma Importer',
}

export default function ImporterPage() {
  return <ImporterClient />
}
