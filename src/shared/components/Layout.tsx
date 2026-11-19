import { Outlet, useLocation, useNavigate } from 'react-router'
import { useStorage } from '@/shared/storage/useStorage'
import { Button } from './Button'
import { Header } from './Header'
import { readNotice } from './notice'
import { TabBar } from './TabBar'

export function Layout() {
  const { card, cart } = useStorage('main')
  const location = useLocation()
  const navigate = useNavigate()

  const hasCard = card !== null
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const notice = readNotice(location.state)

  return (
    <div className="min-h-dvh">
      <Header hasCard={hasCard} cartCount={cartCount} />

      {notice !== null && (
        <div className="mx-auto max-w-5xl px-5 pt-3">
          <div
            role="status"
            aria-label="お知らせ"
            className="flex items-center justify-between gap-3 rounded-card border border-pink bg-surface p-3 text-sm"
          >
            <p>{notice}</p>
            {/* stateを付けずに、今のページへ移動し直して、お知らせを消す */}
            <Button
              variant="secondary"
              onClick={() => navigate(location.pathname, { replace: true })}
            >
              閉じる
            </Button>
          </div>
        </div>
      )}

      <main className={`mx-auto max-w-5xl p-5 ${hasCard ? 'pb-24 md:pb-5' : ''}`}>
        <Outlet />
      </main>

      {hasCard && <TabBar cartCount={cartCount} />}
    </div>
  )
}