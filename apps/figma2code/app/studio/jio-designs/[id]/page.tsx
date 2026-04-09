'use client'

import { useParams } from 'next/navigation'
import { JioDesignDetailClient } from './JioDesignDetailClient'

export default function JioDesignDetailPage() {
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
  return <JioDesignDetailClient id={decodeURIComponent(id)} />
}
