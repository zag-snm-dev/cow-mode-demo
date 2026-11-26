import { CardView } from '@/features/card/components/CardView'
import { EmptyHistory } from '@/features/history/components/EmptyHistory'
import { OrderList } from '@/features/history/components/OrderList'
import { PurchaseStats } from '@/features/history/components/PurchaseStats'
import { summarizeHistory } from '@/features/history/selectors'
import { useStorage } from '@/shared/storage/useStorage'

export function MyPage() {
  const { card, history } = useStorage('main')
  const { totalYen, orderCount } = summarizeHistory(history)

  return (
    <div className="grid gap-8">
      <h1 className="text-2xl">マイページ</h1>

      {card !== null && (
        <section aria-labelledby="my-card-heading">
          <h2 id="my-card-heading" className="sr-only">
            マイカード
          </h2>
          <div className="flex gap-1 justify-center">
            <CardView side="front" name={card.name} className="w-full max-w-xs" />
            <CardView side="back" number={card.number} className="w-full max-w-xs" />
          </div>
        </section>
      )}

      {history.length === 0 ? (
        <EmptyHistory />
      ) : (
        <>
          <PurchaseStats totalYen={totalYen} orderCount={orderCount} />

          <section aria-labelledby="history-heading" className="grid gap-3">
            <h2 id="history-heading" className="text-xl">
              決済履歴
            </h2>
            <OrderList orders={history} />
          </section>
        </>
      )}
    </div>
  )
}
