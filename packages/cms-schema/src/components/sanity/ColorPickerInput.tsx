'use client'

import { useCallback, useState } from 'react'
import { Box, Dialog, Flex, Text, Button, Stack } from '@sanity/ui'
import type { StringInputProps } from 'sanity'
import { set, unset } from 'sanity'
/** Subpath avoids loading `ContentDsProvider` / `@marcelinodzn/ds-react` via the ds package barrel (Sanity Vite). */
import { COLOR_PICKER_OPTIONS, getColorPickerOption } from '@design2code/ds/sanity-color-picker'

const PRIORITY_COUNT = 9
const COLS = 9
const SWATCH_SIZE = 28
const GAP = 6

export function ColorPickerInput(props: StringInputProps) {
  const { value, onChange } = props
  const [open, setOpen] = useState(false)
  const selected = getColorPickerOption(value)

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(value === optValue ? unset() : set(optValue))
      setOpen(false)
    },
    [onChange, value]
  )

  const handleClear = useCallback(() => {
    onChange(unset())
    setOpen(false)
  }, [onChange])

  return (
    <Stack space={2}>
      <Flex gap={2} align="center" wrap="wrap">
        {value && selected && (
          <Flex align="center" gap={2}>
            <div
              style={{
                width: SWATCH_SIZE,
                height: SWATCH_SIZE,
                borderRadius: 4,
                background: selected.hex,
                border: '1px solid rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            />
            <Text size={1}>{selected.title}</Text>
          </Flex>
        )}
        <Button
          text={value ? 'Change' : 'Pick colour'}
          mode="ghost"
          tone="default"
          onClick={() => setOpen(true)}
        />
        {value && (
          <Button text="Clear" tone="critical" mode="ghost" onClick={handleClear} />
        )}
      </Flex>

      {open && (
        <Dialog
          header="Background colour"
          id="color-picker-dialog"
          onClose={() => setOpen(false)}
          width={1}
          zOffset={1000}
        >
          <Box padding={3}>
            <Stack space={3}>
              <Text size={1} weight="semibold">
                Theme colours (Primary, Secondary, Sparkle) × (Minimal, Subtle, Bold)
              </Text>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${COLS}, ${SWATCH_SIZE}px)`,
                  gap: GAP,
                  justifyContent: 'start',
                }}
              >
                {COLOR_PICKER_OPTIONS.slice(0, PRIORITY_COUNT).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    title={opt.title}
                    style={{
                      width: SWATCH_SIZE,
                      height: SWATCH_SIZE,
                      borderRadius: 6,
                      background: opt.hex,
                      border: value === opt.value ? '3px solid #0066cc' : '1px solid rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>

              <Text size={1} weight="semibold">
                Full spectrum (DS colours)
              </Text>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${COLS}, ${SWATCH_SIZE}px)`,
                  gap: GAP,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {COLOR_PICKER_OPTIONS.slice(PRIORITY_COUNT).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    title={`${opt.title} (${opt.value})`}
                    style={{
                      width: SWATCH_SIZE,
                      height: SWATCH_SIZE,
                      borderRadius: 6,
                      background: opt.hex,
                      border: value === opt.value ? '3px solid #0066cc' : '1px solid rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>

              <Flex gap={2} justify="flex-end">
                {value && (
                  <Button text="Clear" tone="critical" mode="ghost" onClick={handleClear} />
                )}
                <Button text="Done" onClick={() => setOpen(false)} />
              </Flex>
            </Stack>
          </Box>
        </Dialog>
      )}
    </Stack>
  )
}
