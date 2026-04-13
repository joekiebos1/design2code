/**
 * POST /api/iterate
 *
 * Chat-based iteration on an existing PageBrief. Accepts the current brief
 * and a user message; returns either an updated brief or an honest explanation
 * of what can and cannot be changed.
 *
 * Response:
 *   { action: 'update', brief: PageBrief, message: string }
 *   { action: 'explain', message: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import JSON5 from 'json5'
import type { PageBrief } from '../../lib/types'
import '../_startup'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a page editor for a content management system. You receive a PageBrief (JSON) describing a marketing page, and a user request to modify it. You apply the change and return the updated brief, or explain honestly what cannot be done.

## Available block types
hero, proofPoints, mediaText5050, carousel, cardGrid, mediaTextAsymmetric, mediaTextStacked

## Rules — READ CAREFULLY

### What you CAN do
- Change copy: headline, body, subhead, eyebrow, items[].title, items[].body/description
- Add or remove items within a block (e.g. go from 3 cards to 4 cards in a cardGrid)
- Reorder sections whose narrativeRole is "setup" or "engage" — but setup must always come before engage in the final order
- Change blockOptions: columns, cardSize, emphasis, appearance, alignment, imagePosition, variant, etc.
- Change imageBrief and imageIntent to hint at different visuals (images are chosen from a pool — you cannot select a specific URL)
- Change section sectionName and rationale

### What you CANNOT do
- Change a section's component type (e.g. turn a carousel into a cardGrid) — say so
- Add a new section with a block type — say so
- Remove or reorder sections with narrativeRole "resolve" — the resolve sections (summary statement, keep exploring, purchase CTA) are always fixed at the end
- Specify exact image URLs — images come from the DAM library automatically
- Invent new block types not in the list above — say so
- Change meta.slug or meta.template

### Item limits per block
- proofPoints: max 4 items
- cardGrid: 2–4 columns, items should match column count (min 2, max 12)
- carousel: any number, but 3–6 is typical
- mediaTextAsymmetric (faq): any number of items

### Storytelling rule
Order of narrativeRole must always be: setup sections first (in their order), then engage sections (in their order), then resolve sections (always fixed at the end, do not touch their order values).

When reordering, update the order field of ALL sections so they are sequential integers starting from 1, with resolve sections last.

## Response format
Return ONLY a JSON object — no markdown, no explanation outside JSON:

{
  "action": "update" | "explain",
  "brief": { /* complete updated PageBrief — only when action is update */ },
  "message": "..." /* ALWAYS present — describe what you changed (action=update) or explain what you can/cannot do (action=explain) */
}

When action is "explain": do not include a "brief" key.
When action is "update": always include the complete brief with ALL sections intact.
Be honest and direct. If a request is partially doable, do the part you can and explain what you skipped.`

function extractJson(raw: string): string {
  let t = raw.trim().replace(/^\uFEFF/, '')
  const codeBlock = t.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) t = codeBlock[1].trim()
  const first = t.indexOf('{')
  const last = t.lastIndexOf('}')
  if (first !== -1 && last > first) t = t.slice(first, last + 1)
  return t
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
  }

  let body: { brief?: PageBrief; message?: string; imageUrls?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { brief, message, imageUrls = [] } = body

  if (!brief || !message) {
    return NextResponse.json({ error: 'brief and message are required' }, { status: 400 })
  }

  const userContent = `Current page brief:
\`\`\`json
${JSON.stringify(brief, null, 2)}
\`\`\`

Available DAM images: ${imageUrls.length} images in pool (assigned cyclically by block order — you cannot choose specific URLs, but you can change imageBrief/imageIntent to improve art direction).

User request: ${message}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    const rawText = response.content.find(c => c.type === 'text')?.text ?? ''
    const jsonText = extractJson(rawText)

    let parsed: { action: string; brief?: PageBrief; message: string }
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      try {
        parsed = JSON5.parse(jsonText)
      } catch {
        return NextResponse.json({
          action: 'explain',
          message: 'I had trouble processing that request. Could you try rephrasing it?',
        })
      }
    }

    if (parsed.action === 'update' && parsed.brief) {
      // Sanity-check: ensure resolve sections are intact
      const resolveFromOriginal = brief.sections.filter(s => s.narrativeRole === 'resolve')
      const resolveInUpdated = (parsed.brief.sections ?? []).filter(s => s.narrativeRole === 'resolve')

      if (resolveInUpdated.length < resolveFromOriginal.length) {
        // Restore missing resolve sections
        const updatedNonResolve = (parsed.brief.sections ?? []).filter(s => s.narrativeRole !== 'resolve')
        const maxOrder = updatedNonResolve.reduce((m, s) => Math.max(m, s.order ?? 0), 0)
        const restoredResolve = resolveFromOriginal.map((s, i) => ({ ...s, order: maxOrder + 1 + i }))
        parsed.brief.sections = [...updatedNonResolve, ...restoredResolve]
      }

      return NextResponse.json({
        action: 'update',
        brief: parsed.brief,
        message: parsed.message ?? 'Done.',
      })
    }

    return NextResponse.json({
      action: 'explain',
      message: parsed.message ?? "I wasn't able to make that change.",
    })
  } catch (err) {
    console.error('[iterate] Error:', err)
    return NextResponse.json({
      action: 'explain',
      message: 'Something went wrong on my end. Please try again.',
    }, { status: 500 })
  }
}
