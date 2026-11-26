import { describe, expect, it } from 'vitest'
import { LIMITS } from '@/shared/constants'
import {
  sampleApiItem,
  sampleCard,
  sampleDataUrl,
  sampleOrder,
  sampleUploadItem,
} from '@/test/fixtures'
import {
  cardSchema,
  cartItemSchema,
  createInitialImages,
  createInitialMain,
  imagesStateSchema,
  mainStateSchema,
} from './schema'

describe('mainStateSchema', () => {
  it('初期状態は検証を通る', () => {
    expect(mainStateSchema.safeParse(createInitialMain()).success).toBe(true)
  })

  it('カード・カート・履歴が入った状態も通る', () => {
    const state = {
      ...createInitialMain(),
      card: sampleCard,
      cart: [sampleApiItem, sampleUploadItem],
      history: [sampleOrder],
    }

    expect(mainStateSchema.safeParse(state).success).toBe(true)
  })

  it('versionが違うと失敗する', () => {
    const state = { ...createInitialMain(), version: 2 }

    expect(mainStateSchema.safeParse(state).success).toBe(false)
  })
})

describe('cardSchema', () => {
  it('名前が20字を超えると失敗する', () => {
    const name = 'あ'.repeat(LIMITS.cardName.max + 1)

    expect(cardSchema.safeParse({ ...sampleCard, name }).success).toBe(false)
  })

  it('空の名前は失敗する', () => {
    expect(cardSchema.safeParse({ ...sampleCard, name: '' }).success).toBe(false)
  })

  it('番号が5-7-5の形式でないと失敗する', () => {
    expect(cardSchema.safeParse({ ...sampleCard, number: '1234-1234567-12345' }).success).toBe(
      false,
    )
  })
})

describe('cartItemSchema', () => {
  it('数量は1〜99だけを通す', () => {
    expect(cartItemSchema.safeParse({ ...sampleApiItem, quantity: 0 }).success).toBe(false)
    expect(cartItemSchema.safeParse({ ...sampleApiItem, quantity: 1 }).success).toBe(true)
    expect(cartItemSchema.safeParse({ ...sampleApiItem, quantity: 99 }).success).toBe(true)
    expect(cartItemSchema.safeParse({ ...sampleApiItem, quantity: 100 }).success).toBe(false)
  })

  it('価格は上限を超えると失敗する', () => {
    const over = { ...sampleApiItem, priceYen: LIMITS.priceYen.max + 1 }

    expect(cartItemSchema.safeParse(over).success).toBe(false)
  })

  it('小数の価格は失敗する', () => {
    expect(cartItemSchema.safeParse({ ...sampleApiItem, priceYen: 10.5 }).success).toBe(false)
  })

  it('API商品の名前は、20字を超えても通る', () => {
    const item = { ...sampleApiItem, name: 'あ'.repeat(100) }

    expect(cartItemSchema.safeParse(item).success).toBe(true)
  })

  it('アップロード品の名前は、20字を超えると失敗する', () => {
    const item = { ...sampleUploadItem, name: 'あ'.repeat(LIMITS.itemName.max + 1) }

    expect(cartItemSchema.safeParse(item).success).toBe(false)
  })

  it('httpsでない画像URLは失敗する', () => {
    const item = { ...sampleApiItem, imageUrl: 'http://example.com/a.webp' }

    expect(cartItemSchema.safeParse(item).success).toBe(false)
  })

  it('知らないsourceは失敗する', () => {
    expect(cartItemSchema.safeParse({ ...sampleApiItem, source: 'other' }).success).toBe(false)
  })
})

describe('imagesStateSchema', () => {
  it('初期状態は検証を通る', () => {
    expect(imagesStateSchema.safeParse(createInitialImages()).success).toBe(true)
  })

  it('JPEGのデータURLは通る', () => {
    const state = { ...createInitialImages(), images: { 'img-1': sampleDataUrl } }

    expect(imagesStateSchema.safeParse(state).success).toBe(true)
  })

  it('JPEG以外のデータURLは失敗する', () => {
    const state = { ...createInitialImages(), images: { 'img-1': 'data:image/png;base64,AAAA' } }

    expect(imagesStateSchema.safeParse(state).success).toBe(false)
  })
})
