import { describe, expect, it } from 'vitest'
import { cardNameSchema } from './schema'

function errorMessage(value: string): string | undefined {
  const result = cardNameSchema.safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message
}

describe('cardNameSchema', () => {
  it('前後の空白を除く', () => {
    expect(cardNameSchema.parse('  TARO  ')).toBe('TARO')
  })

  it('空の名前は失敗する', () => {
    expect(errorMessage('')).toBe('名前を入力してください')
  })

  it('空白だけの名前も失敗する', () => {
    expect(errorMessage('   ')).toBe('名前を入力してください')
  })

  it('10字までは通る', () => {
    expect(cardNameSchema.safeParse('あ'.repeat(10)).success).toBe(true)
  })

  it('11字は失敗する', () => {
    expect(errorMessage('あ'.repeat(11))).toBe('10文字以内で入力してください')
  })
})