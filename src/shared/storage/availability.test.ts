import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryBackend, isLocalStorageAvailable } from './availability'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('isLocalStorageAvailable', () => {
  it('通常はtrue', () => {
    expect(isLocalStorageAvailable()).toBe(true)
  })

  it('確認用のキーを残さない', () => {
    isLocalStorageAvailable()

    expect(localStorage.length).toBe(0)
  })

  it('書き込みに失敗するとfalse', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })

    expect(isLocalStorageAvailable()).toBe(false)
  })
})

describe('createMemoryBackend', () => {
  it('書いた値を読み出せて、消せる', () => {
    const backend = createMemoryBackend()

    backend.setItem('a', '1')
    expect(backend.getItem('a')).toBe('1')

    backend.removeItem('a')
    expect(backend.getItem('a')).toBeNull()
  })

  it('存在しないキーはnull', () => {
    expect(createMemoryBackend().getItem('none')).toBeNull()
  })

  it('インスタンスごとに独立している', () => {
    const a = createMemoryBackend()
    const b = createMemoryBackend()

    a.setItem('k', 'v')

    expect(b.getItem('k')).toBeNull()
  })
})
