import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import Anthropic from '@anthropic-ai/sdk'
import type { StoryCoachInput, StoryCoachResult } from '../../components/studio/storytelling-inspiration/types'

const LIB_SHARED = join(process.cwd(), 'lib', 'shared')

function loadSharedFile(path: string): string {
  return readFileSync(join(LIB_SHARED, path), 'utf-8')
}

const ROLE_INTRO = `You are the JioKarna Storytelling Inspiration — a brand storytelling strategist for Jio, India's largest digital services company.

Your job is to read a structured product brief and produce a narrative arc and block structure for a Jio product or category page. Your output feeds directly into a design production pipeline — it must be specific, opinionated, and immediately usable.

Generic output is a failure. If your output could have been written by someone who has never been to India, start again.`

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

From these three inputs:
1. Derive four RTBs — each must be a specific product fact, not emotional language or a claim
2. Identify the central India context truth most alive for this product
3. Produce the full narrative arc and block structure

Respond in valid JSON only. No markdown. No preamble. Match this exact shape:
{
  "primaryEmotion": "",
  "centralTruth": "",
  "rtbs": { "emotional": "", "rational": "", "social": "", "proud": "" },
  "hook": { "visitorState": "", "openingTension": "", "mustFeel": "" },
  "middle": { "centralDesire": "", "emotional": "", "rational": "", "social": "", "security": "" },
  "close": { "barrier": "", "ctaFraming": "" },
  "blocks": [{ "num": 1, "type": "", "section": "setup"|"engage"|"resolve", "job": "", "headline": "" }]
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
