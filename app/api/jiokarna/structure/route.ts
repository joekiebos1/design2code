import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import JSON5 from 'json5'
import Anthropic from '@anthropic-ai/sdk'
import { transformJSONSchema } from '@anthropic-ai/sdk/lib/transform-json-schema'
import type { PageBrief } from '../../../jiokarna/types'
import { PAGE_BRIEF_SCHEMA } from '../structure-schema'

/** Product page storytelling and structure rules. Shared with Storytelling Inspiration (Studio). */
const PRODUCT_PAGE_RULES = readFileSync(
  join(process.cwd(), 'lib', 'shared', 'storytelling', 'product-pages.md'),
  'utf-8'
)

/** Jio Story storytelling rules. Editorial content, 5-act arc. */
const JIO_STORY_RULES = readFileSync(
  join(process.cwd(), 'lib', 'shared', 'storytelling', 'jio-stories.md'),
  'utf-8'
)

/** Component library: block purposes and options for content managers. */
const BLOCK_LIBRARY = `
## Component library (use only these blocks)

### hero
Full-width or compact hero. Use for page opening, product launch, campaign hero.
Options: variant (category | product | ghost | fullscreen), productName, headline, subheadline, ctaText, ctaLink, cta2Text, cta2Link, image.

### mediaTextStacked
Media + text stacked. Flexible layout for features, intros, CTAs.
Options:
- template: TextOnly | Stacked | Overlay. mediaSize: edgeToEdge | default (Stacked/Overlay only). alignment: left | center (left = Default grid).
- size: hero (largest), feature (standard), editorial (compact)
- emphasis: ghost | minimal | subtle | bold
- surfaceColour: primary | secondary | neutral
- contentWidth: XS | S | M | L | XL | XXL | edgeToEdge
- stackImagePosition: top | bottom (for Stacked)
Slots: eyebrow, title, subhead, body, descriptionTitle, descriptionBody, ctaText, ctaLink, cta2Text, cta2Link, image, video.

### mediaText5050
Media + Text: 50/50. Text and image side by side. Use for feature comparisons, accordions, multi-paragraph content.
Options: variant (paragraphs | accordion), imagePosition (left | right), emphasis, surfaceColour.
Slots: headline, items[] (subtitle, body), image, video.

### cardGrid
Grid of 2, 3, or 4 cards. Use for feature comparison, benefits, product highlights.
Options: columns (2 | 3 | 4), emphasis (ghost | minimal | subtle | bold), surfaceColour (primary | secondary | sparkle | neutral).
Per card: cardStyle (image-above | text-on-colour | text-on-image), title, description, image, video, ctaText, ctaLink.
Slots: title, items[].

### carousel
Horizontal carousel of cards. Use for product features, testimonials, media showcases.
Options:
- cardSize: compact (3 per row) | medium (2 per row, 4:5) | large (1 per row, 2:1)
- emphasis: ghost | minimal | subtle | bold
- surfaceColour: primary | secondary | neutral
Slots: title, items[] (each: title, description, image, video, link, ctaText, aspectRatio 4:5 | 8:5 | 2:1).

### proofPoints
Text + icon strip. Use for top-of-page reasons to believe, trust signals.
Options: emphasis (ghost | minimal | subtle | bold), surfaceColour (primary | secondary | sparkle | neutral).
Slots: title, items[] (title, description, icon).

### mediaTextAsymmetric
Asymmetric layout: optional left **block title**, main column on the right. Use for dense editorial copy (paragraph rows, merged paragraphs, FAQ, links, long-form body, or a main-column image).
- **Stacking:** Use several \`mediaTextAsymmetric\` sections in sequence when one left title should visually anchor multiple blocks of content.
- **Continuation:** For follow-up blocks, omit a block title (or use null / empty in briefs). The left column is not rendered; the main column spans the block width so copy continues under the previous block’s title.
- **Variants (one per block):** \`textList\`, \`paragraphs\`, \`longForm\`, \`faq\`, \`links\`, \`image\`.
- **Brief mapping:** \`contentSlots.headline\` → block title when present; null or omitted headline → continuation block.
Options: variant, emphasis, surfaceColour, theme; per variant: items[], paragraphRows[], longFormParagraphs[], image brief / aspect / alt as applicable.

## Block-level options (apply to blocks that support them)
- emphasis: ghost (no background) | minimal (neutral grey) | subtle (primary tint) | bold (brand colour)
- surfaceColour: primary (brand) | secondary (brand secondary) | neutral (grey)
`

// Product graph derived from site navigation XML.
// Used by Claude to make informed CTA destination decisions.
// Update this as the site grows.
const PRODUCT_GRAPH = `
Mobile ecosystem:
- Prepaid, Postpaid, International (plans)
- Apps & Services: MyJio, JioPC, JioTV+, JioGames, JioPhotos, JioSaavn, JioNews, JioAICloud, JioHome, JioJoin, JioMeet, JioSphere, JioCentrex, JioGate, Home surveillance, JioMart, JioFinance, JioHealth, JioPOSLite, JioTranslate, JioChat, JioMessages, JioSafe
- Devices

Home ecosystem:
- Browse plans, Apps & services, Devices

Business ecosystem:
  Connectivity:
    - Cloud Connect, MPLS VPN, Internet Leased Line, GrowNet Solutions, JioBusiness Solution, Jio True 5G, JioFi, SD-WAN, Managed Wi-Fi
    - Voice & collab: IP Centrex, Jio Meet, SIP Trunk, Toll Free Service
    - Security: DDoS Mitigation, Threat & Vulnerability Management, NetSensor, CyberSOC
    - Mobile: Jio True 5G, JioConnect, JioFi, Jio 4G Service
    - CPaaS (JioCX): JioCX SMS, JioCX Email, JioCX Voice, JioCX RCS, JioCX WhatsApp, JioCX Alerts, JioCX EasyPhone, JioCX EasyListing
    - Jio Ads
  Cloud:
    - AICloud: OCR, Document Translation, Entity Extraction, Language Translation, Speech Translation, Text to Speech, Speech to Text, Sentiment Analysis, Content Summarisation, PII Detection & Redaction, Content Moderation, Transcription, Video Analytics
    - CloudXP: Onboarding, Provisioning, Process Automation, Cost Engineering, Resource Management, AIOps, FinOps (Cost Analysis, Cost Governance, Cost Chargeback, Spot Savings), SecOps (SIEM, VA, RA)
    - MS Azure
  IoT:
    - Energy & Sustainability: Diesel Generator, Smart HVAC, Sub metering, Smart Lighting, Temperature Monitoring, Jio Smart Microinverter
    - Operation Efficiency: Digital Signages, Workforce Management, Fleet management, Asset tracking, Battery management system, Battery swapping solution
    - Connected Vehicle: Fleet management, AvniOS, EV charging, Vehicle telematics, JioXplor, Jio auto apps suite
    - Safety & Security: Jio Secure, Smart Outdoor lighting, Jio Talkie
    - Agriculture: JioKrishi, JioGauSamridhhi
    - Payments Platform: Voice Box, Smart Standee, Jio POS
    - Devices: JioTag Air, JioTag go
    - Industries: Retail, Manufacturing, BFSI, Hospitality, Healthcare, Real Estate/Smart Cities, Automotive Logistics, Energy & utilities
  5G Solutions:
    - Radio Products: 5G Radio Products, 5G Outdoor Small Cell, 5G mmWave Radio, Indoor Small Cell, 5G NR Macro gNodeB, Pico Small Cell
    - Core: 5G on the Edge, Network Slicing, Unified Subscriber Data Management, Converged Policy Control, 5G Charging & Policy Gateway, 5G Analytics Engine
    - Technologies: AI Networks, Edge Computing, MLaaS, 5G Advanced, Network Slicing, 6G
`

function buildSystemPrompt(template: string): string {
  const isJioStory = template === 'jio-story'
  const rules = isJioStory ? JIO_STORY_RULES : PRODUCT_PAGE_RULES
  const narrativeRoleNote = isJioStory
    ? 'Map: narrativeRole = act (hook | context | impact | proof | close), component = block type, blockOptions = decisions, contentSlots.headline = headline (evocative creative direction).'
    : 'Map: narrativeRole = section (setup | engage | resolve), component = block type, blockOptions = decisions, contentSlots.headline = headline (evocative creative direction).'

  let prompt = `You are a senior digital strategist and content architect who specialises in brand websites for companies like Apple, Dyson, and Sonos — brands where storytelling, product beauty, and conversion work together. You help teams turn rough briefs into structured, narrative-led web pages.

You are opinionated. You push back when structure is weak. You ask precise questions. You are never vague. You know that a bad page structure wastes good content.

## Context
You are embedded in a tool used by designers, content editors, and storytellers. They are working on a brand website that combines premium product storytelling, campaigns, and some e-commerce. Think Apple.com in purpose and tone — window shopping, aspiration, clarity, and confidence.

The website uses a defined component library. You must propose page structures using only the components provided.

## ${isJioStory ? 'Jio Story' : 'Product Page'} Rules (MUST FOLLOW)
The following rules define how ${isJioStory ? 'Jio Stories' : 'product pages'} must be structured. Follow them strictly when proposing structure. ${narrativeRoleNote} The output format below overrides any simplified format in the rules — you must output the full PageBrief JSON.

${rules}
`

  if (!isJioStory) {
    prompt += `
## Product Graph
A product graph is provided in each request representing the ecosystem of existing products on the site, organised by ecosystem (Mobile, Home, Business).

Use it exclusively for CTA destination decisions. When a section's topic connects to an existing product in the graph, that product is the CTA destination — not a generic or invented link.

Rules for using the product graph:
- Only suggest products that exist in the graph — never invent names or URLs
- Choose the most specific match — a sibling product beats a parent category
- Default to same ecosystem — cross-ecosystem links need a strong reason
- Pick the destination most valuable to the user reading that section, not the most convenient for the business
- URLs are placeholders for now — use the product name as the destination reference
`
  }

  prompt += `
## Structure Proposal Output
Output ONLY valid JSON matching this exact shape. No markdown, no explanation.

{
  "meta": {
    "pageName": "string (use product from intent)",
    "pageType": "campaign | product-launch | editorial | category | other",
    "slug": "string (URL-friendly, derive from page path)",
    "intent": "string",
    "audience": "string",
    "primaryAction": "string",
    "keyMessage": "string"
  },
  "ia": {
    "proposedPath": "string (e.g. /products/new — placeholder, verify against live site)",
    "parentSection": "string",
    "relatedPages": [{ "title": "string", "path": "string", "relationship": "string" }],
    "existingConflicts": []
  },
  "sections": [
    {
      "order": 1,
      "sectionName": "string",
      "component": "string (use only: hero, mediaTextBlock, mediaText5050, cardGrid, carousel, proofPoints, mediaTextAsymmetric)",
      "rationale": "string",
      "narrativeRole": "string",
      "contentSlots": {
        "headline": "string or null",
        "subhead": "string or null",
        "body": "string or null",
        "cta": {
          "label": "string or null",
          "destination": "product name from graph, or placeholder if none exists",
          "rationale": "string — why this destination was chosen"
        },
        "mediaType": "image | video | none | null",
        "items": "array or null"
      },
      "blockOptions": {
        "emphasis": "ghost | minimal | subtle | bold | null",
        "surfaceColour": "primary | secondary | neutral | null",
        "variant": "string or null (block-specific)",
        "size": "hero | feature | editorial | null (mediaTextStacked)",
        "template": "TextOnly | Stacked | Overlay (mediaTextStacked, required)",
        "alignment": "left | center (mediaTextStacked, required)",
        "mediaSize": "edgeToEdge | default (mediaTextStacked Stacked/Overlay, required)",
        "cardSize": "compact | medium | large | null (carousel)",
        "columns": "2 | 3 | 4 | null (cardGrid)"
      } | null,
      "crossLinks": [{ "label": "string", "destination": "string", "rationale": "string" }] | null,
      "flags": [],
      "imageBrief": "string or null — description of the ideal visual for this block (Art Director uses this)",
      "imageIntent": "lifestyle | product | abstract | null — visual intent signal"
    }
  ],
  "launchChecklist": [],
  "status": "draft",
  "createdAt": "ISO timestamp",
  "version": 1
}

## Hard Rules
1. Never propose a component not in the component library provided.
2. Every page starts with hero (or mediaTextStacked for text-only pages).
5. Never ask about visual design or technical implementation.
6. Always output the structured JSON — no markdown, no explanation, JSON only.
7. If you don't have enough information, say so and ask the specific question that unblocks you.
8. Never make up IA paths — use placeholders like "/[parent]/[slug]".
12. Use blockOptions to specify emphasis, surfaceColour, variant, size, template, etc. when relevant. Omit blockOptions when defaults are fine.
`

  if (isJioStory) {
    prompt += `
Jio Story specific:
3. narrativeRole must be one of: hook | context | impact | proof | close.
4. Page length: 9–17 blocks. Use hero for the opener.
9. No CTA. No product graph. No crossLinks to products.
10. Every Jio Story ends with a cardGrid (3 cards) for "Related stories" — use placeholder titles (Related Story 1, 2, 3) with crossLinks.destination as placeholder paths for other Jio Stories.`
  } else {
    prompt += `
Product page specific:
3. Every page ends with a CTA-focused section (hero with CTAs, or mediaTextStacked with template TextOnly and CTAs) unless there is a very specific reason not to.
4. Page length: 12–25 blocks (minimum 12, maximum 25, target 14–18). Follow architect rules.
9. CTA destinations must come from the product graph — never invent a product name that isn't in it.
10. Cross-linking is a CTA decision. A section about music on a glasses page should CTA to the music product, not back to the glasses.
11. For modules with multiple items (cardGrid, carousel, proofPoints, etc.), use crossLinks to suggest per-item destinations from the product graph. Omit crossLinks when not relevant.`
  }

  return prompt
}

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
    const template = intentData.template || 'product-page'
    const systemPrompt = buildSystemPrompt(template)
    const isJioStory = template === 'jio-story'

    const conversationSummary = conversation
      ?.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n\n')

    const userPrompt = isJioStory
      ? `Jio Story intent:
- Story title: ${intentData.product || 'Untitled'}
- India context: ${intentData.audience || 'Not specified'}
- Story angle: ${intentData.keyMessage || 'Not specified'}
- Page path: ${intentData.pagePath || 'Not specified'}
- Story details: ${intentData.intent || 'Not specified'}
${intentData.briefContent ? `- Brief: ${intentData.briefContent}` : ''}

Interview conversation:
${conversationSummary || 'No conversation yet.'}

${BLOCK_LIBRARY}

Propose the page structure as JSON. Output ONLY the JSON object, no markdown.`
      : `Page intent:
- Product: ${intentData.product || 'Untitled'}
- Type: ${intentData.pageType || 'other'}
- Audience: ${intentData.audience || 'Not specified'}
- Primary action: ${intentData.primaryAction || 'Not specified'}
- Key message: ${intentData.keyMessage || 'Not specified'}
- Page path: ${intentData.pagePath || 'Not specified'}
- Intent: ${intentData.intent || 'Not specified'}
${intentData.briefContent ? `- Brief: ${intentData.briefContent}` : ''}

Interview conversation:
${conversationSummary || 'No conversation yet.'}

Product graph (use for CTA destinations only):
${PRODUCT_GRAPH}

${BLOCK_LIBRARY}

Propose the page structure as JSON. Output ONLY the JSON object, no markdown.`

    let response: Awaited<ReturnType<typeof anthropic.messages.create>>
    try {
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      output_config: {
        format: {
          type: 'json_schema',
          schema: transformJSONSchema(PAGE_BRIEF_SCHEMA as Record<string, unknown>),
        },
      },
      })
    } catch (structuredErr: unknown) {
      // Fallback if structured output not supported (e.g. model or schema)
      const err = structuredErr as { status?: number }
      if (err?.status === 400) {
        response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        })
      } else {
        throw structuredErr
      }
    }

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No text in AI response' }, { status: 500 })
    }

    /** Extract and normalize JSON from AI response. */
    function extractJson(raw: string): string {
      let text = raw.trim().replace(/^\uFEFF/, '')
      const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (codeBlock) text = codeBlock[1].trim()
      const firstBrace = text.indexOf('{')
      const lastBrace = text.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        text = text.slice(firstBrace, lastBrace + 1)
      }
      // Fix common LLM output issues
      text = text
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      return text
    }

    const text = extractJson(textContent.text)

    function tryParse(t: string): PageBrief | null {
      try {
        return JSON.parse(t) as PageBrief
      } catch {
        try {
          return JSON5.parse(t) as PageBrief
        } catch {
          return null
        }
      }
    }

    const parsed = tryParse(text)

    if (!parsed) {
      console.error('Structure JSON parse error')
      console.error('Extracted text (first 2000 chars):', text.slice(0, 2000))
      return NextResponse.json(
        {
          error: 'Invalid JSON from AI',
          snippet: text.length > 800 ? `...${text.slice(-600)}` : text,
          hint: 'Common causes: truncated response (try shorter interview), unescaped quotes in strings, or smart quotes.',
        },
        { status: 500 }
      )
    }

    if (!parsed.meta) parsed.meta = {} as PageBrief['meta']
    if (!parsed.ia) parsed.ia = {} as PageBrief['ia']
    if (!Array.isArray(parsed.sections)) parsed.sections = []
    parsed.createdAt = new Date().toISOString()
    parsed.version = 1
    parsed.status = 'draft'

    const id = intentData as { template?: string; product?: string; pagePath?: string; audience?: string; primaryAction?: string; keyMessage?: string }
    parsed.meta.template = (id.template as 'product-page' | 'jio-story') || 'product-page'
    if (id.product && !parsed.meta.pageName) parsed.meta.pageName = id.product
    if (id.pagePath) parsed.meta.slug = id.pagePath.replace(/^\//, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9/-]/g, '')
    if (id.audience && !parsed.meta.audience) parsed.meta.audience = id.audience
    if (id.primaryAction && !parsed.meta.primaryAction) parsed.meta.primaryAction = id.primaryAction
    if (id.keyMessage && !parsed.meta.keyMessage) parsed.meta.keyMessage = id.keyMessage
    if (parsed.meta.template === 'jio-story' && !parsed.meta.primaryAction) parsed.meta.primaryAction = 'Read the story'

    return NextResponse.json({ brief: parsed })
  } catch (err) {
    console.error('JioKarna structure error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
