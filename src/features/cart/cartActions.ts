import { MESSAGES } from '@/shared/constants'
import { StorageQuotaError } from '@/shared/storage/errors'
import { showToast } from '@/shared/toast/toastStore'
import { removeFromCart, setQuantity } from './cartStore'

function notifyFailure(error: unknown): void {
  showToast(error instanceof StorageQuotaError ? error.message : MESSAGES.updateFailed, 'error')
}

/** 数量を変える。失敗したときだけ、エラーを通知する(成功は、画面の変化で分かる) */
export function changeQuantityWithNotice(id: string, quantity: number): boolean {
  try {
    setQuantity(id, quantity)
    return true
  } catch (error) {
    notifyFailure(error)
    return false
  }
}

/** カートから削除して、通知する。失敗したときは、エラーを通知する */
export function removeFromCartWithNotice(id: string): boolean {
  try {
    removeFromCart(id)
    showToast(MESSAGES.removedFromCart)
    return true
  } catch (error) {
    notifyFailure(error)
    return false
  }
}