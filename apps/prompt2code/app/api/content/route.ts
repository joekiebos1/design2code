import { NextResponse } from 'next/server'
import type { PageBrief } from '../../lib/types'

// Stub: returns brief unchanged.
// Future: enrich contentSlots with real copy via Claude + external content API.
export async function POST(req: Request) {
  const { brief } = (await req.json()) as { brief: PageBrief }
  return NextResponse.json({ brief })
}
