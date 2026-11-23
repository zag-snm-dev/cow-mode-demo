import { describe, expect, it } from 'vitest'
import { saveCard } from '@/features/card/useCard'
import { addToCart, removeFromCart, setQuantity } from '@/features/cart/cartStore'
import { completeCheckout } from '@/features/checkout/checkout'
import { CheckoutError } from '@/features/checkout/errors'
import { LIMITS } from '@/shared/constants'
import { ImageLimitError, saveImage } from '@/shared/storage/imageStore'
import { createInitialImages, createInitialMain, type MainState } from '@/shared/storage/schema'
import { load } from '@/shared/storage/storage'
import {
  sampleApiItem,
  sampleCard,
  sampleDataUrl,
  sampleNewUploadItem,
  sampleOrder,
  sampleUploadItem,
} from '@/test/fixtures'
import { writeFromOtherTab } from '@/test/otherTab'

const main = (overrides: Partial<MainState> = {}): MainState => ({
  ...createInitialMain(),
  ...overrides,
})

const images = (count: number) => ({
  ...createInitialImages(),
  images: Object.fromEntries(Array.from({ length: count }, (_, i) => [`img-${i}`, sampleDataUrl])),
})

// どのテストも、「別のタブが書き込み済みだが、このタブには、通知がまだ届いていない」状態から始める
const silently = { notify: false }

describe('通知が届く前に書き込んでも、別のタブの変更を消さない', () => {
  it('カードの保存は、別のタブで入れたカートを消さない', () => {
    load('main') // このタブは、空の状態を覚えている
    writeFromOtherTab('main', main({ cart: [sampleApiItem] }), silently)

    saveCard(sampleCard)

    expect(load('main').cart).toEqual([sampleApiItem])
    expect(load('main').card).toEqual(sampleCard)
    expect(JSON.parse(localStorage.getItem('app:main') ?? '').cart).toHaveLength(1)
  })

  it('カートへの追加は、別のタブで入れた別の商品を消さない', () => {
    load('main')
    writeFromOtherTab('main', main({ card: sampleCard, cart: [sampleApiItem] }), silently)

    addToCart(sampleNewUploadItem)

    expect(load('main').cart.map((line) => line.id)).toEqual([
      sampleApiItem.id,
      sampleNewUploadItem.id,
    ])
  })

  it('数量の変更は、別のタブで追加された商品を消さない', () => {
    writeFromOtherTab('main', main({ cart: [sampleApiItem] }), silently)
    load('main') // このタブは、1行だけのカートを覚えている
    writeFromOtherTab('main', main({ cart: [sampleApiItem, sampleUploadItem] }), silently)

    setQuantity(sampleApiItem.id, 5)

    const { cart } = load('main')
    expect(cart).toHaveLength(2)
    expect(cart[0].quantity).toBe(5)
    expect(cart[1]).toEqual(sampleUploadItem)
  })

  it('削除は、別のタブで追加された商品を消さない', () => {
    writeFromOtherTab('main', main({ cart: [sampleApiItem] }), silently)
    load('main')
    writeFromOtherTab('main', main({ cart: [sampleApiItem, sampleUploadItem] }), silently)

    removeFromCart(sampleApiItem.id)

    expect(load('main').cart).toEqual([sampleUploadItem])
  })

  it('別のタブが、先に決済を終えていたら、二重に決済しない', () => {
    writeFromOtherTab(
      'main',
      main({ card: sampleCard, cart: [sampleApiItem, sampleUploadItem] }),
      silently,
    )
    load('main') // このタブは、カートに商品がある状態を覚えている

    // 別のタブが、先に決済を終えた
    writeFromOtherTab('main', main({ card: sampleCard, cart: [], history: [sampleOrder] }), silently)

    expect(() => completeCheckout()).toThrow(CheckoutError)
    expect(load('main').history).toEqual([sampleOrder])
    expect(load('main').cart).toEqual([])
  })

  it('画像の保存は、別のタブが、50枚目を保存していたら、上限を超えて保存しない', () => {
    writeFromOtherTab('images', images(LIMITS.imageCount - 1), silently)
    load('images') // このタブは、49枚と覚えている
    writeFromOtherTab('images', images(LIMITS.imageCount), silently)

    expect(() => saveImage(sampleDataUrl)).toThrow(ImageLimitError)
    expect(Object.keys(load('images').images)).toHaveLength(LIMITS.imageCount)
  })
})