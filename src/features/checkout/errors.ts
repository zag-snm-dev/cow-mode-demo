import { MESSAGES } from '@/shared/constants'
import { StorageQuotaError } from '@/shared/storage/errors'

/** empty-cart:カートが空 / no-card:カードが未作成 */
export type CheckoutErrorCode = 'empty-cart' | 'no-card'

/** 決済のルールに反していて、決済できないときのエラー */
export class CheckoutError extends Error {
  readonly code: CheckoutErrorCode

  constructor(code: CheckoutErrorCode) {
    super(code === 'empty-cart' ? MESSAGES.checkoutEmpty : MESSAGES.checkoutNoCard)
    this.name = 'CheckoutError'
    this.code = code
  }
}

/** 決済に失敗したときに、画面に出す文言を選ぶ */
export function checkoutErrorMessage(error: unknown): string {
  if (error instanceof CheckoutError) return error.message
  if (error instanceof StorageQuotaError) return MESSAGES.checkoutQuota
  return MESSAGES.checkoutFailed
}