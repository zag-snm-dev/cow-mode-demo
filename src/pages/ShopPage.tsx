import { addToCartWithNotice } from '@/features/cart/addToCartWithNotice'
import { ProductSection } from '@/features/products/components/ProductSection'
import { productToCartItem } from '@/features/products/toCartItem'

export function ShopPage() {
  return (
    <div className="grid gap-8">
      <h1 className="text-2xl">お買い物</h1>

      <ProductSection onAdd={(product) => addToCartWithNotice(productToCartItem(product))} />

      <p>(画像のアップロードは feature/upload で実装します)</p>
    </div>
  )
}