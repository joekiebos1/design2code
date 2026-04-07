'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Headline, Text, SurfaceProvider, Button, Icon, IcCopyDocument, IcImage } from '@marcelinodzn/ds-react'
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
  label: 'rgba(0, 0, 0, 0.65)',
  secondary: 'rgba(0, 0, 0, 0.48)',
  tertiary: 'rgba(0, 0, 0, 0.36)',
}

function formatBlockStructureAsText(blocks: Block[]): string {
  return blocks
    .map(
      (b) =>
        `${b.num}. [${b.type}] ${b.section} (${b.role})\n   ${b.headline}${b.proof ? `\n   ${b.proof}` : ''}\n   ${b.job}`,
    )
    .join('\n\n')
}

function CopyIconButton({ text, ariaLabel = 'Copy' }: { text: string; ariaLabel?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [text])

  return (
    <Button
      single
      size="S"
      appearance="secondary"
      contained={false}
      onPress={handleCopy}
      aria-label={ariaLabel}
      content={
        <Icon
          asset={<IcCopyDocument />}
          size="S"
          appearance="secondary"
          style={{ opacity: copied ? 0.5 : 1 }}
        />
      }
      style={{ flexShrink: 0, padding: 'var(--ds-spacing-s)' }}
    />
  )
}

function ModalityRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 'var(--ds-spacing-m)',
        padding: 'var(--ds-spacing-l)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Headline
          size="S"
          as="h2"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-s)',
            fontSize: 'var(--ds-typography-headline-s)',
            fontWeight: 'var(--ds-typography-weight-medium)',
            color: 'var(--ds-color-text-high)',
          }}
        >
          {label}
        </Headline>
        <Text
          size="M"
          as="p"
          style={{
            margin: 0,
            fontSize: 'var(--ds-typography-body-m)',
            fontWeight: 'var(--ds-typography-weight-low)',
            color: grey.secondary,
            lineHeight: 1.5,
          }}
        >
          {value}
        </Text>
      </div>
      <CopyIconButton text={value} ariaLabel={`Copy ${label}`} />
    </div>
  )
}

function NarrativeParagraph({ label, text }: { label: string; text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 'var(--ds-spacing-m)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="XS"
          as="span"
          style={{
            display: 'block',
            fontWeight: 'var(--ds-typography-weight-medium)',
            color: grey.tertiary,
            marginBottom: 'var(--ds-spacing-s)',
            fontSize: 'var(--ds-typography-label-s)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </Text>
        <Text
          size="S"
          as="p"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-typography-weight-low)',
            color: grey.secondary,
            lineHeight: 1.6,
            fontSize: 'var(--ds-typography-body-m)',
          }}
        >
          {text}
        </Text>
      </div>
      <CopyIconButton text={text} ariaLabel={`Copy ${label}`} />
    </div>
  )
}

function ResultView({ result, productName }: { result: StoryCoachResult; productName?: string }) {
  const setup = result.blocks.filter((b) => b.section === 'setup')
  const engage = result.blocks.filter((b) => b.section === 'engage')
  const resolve = result.blocks.filter((b) => b.section === 'resolve')
  const fullBlockText = formatBlockStructureAsText(result.blocks)
  const blockStructureRef = useRef<HTMLDivElement>(null)
  const [copyingPng, setCopyingPng] = useState(false)

  const handleCopyAsPng = useCallback(async () => {
    const el = blockStructureRef.current
    if (!el) return
    setCopyingPng(true)
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      await new Promise<void>((resolve) => {
        canvas.toBlob(
          async (blob) => {
            try {
              if (blob && navigator.clipboard?.write) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
              }
            } finally {
              resolve()
            }
          },
          'image/png',
        )
      })
    } catch {
      // ignore
    } finally {
      setCopyingPng(false)
    }
  }, [])

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 'var(--ds-typography-headline-m)',
    fontWeight: 'var(--ds-typography-weight-medium)',
    color: 'var(--ds-color-text-high)',
    letterSpacing: '-0.02em',
    marginBottom: 'var(--ds-spacing-xl)',
  }

  const sectionHeaderStyle: React.CSSProperties = {
    ...sectionTitleStyle,
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3xl)',
      }}
    >
      <header style={{ marginBottom: 'var(--ds-spacing-m)' }}>
        <Headline
          size="M"
          as="h1"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-s)',
            fontSize: 'var(--ds-typography-display-m)',
            fontWeight: 'var(--ds-typography-weight-medium)',
            color: 'var(--ds-color-text-high)',
            letterSpacing: '-0.02em',
          }}
        >
          {productName || result.primaryEmotion}
        </Headline>
        <Text
          size="M"
          style={{
            fontSize: 'var(--ds-typography-body-m)',
            fontWeight: 'var(--ds-typography-weight-low)',
            color: grey.secondary,
          }}
        >
          {result.blocks.length} blocks — {setup.length} setup · {engage.length} engage · {resolve.length} resolve
        </Text>
      </header>

      <section style={{ marginTop: 'var(--ds-spacing-2xl)' }}>
        <div style={{ ...sectionHeaderStyle, marginBottom: 'var(--ds-spacing-xl)' }}>
          Buyer modalities
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-xl)' }}>
          <ModalityRow label="Emotional" value={result.modalities.emotional} />
          <ModalityRow label="Rational" value={result.modalities.rational} />
          <ModalityRow label="Social" value={result.modalities.social} />
          <ModalityRow label="Security" value={result.modalities.security} />
        </div>
      </section>

      <section style={{ marginTop: 'var(--ds-spacing-2xl)' }}>
        <div style={{ ...sectionHeaderStyle, marginBottom: 'var(--ds-spacing-xl)' }}>
          Narrative arc
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-xl)',
            paddingBlock: 'var(--ds-spacing-l)',
          }}
        >
          <NarrativeParagraph label="Setup" text={`${result.hook.openingTension} ${result.hook.mustFeel}`} />
          <NarrativeParagraph label="Engage" text={`${result.middle.centralDesire} ${result.middle.emotional} ${result.middle.rational} ${result.middle.social} ${result.middle.security}`} />
          <NarrativeParagraph label="Resolve" text={`${result.close.barrier} ${result.close.ctaFraming}`} />
        </div>
      </section>

      <section style={{ marginTop: 'var(--ds-spacing-2xl)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--ds-spacing-m)',
            marginBottom: 'var(--ds-spacing-xl)',
          }}
        >
          <Headline size="S" as="h2" style={{ margin: 0, ...sectionTitleStyle }}>
            Block structure
          </Headline>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-s)' }}>
            <Button
              single
              size="S"
              appearance="secondary"
              contained={false}
              onPress={handleCopyAsPng}
              aria-label="Copy as PNG"
              isDisabled={copyingPng}
              content={
                <Icon
                  asset={<IcImage />}
                  size="S"
                  appearance="secondary"
                  style={{ opacity: copyingPng ? 0.5 : 1 }}
                />
              }
              style={{ padding: 'var(--ds-spacing-s)' }}
            />
            <Button
              single
              size="S"
              appearance="secondary"
              contained={false}
              aria-label="Copy as text"
              content={<Icon asset={<IcCopyDocument />} size="S" appearance="secondary" />}
              style={{ padding: 'var(--ds-spacing-s)' }}
              onPress={async () => {
                try {
                  await navigator.clipboard.writeText(fullBlockText)
                } catch {
                  // ignore
                }
              }}
            />
          </div>
        </div>
        <div ref={blockStructureRef} style={{ padding: 'var(--ds-spacing-l)', background: 'var(--ds-color-background-subtle)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {result.blocks.map((block) => (
              <BlockRow key={block.num} block={block} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function BlockRow({ block }: { block: Block }) {
  const blockText = `${block.num}. [${block.type}] ${block.section} (${block.role})\n${block.headline}${block.proof ? `\n${block.proof}` : ''}\n${block.job}`

  const isChapter = block.role === 'chapter'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 'var(--ds-spacing-m)',
        paddingBlock: isChapter ? 'var(--ds-spacing-l)' : 'var(--ds-spacing-m)',
        paddingInline: isChapter ? 'var(--ds-spacing-m)' : 0,
        marginBlockEnd: isChapter ? 'var(--ds-spacing-l)' : 0,
        borderBlockEnd: '1px solid rgba(0, 0, 0, 0.06)',
        ...(isChapter && {
          background: 'rgba(0, 0, 0, 0.03)',
          borderRadius: 'var(--ds-spacing-s)',
          paddingInline: 'var(--ds-spacing-m)',
        }),
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 'var(--ds-spacing-m)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
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
          <Text
            size="XS"
            as="span"
            style={{
              color: block.role === 'chapter' ? 'var(--ds-color-text-high)' : grey.tertiary,
              fontSize: '10px',
              fontWeight: 'var(--ds-typography-weight-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {block.role}
          </Text>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text
            size="S"
            as="p"
            style={{
              margin: '0 0 var(--ds-spacing-xs)',
              fontWeight:
                block.role === 'chapter'
                  ? 'var(--ds-typography-weight-high)'
                  : 'var(--ds-typography-weight-medium)',
              fontSize:
                block.role === 'chapter'
                  ? 'var(--ds-typography-label-m)'
                  : 'var(--ds-typography-label-s)',
              color: 'var(--ds-color-text-high)',
            }}
          >
            {block.headline}
          </Text>
          {block.proof && (
            <Text
              size="XS"
              as="p"
              style={{
                margin: '0 0 var(--ds-spacing-xs)',
                color: grey.label,
                fontWeight: 'var(--ds-typography-weight-low)',
                lineHeight: 1.45,
                fontStyle: 'italic',
              }}
            >
              {block.proof}
            </Text>
          )}
          <Text
            size="XS"
            as="p"
            style={{
              margin: 0,
              color: grey.secondary,
              fontWeight: 'var(--ds-typography-weight-low)',
              lineHeight: 1.45,
            }}
          >
            {block.job}
          </Text>
        </div>
      </div>
      <CopyIconButton text={blockText} ariaLabel={`Copy block ${block.num}`} />
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
          <Text
            style={{
              fontSize: 'var(--ds-typography-body-m)',
              fontWeight: 'var(--ds-typography-weight-low)',
              color: grey.secondary,
            }}
          >
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
          <Text
            style={{
              fontSize: 'var(--ds-typography-body-m)',
              fontWeight: 'var(--ds-typography-weight-low)',
              color: grey.secondary,
            }}
          >
            {loadingMessage}
          </Text>
        </div>
      </SurfaceProvider>
    )
  }

  if (state.status === 'error') {
    return (
      <SurfaceProvider level={0}>
        <div style={{ padding: 'var(--ds-spacing-2xl)' }}>
          <Text
            appearance="negative"
            style={{
              fontSize: 'var(--ds-typography-body-m)',
              fontWeight: 'var(--ds-typography-weight-medium)',
            }}
          >
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
