import { describe, expect, it } from 'vitest'

describe('DummyJSONのモック', () => {
  it('limitとskipに応じた件数を返す', async () => {
    const res = await fetch('https://dummyjson.com/products?limit=5&skip=10')
    const data = await res.json()

    expect(data.products).toHaveLength(2)
    expect(data.total).toBe(12)
  })
})