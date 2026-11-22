import type { Order } from '@/shared/storage/schema'
import { sortOrdersNewestFirst } from '../selectors'
import { OrderRow } from './OrderRow'

type Props = {
  orders: readonly Order[]
}

/** 決済履歴を、新しい順に並べて表示する */
export function OrderList({ orders }: Props) {
  return (
    <ul role="list" className="grid gap-3">
      {sortOrdersNewestFirst(orders).map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </ul>
  )
}