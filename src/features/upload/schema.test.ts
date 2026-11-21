import { describe, expect, it } from 'vitest'
import { LIMITS } from '@/shared/constants'
import { normalizeNumberInput, parseUploadForm } from './schema'

const valid = { name: '欲しい物', price: '1500', quantity: '1' }

describe('normalizeNumberInput', () => {
  it('全角の数字を半角にし、カンマと前後の空白を取り除く', () => {
    expect(normalizeNumberInput(' １，５００ ')).toBe('1500')
    expect(normalizeNumberInput('1,500')).toBe('1500')
  })
})

describe('parseUploadForm(成功)', () => {
  it('正しい入力は、数値に直して返す', () => {
    expect(parseUploadForm(valid)).toEqual({
      ok: true,
      value: { name: '欲しい物', priceYen: 1500, quantity: 1 },
    })
  })

  it('名前の前後の空白は取り除く', () => {
    const result = parseUploadForm({ ...valid, name: '  欲しい物  ' })

    expect(result.ok && result.value.name).toBe('欲しい物')
  })

  it('全角の数字とカンマも受け付ける', () => {
    const result = parseUploadForm({ ...valid, price: '１,５００', quantity: '３' })

    expect(result).toEqual({ ok: true, value: { name: '欲しい物', priceYen: 1500, quantity: 3 } })
  })

  it('境界の値(名前20字、価格の下限と上限、個数の下限と上限)は通る', () => {
    const lower = parseUploadForm({ name: 'あ'.repeat(20), price: '1', quantity: '1' })
    const upper = parseUploadForm({
      name: 'あ',
      price: String(LIMITS.priceYen.max),
      quantity: String(LIMITS.quantity.max),
    })

    expect(lower.ok).toBe(true)
    expect(upper.ok).toBe(true)
  })
})

describe('parseUploadForm(失敗)', () => {
  function errorsOf(input: Partial<typeof valid>) {
    const result = parseUploadForm({ ...valid, ...input })
    return result.ok ? null : result.errors
  }

  it('空の入力は、項目ごとに「入力してください」', () => {
    expect(errorsOf({ name: '', price: '', quantity: '' })).toEqual({
      name: '商品名を入力してください',
      price: '価格を入力してください',
      quantity: '個数を入力してください',
    })
  })

  it('空白だけの名前は失敗する', () => {
    expect(errorsOf({ name: '   ' })?.name).toBe('商品名を入力してください')
  })

  it('名前が21字だと失敗する', () => {
    expect(errorsOf({ name: 'あ'.repeat(21) })?.name).toBe('20文字以内で入力してください')
  })

  it.each(['0', '-1', '10.5', 'abc', '1e3', '10,000,000,000'])('価格「%s」は失敗する', (price) => {
    expect(errorsOf({ price })?.price).toBe('価格は1〜9,999,999,999円の整数で入力してください')
  })

  it('価格が上限を1円でも超えると失敗する', () => {
    const price = String(LIMITS.priceYen.max + 1)

    expect(errorsOf({ price })?.price).toBeDefined()
  })

  it.each(['0', '100', '-1', '1.5', 'abc'])('個数「%s」は失敗する', (quantity) => {
    expect(errorsOf({ quantity })?.quantity).toBe('個数は1〜99の整数で入力してください')
  })

  it('エラーは、あった項目だけに付く', () => {
    expect(errorsOf({ price: '0' })).toEqual({
      price: '価格は1〜9,999,999,999円の整数で入力してください',
    })
  })
})