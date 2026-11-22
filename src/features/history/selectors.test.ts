import { describe, expect, it } from 'vitest'
import { sampleOrder } from '@/test/fixtures'
import { latestOrder } from './selectors'

const older = { ...sampleOrder, id: 'older', paidAt: 1000 }
const newer = { ...sampleOrder, id: 'newer', paidAt: 2000 }

describe('latestOrder', () => {
  it('履歴がなければ null', () => {
    expect(latestOrder([])).toBeNull()
  })

  it('決済日時がいちばん新しい注文を返す(並び順に関係なく)', () => {
    expect(latestOrder([older, newer])).toBe(newer)
    expect(latestOrder([newer, older])).toBe(newer)
  })

  it('決済日時が同じなら、あとの注文を返す', () => {
    const a = { ...sampleOrder, id: 'a', paidAt: 1000 }
    const b = { ...sampleOrder, id: 'b', paidAt: 1000 }

    expect(latestOrder([a, b])).toBe(b)
  })
})