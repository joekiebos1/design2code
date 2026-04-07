'use client'

import { useMemo, useState, useCallback } from 'react'
import { Box, Dialog, Flex, Text, TextInput, Button, Stack } from '@sanity/ui'
import type { StringInputProps } from 'sanity'
import { set, unset } from 'sanity'
import { Icon as SanityIcon } from '@sanity/icons'
import iconNamesJson from '../../lib/ds-icon-names.json'

const ICON_NAMES: string[] = iconNamesJson as string[]

const COLS = 6
const ROW_HEIGHT = 44
const VISIBLE_ROWS = 6
const GRID_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS

function filterIcons(query: string): string[] {
  const q = query.toLowerCase().trim()
  if (!q) return ICON_NAMES
  return ICON_NAMES.filter((name) => name.toLowerCase().includes(q))
}

export function IconPickerInput(props: StringInputProps) {
  const { value, onChange } = props
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredIcons = useMemo(() => filterIcons(search), [search])

  const handleSelect = useCallback(
    (iconName: string) => {
      onChange(value === iconName ? unset() : set(iconName))
      setOpen(false)
      setSearch('')
    },
    [onChange, value]
  )

  const handleClear = useCallback(() => {
    onChange(unset())
    setOpen(false)
    setSearch('')
  }, [onChange])

  return (
    <Stack space={2}>
      <Flex gap={2} align="center">
        <Box flex={1}>
          <TextInput
            placeholder="Search icons..."
            value={open ? search : (value || '')}
            onChange={(e) => {
              const v = e.currentTarget.value
              if (open) {
                setSearch(v)
              } else {
                setSearch(v)
                setOpen(true)
              }
            }}
            onFocus={() => setOpen(true)}
          />
        </Box>
        <Button
          text={value ? 'Change' : 'Browse'}
          icon={SanityIcon}
          mode="ghost"
          tone="default"
          onClick={() => {
            setSearch('')
            setOpen(true)
          }}
        />
      </Flex>

      {open && (
        <Dialog
          header="Choose icon"
          id="icon-picker-dialog"
          onClose={() => {
            setOpen(false)
            setSearch('')
          }}
          width={1}
          zOffset={1000}
        >
          <Box padding={3}>
            <Stack space={3}>
              <TextInput
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                autoFocus
              />

              <Box
                style={{
                  height: GRID_HEIGHT,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  border: '1px solid var(--card-border-color)',
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                    gap: 4,
                    padding: 8,
                  }}
                >
                  {filteredIcons.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelect(name)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: 8,
                        minHeight: ROW_HEIGHT - 8,
                        border: '1px solid transparent',
                        borderRadius: 4,
                        background: value === name ? 'var(--card-selected-color)' : 'transparent',
                        cursor: 'pointer',
                        font: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (value !== name) {
                          e.currentTarget.style.background = 'var(--card-hover-color)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          value === name ? 'var(--card-selected-color)' : 'transparent'
                      }}
                    >
                      <Text size={0} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', fontFamily: 'monospace' }}>
                        {name}
                      </Text>
                    </button>
                  ))}
                </div>
              </Box>

              {filteredIcons.length === 0 && (
                <Text muted>No icons match "{search}"</Text>
              )}

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
