import { useId, useState } from 'react'
import { ItemImage } from '@/shared/components/ItemImage'
import { formatDateTime } from '@/shared/date'
import { calcSubtotal, formatYen, sumQuantity } from '@/shared/money'
import type { Order } from '@/shared/storage/schema'

type Props = {
  order: Order
}

export function OrderRow({ order }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <li className="rounded-card bg-surface">
      <h3 className="text-base">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="flex min-h-14 w-full items-center justify-between gap-3 rounded-card p-4 text-left text-ivory hover:bg-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink hover:cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="text-gold">
              {open ? '▼' : '▶'}
            </span>
            <time dateTime={new Date(order.paidAt).toISOString()}>
              {formatDateTime(order.paidAt)}
            </time>
          </span>
          <span>
            <span className="font-bold text-pink">{formatYen(order.totalYen)}</span>
            <span className="ml-2 text-sm font-normal text-ivory/80">
              ({sumQuantity(order.items)}点)
            </span>
          </span>
        </button>
      </h3>

      {/* 閉じている間は、見えなくするだけ。画像は lazy なので、開くまで読み込まれない */}
      <div id={panelId} hidden={!open} className="p-4">
        <ul role="list" className="grid gap-3">
          {order.items.map((item) => (
            <li key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <ItemImage item={item} className="size-14 rounded-lg" />
              <div className="grid gap-0.5">
                <p className="line-clamp-2 font-bold">{item.name}</p>
                <p className="text-sm text-ivory/80">
                  {formatYen(item.priceYen)} × {item.quantity}
                </p>
              </div>
              <p className="font-bold text-pink">{formatYen(calcSubtotal(item))}</p>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}