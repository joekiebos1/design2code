export type OutputType = 'banner' | 'product-page' | 'campaign-page'

export type ProductType = 'hardware' | 'software'

export type StoryCoachInput = {
  outputType: OutputType
  productType: ProductType
  productName: string
  whatItDoes: string
  whatIsInIt: string
  builtFor: string
}

export type BuyerModalities = {
  emotional: string
  rational: string
  social: string
  security: string
}

export type Block = {
  num: number
  type: string
  section: 'setup' | 'engage' | 'resolve'
  role: 'chapter' | 'supporting'
  job: string
  headline: string
  proof: string
}

export type StoryCoachResult = {
  primaryEmotion: string
  modalities: BuyerModalities
  hook: {
    visitorState: string
    openingTension: string
    mustFeel: string
  }
  middle: {
    centralDesire: string
    emotional: string
    rational: string
    social: string
    security: string
  }
  close: {
    barrier: string
    ctaFraming: string
  }
  blocks: Block[]
}

export type StoryCoachState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  result: StoryCoachResult | null
  error: string | null
}
