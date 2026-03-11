import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const BLOCK_DESCRIPTIONS: Record<string, string> = {
  hero: 'Hero block: contentLayout (stacked|sideBySide|mediaOverlay), overlayHeight (band|fullscreen) when mediaOverlay, blockSurface, blockAccent, productName, headline, subheadline, ctaText, ctaLink, cta2Text, cta2Link, image',
  mediaTextBlock:
    'Media+Text block: template, size, title, subhead, body, bulletList, ctaText, ctaLink, blockBackground, contentWidth, image',
  cardGrid: 'Card grid: columns, title, items (cardStyle, title, description, image, ctaText, ctaLink, surface)',
  carousel: 'Carousel: cardSize (compact|medium|large), surface (Emphasis), title, items (title, description, image, link, ctaText, aspectRatio)',
  proofPoints: 'Proof points: title, items (title, description, icon)',
}

const SYSTEM_PROMPT = `You are an expert content strategist helping to configure a block on a brand website. You see the current block state and help the user refine it.

When the user asks for changes, you can suggest specific field updates. If the user says "apply" or "update" or approves your suggestion, output a JSON block in this exact format (no other text before or after):
\`\`\`json
{ ...block fields... }
\`\`\`

Only output the JSON block when the user explicitly wants to apply changes. Otherwise, respond conversationally. The JSON must be valid and include only fields that exist for this block type. Omit image/video asset references (those stay as-is); only update text, options, and structure. For arrays like items[], include the full array with updates.`

export async function POST(req: NextRequest) {
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500, headers: corsHeaders })
    }

    const { blockType, blockValue, conversation, pageContext } = await req.json()
    if (!blockType || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: 'blockType and conversation required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const blockDesc = BLOCK_DESCRIPTIONS[blockType] || `Block type: ${blockType}`
    const context = `Block type: ${blockType}
${blockDesc}

Current block state:
${JSON.stringify(blockValue || {}, null, 2)}
${pageContext ? `\nPage context: ${pageContext}` : ''}`

    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      { role: 'user', content: `${context}\n\nI'm ready to help configure this block. What would you like to change?` },
    ]

    conversation.forEach((m: { role: string; content: string }) => {
      if (m.role === 'user' || m.role === 'assistant') {
        messages.push({ role: m.role, content: m.content })
      }
    })

    const anthropic = new Anthropic({ apiKey })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No AI response' }, { status: 500, headers: corsHeaders })
    }

    const reply = textContent.text.trim()
    let suggestedBlock: Record<string, unknown> | null = null

    const jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      try {
        suggestedBlock = JSON.parse(jsonMatch[1].trim()) as Record<string, unknown>
      } catch {
        // ignore parse errors
      }
    }

    return NextResponse.json(
      { reply, suggestedBlock },
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('JioKarna configure-block error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
