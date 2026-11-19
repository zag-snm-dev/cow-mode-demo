import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/msw/server'
import { fetchProducts, ProductsApiError } from './api'

const PRODUCTS_URL = 'https://dummyjson.com/products'

describe('fetchProducts', () => {
  it('limitとskipに応じた商品を返す', async () => {
    const first = await fetchProducts({ limit: 5, skip: 0 })
    const last = await fetchProducts({ limit: 5, skip: 10 })

    expect(first.products).toHaveLength(5)
    expect(first.total).toBe(12)
    expect(last.products).toHaveLength(2)
  })

  it('limitとskipを、クエリに付けて送る', async () => {
    const requested: { url: URL | null } = { url: null }
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        requested.url = new URL(request.url)
        return HttpResponse.json({ products: [], total: 0, skip: 5, limit: 5 })
      }),
    )

    await fetchProducts({ limit: 5, skip: 5 })

    expect(requested.url?.searchParams.get('limit')).toBe('5')
    expect(requested.url?.searchParams.get('skip')).toBe('5')
  })

  it('HTTPエラーのときは、ProductsApiErrorを投げる', async () => {
    server.use(http.get(PRODUCTS_URL, () => new HttpResponse(null, { status: 500 })))

    const error = await fetchProducts({ limit: 5, skip: 0 }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ProductsApiError)
    expect((error as ProductsApiError).status).toBe(500)
  })

  it('応答の形が違うときは、例外を投げる', async () => {
    server.use(http.get(PRODUCTS_URL, () => HttpResponse.json({ products: [{ id: 'x' }] })))

    await expect(fetchProducts({ limit: 5, skip: 0 })).rejects.toThrow()
  })
})