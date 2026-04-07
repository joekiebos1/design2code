'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { createTransition } from '@marcelinodzn/ds-tokens'

export type CardLinkProps = {
  interaction?: 'information' | 'navigation'
  link?: string | null
  children: ReactNode
  style?: CSSProperties
}

const TRANSITION = createTransition(['transform', 'box-shadow'], 's', 'transition', 'moderate')

export function CardLink({ interaction, link, children, style }: CardLinkProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  if (interaction !== 'navigation' || !link?.trim()) {
    return <div style={style}>{children}</div>
  }

  const href = link.trim()
  const scale = isPressed ? 'scale(0.98)' : isHovered ? 'scale(1.02)' : 'scale(1)'
  const shadow = isHovered && !isPressed
    ? '0 4px 16px rgba(0, 0, 0, 0.10)'
    : 'none'

  const linkStyle: CSSProperties = {
    ...style,
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: 'var(--ds-radius-card-m)',
    overflow: 'hidden',
    transform: scale,
    boxShadow: shadow,
    transition: TRANSITION,
    cursor: 'pointer',
  }

  if (href.startsWith('/')) {
    return (
      <Link
        href={href}
        style={linkStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
      >
        {children}
      </Link>
    )
  }

  return (
    <a
      href={href}
      style={linkStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {children}
    </a>
  )
}
