import { Navigate, Outlet } from 'react-router'
import { useCard } from '@/features/card/useCard'
import { NeedCardPage } from '@/pages/NeedCardPage'
import { TopPage } from '@/pages/TopPage'
import { MESSAGES } from '@/shared/constants'
import { useStorage } from '@/shared/storage/useStorage'

/** `/`:カードがあればお買い物へ、なければトップを表示する */
export function HomeRoute() {
  const card = useCard()
  return card === null ? <TopPage /> : <Navigate to="/shop" replace />
}

/** カードがなければカード作成を促す。あれば、中のページを表示する */
export function RequireCard() {
  const card = useCard()
  return card === null ? <NeedCardPage /> : <Outlet />
}

/** 履歴がなければ、お知らせを添えて /shop に移る。あれば、中のページを表示する */
export function RequireHistory() {
  const { history } = useStorage('main')

  return history.length === 0 ? (
    <Navigate to="/shop" replace state={{ notice: MESSAGES.noHistory }} />
  ) : (
    <Outlet />
  )
}