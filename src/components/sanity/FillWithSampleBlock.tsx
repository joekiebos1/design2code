'use client'

import { useCallback } from 'react'
import { Card, Button, Stack } from '@sanity/ui'
import { set, PatchEvent } from 'sanity'
import type { ObjectInputProps } from 'sanity'
import { PLACEHOLDER_CONTENT } from '../../../lib/content/placeholder-content'

export function FillWithSampleBlock(props: ObjectInputProps) {
  const { onChange, schemaType } = props

  const handleFill = useCallback(() => {
    const sample =
      PLACEHOLDER_CONTENT[schemaType.name as keyof typeof PLACEHOLDER_CONTENT]
    if (sample) {
      onChange(PatchEvent.from(set(sample)))
    }
  }, [onChange, schemaType.name])

  return (
    <Stack space={3}>
      <Card padding={2} radius={2} tone="primary">
        <Button text="Fill with sample" tone="primary" onClick={handleFill} />
      </Card>
      {props.renderDefault(props)}
    </Stack>
  )
}
