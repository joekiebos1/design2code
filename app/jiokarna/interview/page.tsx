'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { InterviewScreen } from '../screens/InterviewScreen'
import { useJioKarna } from '../JioKarnaContext'

export default function JioKarnaInterviewPage() {
  const router = useRouter()
  const {
    intentData,
    messages,
    setMessages,
    isThinking,
    setIsThinking,
  } = useJioKarna()

  useEffect(() => {
    if (messages.length > 0 || isThinking) return
    setIsThinking(true)
    fetch('/api/jiokarna/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentData, conversation: [] }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.reply) {
          setMessages([{ role: 'assistant', content: data.reply }])
        }
      })
      .catch(() => {
        setMessages([{ role: 'assistant', content: 'Failed to start. Please try again.' }])
      })
      .finally(() => setIsThinking(false))
  }, [])

  const handleSendMessage = async (content: string) => {
    const userMsg = { role: 'user' as const, content }
    setMessages((prev) => [...prev, userMsg])
    setIsThinking(true)
    try {
      const res = await fetch('/api/jiokarna/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentData,
          conversation: [...messages, userMsg],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  const handleReady = () => {
    router.push('/jiokarna/structure')
  }

  return (
    <InterviewScreen
      intentData={intentData}
      messages={messages}
      isThinking={isThinking}
      onSendMessage={handleSendMessage}
      onReady={handleReady}
    />
  )
}
