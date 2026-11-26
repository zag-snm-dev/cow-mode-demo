import { LIMITS } from '@/shared/constants'
import type { CartItem, NewCartItem } from '@/shared/storage/schema'
import { loadLatest, save } from '@/shared/storage/storage'
import { removeImageIfUnused } from '@/shared/storage/imageStore'

const MIN_QUANTITY = LIMITS.quantity.min
const MAX_QUANTITY = LIMITS.quantity.max

/** added:追加できた / limit:数量の上限(99)に達した */
export type AddResult = 'added' | 'limit'

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
    throw new RangeError(`数量は${MIN_QUANTITY}〜${MAX_QUANTITY}の整数にしてください`)
  }
}

// ---- 純粋関数(何も保存せず、新しい配列を返す) ----

/**
 * カートに商品を足す。
 * 同じ商品(id)がすでにあるときは数量を増やし、名前・価格・画像は、最初に入れたときのままにする。
 * 合計が上限(99)を超えるときは、99にして 'limit' を返す。
 */
export function addItem(
  cart: readonly CartItem[],
  item: NewCartItem,
  quantity = 1,
): { cart: CartItem[]; result: AddResult } {
  assertQuantity(quantity)

  const index = cart.findIndex((line) => line.id === item.id)
  if (index === -1) {
    return { cart: [...cart, { ...item, quantity }], result: 'added' }
  }

  const total = cart[index].quantity + quantity
  const next = Math.min(total, MAX_QUANTITY)

  return {
    cart: cart.map((line, i) => (i === index ? { ...line, quantity: next } : line)),
    result: total > MAX_QUANTITY ? 'limit' : 'added',
  }
}

/** 指定した商品の数量を、指定した値にする */
export function changeQuantity(cart: readonly CartItem[], id: string, quantity: number): CartItem[] {
  assertQuantity(quantity)
  return cart.map((line) => (line.id === id ? { ...line, quantity } : line))
}

/** 指定した商品を取り除く */
export function removeItem(cart: readonly CartItem[], id: string): CartItem[] {
  return cart.filter((line) => line.id !== id)
}

// ---- 保存する関数(窓口を通して、読んで、計算して、書く) ----

/** カートに追加して保存する。容量がいっぱいのときは StorageQuotaError を投げる */
export function addToCart(item: NewCartItem, quantity = 1): AddResult {
  const state = loadLatest('main')
  const { cart, result } = addItem(state.cart, item, quantity)
  save('main', { ...state, cart })
  return result
}

/** 数量を変更して保存する */
export function setQuantity(id: string, quantity: number): void {
  const state = loadLatest('main')
  save('main', { ...state, cart: changeQuantity(state.cart, id, quantity) })
}

/** カートから取り除いて保存する。アップロード商品の画像は、使われなくなったら片付ける */
export function removeFromCart(id: string): void {
  const state = loadLatest('main')
  const target = state.cart.find((line) => line.id === id)

  save('main', { ...state, cart: removeItem(state.cart, id) })

  if (target?.source === 'upload') {
    try {
      removeImageIfUnused(target.imageId)
    } catch {
      // 画像の片付けに失敗しても、カートからの削除は完了している
    }
  }
}