/**
 * POST /api/infer-product
 *
 * Two behaviours depending on payload:
 *
 * 1. Initial inference (no confirmed/dismissed):
 *    { productName: string }
 *    → { productType, keyMessage, suggestions: string[], confidence: 'high'|'low', hasMore: boolean }
 *
 * 2. Next batch (with context):
 *    { productName: string, confirmed: string[], dismissed: string[] }
 *    → { suggestions: string[], hasMore: boolean }
 *
 * Suggestions are specific, factual claims about the product — RTBs, numbers,
 * features, differentiators — the raw material Claude needs to write sharp copy.
 * Returns [] suggestions with confidence:'low' when Claude has little knowledge.
 */
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import '../_startup'

const client = new Anthropic()

// ─── Initial inference ────────────────────────────────────────────────────────

const INFER_SYSTEM = `You are a product knowledge assistant for Jio, India's largest digital services company.

Given a product name, return structured facts that a page writer needs to create compelling copy.
Focus on: specific numbers, concrete capabilities, differentiators, what makes it distinctly Jio/Indian.

Return ONLY valid JSON. No markdown, no explanation.`

const INFER_PROMPT = (name: string) => `Product: "${name}"

Return JSON:
{
  "confidence": "high" | "low",
  "productType": "software" | "hardware",
  "keyMessage": "one sentence — the core promise of this product in Jio's voice",
  "suggestions": ["specific factual claim", "specific factual claim", ...],
  "hasMore": true | false
}

Rules:
- suggestions: 6–8 items maximum. Specific facts only — numbers, features, capabilities.
  Bad: "has many features". Good: "80M+ songs across Bollywood, regional, and independent artists".
- If you are not confident about a specific number, omit it rather than guess.
- confidence "low" means you have little reliable knowledge about this product.
- keyMessage: written in Jio's voice — human, warm, specific. Not a tagline. A true statement.
- If confidence is "low", return at most 2 suggestions and set hasMore to false.`

// ─── Next batch ───────────────────────────────────────────────────────────────

const BATCH_SYSTEM = `You are a product knowledge assistant for Jio.
Suggest additional specific facts about a product that haven't been covered yet.
Return ONLY valid JSON.`

const BATCH_PROMPT = (name: string, confirmed: string[], dismissed: string[]) => `Product: "${name}"

Already confirmed by user:
${confirmed.length ? confirmed.map(f => `- ${f}`).join('\n') : '(none yet)'}

Already dismissed by user:
${dismissed.length ? dismissed.map(f => `- ${f}`).join('\n') : '(none)'}

Suggest 3–4 more specific facts not yet covered. Vary the type — if confirmed facts are mostly features,
suggest proof points or differentiators. If dismissed facts were vague, be more specific.

Return JSON:
{
  "suggestions": ["specific factual claim", ...],
  "hasMore": true | false
}

Rules:
- Never repeat or rephrase anything already confirmed or dismissed.
- hasMore: false when you have genuinely run out of confident facts.
- If you have nothing meaningful to add, return { "suggestions": [], "hasMore": false }`

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { productName, confirmed, dismissed } = body as {
    productName: string
    confirmed?: string[]
    dismissed?: string[]
  }

  if (!productName?.trim()) {
    return NextResponse.json({ error: 'productName required' }, { status: 400 })
  }

  const isInitial = !confirmed && !dismissed

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: isInitial ? INFER_SYSTEM : BATCH_SYSTEM,
      messages: [{
        role: 'user',
        content: isInitial
          ? INFER_PROMPT(productName)
          : BATCH_PROMPT(productName, confirmed ?? [], dismissed ?? []),
      }],
    })

    const text = message.content.find(b => b.type === 'text')?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const data = JSON.parse(jsonMatch[0])

    return NextResponse.json(data)
  } catch (err) {
    console.error('[infer-product]', err)
    // Graceful fallback — return empty suggestions so UI shows free input only
    return NextResponse.json({
      confidence: 'low',
      productType: 'software',
      keyMessage: '',
      suggestions: [],
      hasMore: false,
    })
  }
}
