import type { Order } from '@/shared/storage/schema'

/** いちばん新しい注文(決済日時が同じなら、あとから保存したほう)。履歴がなければ null */
export function latestOrder(history: readonly Order[]): Order | null {
  if (history.length === 0) return null
  return history.reduce((latest, order) => (order.paidAt >= latest.paidAt ? order : latest))
}

/** 新しい順に並べ替えた、新しい配列を返す(決済日時が同じなら、あとから保存したほうを先に) */
export function sortOrdersNewestFirst(history: readonly Order[]): Order[] {
  return history
    .map((order, index) => ({ order, index }))
    .sort((a, b) => b.order.paidAt - a.order.paidAt || b.index - a.index)
    .map(({ order }) => order)
}

export type HistorySummary = {
  /** 総決済額(円) */
  totalYen: number
  /** 決済回数 */
  orderCount: number
}

/** 履歴から、総決済額と決済回数を計算する */
export function summarizeHistory(history: readonly Order[]): HistorySummary {
  return {
    totalYen: history.reduce((sum, order) => sum + order.totalYen, 0),
    orderCount: history.length,
  }
}