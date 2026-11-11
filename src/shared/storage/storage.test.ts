import { afterEach, describe, expect, it, vi } from 'vitest'
import { sampleApiItem, sampleCard, sampleDataUrl } from '@/test/fixtures'
import { STORAGE_MESSAGES, StorageQuotaError } from './errors'
import { createInitialImages, createInitialMain } from './schema'
import { clear, isMemoryMode, load, save, subscribe } from './storage'

afterEach(() => {
  vi.restoreAllMocks()
})

function fireStorageEvent(key: string | null) {
  window.dispatchEvent(new StorageEvent('storage', { key, storageArea: window.localStorage }))
}

describe('load', () => {
  it('何も保存されていなければ初期値を返す', () => {
    expect(load('main')).toEqual(createInitialMain())
    expect(load('images')).toEqual(createInitialImages())
  })

  it('同じデータには、同じオブジェクトを返し続ける', () => {
    expect(load('main')).toBe(load('main'))
  })

  it('保存済みの正しいデータを読み出せる', () => {
    const state = { ...createInitialMain(), card: sampleCard }
    localStorage.setItem('app:main', JSON.stringify(state))

    expect(load('main')).toEqual(state)
  })

  it('JSONが壊れていたら、初期化する', () => {
    localStorage.setItem('app:main', '{broken')

    expect(load('main')).toEqual(createInitialMain())
    expect(localStorage.getItem('app:main')).toBeNull()
  })

  it('検証に失敗したら、初期化する', () => {
    const state = { ...createInitialMain(), cart: [{ ...sampleApiItem, quantity: 100 }] }
    localStorage.setItem('app:main', JSON.stringify(state))

    expect(load('main')).toEqual(createInitialMain())
    expect(localStorage.getItem('app:main')).toBeNull()
  })

  it('versionが違ったら、初期化する', () => {
    localStorage.setItem('app:main', JSON.stringify({ ...createInitialMain(), version: 2 }))

    expect(load('main')).toEqual(createInitialMain())
    expect(localStorage.getItem('app:main')).toBeNull()
  })
})

describe('save', () => {
  it('保存した内容を、loadで読み出せる', () => {
    const state = { ...createInitialMain(), card: sampleCard }

    save('main', state)

    expect(load('main')).toEqual(state)
    expect(JSON.parse(localStorage.getItem('app:main') ?? '')).toEqual(state)
  })

  it('画像も保存できる', () => {
    const state = { ...createInitialImages(), images: { 'img-1': sampleDataUrl } }

    save('images', state)

    expect(load('images')).toEqual(state)
  })

  it('不正な値は、何も書き込まずに例外を投げる', () => {
    const bad = { ...createInitialMain(), cart: [{ ...sampleApiItem, quantity: 100 }] }

    expect(() => save('main', bad)).toThrow()
    expect(localStorage.getItem('app:main')).toBeNull()
  })

  it('容量超過では、StorageQuotaErrorを投げて、保存前の状態を保つ', () => {
    // 先に1回保存して、保存先をlocalStorageに決めてから、書き込みを失敗させる
    save('main', { ...createInitialMain(), card: sampleCard })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    const next = { ...load('main'), cart: [sampleApiItem] }

    expect(() => save('main', next)).toThrow(StorageQuotaError)
    expect(() => save('main', next)).toThrow(STORAGE_MESSAGES.quotaExceeded)
    expect(load('main').cart).toEqual([])
  })
})

describe('localStorageが使えないとき', () => {
  it('メモリ上で動き、localStorageには書かない', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })

    expect(isMemoryMode()).toBe(true)

    save('main', { ...createInitialMain(), card: sampleCard })

    expect(load('main').card).toEqual(sampleCard)
    expect(localStorage.getItem('app:main')).toBeNull()
  })

  it('通常はメモリモードではない', () => {
    expect(isMemoryMode()).toBe(false)
  })
})

describe('clear', () => {
  it('指定したデータを初期状態に戻す', () => {
    save('main', { ...createInitialMain(), card: sampleCard })

    clear('main')

    expect(load('main')).toEqual(createInitialMain())
    expect(localStorage.getItem('app:main')).toBeNull()
  })

  it('名前を省略すると、すべて消す', () => {
    save('main', { ...createInitialMain(), card: sampleCard })
    save('images', { ...createInitialImages(), images: { 'img-1': sampleDataUrl } })

    clear()

    expect(load('main')).toEqual(createInitialMain())
    expect(load('images')).toEqual(createInitialImages())
  })
})

describe('subscribe', () => {
  it('saveすると通知され、解除すると通知されない', () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    save('main', { ...createInitialMain(), card: sampleCard })
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    save('main', createInitialMain())
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('他のタブの変更(storageイベント)で通知され、新しい値を読み直す', () => {
    load('main') // 初期状態をキャッシュさせる
    const listener = vi.fn()
    subscribe(listener)

    localStorage.setItem('app:main', JSON.stringify({ ...createInitialMain(), card: sampleCard }))
    fireStorageEvent('app:main')

    expect(listener).toHaveBeenCalledTimes(1)
    expect(load('main').card).toEqual(sampleCard)
  })

  it('関係ないキーの変更では通知されない', () => {
    const listener = vi.fn()
    subscribe(listener)

    fireStorageEvent('other-app:key')

    expect(listener).not.toHaveBeenCalled()
  })

  it('keyがnull(全消去)のときも通知される', () => {
    load('main')
    const listener = vi.fn()
    subscribe(listener)

    fireStorageEvent(null)

    expect(listener).toHaveBeenCalledTimes(1)
  })
})
