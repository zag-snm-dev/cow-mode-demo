import { useState } from 'react'
import { RouterProvider } from 'react-router/dom'
import { Providers } from './providers'
import { createAppRouter } from './router'

export default function App() {
  // ルーターも、最初の1回だけ作る
  const [router] = useState(createAppRouter)

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}