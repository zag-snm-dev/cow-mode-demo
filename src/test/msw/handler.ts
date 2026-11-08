import { http, HttpResponse } from 'msw'

export const sampleProducts = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `テスト商品${i + 1}`,
  price: (i + 1) * 10,
  thumbnail: `https://cdn.dummyjson.com/test/${i + 1}.webp`,
}))

export const handlers = [
  http.get('https://dummyjson.com/products', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') ?? 30)
    const skip = Number(url.searchParams.get('skip') ?? 0)

    return HttpResponse.json({
      products: sampleProducts.slice(skip, skip + limit),
      total: sampleProducts.length,
      skip,
      limit,
    })
  }),
]