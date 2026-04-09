'use client'

import { useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { studioInputClass, studioTitleBlockBottom } from '../../../studio/studio-ui'
import type { StoryCoachInput } from './types'

const CHECKLIST: Record<string, { id: string; label: string }[]> = {
  whatItDoes: [
    { id: 'core', label: 'Core functionality' },
    { id: 'social', label: 'Social, family and sharing functionality' },
    { id: 'personalisation', label: 'Personalisation and intelligence' },
    { id: 'access', label: 'Access and pricing' },
    { id: 'privacy', label: 'Privacy, data, accessibility' },
  ],
  whatIsInIt: [
    { id: 'catalogue', label: 'Catalogue depth and breadth' },
    { id: 'languages', label: 'Language and regions' },
    { id: 'editorial', label: 'Editorial and curation' },
    { id: 'partners', label: 'Partner and exclusives' },
  ],
  builtFor: [
    { id: 'devices', label: 'Device range' },
    { id: 'network', label: 'Network conditions' },
    { id: 'india', label: 'Indian-specific adaptations' },
  ],
}

const OUTPUT_OPTIONS: { value: StoryCoachInput['outputType']; label: string }[] = [
  { value: 'banner', label: 'A banner (doesn\'t work yet)' },
  { value: 'product-page', label: 'A product page' },
  { value: 'campaign-page', label: 'A campaign page (doesn\'t work yet)' },
]

type ChecklistState = {
  whatItDoes: Record<string, boolean>
  whatIsInIt: Record<string, boolean>
  builtFor: Record<string, boolean>
}

const initialChecks: ChecklistState = {
  whatItDoes: { core: false, social: false, personalisation: false, access: false, privacy: false },
  whatIsInIt: { catalogue: false, languages: false, editorial: false, partners: false },
  builtFor: { devices: false, network: false, india: false },
}

type InputPanelProps = {
  onSubmit: (input: StoryCoachInput) => void
  isLoading: boolean
}

function ChecklistGroup({ field, checks }: { field: string; checks: Record<string, boolean> }) {
  const items = CHECKLIST[field]
  return (
    <div className="mt-2">
      {items.map((item, i) => (
        <div key={item.id}>
          {i > 0 && <div className="border-t border-gray-200" />}
          <div className={`flex gap-3 py-2 text-xs ${checks[item.id] ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{checks[item.id] ? '✓' : '✗'}</span>
            <span>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [outputType, setOutputType] = useState<StoryCoachInput['outputType']>('product-page')
  const [productName, setProductName] = useState('')
  const [whatItDoes, setWhatItDoes] = useState('')
  const [whatIsInIt, setWhatIsInIt] = useState('')
  const [builtFor, setBuiltFor] = useState('')
  const [checks, setChecks] = useState<ChecklistState>(initialChecks)

  const analyseField = useDebouncedCallback(
    async (field: string, text: string) => {
      if (text.trim().length < 30) return
      try {
        const res = await fetch('/api/storytelling-inspiration/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, text }),
        })
        const data = await res.json()
        if (Array.isArray(data.covered)) {
          setChecks((prev) => ({
            ...prev,
            [field]: Object.fromEntries(
              CHECKLIST[field].map((item) => [item.id, data.covered.includes(item.id)])
            ),
          }))
        }
      } catch {
        // ignore
      }
    },
    2500
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ outputType, productName, whatItDoes, whatIsInIt, builtFor })
  }

  const outputTypeWorks = outputType === 'product-page'
  const canSubmit = productName.trim().length > 0 && !isLoading && outputTypeWorks

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="flex flex-col p-6">
        <div className={studioTitleBlockBottom}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Storyteller
          </h2>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Helps you craft stories for jio.com
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Fill in as much detail as possible to create a rich story that is uniquely Jio.
          </p>
        </div>

        <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="outputType" className="block text-sm font-medium text-gray-900 mb-1.5">
            What do you want to make?
          </label>
          <select
            id="outputType"
            value={outputType}
            onChange={(e) => setOutputType(e.target.value as StoryCoachInput['outputType'])}
            className={`${studioInputClass} cursor-pointer`}
          >
            {OUTPUT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-900 mb-1.5">
            Product name <span className="text-gray-300">*</span>
          </label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. JioSaavn"
            required
            className={studioInputClass}
          />
        </div>

        <div>
          <label htmlFor="whatItDoes" className="block text-sm font-medium text-gray-900 mb-1.5">
            Describe what the product does
          </label>
          <textarea
            id="whatItDoes"
            value={whatItDoes}
            onChange={(e) => {
              setWhatItDoes(e.target.value)
              analyseField('whatItDoes', e.target.value)
            }}
            rows={6}
            className={`${studioInputClass} resize-y min-h-20`}
          />
          <ChecklistGroup field="whatItDoes" checks={checks.whatItDoes} />
        </div>

        <div>
          <label htmlFor="whatIsInIt" className="block text-sm font-medium text-gray-900 mb-1.5">
            Describe what is in the product or can be accessed through the product
          </label>
          <textarea
            id="whatIsInIt"
            value={whatIsInIt}
            onChange={(e) => {
              setWhatIsInIt(e.target.value)
              analyseField('whatIsInIt', e.target.value)
            }}
            rows={4}
            className={`${studioInputClass} resize-y min-h-20`}
          />
          <ChecklistGroup field="whatIsInIt" checks={checks.whatIsInIt} />
        </div>

        <div>
          <label htmlFor="builtFor" className="block text-sm font-medium text-gray-900 mb-1.5">
            What is it built for?
          </label>
          <textarea
            id="builtFor"
            value={builtFor}
            onChange={(e) => {
              setBuiltFor(e.target.value)
              analyseField('builtFor', e.target.value)
            }}
            rows={4}
            className={`${studioInputClass} resize-y min-h-20`}
          />
          <ChecklistGroup field="builtFor" checks={checks.builtFor} />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="self-start px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        </div>
      </div>
    </form>
  )
}
