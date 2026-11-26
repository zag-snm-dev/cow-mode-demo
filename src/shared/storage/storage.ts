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

/** 読み出した値と、そのときの保存データの文字列(他のタブで変わったかを見分けるために持つ) */
type CacheEntry = { raw: string | null; value: unknown }

/** 読み出した値のキャッシュ。変更がない限り、同じオブジェクトを返し続ける */
const cache = new Map<StorageKey, CacheEntry>()

function readRaw(key: string): string | null {
  try {
    return getBackend().getItem(key)
  } catch {
    return null
  }
}

function readEntry<T>(def: Definition<T>): { raw: string | null; value: T } {
  const raw = readRaw(def.key)
  if (raw === null) return { raw, value: def.initial() }

  try {
    const result = def.schema.safeParse(JSON.parse(raw))
    if (result.success) return { raw, value: result.data }
  } catch {
    // JSONとして壊れている場合は、下の初期化に進む
  }

  // 検証に失敗した(壊れている / 版が違う)ので、消して初期化する
  try {
    getBackend().removeItem(def.key)
  } catch {
    // 消せなくても続行する
  }
  return { raw: null, value: def.initial() }
}

/** 保存データを読み出す(画面の表示用)。検証に失敗したときは初期化して、初期値を返す */
export function load<K extends StorageKey>(name: K): StateMap[K] {
  let entry = cache.get(name)
  if (entry === undefined) {
    entry = readEntry(definitions[name])
    cache.set(name, entry)
  }
  return entry.value as StateMap[K]
}

/**
 * 保存データを、保存先から読み直して返す。保存データを「書き換える処理」の前に使う。
 * 他のタブの変更の通知(storageイベント)が、まだ届いていなくても、古い内容を元に上書きしない。
 * 古いキャッシュだったときは、画面にも通知する。
 */
export function loadLatest<K extends StorageKey>(name: K): StateMap[K] {
  const def = definitions[name]
  const cached = cache.get(name)

  if (cached !== undefined && cached.raw === readRaw(def.key)) {
    return cached.value as StateMap[K]
  }

  const entry = readEntry(def)
  cache.set(name, entry)
  if (cached !== undefined) notify()
  return entry.value as StateMap[K]
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
  const serialized = JSON.stringify(validated)

  try {
    getBackend().setItem(def.key, serialized)
  } catch (error) {
    if (isQuotaExceededError(error)) throw new StorageQuotaError()
    throw error
  }

  // 書き込みに成功してから、キャッシュを更新して通知する
  cache.set(name, { raw: serialized, value: validated })
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

/**
 * 保存データが、他のタブで変わっていないかを確かめ、変わっていれば画面に通知する。
 * 裏に回っていたタブや、「戻る」で復元されたページは、storageイベントを受け取れていないことがあるため、
 * 再び見える状態になったときに呼ぶ。
 */
export function syncWithStorage(): void {
  let changed = false

  names.forEach((name) => {
    const cached = cache.get(name)
    if (cached === undefined) return // まだ読んでいない(次に load したときに、最新を読む)

    if (readRaw(definitions[name].key) !== cached.raw) {
      cache.delete(name)
      changed = true
    }
  })

  if (changed) notify()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', handleStorageEvent)

  // 「戻る・進む」で復元されたページ
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) syncWithStorage()
  })

  // 裏に回っていたタブが、再び見える状態になったとき
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncWithStorage()
  })
}

/** テスト専用:モジュール内の状態を最初に戻す */
export function resetStorageForTests(): void {
  cache.clear()
  listeners.clear()
  backend = null
  memoryMode = false
}