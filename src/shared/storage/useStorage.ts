import { useSyncExternalStore } from 'react'
import { load, subscribe, type StateMap, type StorageKey } from './storage'

/** 保存データを読み、変更(自分のタブ・他のタブ)があれば、自動で再描画する */
export function useStorage<K extends StorageKey>(name: K): StateMap[K] {
  return useSyncExternalStore(subscribe, () => load(name))
}
