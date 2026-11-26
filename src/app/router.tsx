import { createBrowserRouter, type RouteObject } from 'react-router'
import { CartPage } from '@/pages/CartPage'
import { CompletePage } from '@/pages/CompletePage'
import { MyPage } from '@/pages/MyPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ShopPage } from '@/pages/ShopPage'
import { Layout } from '@/shared/components/Layout'
import { HomeRoute, RequireCard, RequireHistory } from './guards'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'mypage', element: <MyPage /> },
      {
        element: <RequireCard />,
        children: [
          { path: 'shop', element: <ShopPage /> },
          { path: 'cart', element: <CartPage /> },
          {
            element: <RequireHistory />,
            children: [{ path: 'complete', element: <CompletePage /> }],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(routes)
}