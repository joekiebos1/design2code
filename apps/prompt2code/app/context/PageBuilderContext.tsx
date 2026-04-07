'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { IntentFormData, PageBrief } from '../lib/types'

type Message = { role: 'user' | 'assistant'; content: string }

export type PreviewImageSource = 'artDirector' | 'sanityOnly'

type JioKarnaContextValue = {
  intentData: IntentFormData
  setIntentData: (d: IntentFormData | ((prev: IntentFormData) => IntentFormData)) => void
  messages: Message[]
  setMessages: (m: Message[] | ((prev: Message[]) => Message[])) => void
  isThinking: boolean
  setIsThinking: (v: boolean) => void
  brief: PageBrief | null
  setBrief: (b: PageBrief | null) => void
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
  approvedBrief: PageBrief | null
  setApprovedBrief: (b: PageBrief | null) => void
  previewImageSource: PreviewImageSource
  setPreviewImageSource: (s: PreviewImageSource) => void
}

const JioKarnaContext = createContext<JioKarnaContextValue | null>(null)

export function JioKarnaProvider({ children }: { children: ReactNode }) {
  const [intentData, setIntentData] = useState<IntentFormData>({
    template: 'product-page',
    product: '',
    pageType: 'other',
    intent: '',
    audience: '',
    primaryAction: '',
    keyMessage: '',
    pagePath: '',
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [brief, setBrief] = useState<PageBrief | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [approvedBrief, setApprovedBrief] = useState<PageBrief | null>(null)
  const [previewImageSource, setPreviewImageSource] = useState<PreviewImageSource>('artDirector')

  const value: JioKarnaContextValue = {
    intentData,
    setIntentData,
    messages,
    setMessages,
    isThinking,
    setIsThinking,
    brief,
    setBrief,
    isGenerating,
    setIsGenerating,
    approvedBrief,
    setApprovedBrief,
    previewImageSource,
    setPreviewImageSource,
  }

  return <JioKarnaContext.Provider value={value}>{children}</JioKarnaContext.Provider>
}

export function useJioKarna() {
  const ctx = useContext(JioKarnaContext)
  if (!ctx) throw new Error('useJioKarna must be used within JioKarnaProvider')
  return ctx
}
