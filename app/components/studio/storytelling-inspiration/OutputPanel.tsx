'use client'

import { useEffect, useState } from 'react'
import { Headline, Text, SurfaceProvider } from '@marcelinodzn/ds-react'
import type { StoryCoachState, StoryCoachResult, Block } from './types'

const LOADING_MESSAGES = [
  'Reading the brief...',
  'Finding the central truth...',
  'Building the arc...',
  'Placing the blocks...',
  'Checking every claim has its proof...',
]

type OutputPanelProps = {
  state: StoryCoachState
  productName?: string
}

const grey = {
  border: 'rgba(0, 0, 0, 0.06)',
  label: 'rgba(0, 0, 0, 0.65)',
  secondary: 'rgba(0, 0, 0, 0.48)',
  tertiary: 'rgba(0, 0, 0, 0.36)',
}

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 'var(--ds-typography-label-s)',
  fontWeight: 'var(--ds-typography-weight-medium)',
  color: 'var(--ds-color-text-high)',
  letterSpacing: '0.02em',
  marginBottom: 'var(--ds-spacing-m)',
  paddingBottom: 'var(--ds-spacing-s)',
  borderBottom: `1px solid ${grey.border}`,
}

function ResultView({ result, productName }: { result: StoryCoachResult; productName?: string }) {
  const setup = result.blocks.filter((b) => b.section === 'setup')
  const engage = result.blocks.filter((b) => b.section === 'engage')
  const resolve = result.blocks.filter((b) => b.section === 'resolve')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2xl)' }}>
      <header style={{ marginBottom: 'var(--ds-spacing-2xl)' }}>
        <Headline level={1} style={{ marginBottom: 'var(--ds-spacing-s)', fontWeight: 'var(--ds-typography-weight-medium)', color: 'var(--ds-color-text-high)', letterSpacing: '-0.02em' }}>
          {productName || result.primaryEmotion}
        </Headline>
        <Text
          style={{
            fontSize: 'var(--ds-typography-label-s)',
            fontWeight: 'var(--ds-typography-weight-low)',
            color: grey.secondary,
          }}
        >
          {result.blocks.length} blocks — {setup.length} setup · {engage.length} engage · {resolve.length} resolve
        </Text>
      </header>

      <section>
        <div style={sectionHeaderStyle}>Reasons to believe</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--ds-spacing-l)',
          }}
        >
          <RTBRow label="Emotional" value={result.rtbs.emotional} />
          <RTBRow label="Rational" value={result.rtbs.rational} />
          <RTBRow label="Social" value={result.rtbs.social} />
          <RTBRow label="Proud of" value={result.rtbs.proud} />
        </div>
      </section>

      <section>
        <div style={sectionHeaderStyle}>Narrative Arc</div>
        <div
          style={{
            padding: 'var(--ds-spacing-m)',
            border: `1px solid ${grey.border}`,
            marginBottom: 'var(--ds-spacing-l)',
          }}
        >
          <Text
            size="S"
            as="p"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-typography-weight-medium)',
              color: 'var(--ds-color-text-high)',
              fontSize: 'var(--ds-typography-label-s)',
            }}
          >
            Central Truth
          </Text>
          <Text size="M" as="p" style={{ margin: 'var(--ds-spacing-s) 0 0', fontWeight: 'var(--ds-typography-weight-low)', color: grey.secondary, lineHeight: 1.5 }}>
            {result.centralTruth}
          </Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)' }}>
          <ArcSection title="Hook" items={result.hook} />
          <ArcSection title="Middle" items={result.middle} />
          <ArcSection title="Close" items={result.close} />
        </div>
      </section>

      <section>
        <div style={sectionHeaderStyle}>Block Structure</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {result.blocks.map((block) => (
            <BlockRow key={block.num} block={block} />
          ))}
        </div>
      </section>
    </div>
  )
}

function RTBRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 'var(--ds-spacing-m)',
        border: `1px solid ${grey.border}`,
      }}
    >
      <Text
        size="S"
        as="span"
        style={{
          display: 'block',
          fontWeight: 'var(--ds-typography-weight-medium)',
          marginBottom: 'var(--ds-spacing-s)',
          color: 'var(--ds-color-text-high)',
          fontSize: 'var(--ds-typography-label-s)',
        }}
      >
        {label}
      </Text>
      <Text size="S" as="p" style={{ margin: 0, fontWeight: 'var(--ds-typography-weight-low)', color: grey.secondary, lineHeight: 1.5 }}>
        {value}
      </Text>
    </div>
  )
}

function ArcSection({ title, items }: { title: string; items: Record<string, string> }) {
  return (
    <div
      style={{
        border: `1px solid ${grey.border}`,
        padding: 'var(--ds-spacing-m)',
      }}
    >
      <Text
        size="M"
        as="span"
        style={{
          fontWeight: 'var(--ds-typography-weight-medium)',
          color: 'var(--ds-color-text-high)',
          fontSize: 'var(--ds-typography-label-s)',
        }}
      >
        {title}
      </Text>
      <div style={{ marginTop: 'var(--ds-spacing-m)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
        {Object.entries(items).map(([key, value]) => (
          <div key={key}>
            <Text
              size="XS"
              as="span"
              style={{
                color: grey.tertiary,
                fontWeight: 'var(--ds-typography-weight-medium)',
                textTransform: 'capitalize',
                fontSize: 'var(--ds-typography-label-s)',
              }}
            >
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Text>
            <Text size="S" as="p" style={{ margin: 'var(--ds-spacing-2xs) 0 0', fontWeight: 'var(--ds-typography-weight-low)', color: grey.secondary, lineHeight: 1.5 }}>
              {value}
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlockRow({ block }: { block: Block }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '48px 80px 1fr',
        gap: 'var(--ds-spacing-m)',
        alignItems: 'start',
        padding: 'var(--ds-spacing-m)',
        borderBottom: `1px solid ${grey.border}`,
      }}
    >
      <Text
        size="S"
        as="span"
        style={{
          fontWeight: 'var(--ds-typography-weight-medium)',
          color: grey.tertiary,
          fontSize: 'var(--ds-typography-label-s)',
        }}
      >
        {block.num}
      </Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2xs)' }}>
        <Text
          size="XS"
          as="span"
          style={{
            fontWeight: 'var(--ds-typography-weight-medium)',
            color: grey.tertiary,
            textTransform: 'capitalize',
            fontSize: 'var(--ds-typography-body-xs)',
          }}
        >
          {block.type}
        </Text>
        <Text
          size="XS"
          as="span"
          style={{
            color: grey.tertiary,
            fontWeight: 'var(--ds-typography-weight-low)',
            textTransform: 'capitalize',
            fontSize: 'var(--ds-typography-body-xs)',
          }}
        >
          {block.section}
        </Text>
      </div>
      <div>
        <Text
          size="S"
          as="p"
          style={{
            margin: '0 0 var(--ds-spacing-xs)',
            fontWeight: 'var(--ds-typography-weight-medium)',
            fontSize: 'var(--ds-typography-label-s)',
            color: 'var(--ds-color-text-high)',
          }}
        >
          {block.headline}
        </Text>
        <Text size="XS" as="p" style={{ margin: 0, color: grey.secondary, fontWeight: 'var(--ds-typography-weight-low)', lineHeight: 1.45 }}>
          {block.job}
        </Text>
      </div>
    </div>
  )
}

export function OutputPanel({ state, productName }: OutputPanelProps) {
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])

  useEffect(() => {
    if (state.status !== 'loading') return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[i])
    }, 1800)
    return () => clearInterval(interval)
  }, [state.status])

  if (state.status === 'idle') {
    return (
      <SurfaceProvider level={0}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--ds-spacing-2xl)',
          }}
        >
          <Text style={{ fontSize: 'var(--ds-typography-label-s)', fontWeight: 'var(--ds-typography-weight-low)', color: grey.secondary }}>
            Enter a product name and generate to see the narrative arc.
          </Text>
        </div>
      </SurfaceProvider>
    )
  }

  if (state.status === 'loading') {
    return (
      <SurfaceProvider level={0}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--ds-spacing-2xl)',
          }}
        >
          <Text style={{ fontSize: 'var(--ds-typography-label-s)', fontWeight: 'var(--ds-typography-weight-low)', color: grey.secondary }}>{loadingMessage}</Text>
        </div>
      </SurfaceProvider>
    )
  }

  if (state.status === 'error') {
    return (
      <SurfaceProvider level={0}>
        <div style={{ padding: 'var(--ds-spacing-2xl)' }}>
          <Text appearance="negative" style={{ fontSize: 'var(--ds-typography-label-s)', fontWeight: 'var(--ds-typography-weight-medium)' }}>
            {state.error}
          </Text>
        </div>
      </SurfaceProvider>
    )
  }

  if (state.status === 'success' && state.result) {
    return (
      <SurfaceProvider level={0}>
        <div style={{ padding: 'var(--ds-spacing-2xl)', maxWidth: 720 }}>
          <ResultView result={state.result} productName={productName} />
        </div>
      </SurfaceProvider>
    )
  }

  return null
}
