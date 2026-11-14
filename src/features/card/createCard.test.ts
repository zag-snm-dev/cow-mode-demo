import { describe, expect, it } from 'vitest'
import { cardSchema } from '@/shared/storage/schema'
import { createCard } from './createCard'

const number = '12345-1234567-12345'

describe('createCard', () => {
  it('名前の前後の空白を除いて、カードを作る', () => {
    expect(createCard({ name: '  TARO  ', number, now: 1000 })).toEqual({
      name: 'TARO',
      number,
      createdAt: 1000,
    })
  })

  it('作ったカードは、保存用のスキーマを通る', () => {
    const card = createCard({ name: 'TARO', number })

    expect(cardSchema.safeParse(card).success).toBe(true)
  })

  it('nowを省略すると、今の時刻になる', () => {
    const before = Date.now()

    const card = createCard({ name: 'TARO', number })

    expect(card.createdAt).toBeGreaterThanOrEqual(before)
  })

  it('空の名前は例外を投げる', () => {
    expect(() => createCard({ name: '', number })).toThrow()
    expect(() => createCard({ name: '   ', number })).toThrow()
  })

  it('11字の名前は例外を投げる', () => {
    expect(() => createCard({ name: 'あ'.repeat(11), number })).toThrow()
  })
})