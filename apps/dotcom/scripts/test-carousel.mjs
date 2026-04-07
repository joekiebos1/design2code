#!/usr/bin/env node
/**
 * Test compact carousel scroll behavior.
 * Run: node scripts/test-carousel.mjs
 * Requires: dev server running (npm run dev:app)
 * Requires: npx playwright install
 */

import { firefox } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function main() {
  const browser = await firefox.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // Desktop viewport (compact shows 3 cards)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE_URL}/lab/carousel`, { waitUntil: 'networkidle' })

    // Find all carousel blocks - each has .card-block-carousel
    const carousels = await page.locator('.card-block-carousel').all()
    console.log('Found carousel blocks:', carousels.length)

    // Test each carousel
    for (let i = 0; i < carousels.length; i++) {
      const carousel = carousels[i]
      const nextBtn = carousel.getByRole('button', { name: /next|right/i }).first()
      const track = carousel.locator('[style*="translateX"]').first()

      const getScroll = async () => {
        const style = await track.getAttribute('style')
        const match = style?.match(/translateX\(-?(\d+(?:\.\d+)?)px\)/)
        return match ? parseFloat(match[1]) : 0
      }

      const scroll0 = await getScroll()
      const canNext = await nextBtn.isEnabled()
      console.log(`\nCarousel ${i + 1}: initial scroll=${scroll0}, next enabled=${canNext}`)
      if (!canNext) continue

      // Click next up to 6 times. Compact with 5 cards + 3 visible = maxPage 2, so 2 clicks to reach end.
      const scrolls = [scroll0]
      for (let click = 0; click < 6; click++) {
        const enabled = await nextBtn.isEnabled()
        if (!enabled) {
          console.log(`  Click ${click + 1}: next disabled (carousel exhausted)`)
          break
        }
        await nextBtn.click()
        await page.waitForTimeout(500)
        const scroll = await getScroll()
        scrolls.push(scroll)
        const delta = scroll - scrolls[scrolls.length - 2]
        console.log(`  Click ${click + 1}: scroll=${scroll} (delta=${delta.toFixed(0)})`)
        if (click === 0) await page.screenshot({ path: `carousel-${i + 1}-after-1st-click.png` })
      }

      if (scrolls.length > 1) {
        const deltas = scrolls.slice(1).map((s, j) => s - scrolls[j])
        console.log(`  Summary: ${deltas.length} scroll steps, deltas=${deltas.map((d) => d.toFixed(0)).join(', ')}`)
      }
      await page.screenshot({ path: `carousel-test-${i + 1}.png` })
    }
  } catch (err) {
    console.error('Test failed:', err.message)
  } finally {
    await browser.close()
  }
}

main()
