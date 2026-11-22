import { describe, expect, it } from 'vitest'
import { MESSAGES } from '@/shared/constants'
import { StorageQuotaError } from '@/shared/storage/errors'
import { CheckoutError, checkoutErrorMessage } from './errors'

describe('CheckoutError', () => {
  it('codeに応じた文言を持つ', () => {
    expect(new CheckoutError('empty-cart').message).toBe(MESSAGES.checkoutEmpty)
    expect(new CheckoutError('no-card').message).toBe(MESSAGES.checkoutNoCard)
    expect(new CheckoutError('empty-cart').code).toBe('empty-cart')
  })
})

describe('checkoutErrorMessage', () => {
  it('決済のルール違反は、そのエラーの文言', () => {
    expect(checkoutErrorMessage(new CheckoutError('empty-cart'))).toBe(MESSAGES.checkoutEmpty)
  })

  it('容量超過は、容量の文言', () => {
    expect(checkoutErrorMessage(new StorageQuotaError())).toBe(MESSAGES.checkoutQuota)
  })

  it('それ以外は、汎用の文言', () => {
    expect(checkoutErrorMessage(new Error('x'))).toBe(MESSAGES.checkoutFailed)
    expect(checkoutErrorMessage('文字列')).toBe(MESSAGES.checkoutFailed)
  })
})