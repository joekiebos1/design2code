'use client'

import { Headline, Text, SurfaceProvider, Card, CardHeader, CardBody, Button } from '@marcelinodzn/ds-react'
import type { PageBrief, Section } from '../types'

function formatCta(cta: Section['contentSlots']['cta']): string | null {
  if (!cta) return null
  if (typeof cta === 'string') return cta
  const label = cta.label || cta.destination
  if (!label) return null
  return cta.destination ? `${label} → ${cta.destination}` : label
}

function hasCrossLinks(s: Section): boolean {
  return Array.isArray(s.crossLinks) && s.crossLinks.length > 0
}

type StructureScreenProps = {
  brief: PageBrief | null
  isGenerating: boolean
  onApprove: () => void
  onRegenerate: () => void
}

export function StructureScreen({ brief, isGenerating, onApprove, onRegenerate }: StructureScreenProps) {
  if (isGenerating) {
    return (
      <SurfaceProvider level={0}>
        <div style={{ maxWidth: 720, margin: '0 auto', paddingBlock: 'var(--ds-spacing-2xl)' }}>
          <Headline level={1} style={{ marginBottom: 'var(--ds-spacing-l)' }}>
            Proposing structure...
          </Headline>
          <Text appearance="secondary" style={{ fontSize: 'var(--ds-typography-body-xs)' }}>
            Claude is analyzing your intent and interview answers to propose a page structure.
          </Text>
        </div>
      </SurfaceProvider>
    )
  }

  if (!brief) {
    return null
  }

  const { meta, ia, sections } = brief

  return (
    <SurfaceProvider level={0}>
      <div style={{ maxWidth: 720, margin: '0 auto', paddingBlock: 'var(--ds-spacing-2xl)' }}>
        <Headline level={1} style={{ marginBottom: 'var(--ds-spacing-xs)' }}>
          Proposed structure
        </Headline>
        <Text appearance="secondary" style={{ marginBottom: 'var(--ds-spacing-2xl)', fontSize: 'var(--ds-typography-body-xs)' }}>
          {meta.pageName} · {meta.pageType}
        </Text>

        <Card surface="minimal" style={{ marginBottom: 'var(--ds-spacing-l)' }}>
          <CardHeader>
            <Headline level={2} style={{ margin: 0, fontSize: 'var(--ds-typography-h4)' }}>
              Meta
            </Headline>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-s)' }}>
            <Text size="S" as="p" style={{ margin: 0 }}>
              <strong>Intent:</strong> {meta.intent}
            </Text>
            <Text size="S" as="p" style={{ margin: 0 }}>
              <strong>Audience:</strong> {meta.audience}
            </Text>
            <Text size="S" as="p" style={{ margin: 0 }}>
              <strong>Primary action:</strong> {meta.primaryAction}
            </Text>
            <Text size="S" as="p" style={{ margin: 0 }}>
              <strong>Key message:</strong> {meta.keyMessage}
            </Text>
            <Text size="S" as="p" style={{ margin: 0 }}>
              <strong>Path:</strong> {ia.proposedPath}
            </Text>
          </CardBody>
        </Card>

        <Headline level={2} style={{ marginBottom: 'var(--ds-spacing-m)', fontSize: 'var(--ds-typography-h4)' }}>
          Sections
        </Headline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)', marginBottom: 'var(--ds-spacing-2xl)' }}>
          {sections
            .sort((a, b) => a.order - b.order)
            .map((s, i) => (
              <Card key={i} surface="minimal" style={{ border: '1px solid var(--ds-color-stroke-divider)' }}>
                <CardHeader style={{ paddingBlock: 'var(--ds-spacing-m)' }}>
                  <Headline level={3} style={{ margin: 0, fontSize: 'var(--ds-typography-h5)' }}>
                    {s.order}. {s.sectionName}
                  </Headline>
                  <Text size="S" appearance="secondary" style={{ marginTop: 'var(--ds-spacing-xs)' }}>
                    {s.component}
                  </Text>
                </CardHeader>
                <CardBody style={{ paddingBlock: '0 var(--ds-spacing-m)' }}>
                  <Text size="S" as="p" style={{ margin: 0 }}>
                    {s.rationale}
                  </Text>
                  {s.contentSlots.headline && (
                    <Text size="S" as="p" style={{ marginTop: 'var(--ds-spacing-s)' }}>
                      Headline: {s.contentSlots.headline}
                    </Text>
                  )}
                  {(() => {
                    const ctaStr = formatCta(s.contentSlots.cta)
                    return ctaStr ? (
                      <Text size="S" as="p" style={{ marginTop: 'var(--ds-spacing-s)' }}>
                        <strong>CTA:</strong> {ctaStr}
                        {typeof s.contentSlots.cta === 'object' && s.contentSlots.cta?.rationale && (
                          <span style={{ display: 'block', color: 'var(--ds-color-text-medium)', fontSize: 'var(--ds-typography-body-2xs)' }}>
                            {s.contentSlots.cta.rationale}
                          </span>
                        )}
                      </Text>
                    ) : null
                  })()}
                  {hasCrossLinks(s) && (
                    <div style={{ marginTop: 'var(--ds-spacing-s)' }}>
                      <Text size="S" as="p" style={{ margin: 0, fontWeight: 'var(--ds-typography-weight-high)' }}>
                        Cross-links:
                      </Text>
                      <ul style={{ margin: 'var(--ds-spacing-xs) 0 0 var(--ds-spacing-m)', paddingLeft: 'var(--ds-spacing-m)', fontSize: 'var(--ds-typography-body-xs)' }}>
                        {s.crossLinks!.map((link, j) => (
                          <li key={j} style={{ marginBottom: 'var(--ds-spacing-xs)' }}>
                            {link.label} → {link.destination}
                            {link.rationale && (
                              <span style={{ display: 'block', color: 'var(--ds-color-text-medium)', fontSize: 'var(--ds-typography-body-2xs)' }}>
                                {link.rationale}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--ds-spacing-m)' }}>
          <Button onPress={onApprove} appearance="neutral" size="M" attention="high">
            Approve & export
          </Button>
          <Button onPress={onRegenerate} appearance="secondary" contained={false} size="M" attention="high">
            Regenerate
          </Button>
        </div>
      </div>
    </SurfaceProvider>
  )
}
