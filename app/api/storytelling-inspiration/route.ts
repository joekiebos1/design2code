import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import Anthropic from '@anthropic-ai/sdk'
import type { StoryCoachInput, StoryCoachResult } from '../../components/studio/storytelling-inspiration/types'

const LIB_SHARED = join(process.cwd(), 'lib', 'shared')

function loadSharedFile(path: string): string {
  return readFileSync(join(LIB_SHARED, path), 'utf-8')
}

const ROLE_INTRO = `You are a senior brand storyteller for Jio — India's largest digital services company. You write narrative arcs for product pages that move people from curiosity to conviction.

You are opinionated. You push back on weak inputs with better interpretations. You never produce generic output. You fight the obvious — the first idea is rarely the right one.

Your output feeds directly into a design production pipeline. Every headline must be vivid and specific enough to inspire the designer and copywriter who come after you. A headline that could apply to any product has failed. A headline that could only be true for this product, for this person, in this moment — that works.`

const SYSTEM_PROMPT = [
  ROLE_INTRO,
  '---',
  loadSharedFile('jio-experience-principles.md'),
  '---',
  loadSharedFile('design-for-india-principles.md'),
  '---',
  loadSharedFile('storytelling/product-pages.md'),
].join('\n\n')

function buildUserMessage(input: StoryCoachInput): string {
  return `Product: ${input.productName}

INPUT 1 — Describe what the product does (core functionality, social/family/sharing, personalisation, access and pricing, privacy/data/accessibility)
${input.whatItDoes}

INPUT 2 — Describe what is in the product or can be accessed through the product (catalogue, language and regions, editorial, partners and exclusives)
${input.whatIsInIt}

INPUT 3 — What is it built for? (device range, network conditions, Indian-specific adaptations)
${input.builtFor}

From these three inputs, produce the full narrative arc and block structure.

Where product features run out, fill blocks with scenarios, use cases,
contrast moments, and ecosystem connections — not repetitions of
existing features from a different angle.

Mark each block as chapter (opens new narrative territory, larger
dramatic weight) or supporting (adds depth or proof within that territory).

Derive four buyer modalities — emotional, rational, social, and security —
that reflect how different visitors will be convinced by this product.

Respond in valid JSON only. No markdown. No preamble. Match this exact shape:
{
  "primaryEmotion": "",
  "modalities": { "emotional": "", "rational": "", "social": "", "security": "" },
  "hook": { "visitorState": "", "openingTension": "", "mustFeel": "" },
  "middle": { "centralDesire": "", "emotional": "", "rational": "", "social": "", "security": "" },
  "close": { "barrier": "", "ctaFraming": "" },
  "blocks": [{ "num": 1, "type": "", "section": "setup|engage|resolve", "role": "chapter|supporting", "job": "", "headline": "", "proof": "" }]
}
Produce 12–18 blocks.`
}

function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
    }

    const body = await req.json()
    const input = body as StoryCoachInput

    if (!input?.productName) {
      return NextResponse.json({ error: 'productName required' }, { status: 400 })
    }

    if (input.outputType !== 'product-page') {
      return NextResponse.json({ error: 'Only product page is supported for now' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(input) }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No text in AI response' }, { status: 500 })
    }

    const raw = stripMarkdownFences(textContent.text.trim())

    let data: StoryCoachResult
    try {
      data = JSON.parse(raw) as StoryCoachResult
    } catch {
      return NextResponse.json({ error: 'Failed to parse response' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Storytelling Inspiration API error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
