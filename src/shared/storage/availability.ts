/** localStorageと同じ形で使える、保存先の最小限のインターフェース */
export type StorageBackend = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const PROBE_KEY = 'app:__probe__'

/** 実際に書き込んで、localStorageが使えるか確かめる */
export function isLocalStorageAvailable(): boolean {
  try {
    const storage = window.localStorage
    storage.setItem(PROBE_KEY, '1')
    storage.removeItem(PROBE_KEY)
    return true
  } catch {
    return false
  }
}

/** localStorageが使えないときの代わりに使う、メモリ上の保存先 */
export function createMemoryBackend(): StorageBackend {
  const map = new Map<string, string>()

  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
  }
}
