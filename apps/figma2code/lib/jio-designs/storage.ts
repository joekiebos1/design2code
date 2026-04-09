import type { JioDesignEntry } from './types'

const INDEX_KEY = 'jio-designs-index'

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

export async function listJioDesignIds(): Promise<string[]> {
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

export async function getJioDesign(id: string): Promise<JioDesignEntry | null> {
  const adapter = getAdapter()
  if (!adapter) return null
  const result = await adapter.get(`jio-designs:${id}`)
  if (!result?.value) return null
  try {
    return JSON.parse(result.value) as JioDesignEntry
  } catch {
    return null
  }
}

export async function saveJioDesign(entry: JioDesignEntry): Promise<void> {
  const adapter = getAdapter()
  if (!adapter) throw new Error('Storage is only available in the browser')
  await adapter.set(`jio-designs:${entry.id}`, JSON.stringify(entry))
  const ids = await listJioDesignIds()
  if (!ids.includes(entry.id)) {
    await adapter.set(INDEX_KEY, JSON.stringify([...ids, entry.id]))
  }
}

export async function listJioDesigns(): Promise<JioDesignEntry[]> {
  const ids = await listJioDesignIds()
  const entries = await Promise.all(ids.map((id) => getJioDesign(id)))
  return entries.filter((e): e is JioDesignEntry => e !== null)
}
