import type { Metadata } from 'next'
import { StudioHomeClient } from './StudioHomeClient'

export const metadata: Metadata = {
  title: 'Jio.com Design Studio',
}

export default function StudioPage() {
  return <StudioHomeClient />
}
