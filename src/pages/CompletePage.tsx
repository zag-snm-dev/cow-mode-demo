import { latestOrder } from '@/features/history/selectors'
import { LinkButton } from '@/shared/components/LinkButton'
import { formatYen, sumQuantity } from '@/shared/money'
import { useStorage } from '@/shared/storage/useStorage'

export function CompletePage() {
  const { history } = useStorage('main')
  const order = latestOrder(history)

  // 履歴がないときは、RequireHistory が /shop に移すので、ここには来ない(念のための備え)
  if (order === null) return null

  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      {/* 牛キャラ(お辞儀)の画像は、chore/assets-copy で差し替える */}
      <div
        aria-hidden="true"
        className="flex h-48 w-48 items-center justify-center rounded-card border border-dashed border-gold bg-surface text-xs text-gold"
      >
        牛キャラ(お辞儀)・仮画像
      </div>

      <h1 className="text-2xl">決済が完了しました</h1>

      <p>
        今回の決済額 <span className="font-bold text-pink">{formatYen(order.totalYen)}</span>
        <span className="text-ivory/80">({sumQuantity(order.items)}点)</span>
      </p>

      <LinkButton to="/">トップに戻る</LinkButton>
    </div>
  )
}