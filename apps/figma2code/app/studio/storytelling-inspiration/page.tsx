'use client'

import { useState } from 'react'
import { InputPanel } from '../../components/studio/storytelling-inspiration/InputPanel'
import { OutputPanel } from '../../components/studio/storytelling-inspiration/OutputPanel'
import type { StoryCoachInput, StoryCoachState } from '../../components/studio/storytelling-inspiration/types'
import { studioPreviewColumn, studioToolInputColumn } from '../studio-ui'

const initialState: StoryCoachState = {
  status: 'idle',
  result: null,
  error: null,
}

export default function StorytellingInspirationPage() {
  const [state, setState] = useState<StoryCoachState>(initialState)
  const [productName, setProductName] = useState<string>('')

  const handleSubmit = async (input: StoryCoachInput) => {
    setProductName(input.productName)
    setState({ status: 'loading', result: null, error: null })
    try {
      const res = await fetch('/api/storytelling-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')
      setState({ status: 'success', result: data, error: null })
    } catch (err) {
      setState({
        status: 'error',
        result: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return (
    <main className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-white">
      <aside className={`${studioToolInputColumn} border-r border-gray-200 overflow-y-auto studio-scrollbar bg-white`}>
        <InputPanel onSubmit={handleSubmit} isLoading={state.status === 'loading'} />
      </aside>
      <div className={`${studioPreviewColumn} bg-white`}>
        <div className="shrink-0 px-4 py-3 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto studio-scrollbar">
          <OutputPanel state={state} productName={productName} />
        </div>
      </div>
    </main>
  )
}
