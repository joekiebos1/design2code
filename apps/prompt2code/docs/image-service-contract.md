# Image Service Contract

This document describes the payload contract between **Prompt2Code** and an external image service (previously n8n webhook). It's preserved here so the integration can be reconnected later without having to reverse-engineer it.

---

## Flow overview

```
Prompt2Code (POST)  ──────────►  IMAGE_SERVICE_URL
     │                               │
     │  ImageRequestManifest         │  processes slots, picks/generates images
     │                               │
     ◄──────────────────────────────  Callback POSTs per slot to /api/images/ready
                                      (one POST per image, as they become available)
     │
     SSE stream open on client
     (GET /api/images/stream, jobId)
     pushes ImageSlotResponse events as callbacks arrive
```

---

## Request — `ImageRequestManifest`

**Endpoint:** `POST $IMAGE_SERVICE_URL`  
**Content-Type:** `application/json`

```ts
type ImageRequestManifest = {
  jobId: string          // UUID, unique per page generation run
  callbackUrl: string    // Where to POST results: /api/images/ready
  page: {
    product: string      // e.g. "MyJio App"
    intent: string       // e.g. "acquisition"
    audience: string     // e.g. "Young urban mobile users"
    keyMessage: string   // e.g. "Everything you need, one app"
    pageType: string     // e.g. "product" | "campaign" | "other"
  }
  slots: ImageSlotRequest[]
}
```

### `ImageSlotRequest`

One entry per image needed on the page.

```ts
type ImageSlotRequest = {
  slotId: string           // Unique ID for this image slot, e.g. "hero-0-image"
  blockType: string        // Block component name, e.g. "hero" | "carousel" | "cardGrid"
  blockIndex: number       // Position of the block on the page (0-based)
  narrativeRole: string    // Section's narrative role, e.g. "hook" | "engage" | "convert"

  aspectRatio: string | null  // Expected display ratio, e.g. "16:9" | "4:5" | "5:4" | "1:1"
  imageRole: ImageRole        // Semantic role of this image in the layout
  visualDirection: string     // Mood/style hint, e.g. "lifestyle" | "product" | "abstract"
  required: boolean           // Whether missing this image breaks the block

  adjacentText: {
    headline: string | null   // Text displayed near this image
    description: string | null
  }
  imageBrief: string | null   // Free-text brief for generation or retrieval

  // Only present for card-level slots:
  cardType?: string            // e.g. "mediaTextBelow" | "mediaTextOverlay" | "colourFeatured"
  cardIndex?: number           // 0-based index within the parent block's item array
}

type ImageRole =
  | 'hero-background'    // Full-bleed hero image
  | 'block-media'        // Primary media in a media+text block
  | 'card-thumbnail'     // Image inside a card (carousel or grid item)
  | 'accordion-panel'    // Image shown when an accordion item is open
```

### Slot ID conventions

| Pattern | Example | Used by |
|---|---|---|
| `hero-{i}-image` | `hero-0-image` | Hero block |
| `mediaTextStacked-{i}-media` | `mediaTextStacked-1-media` | MediaTextStacked |
| `mediaText5050-{i}-media` | `mediaText5050-2-media` | MediaText5050 (block-level) |
| `mediaText5050-{i}-accordion-{j}-image` | `mediaText5050-2-accordion-0-image` | MediaText5050 accordion panels |
| `mediaTextAsymmetric-{i}-media` | `mediaTextAsymmetric-3-media` | MediaTextAsymmetric |
| `cardGrid-{i}-item-{j}-image` | `cardGrid-4-item-0-image` | CardGrid items |
| `carousel-{i}-item-{j}-image` | `carousel-5-item-2-image` | Carousel items |

`{i}` = block index (0-based, sorted by `section.order`), `{j}` = item index within block.

### Aspect ratios by block type

| Block | Default |
|---|---|
| `hero` | `16:9` |
| `mediaTextStacked` | `16:9` |
| `mediaText5050` | `5:4` (overridable via `blockOptions.imageAspectRatio`) |
| `mediaTextAsymmetric` | `5:4` (overridable) |
| `cardGrid` (2-col) | `4:5` |
| `cardGrid` (3–4 col) | `null` (text-driven, image optional) |
| `carousel` compact | `4:5` (or per-card `aspectRatio` field) |
| `carousel` medium/large | `4:5` / `2:1` |

---

## Callback — `ImageSlotResponse`

**Endpoint:** `POST /api/images/ready`  
**Timing:** One POST per slot, as each image becomes available (streaming pattern).

```ts
type ImageSlotResponse = {
  jobId: string       // Matches the jobId from the manifest
  slotId: string      // Matches a slotId from the manifest
  url: string         // Fully resolved image URL
  alt: string         // Alt text for accessibility
  source: 'library' | 'generated' | 'stock'
  width?: number
  height?: number
  metadata?: Record<string, unknown>
}
```

---

## SSE stream — client side

The browser opens a long-lived `EventSource` (or equivalent) connection:

```
GET /api/images/stream?jobId={jobId}
```

Each arriving `ImageSlotResponse` is pushed as an SSE `data:` event:

```
data: {"jobId":"abc","slotId":"hero-0-image","url":"https://...","alt":"...","source":"library","ready":true}

data: {"jobId":"abc","slotId":"cardGrid-1-item-0-image","url":"https://...","alt":"...","source":"generated","ready":true}
```

The stream closes when all slots have been fulfilled or a timeout is hit.

---

## Environment variables

| Variable | Purpose |
|---|---|
| `IMAGE_SERVICE_URL` | Webhook/service to POST the manifest to. If absent → mock mode using DAM. |
| `CALLBACK_BASE_URL` | Base URL for the callback. Falls back to `NEXTAUTH_URL` → `VERCEL_URL` → `localhost:3000`. |

---

## Skipped slots

Cards with colour-only card types (`colourFeatured`, `colourIconText`, `colourTextOnly`) are excluded from the manifest — they don't render images.

---

## Re-connecting the integration

To bring this back:

1. Set `IMAGE_SERVICE_URL` in the prompt2code environment.
2. Restore `apps/prompt2code/app/lib/imageManifest.ts` from git (`git show <hash>:apps/prompt2code/app/lib/imageManifest.ts`).
3. Restore the API routes from git:
   - `app/api/images/stream/route.ts`
   - `app/api/images/ready/route.ts`
   - `app/api/images/callback-url/route.ts`
   - `app/api/images/stream-store.ts`
4. Restore `app/hooks/useImageStream.ts`.
5. Wire `useImageStream` back into `app/page.tsx` and pass `images` down through `PreviewPanel` → `preview/page.tsx` → `BlockRenderer`.

All source code is recoverable via: `git show f0c3834~1:<path>`  
(the commit just before the removal was `f0c3834`)
