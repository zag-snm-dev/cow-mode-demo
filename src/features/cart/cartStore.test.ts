import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StorageQuotaError } from '@/shared/storage/errors'
import { createInitialMain, createInitialImages } from '@/shared/storage/schema'
import { load, resetStorageForTests, save } from '@/shared/storage/storage'
import {sampleApiItem, sampleCard, sampleNewApiItem, sampleNewUploadItem, sampleUploadItem, sampleDataUrl, sampleOrder} from '@/test/fixtures'
import { addItem, addToCart, changeQuantity, removeFromCart, removeItem, setQuantity } from './cartStore'

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('addItem', () => {
  it('新しい商品は、数量1で追加される', () => {
    const { cart, result } = addItem([], sampleNewApiItem)

    expect(result).toBe('added')
    expect(cart).toEqual([{ ...sampleNewApiItem, quantity: 1 }])
  })

  it('数量を指定して追加できる', () => {
    const { cart } = addItem([], sampleNewApiItem, 3)

    expect(cart[0].quantity).toBe(3)
  })

  it('別の商品は、別の行になる', () => {
    const first = addItem([], sampleNewApiItem).cart
    const { cart } = addItem(first, sampleNewUploadItem, 2)

    expect(cart).toHaveLength(2)
    expect(cart[1]).toEqual({ ...sampleNewUploadItem, quantity: 2 })
  })

  it('同じ商品は、数量が増える', () => {
    const first = addItem([], sampleNewApiItem, 2).cart
    const { cart, result } = addItem(first, sampleNewApiItem, 3)

    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(5)
    expect(result).toBe('added')
  })

  it('同じ商品を足しても、最初に入れたときの価格と名前のままになる', () => {
    const first = addItem([], sampleNewApiItem).cart
    const changed = { ...sampleNewApiItem, priceYen: 9999, name: '名前が変わった' }

    const { cart } = addItem(first, changed)

    expect(cart[0].priceYen).toBe(1500)
    expect(cart[0].name).toBe('テスト商品1')
  })

  it('ちょうど99個になるのは、上限ではない', () => {
    const first = addItem([], sampleNewApiItem, 98).cart
    const { cart, result } = addItem(first, sampleNewApiItem, 1)

    expect(cart[0].quantity).toBe(99)
    expect(result).toBe('added')
  })

  it('99個を超えるときは、99にそろえて limit を返す', () => {
    const first = addItem([], sampleNewApiItem, 98).cart
    const { cart, result } = addItem(first, sampleNewApiItem, 5)

    expect(cart[0].quantity).toBe(99)
    expect(result).toBe('limit')
  })

  it('すでに99個のものに足しても、99のまま limit', () => {
    const first = addItem([], sampleNewApiItem, 99).cart
    const { cart, result } = addItem(first, sampleNewApiItem)

    expect(cart[0].quantity).toBe(99)
    expect(result).toBe('limit')
  })

  it.each([0, -1, 100, 1.5, Number.NaN])('数量%sは、RangeErrorになる', (quantity) => {
    expect(() => addItem([], sampleNewApiItem, quantity)).toThrow(RangeError)
  })

  it('元の配列は変更しない', () => {
    const cart = [sampleApiItem]

    addItem(cart, sampleNewApiItem)

    expect(cart).toEqual([sampleApiItem])
  })
})

describe('changeQuantity', () => {
  it('指定した商品の数量だけを変える', () => {
    const cart = [sampleApiItem, sampleUploadItem]

    const result = changeQuantity(cart, sampleApiItem.id, 7)

    expect(result[0].quantity).toBe(7)
    expect(result[1]).toEqual(sampleUploadItem)
  })

  it.each([0, 100, 2.5])('数量%sは、RangeErrorになる', (quantity) => {
    expect(() => changeQuantity([sampleApiItem], sampleApiItem.id, quantity)).toThrow(RangeError)
  })

  it('存在しないidのときは、何も変わらない', () => {
    expect(changeQuantity([sampleApiItem], 'none', 5)).toEqual([sampleApiItem])
  })
})

describe('removeItem', () => {
  it('指定した商品を取り除く', () => {
    expect(removeItem([sampleApiItem, sampleUploadItem], sampleApiItem.id)).toEqual([sampleUploadItem])
  })

  it('存在しないidのときは、何も変わらない', () => {
    expect(removeItem([sampleApiItem], 'none')).toEqual([sampleApiItem])
  })
})

describe('addToCart / setQuantity / removeFromCart(保存)', () => {
  it('追加した内容が保存される', () => {
    expect(addToCart(sampleNewApiItem, 2)).toBe('added')

    expect(load('main').cart).toEqual([{ ...sampleNewApiItem, quantity: 2 }])
    expect(JSON.parse(localStorage.getItem('app:main') ?? '').cart).toHaveLength(1)
  })

  it('カードなど、カート以外のデータは残る', () => {
    save('main', { ...createInitialMain(), card: sampleCard })

    addToCart(sampleNewApiItem)

    expect(load('main').card).toEqual(sampleCard)
  })

  it('同じ商品を追加すると数量が増え、上限を超えるとlimitになる', () => {
    addToCart(sampleNewApiItem, 98)

    expect(addToCart(sampleNewApiItem, 1)).toBe('added')
    expect(addToCart(sampleNewApiItem, 1)).toBe('limit')
    expect(load('main').cart[0].quantity).toBe(99)
  })

  it('数量の変更と削除が保存される', () => {
    addToCart(sampleNewApiItem)
    addToCart(sampleNewUploadItem)

    setQuantity(sampleNewApiItem.id, 4)
    expect(load('main').cart[0].quantity).toBe(4)

    removeFromCart(sampleNewApiItem.id)
    expect(load('main').cart.map((line) => line.id)).toEqual([sampleNewUploadItem.id])
  })

  it('不正な商品(価格0円)は、保存されずに例外になる', () => {
    expect(() => addToCart({ ...sampleNewApiItem, priceYen: 0 })).toThrow()
    expect(load('main').cart).toEqual([])
  })

  it('容量がいっぱいのときは StorageQuotaError になり、カートは変わらない', () => {
    load('main') // 保存先をlocalStorageに決めてから、書き込みを失敗させる
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(() => addToCart(sampleNewApiItem)).toThrow(StorageQuotaError)
    expect(load('main').cart).toEqual([])
  })
})

describe('removeFromCart と、画像の片付け', () => {
  function seed(cart: (typeof sampleUploadItem)[], history = [] as (typeof sampleOrder)[]) {
    save('images', { ...createInitialImages(), images: { 'img-1': sampleDataUrl } })
    save('main', { ...createInitialMain(), cart, history })
  }

  it('アップロード商品を削除すると、使われなくなった画像も消える', () => {
    seed([sampleUploadItem])

    removeFromCart(sampleUploadItem.id)

    expect(load('images').images).toEqual({})
  })

  it('同じ画像を使うほかの行があれば、画像は残す', () => {
    seed([sampleUploadItem, { ...sampleUploadItem, id: 'upload:other' }])

    removeFromCart(sampleUploadItem.id)

    expect(load('images').images).toHaveProperty('img-1')
  })

  it('履歴が使っている画像は、消さない', () => {
    seed([sampleUploadItem], [sampleOrder])

    removeFromCart(sampleUploadItem.id)

    expect(load('images').images).toHaveProperty('img-1')
  })

  it('API商品を削除しても、画像は変わらない', () => {
    save('images', { ...createInitialImages(), images: { 'img-1': sampleDataUrl } })
    save('main', { ...createInitialMain(), cart: [sampleApiItem] })

    removeFromCart(sampleApiItem.id)

    expect(load('images').images).toHaveProperty('img-1')
  })
})