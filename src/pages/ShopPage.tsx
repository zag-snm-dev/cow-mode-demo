import { addToCartWithNotice } from '@/features/cart/addToCartWithNotice'
import { ProductSection } from '@/features/products/components/ProductSection'
import { productToCartItem } from '@/features/products/toCartItem'
import { UploadForm } from '@/features/upload/components/UploadForm'

export function ShopPage() {
  return (
    <div className="grid gap-8">
      <h1 className="text-2xl">お買い物</h1>

      <ProductSection onAdd={(product) => addToCartWithNotice(productToCartItem(product))} />

      <section aria-labelledby="upload-heading" className="grid gap-4 mt-12">
        <h2 id="upload-heading" className="text-xl">
          欲しい物をアップロード
        </h2>
        <div className="flex justify-center w-full">
          <UploadForm />
        </div>
      </section>
    </div>
  )
}