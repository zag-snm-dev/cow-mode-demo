import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import type { ProductsResponse } from './schema'
import { getNextPageParam, useProducts } from './useProducts'

function page(skip: number, count: number, total: number): ProductsResponse {
  return {
    products: Array.from({ length: count }, (_, i) => ({
      id: skip + i + 1,
      title: `商品${skip + i + 1}`,
      price: 1,
      thumbnail: 'https://cdn.dummyjson.com/test/x.webp',
    })),
    total,
    skip,
    limit: 5,
  }
}

describe('getNextPageParam', () => {
  it('まだ残りがあるときは、次の取得位置を返す', () => {
    expect(getNextPageParam(page(0, 5, 12))).toBe(5)
    expect(getNextPageParam(page(5, 5, 12))).toBe(10)
  })

  it('最後まで取ったら、undefined', () => {
    expect(getNextPageParam(page(10, 2, 12))).toBeUndefined()
  })

  it('ちょうど割り切れる場合も、最後はundefined', () => {
    expect(getNextPageParam(page(5, 5, 10))).toBeUndefined()
  })

  it('空のページが返ってきたら、undefined(無限に続けない)', () => {
    expect(getNextPageParam(page(5, 0, 12))).toBeUndefined()
  })
})

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useProducts', () => {
  it('最初は5件。fetchNextPageで5件ずつ増え、最後まで取るとhasNextPageがfalseになる', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.data).toHaveLength(5))
    expect(result.current.hasNextPage).toBe(true)

    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.data).toHaveLength(10))
    expect(result.current.hasNextPage).toBe(true)

    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.data).toHaveLength(12))
    expect(result.current.hasNextPage).toBe(false)
  })
})