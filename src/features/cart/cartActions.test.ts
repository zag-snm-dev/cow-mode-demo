import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MESSAGES } from '@/shared/constants'
import { load, resetStorageForTests } from '@/shared/storage/storage'
import { getToast } from '@/shared/toast/toastStore'
import { sampleNewApiItem } from '@/test/fixtures'
import { addToCart } from './cartStore'
import { changeQuantityWithNotice, removeFromCartWithNotice } from './cartActions'

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function failWriting() {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('quota', 'QuotaExceededError')
  })
}

describe('changeQuantityWithNotice', () => {
  it('数量を変えて true を返す(通知は出さない)', () => {
    addToCart(sampleNewApiItem)

    expect(changeQuantityWithNotice(sampleNewApiItem.id, 5)).toBe(true)

    expect(load('main').cart[0].quantity).toBe(5)
    expect(getToast()).toBeNull()
  })

  it('範囲外の数量は、false を返し、エラーを通知し、カートは変わらない', () => {
    addToCart(sampleNewApiItem, 2)

    expect(changeQuantityWithNotice(sampleNewApiItem.id, 100)).toBe(false)

    expect(getToast()).toMatchObject({ message: MESSAGES.updateFailed, tone: 'error' })
    expect(load('main').cart[0].quantity).toBe(2)
  })

  it('容量がいっぱいのときは、容量の文言をエラーで通知する', () => {
    addToCart(sampleNewApiItem)
    failWriting()

    expect(changeQuantityWithNotice(sampleNewApiItem.id, 3)).toBe(false)

    expect(getToast()).toMatchObject({ message: '容量がいっぱいです', tone: 'error' })
    expect(load('main').cart[0].quantity).toBe(1)
  })
})

describe('removeFromCartWithNotice', () => {
  it('削除して true を返し、「削除しました」を通知する', () => {
    addToCart(sampleNewApiItem)

    expect(removeFromCartWithNotice(sampleNewApiItem.id)).toBe(true)

    expect(load('main').cart).toEqual([])
    expect(getToast()).toMatchObject({ message: MESSAGES.removedFromCart, tone: 'success' })
  })

  it('容量がいっぱいのときは、false を返し、エラーを通知し、カートは変わらない', () => {
    addToCart(sampleNewApiItem)
    failWriting()

    expect(removeFromCartWithNotice(sampleNewApiItem.id)).toBe(false)

    expect(getToast()).toMatchObject({ message: '容量がいっぱいです', tone: 'error' })
    expect(load('main').cart).toHaveLength(1)
  })
})