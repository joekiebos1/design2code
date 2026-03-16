'use client'

import { useState } from 'react'
import { Grid } from '../../components/blocks/Grid'
import { useGridBreakpoint } from '../../../lib/utils/use-grid-breakpoint'
import { InputPanel } from '../../components/studio/storytelling-inspiration/InputPanel'
import { OutputPanel } from '../../components/studio/storytelling-inspiration/OutputPanel'
import type { StoryCoachInput, StoryCoachState } from '../../components/studio/storytelling-inspiration/types'

const initialState: StoryCoachState = {
  status: 'idle',
  result: null,
  error: null,
}

export default function StorytellingInspirationPage() {
  const { columns } = useGridBreakpoint()
  const [state, setState] = useState<StoryCoachState>(initialState)
  const [productName, setProductName] = useState<string>('')

  const isSideBySide = columns >= 8
  const asideCol = isSideBySide ? '1 / span 4' : '1 / -1'
  const outputCol = isSideBySide ? '5 / -1' : '1 / -1'

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
    <Grid as="main" style={{ height: '100%', minHeight: 0, alignContent: 'stretch' }}>
      <aside
        style={{
          gridColumn: asideCol,
          gridRow: isSideBySide ? undefined : 1,
          borderLeft: '1px solid rgba(0, 0, 0, 0.06)',
          borderRight: isSideBySide ? '1px solid rgba(0, 0, 0, 0.06)' : undefined,
          overflowY: 'auto',
        }}
      >
        <InputPanel onSubmit={handleSubmit} isLoading={state.status === 'loading'} />
      </aside>
      <div
        style={{
          gridColumn: outputCol,
          gridRow: isSideBySide ? undefined : 2,
          overflowY: 'auto',
        }}
      >
        <OutputPanel state={state} productName={productName} />
      </div>
    </Grid>
  )
}
