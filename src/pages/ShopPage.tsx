import { ProductSection } from '@/features/products/components/ProductSection'

export function ShopPage() {
  return (
    <div className="grid gap-8">
      <h1 className="text-2xl">お買い物</h1>

      {/* onAdd は、feature/cart-core でカートにつなぐ */}
      <ProductSection />

      <p>(画像のアップロードは feature/upload で実装します)</p>
    </div>
  )
}