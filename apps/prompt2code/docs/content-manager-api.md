# Content Manager — Image API Specification

Two-way protocol between Design2Code (D2C) and the Content Manager for image fulfilment.

---

## Flow

```
D2C                                Content Manager
 │                                       │
 │  POST ImageRequestManifest ──────────►│
 │                                       │  (search, generate, curate)
 │                                       │
 │◄──── POST ImageSlotResponse (×N) ─────│
 │      (one callback per slot)          │
 │                                       │
 │  SSE stream closes when all           │
 │  slots are fulfilled                  │
```

1. D2C sends **one request** per page generation containing all image slots
2. Content Manager processes each slot independently
3. Content Manager calls back with **one POST per fulfilled slot**
4. Callbacks can arrive in any order; D2C tracks completion internally

---

## Request: ImageRequestManifest

**Sent by D2C to:** `IMAGE_SERVICE_URL` (env variable on D2C side)
**Method:** `POST`
**Content-Type:** `application/json`

```json
{
  "jobId": "abc-123",
  "callbackUrl": "https://d2c.example.com/api/images/ready",

  "page": {
    "product": "Jio AirFiber",
    "intent": "Drive sign-ups for home broadband",
    "audience": "Urban Indian households looking for reliable internet",
    "keyMessage": "Ultra-fast internet for every room",
    "pageType": "product-launch"
  },

  "slots": [
    {
      "slotId": "hero-0-image",
      "blockType": "hero",
      "blockIndex": 0,
      "narrativeRole": "setup",
      "aspectRatio": "16:9",
      "imageRole": "hero-background",
      "visualDirection": "lifestyle",
      "required": true,
      "adjacentText": {
        "headline": "Internet that keeps up with your family",
        "description": "Ultra-fast speeds in every corner of your home"
      },
      "imageBrief": "Happy Indian family streaming and working on multiple devices at home"
    },
    {
      "slotId": "carousel-2-item-0-image",
      "blockType": "carousel",
      "blockIndex": 2,
      "narrativeRole": "engage",
      "aspectRatio": "4:5",
      "imageRole": "card-thumbnail",
      "visualDirection": "product",
      "required": false,
      "adjacentText": {
        "headline": "Mesh coverage",
        "description": "Blanket your home in fast, reliable Wi-Fi"
      },
      "imageBrief": "Jio AirFiber mesh device in a modern Indian living room",
      "cardType": "mediaTextBelow",
      "cardIndex": 0
    }
  ]
}
```

### Field reference

#### Top level

| Field | Type | Description |
|---|---|---|
| `jobId` | string | Unique identifier for this request. Use in all callbacks. |
| `callbackUrl` | string | URL to POST each fulfilled slot to. |
| `page` | object | Page-level context (see below). |
| `slots` | array | One entry per image the page needs. |

#### `page` object

| Field | Type | Description |
|---|---|---|
| `product` | string | Product or page name. |
| `intent` | string | What the page should accomplish. |
| `audience` | string | Target audience description. |
| `keyMessage` | string | Core message the page communicates. |
| `pageType` | string | `product-launch`, `campaign`, `editorial`, `category`, `other`. |

#### `slots[]` entries

| Field | Type | Description |
|---|---|---|
| `slotId` | string | Unique slot identifier. Must be returned unchanged in the callback. |
| `blockType` | string | `hero`, `mediaTextStacked`, `mediaText5050`, `mediaTextAsymmetric`, `carousel`, `cardGrid`. |
| `blockIndex` | number | 0-based position of this block on the page. |
| `narrativeRole` | string | `setup`, `engage`, or `resolve` — where this block sits in the page narrative. |
| `aspectRatio` | string \| null | Required image ratio: `16:9`, `5:4`, `4:5`, `8:5`, `2:1`, `1:1`, or `null` (flexible). |
| `imageRole` | string | `hero-background`, `block-media`, `card-thumbnail`, `accordion-panel`. |
| `visualDirection` | string | `lifestyle`, `product`, `abstract` — the kind of imagery needed. |
| `required` | boolean | `true` = the block needs this image to render properly. `false` = optional (e.g. colour cards). |
| `adjacentText.headline` | string \| null | The headline displayed near this image. |
| `adjacentText.description` | string \| null | The description or body text near this image. |
| `imageBrief` | string \| null | Human-readable description of the ideal image. |
| `cardType` | string \| undefined | Only for card slots: `mediaTextBelow`, `mediaTextOverlay`, `colourMediaText`, etc. |
| `cardIndex` | number \| undefined | Only for card slots: position within the parent block. |

---

## Response: ImageSlotResponse (callback)

**Sent by Content Manager to:** the `callbackUrl` from the request
**Method:** `POST`
**Content-Type:** `application/json`

One callback per slot. Send as each image becomes available — no need to batch.

```json
{
  "jobId": "abc-123",
  "slotId": "hero-0-image",
  "url": "https://cdn.example.com/images/airfiber-hero.jpg",
  "alt": "Family streaming on multiple devices in a bright living room",
  "source": "library",
  "width": 1920,
  "height": 1080,
  "metadata": {
    "assetId": "image-abc-123",
    "tags": ["family", "home", "broadband"]
  }
}
```

### Field reference

| Field | Type | Required | Description |
|---|---|---|---|
| `jobId` | string | yes | Must match the request `jobId`. |
| `slotId` | string | yes | Must match a `slotId` from the request. |
| `url` | string | yes | Public URL of the image. D2C will display this directly. |
| `alt` | string | yes | Alt text for the image. |
| `source` | string | yes | `library` (existing asset), `generated` (AI-created), `stock` (external stock). |
| `width` | number | no | Image width in pixels. |
| `height` | number | no | Image height in pixels. |
| `metadata` | object | no | Any additional data the Content Manager wants to pass back. |

---

## Slot naming convention

Slot IDs follow a deterministic pattern:

```
{blockType}-{blockIndex}-image                           hero, mediaTextAsymmetric
{blockType}-{blockIndex}-media                           mediaTextStacked, mediaText5050
{blockType}-{blockIndex}-accordion-{itemIndex}-image     mediaText5050 accordion panels
{blockType}-{blockIndex}-item-{itemIndex}-image          cardGrid, carousel
```

Examples:
- `hero-0-image`
- `mediaTextStacked-1-media`
- `mediaText5050-2-media`
- `mediaText5050-2-accordion-0-image`
- `cardGrid-3-item-0-image`
- `carousel-4-item-2-image`

---

## Aspect ratio reference (from D2C contracts)

| Block / Context | Aspect ratio | Notes |
|---|---|---|
| Hero | `16:9` | Always |
| MediaTextStacked | `16:9` | When media is present |
| MediaText5050 | `5:4` (default), `1:1`, `4:5` | Set by content author |
| MediaTextAsymmetric | `5:4` (default) | Image variant |
| Carousel compact | `4:5` or `8:5` | Per card, editable |
| Carousel medium | `4:5` | Locked |
| Carousel large | `2:1` | Locked |
| CardGrid 2 cols | `4:5` | Locked |
| CardGrid 3/4 cols | `null` | Text-driven, no fixed ratio |

---

## Error handling

- If the Content Manager cannot fulfil a slot, it should still call back with a response. Use `url: ""` and `source: "library"` to signal "no image found". D2C will fall back to a placeholder.
- If no callback arrives for a slot within a reasonable timeout (implementation-defined), D2C will close the SSE stream and use placeholders for unfulfilled slots.
- If `jobId` is unknown or the SSE stream has already closed, the callback endpoint returns `404`.

---

## Environment variables (D2C side)

| Variable | Description |
|---|---|
| `IMAGE_SERVICE_URL` | URL of the Content Manager endpoint. When unset, D2C uses mock mode (Sanity library images). |
| `CALLBACK_BASE_URL` | Public URL of the D2C app (for callbacks). Falls back to `NEXTAUTH_URL` or `localhost:3000`. |

---

## Future improvement — Simplified request format

> **Do not implement yet.** The Content Manager team is using the format above. This section documents a proposed simplification for the next iteration of the flow.

The current request leaks page architecture concerns (block types, block indices, image roles, narrative roles) that the art director agent does not need. The proposed format strips everything back to what an art director actually needs: what the product is, what the image should show, what text it sits next to, and what crops are required.

### Proposed request shape

```json
{
  "jobId": "abc-123",
  "callbackUrl": "https://d2c.example.com/api/images/ready",
  "product": "Jio AirFiber",
  "images": [
    {
      "id": "img-1",
      "aspectRatios": ["16:9", "4:5"],
      "headline": "Internet that keeps up with your family",
      "brief": "Candid shot of a family streaming and working together at home"
    }
  ]
}
```

### What changed and why

| Current field | Proposed | Reason |
|---|---|---|
| `page.product` | `product` (top level) | Simpler — no nested `page` wrapper needed |
| `page.intent`, `page.audience`, `page.keyMessage`, `page.pageType` | removed | Art director doesn't need page strategy — the `brief` encodes this |
| `slots[].blockType`, `blockIndex`, `imageRole`, `cardType`, `cardIndex` | removed | Layout/structure concerns — art director is layout-agnostic |
| `slots[].narrativeRole` | removed | Page architecture — not relevant to image selection |
| `slots[].required` | removed | D2C-internal concern, not for the art director |
| `slots[].visualDirection` | removed | Folded into `brief` |
| `slots[].aspectRatio` (string) | `images[].aspectRatios` (string[]) | Same image must work across multiple crops (e.g. `16:9` desktop, `4:5` mobile) |
| `slots[].adjacentText.headline` | `images[].headline` | Flattened — description sub-field was never used |
| `slots[].adjacentText.description` | removed | Headline is sufficient for art direction context |
| `slots[].imageBrief` | `images[].brief` | Renamed for clarity |
| `slots[].slotId` | `images[].id` | Renamed for clarity |

### Callback response

The callback response stays the same — no changes needed on that side.
