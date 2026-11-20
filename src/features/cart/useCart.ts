import { calcTotal, sumQuantity } from '@/shared/money'
import { useStorage } from '@/shared/storage/useStorage'

/** カートの中身・個数の合計・金額の合計を読む。変更されると、自動で再描画される */
export function useCart() {
  const { cart } = useStorage('main')

  return {
    items: cart,
    count: sumQuantity(cart),
    totalYen: calcTotal(cart),
  }
}