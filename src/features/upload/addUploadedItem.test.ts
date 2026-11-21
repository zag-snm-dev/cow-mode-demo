import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LIMITS, MESSAGES } from '@/shared/constants'
import { countImages, getImage } from '@/shared/storage/imageStore'
import { createInitialImages } from '@/shared/storage/schema'
import { load, resetStorageForTests, save } from '@/shared/storage/storage'
import { getToast } from '@/shared/toast/toastStore'
import { sampleDataUrl } from '@/test/fixtures'
import { addUploadedItemToCart } from './addUploadedItem'

const input = { dataUrl: sampleDataUrl, name: '欲しい物', priceYen: 1500, quantity: 2 }

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
})

/** 指定したキーへの書き込みだけを、容量超過にする */
function failWritingTo(key: string) {
  const original = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
    this: Storage,
    name: string,
    value: string,
  ) {
    if (name === key) throw new DOMException('quota', 'QuotaExceededError')
    original.call(this, name, value)
  })
}

describe('addUploadedItemToCart', () => {
  it('画像を保存し、カートに追加して、通知を出す', () => {
    expect(addUploadedItemToCart(input)).toBe('added')

    const [line] = load('main').cart
    expect(line).toMatchObject({ source: 'upload', name: '欲しい物', priceYen: 1500, quantity: 2 })
    expect(line.id).toMatch(/^upload:/)
    expect(line.source === 'upload' && getImage(line.imageId)).toBe(sampleDataUrl)
    expect(getToast()).toMatchObject({ message: MESSAGES.addedToCart, tone: 'success' })
  })

  it('同じ内容でもう一度追加すると、別の行・別の画像になる', () => {
    addUploadedItemToCart(input)
    addUploadedItemToCart(input)

    expect(load('main').cart).toHaveLength(2)
    expect(countImages()).toBe(2)
  })

  it('画像が50枚に達していたら、image-limit を返し、カートは変わらない', () => {
    save('images', {
      ...createInitialImages(),
      images: Object.fromEntries(
        Array.from({ length: LIMITS.imageCount }, (_, i) => [`img-${i}`, sampleDataUrl]),
      ),
    })

    expect(addUploadedItemToCart(input)).toBe('image-limit')

    expect(load('main').cart).toEqual([])
    expect(countImages()).toBe(LIMITS.imageCount)
  })

  it('画像の保存で容量がいっぱいなら、error を返し、エラーの通知を出す', () => {
    load('images')
    failWritingTo('app:images')

    expect(addUploadedItemToCart(input)).toBe('error')

    expect(getToast()).toMatchObject({ message: '容量がいっぱいです', tone: 'error' })
    expect(load('main').cart).toEqual([])
  })

  it('カートの保存に失敗したら、保存した画像を取り消す', () => {
    load('main')
    failWritingTo('app:main')

    expect(addUploadedItemToCart(input)).toBe('error')

    expect(getToast()?.tone).toBe('error')
    expect(countImages()).toBe(0)
    expect(load('main').cart).toEqual([])
  })

  it('不正な価格は、error を返し、画像を残さない', () => {
    expect(addUploadedItemToCart({ ...input, priceYen: 0 })).toBe('error')

    expect(countImages()).toBe(0)
  })
})