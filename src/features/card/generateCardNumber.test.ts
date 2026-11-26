import { describe, expect, it } from 'vitest'
import {
  formatCardNumber,
  generateCardNumber,
  isLuhnValid,
  type RandomSource,
} from './generateCardNumber'

/** 決まった値を順に返す乱数(足りなくなったら0を返す) */
function sequenceRandom(values: number[]): RandomSource {
  let index = 0
  return (array) => {
    array[0] = values[index] ?? 0
    index += 1
  }
}

describe('isLuhnValid', () => {
  it('検算に通る番号はtrue', () => {
    expect(isLuhnValid('79927398713')).toBe(true)
  })

  it('検算に通らない番号はfalse', () => {
    expect(isLuhnValid('79927398710')).toBe(false)
  })

  it('数字以外や空文字はfalse', () => {
    expect(isLuhnValid('abc')).toBe(false)
    expect(isLuhnValid('')).toBe(false)
  })
})

describe('formatCardNumber', () => {
  it('5桁-7桁-5桁に区切る', () => {
    expect(formatCardNumber('12345123456712345')).toBe('12345-1234567-12345')
  })
})

describe('generateCardNumber', () => {
  it('5桁-7桁-5桁の形式で作る', () => {
    expect(generateCardNumber()).toMatch(/^\d{5}-\d{7}-\d{5}$/)
  })

  it('作った番号は、Luhn検算に通らない', () => {
    for (let i = 0; i < 300; i++) {
      const digits = generateCardNumber().replaceAll('-', '')

      expect(isLuhnValid(digits)).toBe(false)
    }
  })

  it('毎回違う番号になる', () => {
    const numbers = new Set(Array.from({ length: 20 }, () => generateCardNumber()))

    expect(numbers.size).toBe(20)
  })

  it('偶然Luhn検算に通る場合(全部0)は、最後の桁をずらして通らなくする', () => {
    const number = generateCardNumber(sequenceRandom([]))

    expect(number).toBe('00000-0000000-00001')
    expect(isLuhnValid(number.replaceAll('-', ''))).toBe(false)
  })

  it('偏りを避けるため、範囲外の乱数は捨てて引き直す', () => {
    // 4294967295 は範囲外なので捨てられ、次の 7 が最初の桁になる
    const number = generateCardNumber(sequenceRandom([4294967295, 7]))

    expect(number).toBe('70000-0000000-00000')
  })
})