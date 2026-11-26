/** 画面に表示する文言 */
export const STORAGE_MESSAGES = {
  quotaExceeded: '容量がいっぱいです',
  memoryMode: '閉じるとデータが消えます',
} as const

/** 保存先の容量がいっぱいで、書き込めなかったときのエラー */
export class StorageQuotaError extends Error {
  constructor() {
    super(STORAGE_MESSAGES.quotaExceeded)
    this.name = 'StorageQuotaError'
  }
}

/** ブラウザが投げる「容量超過」のエラーかどうかを判定する */
export function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014)
  )
}
