'use client'

import { useParams } from 'next/navigation'
import { BenchmarkDetailClient } from './BenchmarkDetailClient'

export default function BenchmarkDetailPage() {
  const params = useParams()
  const raw = params?.id
  const id = Array.isArray(raw) ? raw[0] : raw
  if (!id) {
    return (
      <main className="flex-1 min-h-0 overflow-auto bg-white p-6 md:p-8">
        <p className="text-sm text-gray-500 m-0">Invalid link.</p>
      </main>
    )
  }
  return <BenchmarkDetailClient id={decodeURIComponent(id)} />
}
