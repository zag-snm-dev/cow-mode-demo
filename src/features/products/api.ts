import { productsResponseSchema, type ProductsResponse } from './schema'

export const PRODUCTS_URL = 'https://dummyjson.com/products'

/** HTTPの応答が、成功(2xx)でなかったときのエラー */
export class ProductsApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`商品の取得に失敗しました(HTTP ${status})`)
    this.name = 'ProductsApiError'
    this.status = status
  }
}

type Params = {
  /** 1回に取る件数 */
  limit: number
  /** 先頭から何件を飛ばすか */
  skip: number
  /** 画面を離れたときなどに、通信を取り消すための合図 */
  signal?: AbortSignal
}

/** 商品を取得し、応答の形を確かめてから返す */
export async function fetchProducts({ limit, skip, signal }: Params): Promise<ProductsResponse> {
  const url = new URL(PRODUCTS_URL)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('skip', String(skip))

  const response = await fetch(url, { signal })
  if (!response.ok) throw new ProductsApiError(response.status)

  return productsResponseSchema.parse(await response.json())
}