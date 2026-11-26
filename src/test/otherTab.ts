import type { StorageKey } from '@/shared/storage/storage'

const KEYS = { main: 'app:main', images: 'app:images' } as const

function dispatchStorageEvent(key: string | null): void {
  window.dispatchEvent(new StorageEvent('storage', { key, storageArea: window.localStorage }))
}

/**
 * 別のタブが、同じlocalStorageに書き込んだ状態を再現する。
 * notify を false にすると、「書き込みは終わっているが、このタブには通知が、まだ届いていない」状態になる。
 */
export function writeFromOtherTab(
  name: StorageKey,
  value: unknown,
  { notify = true }: { notify?: boolean } = {},
): void {
  const key = KEYS[name]
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  if (notify) dispatchStorageEvent(key)
}

/** 別のタブが、localStorageを全消去した状態を再現する */
export function clearFromOtherTab({ notify = true }: { notify?: boolean } = {}): void {
  localStorage.clear()
  if (notify) dispatchStorageEvent(null)
}