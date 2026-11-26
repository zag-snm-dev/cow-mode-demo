import type { ReactNode } from 'react'
import { Button } from '@/shared/components/Button'
import { formatYen } from '@/shared/money'

type Props = {
  count: number
  totalYen: number
  /** 使用カードの縮小表示(呼び出し側から渡す) */
  cardPreview?: ReactNode
  /** 決済ボタンを押したとき。ないときは、ボタンを押せない状態にする */
  onCheckout?: () => void
  /** 決済の処理中か(ボタンを押せなくする) */
  isProcessing?: boolean
  /** 決済に失敗したときのメッセージ */
  errorMessage?: string | null
}

export function CartSummary({
  count,
  totalYen,
  cardPreview,
  onCheckout,
  isProcessing = false,
  errorMessage = null,
}: Props) {
  return (
    <section
      aria-labelledby="cart-summary-heading"
      className="grid gap-4 rounded-card bg-surface p-4 md:sticky md:top-4"
    >
      <h2 id="cart-summary-heading" className="text-lg">
        お支払い
      </h2>

      <dl className="grid gap-2">
        <div className="flex justify-between">
          <dt>点数</dt>
          <dd>{count}点</dd>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <dt>合計</dt>
          <dd className="text-pink">{formatYen(totalYen)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>利用上限</dt>
          <dd>∞</dd>
        </div>
      </dl>

      {cardPreview && (
        <div className="grid gap-1">
          <p className="text-xs text-ivory/70">使用カード</p>
          {cardPreview}
        </div>
      )}

      <Button
        className="w-full"
        disabled={onCheckout === undefined || isProcessing}
        aria-busy={isProcessing}
        onClick={onCheckout}
      >
        {isProcessing ? '決済しています…' : '決済する'}
      </Button>

      {errorMessage && (
        <p role="alert" className="text-sm text-pink">
          {errorMessage}
        </p>
      )}
    </section>
  )
}