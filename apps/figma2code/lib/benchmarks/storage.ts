import type { BenchmarkEntry } from './types'

const INDEX_KEY = 'benchmarks-index'

type StorageAdapter = {
  get(key: string): Promise<{ value: string } | null | undefined>
  set(key: string, value: string): Promise<void>
}

function getAdapter(): StorageAdapter | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    storage?: {
      get(key: string): Promise<{ value: string } | null | undefined>
      set(key: string, value: string): Promise<void>
    }
  }
  if (
    typeof w.storage?.get === 'function' &&
    typeof w.storage?.set === 'function'
  ) {
    return w.storage
  }
  return {
    async get(key) {
      const v = localStorage.getItem(key)
      return v !== null ? { value: v } : null
    },
    async set(key, value) {
      localStorage.setItem(key, value)
    },
  }
}

export async function listBenchmarkIds(): Promise<string[]> {
  const adapter = getAdapter()
  if (!adapter) return []
  const result = await adapter.get(INDEX_KEY)
  if (!result?.value) return []
  try {
    return JSON.parse(result.value) as string[]
  } catch {
    return []
  }
}

export async function getBenchmark(id: string): Promise<BenchmarkEntry | null> {
  const adapter = getAdapter()
  if (!adapter) return null
  const result = await adapter.get(`benchmarks:${id}`)
  if (!result?.value) return null
  try {
    return JSON.parse(result.value) as BenchmarkEntry
  } catch {
    return null
  }
}

export async function saveBenchmark(entry: BenchmarkEntry): Promise<void> {
  const adapter = getAdapter()
  if (!adapter) throw new Error('Storage is only available in the browser')
  await adapter.set(`benchmarks:${entry.id}`, JSON.stringify(entry))
  const ids = await listBenchmarkIds()
  if (!ids.includes(entry.id)) {
    await adapter.set(INDEX_KEY, JSON.stringify([...ids, entry.id]))
  }
}

export async function listBenchmarks(): Promise<BenchmarkEntry[]> {
  const ids = await listBenchmarkIds()
  const entries = await Promise.all(ids.map((id) => getBenchmark(id)))
  return entries.filter((e): e is BenchmarkEntry => e !== null)
}
