# Art Director API Specification

Contract for building an image-generation service that receives page briefs from JioKarna and returns resolved images via callback.

---

## 1. Request (JioKarna → Your Service)

JioKarna POSTs to your webhook URL with the following JSON body.

### Request

```
POST {YOUR_WEBHOOK_URL}
Content-Type: application/json
```

### Body

```json
{
  "jobId": "string — unique job identifier; include in every callback",
  "callbackUrl": "string — URL to POST when each image is ready",
  "product": "string — page/product name (e.g. JioSaavn)",
  "audience": "string — target audience from the brief",
  "blocks": [
    {
      "slot": "string — unique slot ID; must match exactly in callback",
      "section": "string — narrative role: setup | engage | resolve",
      "blockType": "string — hero | mediaTextStacked | cardGrid | carousel",
      "headline": "string — section or card headline",
      "imageBrief": "string — description of the ideal visual (use for AI prompts)",
      "intent": "string — lifestyle | product | abstract",
      "mediaStyle": "string | undefined — contained | overflow (mediaTextStacked only)"
    }
  ]
}
```

### Slot naming convention

Slots follow this pattern so your service can map results back:

| Block type      | Slot pattern                    | Example                    |
|-----------------|---------------------------------|----------------------------|
| hero            | `hero-{i}-image`                | `hero-0-image`             |
| mediaTextStacked  | `mediaTextStacked-{i}-media`      | `mediaTextStacked-1-media`   |
| cardGrid        | `cardGrid-{i}-item-{j}-image`   | `cardGrid-2-item-0-image`   |
| carousel        | `carousel-{i}-item-{j}-image`   | `carousel-3-item-1-image`  |

`i` = section index (0-based), `j` = item index within that section.

### Example request

```json
{
  "jobId": "jk-abc123-xyz",
  "callbackUrl": "https://app.example.com/api/images/ready",
  "product": "JioSaavn",
  "audience": "Music lovers aged 18–35",
  "blocks": [
    {
      "slot": "hero-0-image",
      "section": "setup",
      "blockType": "hero",
      "headline": "Stream millions of songs",
      "imageBrief": "Hero visual for JioSaavn — premium music streaming, diverse genres, mobile-first experience",
      "intent": "lifestyle"
    },
    {
      "slot": "mediaTextStacked-1-media",
      "section": "engage",
      "blockType": "mediaTextStacked",
      "headline": "Curated playlists for every mood",
      "imageBrief": "Person listening on headphones, relaxed setting",
      "intent": "lifestyle",
      "mediaStyle": "contained"
    },
    {
      "slot": "cardGrid-2-item-0-image",
      "section": "engage",
      "blockType": "cardGrid",
      "headline": "Hindi hits",
      "imageBrief": "Bollywood music, vibrant, cultural",
      "intent": "lifestyle"
    }
  ]
}
```

---

## 2. Callback (Your Service → JioKarna)

When an image is ready (from your database, AI generation, or stock), POST it to the `callbackUrl` provided in the request.

### Request

```
POST {callbackUrl}
Content-Type: application/json
```

### Body

```json
{
  "jobId": "string — must match the jobId from the request",
  "slot": "string — must match the slot from the blocks array",
  "url": "string — public URL of the image (https://...)",
  "alt": "string — alt text for accessibility (optional but recommended)",
  "source": "database | generated — where the image came from",
  "ready": true
}
```

### Example callback

```json
{
  "jobId": "jk-abc123-xyz",
  "slot": "hero-0-image",
  "url": "https://cdn.example.com/images/hero-jiosaavn-abc123.jpg",
  "alt": "Person streaming music on smartphone",
  "source": "generated",
  "ready": true
}
```

### Callback rules

- Call once per slot when the image is ready.
- Order does not matter; callbacks can arrive in any sequence.
- `jobId` and `slot` must match the original request exactly.
- `url` must be a publicly accessible image URL.
- `source`: use `"database"` for existing/library images, `"generated"` for AI or newly created images.

---

## 3. Field reference

| Field        | Type   | Required | Description |
|--------------|--------|----------|-------------|
| **Request**  |        |          |             |
| jobId        | string | yes      | Unique job ID; echo in every callback |
| callbackUrl  | string | yes      | Where to POST each ready image |
| product      | string | yes      | Page/product name |
| audience     | string | yes      | Target audience |
| blocks       | array  | yes      | List of image slots to fill |
| blocks[].slot | string | yes     | Unique slot ID |
| blocks[].section | string | yes   | setup \| engage \| resolve |
| blocks[].blockType | string | yes | hero \| mediaTextStacked \| cardGrid \| carousel |
| blocks[].headline | string | yes | Section or card headline |
| blocks[].imageBrief | string | yes | Visual description for prompts |
| blocks[].intent | string | yes | lifestyle \| product \| abstract |
| blocks[].mediaStyle | string | no | contained \| overflow |
| **Callback** |        |          |             |
| jobId        | string | yes      | Same as request |
| slot         | string | yes      | Same as blocks[].slot |
| url          | string | yes      | Public image URL |
| alt          | string | no       | Alt text |
| source       | string | no       | database \| generated (default: database) |
| ready        | boolean | no      | Default: true |

---

## 4. Implementation notes

- Your service should respond quickly to the initial POST (e.g. 200 OK); processing can be async.
- Callbacks can be batched or sent one-by-one as images become available.
- If a slot fails, you may omit it or send an error callback (format TBD).
- JioKarna streams callbacks to the client via SSE; the client expects one event per slot.
