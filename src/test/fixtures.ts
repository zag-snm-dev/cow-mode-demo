import type { Card, CartItem, NewCartItem, Order } from '@/shared/storage/schema'

/** 個数を持たない、カートに入れる前の商品 */
export const sampleNewApiItem: NewCartItem = {
  source: 'api',
  id: 'api:1',
  name: 'テスト商品1',
  priceYen: 1500,
  imageUrl: 'https://cdn.dummyjson.com/test/1.webp',
}

export const sampleNewUploadItem: NewCartItem = {
  source: 'upload',
  id: 'upload:abc',
  name: '欲しい物',
  priceYen: 800,
  imageId: 'img-1',
}

export const sampleCard: Card = {
  name: 'TARO',
  number: '12345-1234567-12345',
  createdAt: 1_700_000_000_000,
}

export const sampleApiItem: CartItem = {
  source: 'api',
  id: 'api:1',
  name: 'テスト商品1',
  priceYen: 1500,
  quantity: 2,
  imageUrl: 'https://cdn.dummyjson.com/test/1.webp',
}

export const sampleUploadItem: CartItem = {
  source: 'upload',
  id: 'upload:abc',
  name: '欲しい物',
  priceYen: 800,
  quantity: 1,
  imageId: 'img-1',
}

export const sampleOrder: Order = {
  id: 'order-1',
  paidAt: 1_700_000_100_000,
  items: [sampleApiItem, sampleUploadItem],
  totalYen: 3800,
}

export const sampleDataUrl = 'data:image/jpeg;base64,AAAA'
