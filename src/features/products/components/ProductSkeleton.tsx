import { PRODUCTS_PER_PAGE } from '@/shared/constants'

type Props = {
  count?: number
}

/** 読み込み中に出す、カードの形をした仮の枠(動きはつけない) */
export function ProductSkeleton({ count = PRODUCTS_PER_PAGE }: Props) {
  return (
    <div role="status">
      <span className="sr-only">商品を読み込み中</span>
      <ul aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="grid gap-2 rounded-card bg-surface p-3">
            <div className="aspect-square rounded-lg bg-ink" />
            <div className="h-4 w-4/5 rounded bg-ink" />
            <div className="h-4 w-1/3 rounded bg-ink" />
            <div className="h-11 rounded-pill bg-ink" />
          </li>
        ))}
      </ul>
    </div>
  )
}