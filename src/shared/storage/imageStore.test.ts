import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LIMITS } from '@/shared/constants'
import { sampleApiItem, sampleDataUrl, sampleOrder, sampleUploadItem } from '@/test/fixtures'
import { StorageQuotaError } from './errors'
import {
  countImages,
  getImage,
  ImageLimitError,
  referencedImageIds,
  removeImageIfUnused,
  saveImage,
} from './imageStore'
import { createInitialImages, createInitialMain } from './schema'
import { load, resetStorageForTests, save } from './storage'

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function seedImages(ids: string[]) {
  save('images', {
    ...createInitialImages(),
    images: Object.fromEntries(ids.map((id) => [id, sampleDataUrl])),
  })
}

describe('saveImage / getImage / countImages', () => {
  it('保存すると、画像IDが返り、取り出せて、数が増える', () => {
    const id = saveImage(sampleDataUrl)

    expect(getImage(id)).toBe(sampleDataUrl)
    expect(countImages()).toBe(1)
  })

  it('保存のたびに、違うIDになる', () => {
    expect(saveImage(sampleDataUrl)).not.toBe(saveImage(sampleDataUrl))
  })

  it('存在しないIDは null', () => {
    expect(getImage('none')).toBeNull()
  })

  it('JPEGのデータURLでないものは、例外になり、保存されない', () => {
    expect(() => saveImage('not-a-data-url')).toThrow()
    expect(countImages()).toBe(0)
  })

  it('容量がいっぱいのときは StorageQuotaError になり、保存されない', () => {
    load('images') // 保存先をlocalStorageに決めてから、書き込みを失敗させる
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(() => saveImage(sampleDataUrl)).toThrow(StorageQuotaError)
    expect(countImages()).toBe(0)
  })
})

describe('50枚の上限', () => {
  const ids = Array.from({ length: LIMITS.imageCount }, (_, i) => `img-${i}`)

  it('49枚のときは、あと1枚保存できる', () => {
    seedImages(ids.slice(0, LIMITS.imageCount - 1))

    saveImage(sampleDataUrl)

    expect(countImages()).toBe(LIMITS.imageCount)
  })

  it('50枚あるときは、ImageLimitError になり、増えない', () => {
    seedImages(ids)

    expect(() => saveImage(sampleDataUrl)).toThrow(ImageLimitError)
    expect(countImages()).toBe(LIMITS.imageCount)
  })

  it('履歴が使っている分も、数に含まれる(消せないので、枠は戻らない)', () => {
    seedImages(ids)
    save('main', { ...createInitialMain(), history: [sampleOrder] })

    expect(removeImageIfUnused('img-1')).toBe(false)
    expect(() => saveImage(sampleDataUrl)).toThrow(ImageLimitError)
  })
})

describe('referencedImageIds', () => {
  it('カートと履歴のアップロード商品が使う画像IDを集める(API商品は含めない)', () => {
    const main = {
      ...createInitialMain(),
      cart: [sampleApiItem, { ...sampleUploadItem, imageId: 'in-cart' }],
      history: [sampleOrder],
    }

    expect(referencedImageIds(main)).toEqual(new Set(['in-cart', 'img-1']))
  })

  it('何も使っていなければ、空', () => {
    expect(referencedImageIds(createInitialMain()).size).toBe(0)
  })
})

describe('removeImageIfUnused', () => {
  it('誰にも使われていない画像は、消える', () => {
    seedImages(['img-1', 'img-2'])

    expect(removeImageIfUnused('img-1')).toBe(true)
    expect(Object.keys(load('images').images)).toEqual(['img-2'])
  })

  it('カートが使っている画像は、残す', () => {
    seedImages(['img-1'])
    save('main', { ...createInitialMain(), cart: [sampleUploadItem] })

    expect(removeImageIfUnused('img-1')).toBe(false)
    expect(getImage('img-1')).toBe(sampleDataUrl)
  })

  it('履歴が使っている画像は、残す', () => {
    seedImages(['img-1'])
    save('main', { ...createInitialMain(), history: [sampleOrder] })

    expect(removeImageIfUnused('img-1')).toBe(false)
    expect(getImage('img-1')).toBe(sampleDataUrl)
  })

  it('存在しない画像は、何もせず false', () => {
    expect(removeImageIfUnused('none')).toBe(false)
  })
})