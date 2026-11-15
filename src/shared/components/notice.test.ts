import { describe, expect, it } from 'vitest'
import { readNotice } from './notice'

describe('readNotice', () => {
  it('stateのnoticeを返す', () => {
    expect(readNotice({ notice: 'こんにちは' })).toBe('こんにちは')
  })

  it('stateがないときはnull', () => {
    expect(readNotice(null)).toBeNull()
    expect(readNotice(undefined)).toBeNull()
  })

  it('noticeがないとき、または文字列でないときはnull', () => {
    expect(readNotice({})).toBeNull()
    expect(readNotice({ notice: 123 })).toBeNull()
    expect(readNotice('文字列')).toBeNull()
  })
})