# JioKarna — Claude Prompt Overview

Total overview of all prompts sent to Claude. Use this to improve the prompt system.

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER FLOW                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Intent → Interview → Structure → Preview → Approved                         │
│              │              │                                                │
│              ▼              ▼                                                │
│  ┌───────────────┐  ┌─────────────────────────────────────────────────────┐ │
│  │ INTERVIEW API │  │ STRUCTURE API                                        │ │
│  │ /api/jiokarna/│  │ /api/jiokarna/structure                              │ │
│  │ interview     │  │                                                      │ │
│  │               │  │  System: SYSTEM_PROMPT + ARCHITECT_RULES              │ │
│  │ System:       │  │  User:   intent + conversation + PRODUCT_GRAPH +    │ │
│  │ UX researcher │  │          BLOCK_LIBRARY                                │ │
│  │               │  │  Output: JSON (constrained by PAGE_BRIEF_SCHEMA)      │ │
│  └───────────────┘  └─────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ CONFIGURE-BLOCK API (no UI yet)                                        │  │
│  │ /api/jiokarna/configure-block                                          │  │
│  │ System: content strategist for block config                            │  │
│  │ User:   blockType + blockValue + conversation                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1.1 Three-layer prompt architecture (Structure API)

The Structure API prompt is built from three layers. Each has a distinct role.

| Layer | Role | Source | What it provides |
|-------|------|--------|------------------|
| **1. Storytelling logic** | Narrative arc, tone, ambition, principles. Defines what a strong page is and how the visitor should feel. | `lib/shared/storytelling/product-pages.md` | Arc (Setup→Engage→Resolve), content ambition, block rules, rhythm, what to avoid. |
| **2. Block definitions** | What each block is, what it can do, its options and slots. The palette. | `BLOCK_LIBRARY` in `structure/route.ts` | Component list, capabilities, valid options (template, size, emphasis, etc.), content slots. Should be rich enough for Claude to make good choices. |
| **3. Claude** | Structural decisions. Given the storytelling logic and block definitions, decides which blocks to use and how. | — | Proposes sections, assigns components, sets blockOptions, writes headlines and rationales. |

**Separation of concerns:**
- Storytelling logic = *why* and *how the journey works* — principles, not prescription.
- Block definitions = *what's available* — capabilities, not placement rules.
- Claude = *the designer* — applies principles to the palette and builds the page.

---

## 2. File Locations

| Piece | File | Lines |
|-------|------|-------|
| Interview system prompt | `app/api/jiokarna/interview/route.ts` | 4–13 |
| Structure system prompt | `app/api/jiokarna/structure/route.ts` | 100–198 |
| Architect rules (injected) | `lib/shared/storytelling/product-pages.md` | full file |
| Block library | `app/api/jiokarna/structure/route.ts` | 17–61 |
| Product graph | `app/api/jiokarna/structure/route.ts` | 66–99 |
| Structure user prompt | `app/api/jiokarna/structure/route.ts` | 223–239 |
| Output schema | `app/api/jiokarna/structure-schema.ts` | full file |
| Configure-block system | `app/api/jiokarna/configure-block/route.ts` | 14–22 |

---

## 3. Interview Prompt

**System:** `app/api/jiokarna/interview/route.ts`

```
You are an expert UX researcher helping to produce a structured page brief for a brand website.

Your role: Ask clarifying questions to understand the page intent, audience, key message, and primary action. Be conversational and concise. Ask 1–3 questions at a time. When you have enough information to propose a page structure, say "READY" and the user will proceed to the structure phase.

Focus on:
- Who is the audience?
- What is the primary action we want users to take?
- What is the key message?
- Any related pages or navigation context?
- Tone and style preferences
```

**First user message:**
```
Product: {product}
Type: {pageType}
Audience: {audience}
Primary action: {primaryAction}
Key message: {keyMessage}
Page path: {pagePath}
Intent: {intent}
{Optional: Additional context: {briefContent}}

I'm ready to answer your questions to help define this page.
```

**Then:** Full conversation history (user + assistant turns).

**Model:** claude-sonnet-4-20250514, max_tokens: 1024

---

## 4. Structure Prompt (Full)

### 4.1 System prompt (structure/route.ts)

```
You are a senior digital strategist and content architect who specialises in brand websites for companies like Apple, Dyson, and Sonos — brands where storytelling, product beauty, and conversion work together. You help teams turn rough briefs into structured, narrative-led web pages.

You are opinionated. You push back when structure is weak. You ask precise questions. You are never vague. You know that a bad page structure wastes good content.

## Context
You are embedded in a tool used by designers, content editors, and storytellers. They are working on a brand website that combines premium product storytelling, campaigns, and some e-commerce. Think Apple.com in purpose and tone — window shopping, aspiration, clarity, and confidence.

The website uses a defined component library. You must propose page structures using only the components provided.

## Page Architect Rules (MUST FOLLOW)
The following rules define how product pages must be structured. Follow them strictly when proposing structure. Map: narrativeRole = section (setup | engage | resolve), component = block type, blockOptions = decisions, contentSlots.headline = headline (evocative creative direction). The output format below overrides the simplified format in the rules — you must output the full PageBrief JSON.

${ARCHITECT_RULES}   ← lib/shared/storytelling/product-pages.md (full contents)

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

{ ... full JSON schema in prompt ... }

## Hard Rules
1. Never propose a component not in the component library provided.
2. Every page starts with hero (or mediaTextStacked for text-only pages).
3. Every page ends with a CTA-focused section (hero with CTAs, or mediaTextStacked with template TextOnly and CTAs) unless there is a very specific reason not to.
4. Page length: 12–25 blocks (minimum 12, maximum 25, target 14–18). Follow architect rules.
5. Never ask about visual design or technical implementation.
6. Always output the structured JSON — no markdown, no explanation, JSON only.
7. If you don't have enough information, say so and ask the specific question that unblocks you.
8. Never make up IA paths — use placeholders like "/[parent]/[slug]".
9. CTA destinations must come from the product graph — never invent a product name that isn't in it.
10. Cross-linking is a CTA decision. A section about music on a glasses page should CTA to the music product, not back to the glasses.
11. For modules with multiple items (cardGrid, carousel, proofPoints, etc.), use crossLinks to suggest per-item destinations from the product graph. Omit crossLinks when not relevant.
12. Use blockOptions to specify emphasis, appearance, variant, size, template, etc. when relevant. Omit blockOptions when defaults are fine.
```

### 4.2 User prompt (structure/route.ts)

```
Page intent:
- Product: {product}
- Type: {pageType}
- Audience: {audience}
- Primary action: {primaryAction}
- Key message: {keyMessage}
- Page path: {pagePath}
- Intent: {intent}
{Optional: - Brief: {briefContent}}

Interview conversation:
{conversationSummary — "role: content" per line}

Product graph (use for CTA destinations only):
${PRODUCT_GRAPH}

${BLOCK_LIBRARY}

Propose the page structure as JSON. Output ONLY the JSON object, no markdown.
```

### 4.3 Block library (in user prompt)

```
## Component library (use only these blocks)

### hero
Full-width or compact hero. Use for page opening, product launch, campaign hero.
Options: variant (category | product | ghost | fullscreen), eyebrow, title, body, ctaText, ctaLink, cta2Text, cta2Link, image.

### mediaTextStacked
Media + text stacked. Flexible layout for features, intros, CTAs.
Options:
- template: TextOnly | Stacked | Overlay. mediaSize: edgeToEdge | default (Stacked/Overlay only). alignment: left | center (left = Default grid).
- size: hero (largest), feature (standard), editorial (compact)
- emphasis: ghost | minimal | subtle | bold
- appearance: primary | secondary | neutral
- contentWidth: XS | S | M | L | XL | XXL | edgeToEdge
- stackImagePosition: top | bottom (for Stacked)
Slots: eyebrow, title, subhead, body, descriptionTitle, descriptionBody, ctaText, ctaLink, cta2Text, cta2Link, image, video.

### mediaText5050
Media + Text: 50/50. Text and image side by side. Use for feature comparisons, accordions, multi-paragraph content.
Options: variant (paragraphs | accordion), imagePosition (left | right), emphasis, appearance.
Slots: headline, items[] (subtitle, body), image, video.

### cardGrid
Grid of 2, 3, or 4 cards. Use for feature comparison, benefits, product highlights.
Options: columns (2 | 3 | 4), emphasis (ghost | minimal | subtle | bold), appearance (primary | secondary | sparkle | neutral).
Per card: cardType (mediaTextBelow | mediaTextOverlay | colourFeatured | colourIconText | colourTextOnly), title, description, image, video, ctaText, ctaLink.
Slots: title, items[].

### carousel
Horizontal carousel of cards. Use for product features, testimonials, media showcases.
Options:
- cardSize: compact (3 per row) | medium (2 per row, 4:5) | large (1 per row, 2:1)
- emphasis: ghost | minimal | subtle | bold
- appearance: primary | secondary | neutral
Slots: title, items[] (each: title, description, image, video, link, ctaText, aspectRatio 4:5 | 8:5 | 2:1).

### proofPoints
Text + icon strip. Use for top-of-page reasons to believe, trust signals.
Options: emphasis (ghost | minimal | subtle | bold), appearance (primary | secondary | sparkle | neutral).
Slots: title, items[] (title, description, icon).

## Block-level options (apply to blocks that support them)
- emphasis: ghost (no background) | minimal (neutral grey) | subtle (primary tint) | bold (brand colour)
- appearance: primary (brand) | secondary (brand secondary) | neutral (grey)
```

### 4.4 Product graph (in user prompt)

See `app/api/jiokarna/structure/route.ts` lines 66–99. Full product tree for Mobile, Home, Business ecosystems.

### 4.5 Architect rules (injected into system)

See `lib/shared/storytelling/product-pages.md` — full file. Covers:
- Role, Story Arc (Setup → Engage → Resolve)
- Content Ambition Rules
- Block Rules (Hero, ProofPoints, MediaTextBlock, Carousel, CardGrid)
- Rhythm and Variety Rules
- Cross-Linking Rules
- Spacing Rules
- Page Length
- Output Format (simplified — overridden by structure prompt)

---

## 5. Output Schema (PAGE_BRIEF_SCHEMA)

Used with Anthropic `output_config` for structured JSON. **Schema wins** — if the prompt says something the schema doesn't allow, the schema constrains the output.

**Location:** `app/api/jiokarna/structure-schema.ts`

**Schema includes:**
- meta: pageName, pageType, slug, intent, audience, primaryAction, keyMessage
- ia: proposedPath, parentSection, relatedPages, existingConflicts
- sections[].contentSlots: headline, subhead, body, cta, mediaType, items
- sections[].blockOptions: emphasis, appearance, variant, size, template, cardSize, columns
- **Schema omits:** alignment, mediaSize, descriptionTitle, descriptionBody in blockOptions

---

## 6. Configure-Block Prompt

**System:** `app/api/jiokarna/configure-block/route.ts`

```
You are an expert content strategist helping to configure a block on a brand website. You see the current block state and help the user refine it.

When the user asks for changes, you can suggest specific field updates. If the user says "apply" or "update" or approves your suggestion, output a JSON block in this exact format (no other text before or after):
```json
{ ...block fields... }
```

Only output the JSON block when the user explicitly wants to apply changes. Otherwise, respond conversationally. The JSON must be valid and include only fields that exist for this block type. Omit image/video asset references (those stay as-is); only update text, options, and structure. For arrays like items[], include the full array with updates.
```

**User:** blockType + block description + current block state (JSON) + optional pageContext + conversation.

---

## 7. Inconsistencies & Gaps

| Issue | Location | Impact |
|-------|----------|--------|
| **mediaTextBlock vs mediaTextStacked** | Structure prompt line 152 says `mediaTextBlock`; BLOCK_LIBRARY and architect rules use `mediaTextStacked`. `briefToBlocks` / `briefToSanityBlocks` only handle `mediaTextStacked`. | Claude may output `mediaTextBlock`; conversion may miss it. |
| **mediaText5050** | In BLOCK_LIBRARY but not in `briefToBlocks` or `briefToSanityBlocks`. | Falls through to default; loses block-specific fields. |
| **Schema vs prompt** | Prompt specifies `alignment`, `mediaSize` in blockOptions; schema omits them. | Structured output may drop these fields. |
| **contentWidth values** | BLOCK_LIBRARY: XS \| S \| M \| L \| XL \| XXL \| edgeToEdge. Layout rules: XS \| S \| M \| Default \| Wide \| edgeToEdge \| full. | Mismatch — L/XL/XXL vs Default/Wide. |
| **mediaStyle** | Architect rules mention `overflow` \| `contained`; BLOCK_LIBRARY uses `mediaSize: edgeToEdge \| default`. | Different terminology. |
| **Spacing** | Architect rules define spacing (small \| medium \| large); PageBrief schema has no spacing fields. | Spacing rules not represented in output. |
| **rotatingMedia, fullBleedVerticalCarousel** | In cursorrules.mdc component list; not in BLOCK_LIBRARY. | Claude cannot propose them. |

---

## 8. Token / Context Notes

- **Interview:** Short system prompt; conversation grows over time.
- **Structure:** Large. System = ~3–4k tokens (role + architect rules + output format). User = ~1–3k (intent + conversation + product graph + block library). Total can exceed 8k input.
- **Structured output:** Reduces output tokens; schema enforces shape.
- **Fallback:** If `output_config` returns 400, structure API retries without structured output (raw JSON).

---

## 9. Improvement Checklist

When improving the prompt:

1. **Align naming** — mediaTextBlock vs mediaTextStacked, contentWidth values, mediaStyle vs mediaSize.
2. **Sync schema and prompt** — Add alignment, mediaSize, descriptionTitle, descriptionBody to PAGE_BRIEF_SCHEMA if you want them in output.
3. **Block library vs implementation** — Ensure every BLOCK_LIBRARY component has a case in `briefToBlocks` and `briefToSanityBlocks`.
4. **Architect rules vs output format** — Architect rules use simplified format; structure prompt overrides. Keep them consistent.
5. **Interview → Structure handoff** — Interview should elicit what Structure needs. Consider adding explicit "READY" criteria or a checklist.
6. **Product graph** — Keep in sync with live site; consider loading from a config file.
7. **Spacing** — Decide if spacing belongs in PageBrief; if yes, add to schema and prompt.
