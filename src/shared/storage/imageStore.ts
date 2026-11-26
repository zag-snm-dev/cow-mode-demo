import { LIMITS, MESSAGES } from '@/shared/constants'
import { generateId } from '@/shared/id'
import type { CartItem, MainState } from './schema'
import { loadLatest, load, save } from './storage'

/** 保存できる画像の数(50枚)に達していて、保存できないときのエラー */
export class ImageLimitError extends Error {
  constructor() {
    super(MESSAGES.imageLimit)
    this.name = 'ImageLimitError'
  }
}

/** カートと履歴が、いま使っている画像のID */
export function referencedImageIds(main: MainState): Set<string> {
  const ids = new Set<string>()

  const collect = (items: readonly CartItem[]) => {
    items.forEach((item) => {
      if (item.source === 'upload') ids.add(item.imageId)
    })
  }

  collect(main.cart)
  main.history.forEach((order) => collect(order.items))

  return ids
}

/** 保存している画像の数(履歴が使っている分も含む) */
export function countImages(): number {
  return Object.keys(load('images').images).length
}

/** 画像IDから、データURLを取り出す。なければ null */
export function getImage(imageId: string): string | null {
  return load('images').images[imageId] ?? null
}

/**
 * 画像を保存して、画像IDを返す。
 * 上限(50枚)に達しているときは ImageLimitError、容量がいっぱいのときは StorageQuotaError を投げる。
 */
export function saveImage(dataUrl: string): string {
  const state = loadLatest('images')
  if (Object.keys(state.images).length >= LIMITS.imageCount) throw new ImageLimitError()

  const imageId = generateId()
  save('images', { ...state, images: { ...state.images, [imageId]: dataUrl } })
  return imageId
}

/**
 * カートにも履歴にも使われていなければ、画像を消す。
 * 消したら true、残したら(使われている・存在しない)false。
 */
export function removeImageIfUnused(imageId: string): boolean {
  if (referencedImageIds(loadLatest('main')).has(imageId)) return false

  const state = loadLatest('images')
  if (!(imageId in state.images)) return false

  const images = Object.fromEntries(Object.entries(state.images).filter(([id]) => id !== imageId))
  save('images', { ...state, images })
  return true
}