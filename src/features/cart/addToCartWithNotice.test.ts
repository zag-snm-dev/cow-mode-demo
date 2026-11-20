import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MESSAGES } from '@/shared/constants'
import { load, resetStorageForTests } from '@/shared/storage/storage'
import { getToast } from '@/shared/toast/toastStore'
import { sampleNewApiItem } from '@/test/fixtures'
import { addToCart } from './cartStore'
import { addToCartWithNotice } from './addToCartWithNotice'

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('addToCartWithNotice', () => {
  it('追加できたら、added を返し、「追加しました」を出す', () => {
    expect(addToCartWithNotice(sampleNewApiItem)).toBe('added')

    expect(getToast()).toMatchObject({ message: MESSAGES.addedToCart, tone: 'success' })
    expect(load('main').cart).toHaveLength(1)
  })

  it('上限に達したら、limit を返し、上限の文言を出す', () => {
    addToCart(sampleNewApiItem, 99)

    expect(addToCartWithNotice(sampleNewApiItem)).toBe('limit')

    expect(getToast()).toMatchObject({ message: MESSAGES.quantityLimit, tone: 'success' })
  })

  it('容量がいっぱいのときは、error を返し、容量の文言をエラーで出す', () => {
    load('main')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(addToCartWithNotice(sampleNewApiItem)).toBe('error')

    expect(getToast()).toMatchObject({ message: '容量がいっぱいです', tone: 'error' })
    expect(load('main').cart).toEqual([])
  })

  it('それ以外の失敗(不正な商品)は、error を返し、汎用の文言をエラーで出す', () => {
    expect(addToCartWithNotice({ ...sampleNewApiItem, priceYen: 0 })).toBe('error')

    expect(getToast()).toMatchObject({ message: MESSAGES.addFailed, tone: 'error' })
  })
})