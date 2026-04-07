/**
 * Figma REST API — fetch node subtrees for import (copy extraction).
 * https://www.figma.com/developers/api#get-file-nodes-endpoint
 */

const FIGMA_API = 'https://api.figma.com/v1'

export type FigmaBoundingBox = { x: number; y: number; width: number; height: number }

/**
 * Figma REST API `ComponentProperty` on INSTANCE nodes.
 * @see https://www.figma.com/developers/api#instance-node
 */
export type FigmaRestComponentProperty = {
  type?: 'BOOLEAN' | 'INSTANCE_SWAP' | 'TEXT' | 'VARIANT' | string
  value?: string | boolean
}

/** Minimal node shape from GET /v1/files/:key/nodes */
export type FigmaFileNode = {
  id: string
  name: string
  type: string
  children?: FigmaFileNode[]
  characters?: string
  absoluteBoundingBox?: FigmaBoundingBox
  /** Present on INSTANCE — main component id (used to resolve INSTANCE_SWAP targets). */
  componentId?: string
  /** Present on INSTANCE — variant / text component properties from the Team Library */
  componentProperties?: Record<string, FigmaRestComponentProperty | unknown>
}

export type FigmaNodesResponse = {
  name?: string
  nodes?: Record<
    string,
    {
      document: FigmaFileNode
      components?: Record<string, unknown>
      componentSets?: Record<string, unknown>
    }
  >
}

export async function fetchFigmaFileNodes(
  fileKey: string,
  nodeIds: string[],
  accessToken: string,
): Promise<FigmaNodesResponse> {
  if (nodeIds.length === 0) throw new Error('fetchFigmaFileNodes: nodeIds required')
  const ids = nodeIds.map((id) => encodeURIComponent(id)).join(',')
  const url = `${FIGMA_API}/files/${encodeURIComponent(fileKey)}/nodes?ids=${ids}`
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'X-Figma-Token': accessToken },
    signal: AbortSignal.timeout(90_000),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Figma API ${res.status}: ${body.slice(0, 500)}`)
  }
  return res.json() as Promise<FigmaNodesResponse>
}

export type FigmaImagesResponse = {
  err: string | null
  images: Record<string, string | null>
}

/**
 * Render Figma nodes as PNG images.
 * @see https://www.figma.com/developers/api#get-images-endpoint
 * Returns a Map from node ID → temporary CDN URL (PNG).
 * Node IDs that failed to render are omitted from the map.
 */
export async function fetchFigmaRenderedImages(
  fileKey: string,
  nodeIds: string[],
  accessToken: string,
  scale = 2,
): Promise<Map<string, string>> {
  if (nodeIds.length === 0) return new Map()

  const ids = nodeIds.map((id) => encodeURIComponent(id)).join(',')
  const url = `${FIGMA_API}/images/${encodeURIComponent(fileKey)}?ids=${ids}&format=png&scale=${scale}`
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'X-Figma-Token': accessToken },
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Figma Images API ${res.status}: ${body.slice(0, 500)}`)
  }

  const data = (await res.json()) as FigmaImagesResponse
  const map = new Map<string, string>()
  if (data.images) {
    for (const [id, imgUrl] of Object.entries(data.images)) {
      if (imgUrl) map.set(id, imgUrl)
    }
  }
  return map
}

export function getDocumentRoot(response: FigmaNodesResponse, nodeId: string): FigmaFileNode | null {
  const withColon = nodeId.includes(':') ? nodeId : nodeId.replace(/-/g, ':')
  const withHyphen = withColon.replace(/:/g, '-')
  const keys = [...new Set([nodeId, withColon, withHyphen])]
  for (const key of keys) {
    const entry = response.nodes?.[key]
    if (entry?.document) return entry.document
  }
  return null
}
