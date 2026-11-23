import { latestOrder } from '@/features/history/selectors'
import { LinkButton } from '@/shared/components/LinkButton'
import { formatYen, sumQuantity } from '@/shared/money'
import { useStorage } from '@/shared/storage/useStorage'
import { CowImage } from '@/shared/components/CowImage'

export function CompletePage() {
  const { history } = useStorage('main')
  const order = latestOrder(history)

  // 履歴がないときは、RequireHistory が /shop に移すので、ここには来ない(念のための備え)
  if (order === null) return null

  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      <div className="flex justify-center">
        <CowImage variant="bow" priority className="w-40" />
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