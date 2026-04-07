export type ImageSlotState = {
  url: string
  alt: string
  source: 'library' | 'generated' | 'stock'
  ready: boolean
}
