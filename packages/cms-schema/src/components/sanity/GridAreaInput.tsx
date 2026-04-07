'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Text } from '@sanity/ui'
import { set, unset, PatchEvent } from 'sanity'
import { useFormValue } from 'sanity'
import type { ObjectInputProps } from 'sanity'
import type { FieldProps } from 'sanity'

/** Catches errors and falls back to default object input so the field always shows. */
class GridAreaErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (props: ObjectInputProps) => React.ReactNode; props: ObjectInputProps },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError = () => ({ hasError: true })
  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.props.props)
    }
    return this.props.children
  }
}

const COLS = 12
const CELL_SIZE = 20
const GAP = 1
const SELECT_COLOUR = 'rgba(0, 102, 204, 0.5)'

export type GridAreaValue = {
  topLeft: { column: number; row: number }
  bottomRight: { column: number; row: number }
}

function normalizeArea(
  topLeft: { column?: number; row?: number } | undefined,
  bottomRight: { column?: number; row?: number } | undefined,
  rows: number,
  defaults: { colStart: number; colSpan: number; rowStart: number; rowSpan: number }
): GridAreaValue {
  const tlCol = topLeft?.column ?? defaults.colStart
  const tlRow = topLeft?.row ?? defaults.rowStart
  const brCol = bottomRight?.column ?? Math.min(tlCol + defaults.colSpan - 1, COLS)
  const brRow = bottomRight?.row ?? Math.min(tlRow + defaults.rowSpan - 1, rows)
  const colStart = Math.min(tlCol, brCol)
  const colEnd = Math.max(tlCol, brCol)
  const rowStart = Math.min(tlRow, brRow)
  const rowEnd = Math.max(tlRow, brRow)
  return {
    topLeft: { column: Math.max(1, colStart), row: Math.max(1, rowStart) },
    bottomRight: { column: Math.min(COLS, colEnd), row: Math.min(rows, rowEnd) },
  }
}

function GridAreaInputInner(props: ObjectInputProps) {
  const { value, onChange, path } = props
  const parentPath = path?.slice(0, -1) ?? []
  const rowsPath = useMemo(() => [...parentPath, 'rows'], [parentPath])
  const rowsRaw = useFormValue(rowsPath) as number | undefined
  const rows = Math.min(16, Math.max(2, rowsRaw ?? 6))

  const defaults = useMemo(
    () =>
      path[path.length - 1] === 'textArea'
        ? { colStart: 1, colSpan: 6, rowStart: 2, rowSpan: 3 }
        : { colStart: 5, colSpan: 8, rowStart: 1, rowSpan: 6 },
    [path]
  )

  const area = useMemo(() => {
    const v = value as GridAreaValue | undefined
    if (!v?.topLeft || !v?.bottomRight) return null
    return normalizeArea(v.topLeft, v.bottomRight, rows, defaults)
  }, [value, rows, defaults])

  const [dragging, setDragging] = useState<{ col: number; row: number } | null>(null)
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null)

  const patch = useCallback(
    (value: GridAreaValue | null) => {
      if (value === null) {
        onChange(PatchEvent.from(unset()))
      } else {
        onChange(PatchEvent.from(set(value)))
      }
    },
    [onChange]
  )

  const handleCellMouseDown = useCallback(
    (col: number, row: number) => {
      setDragging({ col, row })
      patch({ topLeft: { column: col, row }, bottomRight: { column: col, row } })
    },
    [patch]
  )

  const handleCellMouseEnter = useCallback(
    (col: number, row: number) => {
      setHoverCell({ col, row })
      if (dragging) {
        patch({
          topLeft: {
            column: Math.min(dragging.col, col),
            row: Math.min(dragging.row, row),
          },
          bottomRight: {
            column: Math.max(dragging.col, col),
            row: Math.max(dragging.row, row),
          },
        })
      }
    },
    [dragging, patch]
  )

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onUp = () => setDragging(null)
    document.addEventListener('mouseup', onUp)
    return () => document.removeEventListener('mouseup', onUp)
  }, [dragging])

  const handleClear = useCallback(() => {
    patch(null)
  }, [patch])

  const colSpan = area ? area.bottomRight.column - area.topLeft.column + 1 : 0
  const rowSpan = area ? area.bottomRight.row - area.topLeft.row + 1 : 0

  return (
    <Flex direction="column" gap={2}>
      <Flex align="center" gap={2}>
        <Text size={1} weight="semibold">
          12 × {rows} grid
        </Text>
        <Text size={1} muted>
          Drag to select area
        </Text>
        {value && (
          <Text size={1}>
            {colSpan} × {rowSpan} cells
          </Text>
        )}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 6px',
              fontSize: 12,
              color: 'var(--card-muted-fg-color)',
            }}
          >
            Clear
          </button>
        )}
      </Flex>
      <Box
        onMouseLeave={() => setHoverCell(null)}
        onMouseUp={handleMouseUp}
        style={{ userSelect: 'none' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
            gap: GAP,
            width: COLS * CELL_SIZE + (COLS - 1) * GAP,
            background: 'var(--card-muted-bg-color)',
            padding: 4,
            borderRadius: 4,
          }}
        >
          {Array.from({ length: rows }, (_, rowIdx) =>
            Array.from({ length: COLS }, (_, colIdx) => {
              const col = colIdx + 1
              const row = rowIdx + 1
              const isInArea =
                area &&
                col >= area.topLeft.column &&
                col <= area.bottomRight.column &&
                row >= area.topLeft.row &&
                row <= area.bottomRight.row
              const isHover = hoverCell?.col === col && hoverCell?.row === row
              return (
                <button
                  key={`${col}-${row}`}
                  type="button"
                  onMouseDown={() => handleCellMouseDown(col, row)}
                  onMouseEnter={() => handleCellMouseEnter(col, row)}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    padding: 0,
                    border: 'none',
                    borderRadius: 2,
                    background: isInArea ? SELECT_COLOUR : isHover ? 'rgba(0,0,0,0.08)' : 'var(--card-bg-color)',
                    cursor: 'pointer',
                  }}
                  title={`Col ${col}, Row ${row}`}
                />
              )
            })
          )}
        </div>
      </Box>
    </Flex>
  )
}

export function GridAreaInput(props: ObjectInputProps) {
  const { renderDefault } = props
  return (
    <Flex direction="column" gap={3}>
      <GridAreaErrorBoundary props={props} fallback={() => null}>
        <GridAreaInputInner {...props} />
      </GridAreaErrorBoundary>
      {renderDefault ? renderDefault(props) : null}
    </Flex>
  )
}

/** Field-level wrapper: renders only our grid. Use components: { field: GridAreaField } with hidden nested fields. */
export function GridAreaField(props: FieldProps) {
  const { children, inputProps } = props
  const inputPropsObj = inputProps as ObjectInputProps
  return (
    <GridAreaErrorBoundary props={inputPropsObj} fallback={() => children}>
      <GridAreaInputInner {...inputPropsObj} />
    </GridAreaErrorBoundary>
  )
}
