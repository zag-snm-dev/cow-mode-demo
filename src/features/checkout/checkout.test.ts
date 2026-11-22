import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StorageQuotaError } from '@/shared/storage/errors'
import { getImage, removeImageIfUnused } from '@/shared/storage/imageStore'
import {
  createInitialImages,
  createInitialMain,
  type MainState,
} from '@/shared/storage/schema'
import { load, resetStorageForTests, save } from '@/shared/storage/storage'
import {
  sampleApiItem,
  sampleCard,
  sampleDataUrl,
  sampleOrder,
  sampleUploadItem,
} from '@/test/fixtures'
import { completeCheckout, createOrder } from './checkout'
import { CheckoutError } from './errors'

const cart = [sampleApiItem, sampleUploadItem] // 1,500円 x 2 + 800円 x 1 = 3,800円

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function seed(overrides: Partial<MainState> = {}) {
  save('images', { ...createInitialImages(), images: { 'img-1': sampleDataUrl } })
  save('main', { ...createInitialMain(), card: sampleCard, cart, ...overrides })
}

function catchError(fn: () => unknown): unknown {
  try {
    fn()
  } catch (error) {
    return error
  }
  return null
}

describe('createOrder', () => {
  const meta = { id: 'order-1', paidAt: 1000 }

  it('カートを、決済額つきの注文に変換する', () => {
    expect(createOrder(cart, meta)).toEqual({
      id: 'order-1',
      paidAt: 1000,
      items: cart,
      totalYen: 3800,
    })
  })

  it('行はコピーされ、カートの行と同じオブジェクトではない', () => {
    const order = createOrder(cart, meta)

    expect(order.items[0]).not.toBe(cart[0])
  })

  it('カートが空のときは、empty-cart のエラー', () => {
    const error = catchError(() => createOrder([], meta))

    expect(error).toBeInstanceOf(CheckoutError)
    expect(error).toMatchObject({ code: 'empty-cart' })
  })
})

describe('completeCheckout(成功)', () => {
  it('注文を履歴に足し、カートを空にし、カードは残す', () => {
    seed()

    const order = completeCheckout(5000)

    expect(order).toMatchObject({ paidAt: 5000, totalYen: 3800 })
    expect(order.items).toEqual(cart)
    expect(load('main').history).toEqual([order])
    expect(load('main').cart).toEqual([])
    expect(load('main').card).toEqual(sampleCard)
  })

  it('保存した内容が、localStorageにも入っている', () => {
    seed()

    completeCheckout()

    const saved = JSON.parse(localStorage.getItem('app:main') ?? '')
    expect(saved.cart).toEqual([])
    expect(saved.history).toHaveLength(1)
  })

  it('すでにある履歴の後ろに足される', () => {
    seed({ history: [sampleOrder] })

    const order = completeCheckout()

    expect(load('main').history).toEqual([sampleOrder, order])
  })

  it('決済のたびに、別のIDになる', () => {
    seed()
    const first = completeCheckout()
    save('main', { ...load('main'), cart })

    const second = completeCheckout()

    expect(second.id).not.toBe(first.id)
    expect(load('main').history).toHaveLength(2)
  })

  it('アップロード商品の画像は、決済後も消えない(履歴が参照している)', () => {
    seed()

    completeCheckout()

    expect(removeImageIfUnused('img-1')).toBe(false)
    expect(getImage('img-1')).toBe(sampleDataUrl)
  })
})

describe('completeCheckout(失敗)', () => {
  it('カードがないときは、no-card のエラーで、カートは変わらない', () => {
    seed({ card: null })

    const error = catchError(() => completeCheckout())

    expect(error).toMatchObject({ code: 'no-card' })
    expect(load('main').cart).toEqual(cart)
    expect(load('main').history).toEqual([])
  })

  it('カートが空のときは、empty-cart のエラー', () => {
    seed({ cart: [] })

    expect(catchError(() => completeCheckout())).toMatchObject({ code: 'empty-cart' })
    expect(load('main').history).toEqual([])
  })

  it('続けて2回決済しても、履歴は1件のまま(2回目は、カートが空で止まる)', () => {
    seed()
    completeCheckout()

    const error = catchError(() => completeCheckout())

    expect(error).toMatchObject({ code: 'empty-cart' })
    expect(load('main').history).toHaveLength(1)
  })

  it('容量がいっぱいのときは、StorageQuotaError で、カートも履歴も変わらない', () => {
    seed()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(() => completeCheckout()).toThrow(StorageQuotaError)

    expect(load('main').cart).toEqual(cart)
    expect(load('main').history).toEqual([])
  })
})