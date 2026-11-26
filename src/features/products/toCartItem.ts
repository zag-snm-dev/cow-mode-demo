import { usdToYen } from '@/shared/money'
import type { NewCartItem } from '@/shared/storage/schema'
import type { Product } from './schema'

/** 商品を、カートに入れる前の形に変える。価格は、この時点の円価格で確定する */
export function productToCartItem(product: Product): NewCartItem {
  return {
    source: 'api',
    id: `api:${product.id}`,
    name: product.title,
    priceYen: usdToYen(product.price),
    imageUrl: product.thumbnail,
  }
}