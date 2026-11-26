import { describe, expect, it } from 'vitest'
import { sampleOrder } from '@/test/fixtures'
import { latestOrder, sortOrdersNewestFirst, summarizeHistory } from './selectors'

const older = { ...sampleOrder, id: 'older', paidAt: 1000, totalYen: 1500 }
const newer = { ...sampleOrder, id: 'newer', paidAt: 2000, totalYen: 3800 }

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

describe('sortOrdersNewestFirst', () => {
  it('新しい順に並べる', () => {
    expect(sortOrdersNewestFirst([older, newer])).toEqual([newer, older])
    expect(sortOrdersNewestFirst([newer, older])).toEqual([newer, older])
  })

  it('決済日時が同じなら、あとに保存したものを先にする', () => {
    const a = { ...sampleOrder, id: 'a', paidAt: 1000 }
    const b = { ...sampleOrder, id: 'b', paidAt: 1000 }

    expect(sortOrdersNewestFirst([a, b]).map((order) => order.id)).toEqual(['b', 'a'])
  })

  it('元の配列を変更しない', () => {
    const history = [older, newer]

    sortOrdersNewestFirst(history)

    expect(history).toEqual([older, newer])
  })

  it('先頭は、latestOrder と同じ注文になる', () => {
    const history = [older, newer, { ...sampleOrder, id: 'tie', paidAt: 2000 }]

    expect(sortOrdersNewestFirst(history)[0]).toBe(latestOrder(history))
  })
})

describe('summarizeHistory', () => {
  it('履歴がなければ、0円・0回', () => {
    expect(summarizeHistory([])).toEqual({ totalYen: 0, orderCount: 0 })
  })

  it('決済額を足した総決済額と、決済回数を返す', () => {
    expect(summarizeHistory([older, newer])).toEqual({ totalYen: 5300, orderCount: 2 })
  })
})