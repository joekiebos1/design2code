'use client'

import { Flex, Text } from '@sanity/ui'
import { set } from 'sanity'
import type { NumberInputProps } from 'sanity'

const MIN = 0
const MAX = 100

export function BackgroundPositionSliderInput(props: NumberInputProps) {
  const { value, onChange, schemaType } = props
  const num = typeof value === 'number' ? value : MIN
  const isVertical = schemaType.name?.toLowerCase().includes('y')
  const labels = isVertical ? ['Top', 'Center', 'Bottom'] : ['Left', 'Center', 'Right']

  return (
    <Flex direction="column" gap={2}>
      <Flex align="center" gap={3}>
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={num}
          onChange={(e) => onChange(set(Number(e.target.value)))}
          style={{
            flex: 1,
            minWidth: 0,
            accentColor: 'var(--sanity-color-base-focus)',
          }}
        />
        <Text size={1} style={{ minWidth: 32 }}>
          {num}
        </Text>
      </Flex>
      <Flex justify="space-between" style={{ fontSize: 11, color: 'var(--sanity-color-base-muted-fg)' }}>
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
        <span>{labels[2]}</span>
      </Flex>
    </Flex>
  )
}
