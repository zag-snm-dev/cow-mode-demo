import { describe, expect, it } from 'vitest'
import { LIMITS } from './constants'
import { calcSubtotal, calcTotal, formatYen, usdToYen } from './money'

describe('usdToYen', () => {
  it('固定レート(150)で換算する', () => {
    expect(usdToYen(10)).toBe(1500)
  })

  it('小数の価格も、誤差なく四捨五入する', () => {
    expect(usdToYen(19.99)).toBe(2999) // 2998.5 → 2999
    expect(usdToYen(9.99)).toBe(1499) // 1498.5 → 1499
  })

  it('0.5円の端数は切り上げる', () => {
    expect(usdToYen(0.01)).toBe(2) // 1.5 → 2
  })

  it('0ドルは0円', () => {
    expect(usdToYen(0)).toBe(0)
  })

  it('別のレートを渡せる', () => {
    expect(usdToYen(10, 100)).toBe(1000)
  })

  it('結果は常に整数', () => {
    expect(Number.isInteger(usdToYen(7.77))).toBe(true)
  })
})

describe('formatYen', () => {
  it('半角の円記号と桁区切りで表示する', () => {
    expect(formatYen(1500)).toBe('\u00a51,500')
  })

  it('0円', () => {
    expect(formatYen(0)).toBe('\u00a50')
  })

  it('価格の上限も表示できる', () => {
    expect(formatYen(LIMITS.priceYen.max)).toBe('\u00a59,999,999,999')
  })
})

describe('calcSubtotal', () => {
  it('単価 × 個数', () => {
    expect(calcSubtotal({ priceYen: 1500, quantity: 2 })).toBe(3000)
  })

  it('価格の上限 × 個数の上限でも、正確に扱える整数に収まる', () => {
    const subtotal = calcSubtotal({
      priceYen: LIMITS.priceYen.max,
      quantity: LIMITS.quantity.max,
    })

    expect(subtotal).toBe(989_999_999_901)
    expect(Number.isSafeInteger(subtotal)).toBe(true)
  })
})

describe('calcTotal', () => {
  it('全行の小計を合計する', () => {
    const lines = [
      { priceYen: 1500, quantity: 2 },
      { priceYen: 800, quantity: 1 },
    ]

    expect(calcTotal(lines)).toBe(3800)
  })

  it('空のときは0', () => {
    expect(calcTotal([])).toBe(0)
  })

  it('上限の行を99行並べても、正確に扱える整数に収まる', () => {
    const lines = Array.from({ length: 99 }, () => ({
      priceYen: LIMITS.priceYen.max,
      quantity: LIMITS.quantity.max,
    }))

    expect(Number.isSafeInteger(calcTotal(lines))).toBe(true)
  })
})