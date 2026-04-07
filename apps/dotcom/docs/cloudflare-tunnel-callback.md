# Cloudflare tunnel for local callback URL

When testing the image stream with the n8n webhook, the webhook needs to POST callbacks back to your app. From n8n's perspective, `localhost` is unreachable. Use a Cloudflare tunnel to expose your local app.

## 1. Install cloudflared

**Option A – Homebrew (if you have it):**
```bash
brew install cloudflared
```

**Option B – Manual download (macOS):**

1. Download for your Mac:
   - **Apple Silicon (M1/M2/M3):** [cloudflared-darwin-arm64.tgz](https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz)
   - **Intel:** [cloudflared-darwin-amd64.tgz](https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz)

2. Extract and run:
   ```bash
   tar -xzf cloudflared-darwin-arm64.tgz   # or amd64 for Intel
   chmod +x cloudflared
   ./cloudflared tunnel --url http://localhost:3000
   ```

   Or move it to your PATH:
   ```bash
   sudo mv cloudflared /usr/local/bin/
   cloudflared tunnel --url http://localhost:3000
   ```

## 2. Start the tunnel

In a **separate terminal** (keep your Next.js dev server running in the first):

```bash
cloudflared tunnel --url http://localhost:3000
```

You'll see output like:
```
Your quick Tunnel has been created! Visit it at:
https://abc-xyz-123.trycloudflare.com
```

## 3. Set the callback URL

Add to your `.env` (or `.env.local`):

```
CALLBACK_BASE_URL=https://abc-xyz-123.trycloudflare.com
```

Replace with the URL from step 2.

## 4. Restart Next.js

Restart your dev server so it picks up the new env var.

## 5. Run the test

1. Go to http://localhost:3000/jiokarna/test-images
2. Click **Start test**
3. The payload sent to the webhook will include `callbackUrl: "https://abc-xyz-123.trycloudflare.com/api/images/ready"`
4. When n8n processes images, it can POST to that URL and your app will receive the callbacks

**Note:** Quick tunnel URLs change each time you run `cloudflared tunnel`. If you restart the tunnel, update `CALLBACK_BASE_URL` and restart Next.js.
