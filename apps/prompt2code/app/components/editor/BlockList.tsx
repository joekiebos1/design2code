'use client'

import { useState, useRef } from 'react'
import type { PageBrief } from '../../lib/types'

const COMPONENT_LABELS: Record<string, string> = {
  hero:                 'Hero',
  mediaTextStacked:     'Media + Text',
  mediaText5050:        '50/50',
  cardGrid:             'Card Grid',
  carousel:             'Carousel',
  proofPoints:          'Proof Points',
  iconGrid:             'Icon Grid',
  mediaTextAsymmetric:  'Asymmetric',
}

type BlockListProps = {
  brief: PageBrief
  onReorder: (newOrder: string[]) => void
}

export function BlockList({ brief, onReorder }: BlockListProps) {
  const sorted = [...brief.sections].sort((a, b) => a.order - b.order)
  const nonResolve = sorted.filter(s => s.narrativeRole !== 'resolve')
  const resolve = sorted.filter(s => s.narrativeRole === 'resolve')

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const draggingRef = useRef<number | null>(null)

  const handleDragStart = (index: number) => {
    draggingRef.current = index
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setOverIndex(index)
  }

  const handleDrop = (dropIndex: number) => {
    const from = draggingRef.current
    if (from == null || from === dropIndex) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    const reordered = [...nonResolve]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(dropIndex, 0, moved)
    onReorder(reordered.map(s => s.sectionName))
    setDragIndex(null)
    setOverIndex(null)
    draggingRef.current = null
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setOverIndex(null)
    draggingRef.current = null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Draggable (non-resolve) sections */}
      {nonResolve.map((section, i) => {
        const isDragging = dragIndex === i
        const isOver = overIndex === i && dragIndex !== i
        return (
          <div
            key={section.sectionName}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={e => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 16px',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              background: isDragging
                ? 'rgba(0,0,0,0.03)'
                : isOver
                ? 'rgba(0,100,220,0.05)'
                : 'transparent',
              opacity: isDragging ? 0.45 : 1,
              cursor: 'grab',
              transition: 'background 0.1s',
              borderLeft: isOver ? '2px solid rgba(0,100,220,0.5)' : '2px solid transparent',
              userSelect: 'none',
            }}
          >
            {/* Drag handle */}
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ flexShrink: 0, color: 'rgba(0,0,0,0.25)' }}>
              <circle cx="3" cy="2" r="1.2" fill="currentColor"/>
              <circle cx="7" cy="2" r="1.2" fill="currentColor"/>
              <circle cx="3" cy="7" r="1.2" fill="currentColor"/>
              <circle cx="7" cy="7" r="1.2" fill="currentColor"/>
              <circle cx="3" cy="12" r="1.2" fill="currentColor"/>
              <circle cx="7" cy="12" r="1.2" fill="currentColor"/>
            </svg>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(0,0,0,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {section.sectionName}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', marginTop: 1 }}>
                {COMPONENT_LABELS[section.component] ?? section.component}
              </div>
            </div>

            {/* Role badge */}
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: section.narrativeRole === 'setup' ? 'rgba(0,120,80,0.7)' : 'rgba(30,90,220,0.6)',
              flexShrink: 0,
            }}>
              {section.narrativeRole}
            </div>
          </div>
        )
      })}

      {/* Resolve sections — locked */}
      {resolve.length > 0 && (
        <>
          <div style={{
            padding: '8px 16px 5px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.25)',
            marginTop: 4,
          }}>
            Resolve — fixed
          </div>
          {resolve.map(section => (
            <div
              key={section.sectionName}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 16px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                opacity: 0.4,
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              {/* Lock icon */}
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0, color: 'rgba(0,0,0,0.4)' }}>
                <rect x="1" y="5" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(0,0,0,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {section.sectionName}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', marginTop: 1 }}>
                  {COMPONENT_LABELS[section.component] ?? section.component}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
