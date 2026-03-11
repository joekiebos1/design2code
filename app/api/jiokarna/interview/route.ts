import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are an expert UX researcher helping to produce a structured page brief for a brand website.

Your role: Ask clarifying questions to understand the page intent, audience, key message, and primary action. Be conversational and concise. Ask 1–3 questions at a time. When you have enough information to propose a page structure, say "READY" and the user will proceed to the structure phase.

Focus on:
- Who is the audience?
- What is the primary action we want users to take?
- What is the key message?
- Any related pages or navigation context?
- Tone and style preferences`

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
    }

    const { intentData, conversation } = await req.json()
    if (!intentData) {
      return NextResponse.json({ error: 'intentData required' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const context = `Product: ${intentData.product || 'Untitled'}
Type: ${intentData.pageType || 'other'}
Audience: ${intentData.audience || 'Not specified'}
Primary action: ${intentData.primaryAction || 'Not specified'}
Key message: ${intentData.keyMessage || 'Not specified'}
Page path: ${intentData.pagePath || 'Not specified'}
Intent: ${intentData.intent || 'Not specified'}
${intentData.briefContent ? `Additional context: ${intentData.briefContent}` : ''}`

    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      {
        role: 'user',
        content: `${context}\n\nI'm ready to answer your questions to help define this page.`,
      },
    ]

    if (conversation?.length) {
      conversation.forEach((m: { role: string; content: string }) => {
        if (m.role === 'user' || m.role === 'assistant') {
          messages.push({ role: m.role, content: m.content })
        }
      })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No text in AI response' }, { status: 500 })
    }

    return NextResponse.json({ reply: textContent.text.trim() })
  } catch (err) {
    console.error('JioKarna interview error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
