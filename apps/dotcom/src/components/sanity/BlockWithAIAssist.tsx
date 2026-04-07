'use client'

import { useCallback, useState } from 'react'
import { Box, Button, Card, Dialog, DialogProvider, Flex, Stack, Text, TextArea } from '@sanity/ui'
import { set, PatchEvent } from 'sanity'
import type { ObjectInputProps } from 'sanity'
import { PLACEHOLDER_CONTENT } from '../../../lib/content/placeholder-content'
import { APP_URL } from '../../config'

type Message = { role: 'user' | 'assistant'; content: string }

export function BlockWithAIAssist(props: ObjectInputProps) {
  const { onChange, schemaType, value } = props
  const [configOpen, setConfigOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestedBlock, setSuggestedBlock] = useState<Record<string, unknown> | null>(null)

  const handleFill = useCallback(() => {
    const sample = PLACEHOLDER_CONTENT[schemaType.name as keyof typeof PLACEHOLDER_CONTENT]
    if (sample) {
      onChange(PatchEvent.from(set(sample)))
    }
  }, [onChange, schemaType.name])

  const handleOpenConfig = useCallback(() => {
    setConfigOpen(true)
    setMessages([])
    setSuggestedBlock(null)
    setInput('')
  }, [])

  const handleCloseConfig = useCallback(() => {
    setConfigOpen(false)
  }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setSuggestedBlock(null)

    try {
      const res = await fetch(`${APP_URL}/api/jiokarna/configure-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockType: schemaType.name,
          blockValue: value,
          conversation: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error || 'Failed'}` }])
        return
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      if (data.suggestedBlock) {
        setSuggestedBlock(data.suggestedBlock)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Request failed'}` },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, schemaType.name, value])

  const handleApply = useCallback(() => {
    if (suggestedBlock) {
      // Shallow merge to preserve image/video refs Claude omits
      const merged = { ...(value || {}), ...suggestedBlock }
      onChange(PatchEvent.from(set(merged)))
      setSuggestedBlock(null)
    }
  }, [onChange, suggestedBlock, value])

  return (
    <Stack space={3}>
      <Card padding={2} radius={2} tone="primary">
        <Flex gap={2} wrap="wrap">
          <Button text="Fill with sample" tone="primary" onClick={handleFill} />
          <Button text="Configure with Claude" tone="primary" mode="ghost" onClick={handleOpenConfig} />
        </Flex>
      </Card>

      {configOpen && (
        <DialogProvider position="fixed" zOffset={1000}>
          <ConfigureDialog
            blockType={schemaType.name}
            messages={messages}
            input={input}
            setInput={setInput}
            loading={loading}
            onSend={handleSend}
            onClose={handleCloseConfig}
            suggestedBlock={suggestedBlock}
            onApply={handleApply}
          />
        </DialogProvider>
      )}

      {props.renderDefault(props)}
    </Stack>
  )
}

function ConfigureDialog({
  blockType,
  messages,
  input,
  setInput,
  loading,
  onSend,
  onClose,
  suggestedBlock,
  onApply,
}: {
  blockType: string
  messages: Message[]
  input: string
  setInput: (v: string) => void
  loading: boolean
  onSend: () => void
  onClose: () => void
  suggestedBlock: Record<string, unknown> | null
  onApply: () => void
}) {
  return (
    <Dialog
      header={`Configure ${blockType} with Claude`}
      id="configure-block-dialog"
      onClose={onClose}
      width={1}
      footer={
        <Flex justify="flex-end" gap={2}>
          {suggestedBlock && (
            <Button text="Apply changes" tone="primary" onClick={onApply} />
          )}
          <Button text="Close" mode="ghost" onClick={onClose} />
        </Flex>
      }
    >
      <Box padding={3}>
        <Stack space={3}>
          <Box
            style={{
              maxHeight: 280,
              overflowY: 'auto',
              padding: 12,
              background: 'var(--card-bg-color)',
              borderRadius: 4,
              border: '1px solid var(--card-border-color)',
            }}
          >
            {messages.length === 0 ? (
              <Text size={1} muted>
                Ask Claude to help configure this block. Describe the changes you want, or ask for suggestions.
              </Text>
            ) : (
              messages.map((m, i) => (
                <Box key={i} marginBottom={2}>
                  <Text size={1} weight="semibold" style={{ marginBottom: 4 }}>
                    {m.role === 'user' ? 'You' : 'Claude'}
                  </Text>
                  <Text size={1} style={{ whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </Text>
                </Box>
              ))
            )}
          </Box>

          <Flex gap={2}>
            <Box flex={1}>
              <TextArea
                placeholder="Describe changes or ask for suggestions..."
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    onSend()
                  }
                }}
                rows={2}
              />
            </Box>
            <Button text={loading ? 'Sending...' : 'Send'} tone="primary" onClick={onSend} disabled={loading} />
          </Flex>
        </Stack>
      </Box>
    </Dialog>
  )
}
