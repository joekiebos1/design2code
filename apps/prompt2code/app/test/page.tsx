'use client'

/**
 * DEV-ONLY TEST PAGE — bypasses input/generate steps.
 * Remove this file (and app/test/) when editor testing is done.
 */

import { useState, useEffect, useMemo } from 'react'
import { PreviewPanel } from '../components/PreviewPanel'
import { Header } from '../components/Header'
import { briefToBlocks } from '../lib/briefToBlocks'
import type { PageBrief } from '../lib/types'

type DamMedia = { urls: string[]; videoUrls: string[] }

const TEST_BRIEF: PageBrief = {
  status: 'draft',
  createdAt: new Date().toISOString(),
  version: 1,
  meta: {
    pageName: 'Test Page',
    pageType: 'product-page',
    slug: 'test-page',
    intent: 'Test the editor',
    audience: 'Developers',
    primaryAction: 'Get started',
    keyMessage: 'This is a test page for editor development',
  },
  ia: {
    proposedPath: '/test',
    parentSection: 'Dev',
    relatedPages: [],
    existingConflicts: [],
  },
  launchChecklist: [],
  sections: [
    {
      order: 0,
      sectionName: 'hero-1',
      component: 'hero',
      rationale: 'Hero block',
      narrativeRole: 'introduce',
      flags: [],
      blockOptions: { emphasis: 'bold' },
      contentSlots: {
        headline: 'Editor Test Page',
        subhead: 'Use this page to test the editor without burning tokens',
        body: 'Select blocks, move them, swap images, and change emphasis.',
        eyebrow: 'Dev only',
        cta: { label: 'Get started', url: '#' },
      },
    },
    {
      order: 1,
      sectionName: 'media-text-1',
      component: 'mediaTextStacked',
      rationale: 'Media + text block',
      narrativeRole: 'explain',
      flags: [],
      blockOptions: { emphasis: 'subtle', template: 'stacked' },
      contentSlots: {
        headline: 'Block editing',
        subhead: 'Click any block to select it',
        body: 'Use the left arrows to reorder blocks. Use the right panel to change emphasis, variant, or swap images.',
        eyebrow: 'How it works',
        cta: { label: 'Learn more', url: '#' },
      },
    },
    {
      order: 2,
      sectionName: 'carousel-1',
      component: 'carousel',
      rationale: 'Carousel block',
      narrativeRole: 'explore',
      flags: [],
      blockOptions: { cardSize: 'medium' },
      contentSlots: {
        headline: 'Carousel block',
        subhead: 'Swipe through cards',
        items: [
          { title: 'Card one', description: 'First item description here' },
          { title: 'Card two', description: 'Second item description here' },
          { title: 'Card three', description: 'Third item description here' },
          { title: 'Card four', description: 'Fourth item description here' },
        ],
      },
    },
    {
      order: 3,
      sectionName: 'card-grid-1',
      component: 'cardGrid',
      rationale: 'Card grid',
      narrativeRole: 'compare',
      flags: [],
      blockOptions: { columns: 3 },
      contentSlots: {
        headline: 'Card grid block',
        items: [
          { title: 'Feature one', description: 'Description for feature one' },
          { title: 'Feature two', description: 'Description for feature two' },
          { title: 'Feature three', description: 'Description for feature three' },
        ],
      },
    },
    {
      order: 4,
      sectionName: 'faq-1',
      component: 'mediaTextAsymmetric',
      rationale: 'FAQ block',
      narrativeRole: 'reassure',
      flags: [],
      blockOptions: {},
      contentSlots: {
        headline: 'Frequently asked questions',
        items: [
          { subtitle: 'What is this?', body: 'A dev test page for the editor.' },
          { subtitle: 'Will this be removed?', body: 'Yes, once editor testing is complete.' },
          { subtitle: 'Can I add items?', body: 'Yes — use the Add button in the editor panel.' },
        ],
      },
    },
    {
      order: 5,
      sectionName: 'resolve-1',
      component: 'proofPoints',
      rationale: 'Proof points',
      narrativeRole: 'resolve',
      flags: [],
      blockOptions: {},
      contentSlots: {
        headline: 'Why it works',
        items: [
          { title: '60%', description: 'Canvas zoom scale' },
          { title: '120px', description: 'Panel offset from top' },
          { title: '5', description: 'Block types to test' },
        ],
      },
    },
  ],
}

export default function TestPage() {
  const [brief, setBrief] = useState<PageBrief>(TEST_BRIEF)
  const [damMedia, setDamMedia] = useState<DamMedia>({ urls: [], videoUrls: [] })

  useEffect(() => {
    fetch('/api/dam-images')
      .then(r => r.json())
      .then((data: DamMedia) => { if (data.urls?.length) setDamMedia(data) })
      .catch(() => {})
  }, [])

  const blocks = useMemo(
    () => briefToBlocks(brief, damMedia.urls, damMedia.videoUrls),
    [brief, damMedia],
  )

  return (
    <div className="font-sans h-screen flex flex-col overflow-hidden bg-white">
      <Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Minimal left panel */}
        <div className="shrink-0 w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Editor test page</p>
            <p className="text-sm text-gray-400 mt-0.5">Dev only — remove when done</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-300 text-center px-6">
              Select any block on the canvas to open the editor panel
            </p>
          </div>
          <div className="px-5 py-4 border-t border-gray-200">
            <a href="/" className="h-9 w-full flex items-center justify-center px-4 rounded-md bg-secondary text-secondary-text text-sm font-medium hover:bg-secondary-hover transition-colors cursor-pointer">
              ← Back to main
            </a>
          </div>
        </div>

        <PreviewPanel
          blocks={blocks}
          brief={brief}
          imageUrls={damMedia.urls}
          videoUrls={damMedia.videoUrls}
          step="reviewing"
          sectionCount={brief.sections.length}
          onBriefUpdate={setBrief}
        />
      </div>
    </div>
  )
}
