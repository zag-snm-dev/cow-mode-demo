import { describe, expect, it } from 'vitest'
import { LIMITS } from '@/shared/constants'
import { validateImageFile } from './validateImageFile'

describe('validateImageFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('%s は通る', (type) => {
    expect(validateImageFile({ type, size: 1000 })).toEqual({ ok: true })
  })

  it.each(['image/gif', 'image/svg+xml', 'image/heic', 'application/pdf', ''])(
    '形式「%s」は、形式のメッセージで失敗する',
    (type) => {
      expect(validateImageFile({ type, size: 1000 })).toEqual({
        ok: false,
        message: 'JPEG / PNG / WebP の画像を選んでください',
      })
    },
  )

  it('ちょうど5MBは通る', () => {
    expect(validateImageFile({ type: 'image/png', size: LIMITS.fileSizeBytes })).toEqual({ ok: true })
  })

  it('5MBを1バイトでも超えると失敗する', () => {
    const result = validateImageFile({ type: 'image/png', size: LIMITS.fileSizeBytes + 1 })

    expect(result).toEqual({ ok: false, message: '5MB以下の画像を選んでください' })
  })

  it('空のファイルは失敗する', () => {
    expect(validateImageFile({ type: 'image/png', size: 0 }).ok).toBe(false)
  })
})