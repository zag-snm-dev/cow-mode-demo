import { MESSAGES } from '@/shared/constants'
import { StorageQuotaError } from '@/shared/storage/errors'
import type { NewCartItem } from '@/shared/storage/schema'
import { showToast } from '@/shared/toast/toastStore'
import { addToCart, type AddResult } from './cartStore'

/** added:追加できた / limit:上限に達した / error:追加できなかった */
export type NoticeResult = AddResult | 'error'

/** カートに追加して、結果を通知(Toast)で伝える */
export function addToCartWithNotice(item: NewCartItem, quantity = 1): NoticeResult {
  try {
    const result = addToCart(item, quantity)
    showToast(result === 'limit' ? MESSAGES.quantityLimit : MESSAGES.addedToCart)
    return result
  } catch (error) {
    showToast(error instanceof StorageQuotaError ? error.message : MESSAGES.addFailed, 'error')
    return 'error'
  }
}