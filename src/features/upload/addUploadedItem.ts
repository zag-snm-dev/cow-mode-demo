import { addToCartWithNotice } from '@/features/cart/addToCartWithNotice'
import { MESSAGES } from '@/shared/constants'
import { generateId } from '@/shared/id'
import { StorageQuotaError } from '@/shared/storage/errors'
import { ImageLimitError, removeImageIfUnused, saveImage } from '@/shared/storage/imageStore'
import { showToast } from '@/shared/toast/toastStore'

export type AddUploadedInput = {
  /** 縮小済みのJPEG(データURL) */
  dataUrl: string
  name: string
  priceYen: number
  quantity: number
}

/**
 * added:追加できた
 * image-limit:画像が50枚に達していて、追加できなかった(画面に表示する)
 * error:保存に失敗した(通知は、すでに出している)
 */
export type AddUploadedResult = 'added' | 'image-limit' | 'error'

/** 画像を保存して、アップロード商品としてカートに追加する */
export function addUploadedItemToCart(input: AddUploadedInput): AddUploadedResult {
  let imageId: string
  try {
    imageId = saveImage(input.dataUrl)
  } catch (error) {
    if (error instanceof ImageLimitError) return 'image-limit'
    showToast(error instanceof StorageQuotaError ? error.message : MESSAGES.addFailed, 'error')
    return 'error'
  }

  const result = addToCartWithNotice(
    {
      source: 'upload',
      id: `upload:${generateId()}`,
      name: input.name,
      priceYen: input.priceYen,
      imageId,
    },
    input.quantity,
  )

  if (result === 'error') {
    // カートに入れられなかったので、保存した画像を取り消す(使われない画像を残さない)
    try {
      removeImageIfUnused(imageId)
    } catch {
      // 取り消しに失敗しても、利用者には、すでにエラーを通知している
    }
    return 'error'
  }

  return 'added'
}