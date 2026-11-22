import { describe, expect, it } from 'vitest'
import { formatDateTime } from './date'

const timestamp = 1_700_000_100_000 // 2023-11-14 22:15:00 (UTC)

describe('formatDateTime', () => {
  it('指定した時間帯で、年/月/日 時:分 の形にする', () => {
    expect(formatDateTime(timestamp, 'Asia/Tokyo')).toBe('2023/11/15 07:15')
    expect(formatDateTime(timestamp, 'UTC')).toBe('2023/11/14 22:15')
    expect(formatDateTime(timestamp, 'America/New_York')).toBe('2023/11/14 17:15')
  })

  it('月・日・時・分は、2桁にそろえる', () => {
    expect(formatDateTime(Date.UTC(2024, 0, 5, 3, 4), 'UTC')).toBe('2024/01/05 03:04')
  })

  it('0時は、24:00ではなく00:00になる', () => {
    expect(formatDateTime(Date.UTC(2023, 10, 14, 15, 0), 'Asia/Tokyo')).toBe('2023/11/15 00:00')
  })

  it('時間帯を省略しても、同じ形式になる', () => {
    expect(formatDateTime(timestamp)).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/)
  })
})