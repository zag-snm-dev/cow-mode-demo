import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateId } from './id'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('generateId', () => {
  it('UUID v4の形式で、毎回違う値になる', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()))

    expect(ids.size).toBe(50)
    ids.forEach((id) => expect(id).toMatch(UUID_V4))
  })

  it('randomUUID が使えない環境でも、同じ形式で作れる', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint8Array) => {
        array.forEach((_, index) => {
          array[index] = index * 17
        })
        return array
      },
    })

    expect(generateId()).toMatch(UUID_V4)
  })
})