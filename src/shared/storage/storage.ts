import type { z } from 'zod'
import { createMemoryBackend, isLocalStorageAvailable, type StorageBackend } from './availability'
import { isQuotaExceededError, StorageQuotaError } from './errors'
import {
  createInitialImages,
  createInitialMain,
  imagesStateSchema,
  mainStateSchema,
  type ImagesState,
  type MainState,
} from './schema'

export type StateMap = { main: MainState; images: ImagesState }
export type StorageKey = keyof StateMap

type Definition<T> = {
  key: string
  schema: z.ZodType<T>
  initial: () => T
}

const definitions: { [K in StorageKey]: Definition<StateMap[K]> } = {
  main: { key: 'app:main', schema: mainStateSchema, initial: createInitialMain },
  images: { key: 'app:images', schema: imagesStateSchema, initial: createInitialImages },
}

const names = Object.keys(definitions) as StorageKey[]

// ---- 保存先(localStorage か、メモリ) ----

let backend: StorageBackend | null = null
let memoryMode = false

function getBackend(): StorageBackend {
  if (backend === null) {
    if (isLocalStorageAvailable()) {
      backend = window.localStorage
    } else {
      backend = createMemoryBackend()
      memoryMode = true
    }
  }
  return backend
}

/** localStorageが使えず、メモリ上で動いているか(「閉じるとデータが消えます」の表示に使う) */
export function isMemoryMode(): boolean {
  getBackend()
  return memoryMode
}

// ---- 読み出し ----

/** 読み出した値のキャッシュ。同じ値には、同じオブジェクトを返し続ける */
const cache = new Map<StorageKey, unknown>()

function readState<T>(def: Definition<T>): T {
  const store = getBackend()

  let raw: string | null
  try {
    raw = store.getItem(def.key)
  } catch {
    return def.initial()
  }
  if (raw === null) return def.initial()

  try {
    const result = def.schema.safeParse(JSON.parse(raw))
    if (result.success) return result.data
  } catch {
    // JSONとして壊れている場合は、下の初期化に進む
  }

  // 検証に失敗した(壊れている / 版が違う)ので、初期化する
  try {
    store.removeItem(def.key)
  } catch {
    // 消せなくても続行する
  }
  return def.initial()
}

/** 保存データを読み出す。検証に失敗したときは初期化して、初期値を返す */
export function load<K extends StorageKey>(name: K): StateMap[K] {
  if (!cache.has(name)) {
    cache.set(name, readState(definitions[name]))
  }
  return cache.get(name) as StateMap[K]
}

// ---- 購読(画面への通知) ----

const listeners = new Set<() => void>()

/** データが変わったときに呼ばれる関数を登録する。解除する関数を返す */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notify(): void {
  listeners.forEach((listener) => listener())
}

// ---- 書き込み・削除 ----

/** 保存データを書き込む。容量がいっぱいのときは StorageQuotaError を投げる */
export function save<K extends StorageKey>(name: K, value: StateMap[K]): void {
  const def: Definition<StateMap[K]> = definitions[name]

  // 書き込む前にも検証する(アプリのバグで、壊れたデータを保存しないため)
  const validated = def.schema.parse(value)

  try {
    getBackend().setItem(def.key, JSON.stringify(validated))
  } catch (error) {
    if (isQuotaExceededError(error)) throw new StorageQuotaError()
    throw error
  }

  // 書き込みに成功してから、キャッシュを更新して通知する
  cache.set(name, validated)
  notify()
}

/** 保存データを消して、初期状態に戻す。名前を省略すると、すべて消す */
export function clear(name?: StorageKey): void {
  const store = getBackend()
  const targets = name === undefined ? names : [name]

  targets.forEach((target) => {
    try {
      store.removeItem(definitions[target].key)
    } catch {
      // 消せなくても続行する
    }
    cache.delete(target)
  })
  notify()
}

// ---- 他のタブの変更 ----

function handleStorageEvent(event: StorageEvent): void {
  if (event.storageArea !== window.localStorage) return

  // key が null のときは「localStorage全体が消された」という意味
  const changed = names.filter((name) => event.key === null || event.key === definitions[name].key)
  if (changed.length === 0) return

  // 古いキャッシュを捨てて、次に load したときに読み直させる
  changed.forEach((name) => cache.delete(name))
  notify()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', handleStorageEvent)
}

/** テスト専用:モジュール内の状態を最初に戻す */
export function resetStorageForTests(): void {
  cache.clear()
  listeners.clear()
  backend = null
  memoryMode = false
}
