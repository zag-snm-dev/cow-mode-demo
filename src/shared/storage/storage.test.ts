import { afterEach, describe, expect, it, vi } from 'vitest'
import { sampleApiItem, sampleCard, sampleDataUrl } from '@/test/fixtures'
import { STORAGE_MESSAGES, StorageQuotaError } from './errors'
import { createInitialImages, createInitialMain } from './schema'
import { clear, isMemoryMode, load, loadLatest, save, subscribe } from './storage'
import { writeFromOtherTab } from '@/test/otherTab'

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

describe('loadLatest', () => {
  it('まだ読んでいないときは、保存先から読む', () => {
    writeFromOtherTab('main', { ...createInitialMain(), card: sampleCard }, { notify: false })

    expect(loadLatest('main').card).toEqual(sampleCard)
  })

  it('変更がなければ、キャッシュと同じオブジェクトを返し、通知しない', () => {
    const cached = load('main')
    const listener = vi.fn()
    subscribe(listener)

    expect(loadLatest('main')).toBe(cached)
    expect(listener).not.toHaveBeenCalled()
  })

  it('通知が届いていない他のタブの変更も読み直し、購読者に通知する', () => {
    load('main')
    const listener = vi.fn()
    subscribe(listener)
    writeFromOtherTab('main', { ...createInitialMain(), card: sampleCard }, { notify: false })

    expect(loadLatest('main').card).toEqual(sampleCard)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(load('main').card).toEqual(sampleCard)
  })

  it('壊れたデータは、初期化して返す', () => {
    load('main')
    writeFromOtherTab('main', '{broken', { notify: false })

    expect(loadLatest('main')).toEqual(createInitialMain())
    expect(localStorage.getItem('app:main')).toBeNull()
  })
})

describe('タブが見える状態に戻ったとき', () => {
  function becomeVisible(state: DocumentVisibilityState = 'visible') {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state)
    document.dispatchEvent(new Event('visibilitychange'))
  }

  function otherTabChangedCard() {
    load('main')
    writeFromOtherTab('main', { ...createInitialMain(), card: sampleCard }, { notify: false })
  }

  it('通知が届いていなくても、他のタブの変更を読み直して通知する', () => {
    otherTabChangedCard()
    const listener = vi.fn()
    subscribe(listener)
    expect(load('main').card).toBeNull() // 通知が届いていないので、古いまま

    becomeVisible()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(load('main').card).toEqual(sampleCard)
  })

  it('見えない状態になったときは、何もしない', () => {
    otherTabChangedCard()
    const listener = vi.fn()
    subscribe(listener)

    becomeVisible('hidden')

    expect(listener).not.toHaveBeenCalled()
    expect(load('main').card).toBeNull()
  })

  it('他のタブで何も変わっていなければ、通知しない', () => {
    load('main')
    const listener = vi.fn()
    subscribe(listener)

    becomeVisible()

    expect(listener).not.toHaveBeenCalled()
  })

  it('「戻る」で復元されたページ(persisted)でも、読み直す。復元でなければ何もしない', () => {
    otherTabChangedCard()
    const listener = vi.fn()
    subscribe(listener)

    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: false }))
    expect(listener).not.toHaveBeenCalled()

    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(load('main').card).toEqual(sampleCard)
  })
})