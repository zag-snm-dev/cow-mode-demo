import { formatYen } from '@/shared/money'
import { MYPAGE_COPY } from '../content'

type Props = {
  totalYen: number
  orderCount: number
}

export function PurchaseStats({ totalYen, orderCount }: Props) {
  return (
    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">
        購入の集計
      </h2>
      <dl className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1 rounded-card bg-surface p-4">
          <dt className="text-sm text-ivory/80">総決済額</dt>
          <dd className="text-2xl font-bold text-pink">{formatYen(totalYen)}</dd>
          <dd className="text-xs text-ivory/70">{MYPAGE_COPY.savedCaption}</dd>
        </div>
        <div className="grid gap-1 rounded-card bg-surface p-4">
          <dt className="text-sm text-ivory/80">決済回数</dt>
          <dd className="text-2xl font-bold text-pink">{orderCount}回</dd>
        </div>
      </dl>
    </section>
  )
}