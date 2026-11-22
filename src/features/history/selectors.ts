import type { Order } from '@/shared/storage/schema'

/** いちばん新しい注文(決済日時が同じなら、あとから保存したほう)。履歴がなければ null */
export function latestOrder(history: readonly Order[]): Order | null {
  if (history.length === 0) return null
  return history.reduce((latest, order) => (order.paidAt >= latest.paidAt ? order : latest))
}