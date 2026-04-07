import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const CHECKLIST: Record<string, { id: string; label: string }[]> = {
  whatItDoes: [
    { id: 'core', label: 'Core functionality' },
    { id: 'social', label: 'Social, family and sharing functionality' },
    { id: 'personalisation', label: 'Personalisation and intelligence' },
    { id: 'access', label: 'Access and pricing' },
    { id: 'privacy', label: 'Privacy, data, accessibility' },
  ],
  whatIsInIt: [
    { id: 'catalogue', label: 'Catalogue depth and breadth' },
    { id: 'languages', label: 'Language and regions' },
    { id: 'editorial', label: 'Editorial and curation' },
    { id: 'partners', label: 'Partner and exclusives' },
  ],
  builtFor: [
    { id: 'devices', label: 'Device range' },
    { id: 'network', label: 'Network conditions' },
    { id: 'india', label: 'Indian-specific adaptations' },
  ],
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ covered: [] }, { status: 500 })
    }

    const { field, text } = await req.json()
    const items = CHECKLIST[field]
    if (!items) return NextResponse.json({ covered: [] })

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: `You are analysing a product brief text field to detect which topic areas are meaningfully covered.
An item is covered only if there is specific, substantive content about it — not a vague mention, not just the label itself. Interpretation is required — the text may not use the exact words of the checklist item.
Respond in valid JSON only. No markdown. No explanation.
Format: { "covered": ["id1", "id2"] }`,
      messages: [
        {
          role: 'user',
          content: `Field: ${field}

Checklist items to detect (id: description):
${items.map((i) => `- ${i.id}: ${i.label}`).join('\n')}

Text to analyse:
${text}

Return the IDs of items that are meaningfully covered in the text.`,
        },
      ],
    })

    const textBlock = response.content.find((c) => c.type === 'text')
    const raw = textBlock && textBlock.type === 'text' ? textBlock.text : ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json({ covered: parsed.covered ?? [] })
  } catch {
    return NextResponse.json({ covered: [] })
  }
}
