import { Button } from '@/shared/components/Button'
import { ItemImage } from '@/shared/components/ItemImage'
import { LIMITS } from '@/shared/constants'
import { calcSubtotal, formatYen } from '@/shared/money'
import type { CartItem } from '@/shared/storage/schema'
import { QuantityStepper } from './QuantityStepper'

type Props = {
  item: CartItem
  onChangeQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItemRow({ item, onChangeQuantity, onRemove }: Props) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 rounded-card bg-surface p-3">
      <ItemImage item={item} className="size-20 rounded-lg md:size-24" />

      <div className="grid content-start gap-1">
        <h3 className="line-clamp-2 text-base font-bold text-ivory min-h-12">{item.name}</h3>
        <p className="text-sm text-ivory/80">単価 {formatYen(item.priceYen)}</p>
        <p className="text-sm">
          小計 <strong className="text-pink">{formatYen(calcSubtotal(item))}</strong>
        </p>
      </div>

      <div className="col-span-2 flex flex-wrap items-start justify-between gap-3">
        <QuantityStepper
          label={item.name}
          value={item.quantity}
          min={LIMITS.quantity.min}
          max={LIMITS.quantity.max}
          onChange={(quantity) => onChangeQuantity(item.id, quantity)}
        />
        <Button
          variant="secondary"
          aria-label={`${item.name}をカートから削除`}
          onClick={() => onRemove(item.id)}
          className="px-4 text-sm"
        >
          削除
        </Button>
      </div>
    </li>
  )
}