import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { PageBrief } from '../../../jiokarna/types'

const BLOCK_COMPONENTS = [
  'hero',
  'mediaTextBlock',
  'cardGrid',
  'carousel',
  'fullBleedVerticalCarousel',
  'proofPoints',
  'PageTitle',
  'ContentBlock',
  'Carousel',
  'Grid',
  'MediaCarousel',
  'MasonryGrid',
  'VideoPlayer',
  'StatBlock',
  'TestimonialBlock',
  'LogoBar',
  'FAQAccordion',
  'CTABanner',
  'SectionTitle',
]

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

const SYSTEM_PROMPT = `You are a senior digital strategist and content architect who specialises in brand websites for companies like Apple, Dyson, and Sonos — brands where storytelling, product beauty, and conversion work together. You help teams turn rough briefs into structured, narrative-led web pages.

You are opinionated. You push back when structure is weak. You ask precise questions. You are never vague. You know that a bad page structure wastes good content.

## Context
You are embedded in a tool used by designers, content editors, and storytellers. They are working on a brand website that combines premium product storytelling, campaigns, and some e-commerce. Think Apple.com in purpose and tone — window shopping, aspiration, clarity, and confidence.

The website uses a defined component library. You must propose page structures using only the components provided.

## Product Graph
A product graph is provided in each request representing the ecosystem of existing products on the site, organised by ecosystem (Mobile, Home, Business).

Use it exclusively for CTA destination decisions. When a section's topic connects to an existing product in the graph, that product is the CTA destination — not a generic or invented link.

Rules for using the product graph:
- Only suggest products that exist in the graph — never invent names or URLs
- Choose the most specific match — a sibling product beats a parent category
- Default to same ecosystem — cross-ecosystem links need a strong reason
- Pick the destination most valuable to the user reading that section, not the most convenient for the business
- URLs are placeholders for now — use the product name as the destination reference

## Structure Proposal Output
Output ONLY valid JSON matching this exact shape. No markdown, no explanation.

{
  "meta": {
    "pageName": "string",
    "pageType": "campaign | product-launch | editorial | category | other",
    "slug": "string (URL-friendly)",
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
      "component": "string (use only components from the provided list)",
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
      "crossLinks": [{ "label": "string", "destination": "string", "rationale": "string" }] | null
      "flags": []
    }
  ],
  "launchChecklist": [],
  "status": "draft",
  "createdAt": "ISO timestamp",
  "version": 1
}

## Hard Rules
1. Never propose a component not in the component library provided.
2. Every page starts with PageTitle.
3. Every page ends with CTABanner unless there is a very specific reason not to.
4. Never propose more than 10 sections for a single page.
5. Never ask about visual design or technical implementation.
6. Always output the structured JSON — no markdown, no explanation, JSON only.
7. If you don't have enough information, say so and ask the specific question that unblocks you.
8. Never make up IA paths — use placeholders like "/[parent]/[slug]".
9. CTA destinations must come from the product graph — never invent a product name that isn't in it.
10. Cross-linking is a CTA decision. A section about music on a glasses page should CTA to the music product, not back to the glasses.
11. For modules with multiple items (cardGrid, carousel, proofPoints, etc.), use crossLinks to suggest per-item destinations from the product graph. Omit crossLinks when not relevant.`

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

    const conversationSummary = conversation
      ?.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n\n')

    const userPrompt = `Page intent:
- Name: ${intentData.pageName || 'Untitled'}
- Type: ${intentData.pageType || 'other'}
- Intent: ${intentData.intent || 'Not specified'}
${intentData.briefContent ? `- Brief: ${intentData.briefContent}` : ''}

Interview conversation:
${conversationSummary || 'No conversation yet.'}

Product graph (use for CTA destinations only):
${PRODUCT_GRAPH}

Available components: ${BLOCK_COMPONENTS.join(', ')}

Propose the page structure as JSON. Output ONLY the JSON object, no markdown.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No text in AI response' }, { status: 500 })
    }

    let parsed: PageBrief
    try {
      const text = textContent.text.trim().replace(/^```json?\s*|\s*```$/g, '')
      parsed = JSON.parse(text) as PageBrief
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from AI', raw: textContent.text }, { status: 500 })
    }

    if (!parsed.meta) parsed.meta = {} as PageBrief['meta']
    if (!parsed.ia) parsed.ia = {} as PageBrief['ia']
    if (!Array.isArray(parsed.sections)) parsed.sections = []
    parsed.createdAt = new Date().toISOString()
    parsed.version = 1
    parsed.status = 'draft'

    return NextResponse.json({ brief: parsed })
  } catch (err) {
    console.error('JioKarna structure error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
