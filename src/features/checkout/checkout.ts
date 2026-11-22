import { generateId } from '@/shared/id'
import { calcTotal } from '@/shared/money'
import type { CartItem, Order } from '@/shared/storage/schema'
import { load, save } from '@/shared/storage/storage'
import { CheckoutError } from './errors'

type OrderMeta = { id: string; paidAt: number }

/**
 * カートを、注文(Order)に変換する。何も保存しない純粋な関数。
 * 商品名・円単価・数量・画像の参照は、決済した時点のままコピーする(後で変わらない)。
 */
export function createOrder(cart: readonly CartItem[], meta: OrderMeta): Order {
  if (cart.length === 0) throw new CheckoutError('empty-cart')

  return {
    id: meta.id,
    paidAt: meta.paidAt,
    items: cart.map((line) => ({ ...line })),
    totalYen: calcTotal(cart),
  }
}

/**
 * 決済を完了する:注文を履歴に足して、カートを空にする(1回の保存で、まとめて行う)。
 * カードがない・カートが空のときは CheckoutError、容量がいっぱいのときは StorageQuotaError を投げる。
 * どのエラーでも、何も保存されず、カートはそのまま残る。
 */
export function completeCheckout(now: number = Date.now()): Order {
  const state = load('main')
  if (state.card === null) throw new CheckoutError('no-card')

  const order = createOrder(state.cart, { id: generateId(), paidAt: now })
  save('main', { ...state, cart: [], history: [...state.history, order] })

  return order
}