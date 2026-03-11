'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StructureScreen } from '../screens/StructureScreen'
import { useJioKarna } from '../JioKarnaContext'

export default function JioKarnaStructurePage() {
  const router = useRouter()
  const {
    intentData,
    messages,
    brief,
    setBrief,
    isGenerating,
    setIsGenerating,
    setMessages,
    setPreviewImageSource,
  } = useJioKarna()

  useEffect(() => {
    if (brief) return
    setIsGenerating(true)
    fetch('/api/jiokarna/structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentData, conversation: messages }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          const msg = [data.error, data.hint].filter(Boolean).join('. ')
          throw new Error(msg)
        }
        setBrief(data.brief)
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
        ])
        router.push('/jiokarna/interview')
      })
      .finally(() => setIsGenerating(false))
  }, [intentData, messages])

  const handleRegenerate = async () => {
    setIsGenerating(true)
    setBrief(null)
    try {
      const res = await fetch('/api/jiokarna/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentData, conversation: messages }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = [data.error, data.hint].filter(Boolean).join('. ')
        throw new Error(msg)
      }
      setBrief(data.brief)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      ])
      router.push('/jiokarna/interview')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div style={{ maxWidth: 720, margin: '0 auto', paddingBlock: 'var(--ds-spacing-m)' }}>
        <Link
          href="/jiokarna/interview"
          style={{
            fontSize: 'var(--ds-typography-body-xs)',
            color: 'var(--ds-color-text-medium)',
            textDecoration: 'none',
          }}
        >
          ← Back to interview
        </Link>
      </div>
      <StructureScreen
        brief={brief}
        isGenerating={isGenerating}
        onPreviewArtDirector={() => {
          setPreviewImageSource('artDirector')
          router.push('/jiokarna/preview')
        }}
        onPreviewSanityOnly={() => {
          setPreviewImageSource('sanityOnly')
          router.push('/jiokarna/preview')
        }}
        onRegenerate={handleRegenerate}
      />
    </>
  )
}
