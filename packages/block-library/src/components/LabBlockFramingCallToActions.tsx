'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@marcelinodzn/ds-react'
import type { LabBlockCallToAction } from '../lab-utils/lab-block-framing-typography'

export function LabBlockFramingCallToActions({
  actions,
  align = 'center',
}: {
  actions: LabBlockCallToAction[] | null | undefined
  align?: 'left' | 'center'
}) {
  const router = useRouter()
  const list = actions?.filter((a) => a?.label?.trim()) ?? []
  if (list.length === 0) return null

  const navigate = (href: string) => {
    const h = href.trim()
    if (!h) return
    if (h.startsWith('/')) router.push(h)
    else window.location.href = h
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'left' ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-m)',
      }}
    >
      {list.map((a) => (
        <Button
          key={a._key ?? a.label}
          appearance={a.style === 'outlined' ? 'secondary' : 'primary'}
          size="M"
          attention="high"
          onPress={() => a.link && navigate(a.link)}
        >
          {a.label}
        </Button>
      ))}
    </div>
  )
}
