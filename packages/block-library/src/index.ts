// Production blocks
export * from './production'

// Lab blocks
export * from './lab'

// Shared types and mappers
export { BLOCK_CATALOGUE } from './shared/block-catalogue'
export type { BlockCatalogueEntry, BlockCategory } from './shared/block-catalogue'
export * from './shared/media-text-asymmetric-shared.types'
export * from './shared/map-media-text-blocks'
export type { ImageSlotState } from './shared/image-slot-state'

// Lab utilities
export type { LabBlockCallToAction } from './lab-utils/lab-block-framing-typography'

// Shared UI components
export { Grid, useCell } from './components/blocks/Grid'
export { StreamImage } from './components/blocks/StreamImage'
export { VideoWithControls } from './components/blocks/VideoWithControls'
