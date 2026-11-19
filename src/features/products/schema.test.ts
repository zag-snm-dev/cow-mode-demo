import { describe, expect, it } from 'vitest'
import { productSchema, productsResponseSchema } from './schema'

const product = {
  id: 1,
  title: 'テスト商品1',
  price: 9.99,
  thumbnail: 'https://cdn.dummyjson.com/test/1.webp',
}

describe('productSchema', () => {
  it('正しい商品は通る', () => {
    expect(productSchema.safeParse(product).success).toBe(true)
  })

  it('使わない項目は、取り除かれる', () => {
    const result = productSchema.parse({ ...product, description: '説明', rating: 4.5 })

    expect(result).toEqual(product)
  })

  it('画像URLがhttpsでないと失敗する', () => {
    const http = { ...product, thumbnail: 'http://example.com/a.webp' }

    expect(productSchema.safeParse(http).success).toBe(false)
  })

  it('名前が空だと失敗する', () => {
    expect(productSchema.safeParse({ ...product, title: '' }).success).toBe(false)
  })

  it('価格が文字列だと失敗する', () => {
    expect(productSchema.safeParse({ ...product, price: '9.99' }).success).toBe(false)
  })

  it('価格が負だと失敗する', () => {
    expect(productSchema.safeParse({ ...product, price: -1 }).success).toBe(false)
  })
})

describe('productsResponseSchema', () => {
  it('正しい応答は通る', () => {
    const response = { products: [product], total: 1, skip: 0, limit: 5 }

    expect(productsResponseSchema.safeParse(response).success).toBe(true)
  })

  it('productsがないと失敗する', () => {
    expect(productsResponseSchema.safeParse({ total: 1, skip: 0, limit: 5 }).success).toBe(false)
  })

  it('1つでも不正な商品があると、応答全体が失敗する', () => {
    const response = { products: [product, { ...product, id: 'x' }], total: 2, skip: 0, limit: 5 }

    expect(productsResponseSchema.safeParse(response).success).toBe(false)
  })
})