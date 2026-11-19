import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { PRODUCTS_PER_PAGE } from '@/shared/constants'
import { fetchProducts } from './api'
import type { Product, ProductsResponse } from './schema'

export const PRODUCTS_QUERY_KEY = ['products'] as const

/** 5分間は、同じ棚の情報を覚えておく(お買い物とカートを行き来しても、取り直さない) */
const STALE_TIME_MS = 5 * 60 * 1000

/** 次に取得する位置(skip)を返す。最後まで取ったら undefined */
export function getNextPageParam(lastPage: ProductsResponse): number | undefined {
  if (lastPage.products.length === 0) return undefined

  const next = lastPage.skip + lastPage.products.length
  return next < lastPage.total ? next : undefined
}

/** ページごとの配列を、1本の商品の配列にまとめる。毎回新しい関数になって、無駄な再計算が起きないようにするために、外に出しておく */
function flattenPages(data: InfiniteData<ProductsResponse, number>): Product[] {
  return data.pages.flatMap((page) => page.products)
}

export function useProducts() {
  return useInfiniteQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: ({ pageParam, signal }) =>
      fetchProducts({ limit: PRODUCTS_PER_PAGE, skip: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam,
    select: flattenPages,
    staleTime: STALE_TIME_MS,
  })
}