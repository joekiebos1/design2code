# Page Architect (MVP)

Sanity-based page builder with 3 Blocks: Hero, Feature Grid, and Text + Image. Add blocks via dropdown and use "Fill with sample" to populate placeholder content.

## Setup

### 1. Create a Sanity project

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Create a new project
3. Copy the Project ID and Dataset name

### 2. Install and configure

```bash
cd design2code
npm install
cp .env.example .env
```

Edit `.env`:

```
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-token-with-editor-permissions
```

> **Presentation mode:** Create a token at [sanity.io/manage](https://sanity.io/manage) → API → Tokens with **Editor** permissions. Required for draft preview and JioKarna.

### 3. Run locally

**Terminal 1 – Sanity Studio** (port 3333):

```bash
npm run dev
```

**Terminal 2 – Next.js front-end** (port 3000):

```bash
npm run dev:app
```

- Open [http://localhost:3333](http://localhost:3333) to use the Studio
- Open [http://localhost:3000](http://localhost:3000) to view the rendered pages

### Presentation mode ("Unable to connect")

1. **Both servers must run** – Studio (`npm run dev`) and Next.js (`npm run dev:app`)
2. **SANITY_API_TOKEN** – Set in `.env` (Editor permissions)
3. **CORS** – Add `http://localhost:3000` at [sanity.io/manage](https://sanity.io/manage) → API → CORS origins
4. **Continue anyway** – Click the button in the error overlay to view the preview without overlays

## Usage

1. Create a **Page** document (title + slug)
2. Add blocks: click "Add item" and choose Hero, Feature Grid, or Text + Image from the dropdown
3. Click **Fill with sample** on a block to populate it with placeholder content
4. View the page at [http://localhost:3000](http://localhost:3000) (or `/[slug]` for specific pages)

## Deploy

### Vercel

1. Push to GitHub and import the repo in [Vercel](https://vercel.com)
2. Vercel auto-detects Next.js. Add env vars:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
3. Deploy

### Sanity Studio

```bash
npm run deploy:studio
```

Deploys Studio to sanity.io. Configure `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` in [sanity.io/manage](https://sanity.io/manage).
