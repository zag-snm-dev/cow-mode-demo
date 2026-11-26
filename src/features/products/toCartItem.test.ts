import { describe, expect, it } from 'vitest'
import { cartItemSchema } from '@/shared/storage/schema'
import type { Product } from './schema'
import { productToCartItem } from './toCartItem'

const product: Product = {
  id: 1,
  title: 'テスト商品1',
  price: 10,
  thumbnail: 'https://cdn.dummyjson.com/test/1.webp',
}

describe('productToCartItem', () => {
  it('円に換算した価格で、カートの1行の形にする', () => {
    expect(productToCartItem(product)).toEqual({
      source: 'api',
      id: 'api:1',
      name: 'テスト商品1',
      priceYen: 1500,
      imageUrl: 'https://cdn.dummyjson.com/test/1.webp',
    })
  })

  it('小数の価格は、四捨五入した円になる', () => {
    expect(productToCartItem({ ...product, price: 19.99 }).priceYen).toBe(2999)
  })

  it('個数を付ければ、カートのスキーマを通る', () => {
    const item = { ...productToCartItem(product), quantity: 1 }

    expect(cartItemSchema.safeParse(item).success).toBe(true)
  })
})