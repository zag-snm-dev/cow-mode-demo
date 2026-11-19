import { Button } from '@/shared/components/Button'
import { formatYen, usdToYen } from '@/shared/money'
import type { Product } from '../schema'

type Props = {
  product: Product
  /** カートへの追加。ないときは、ボタンを押せない状態にする */
  onAdd?: (product: Product) => void
}

export function ProductCard({ product, onAdd }: Props) {
  const priceYen = usdToYen(product.price)

  return (
    <article className="flex w-full flex-col gap-2 rounded-card bg-surface p-3">
      {/* すぐ下に商品名の文字があるので、画像は飾りとして扱う(alt を空にする) */}
      <img
        src={product.thumbnail}
        alt=""
        loading="lazy"
        className="aspect-square w-full rounded-lg bg-ink object-contain"
      />
      <h3 className="line-clamp-2 min-h-8 leading-5 text-sm font-bold text-ivory">{product.title}</h3>
      <p className="font-bold text-pink">{formatYen(priceYen)}</p>
      <Button
        className="mt-auto w-full px-3 text-sm"
        disabled={onAdd === undefined}
        aria-label={`${product.title}をカートに追加`}
        onClick={() => onAdd?.(product)}
      >
        カートに追加
      </Button>
    </article>
  )
}