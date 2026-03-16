export type OutputType = 'banner' | 'product-page' | 'campaign-page'

export type StoryCoachInput = {
  outputType: OutputType
  productName: string
  whatItDoes: string
  whatIsInIt: string
  builtFor: string
}

export type RTBs = {
  emotional: string
  rational: string
  social: string
  proud: string
}

export type Block = {
  num: number
  type: string
  section: 'setup' | 'engage' | 'resolve'
  job: string
  headline: string
}

export type StoryCoachResult = {
  primaryEmotion: string
  centralTruth: string
  rtbs: RTBs
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
