import { Button } from '@/shared/components/Button'
import type { Product } from '../schema'
import { useProducts } from '../useProducts'
import { ProductGrid } from './ProductGrid'
import { ProductSkeleton } from './ProductSkeleton'

type Props = {
  onAdd?: (product: Product) => void
}

export function ProductSection({ onAdd }: Props) {
  const query = useProducts()
  const products = query.data

  return (
    <section aria-labelledby="products-heading" className="grid gap-4">
      <h2 id="products-heading" className="text-xl">
        商品一覧
      </h2>

      {/* 1. 初回の読み込み中 */}
      {query.isPending && <ProductSkeleton />}

      {/* 2. 初回の取得に失敗(1件も表示できていない) */}
      {query.isError && products === undefined && (
        <div
          role="alert"
          className="grid justify-items-start gap-3 rounded-card border border-pink bg-surface p-4"
        >
          <p>商品を取得できませんでした。通信の状態を確認して、もう一度お試しください。</p>
          <Button variant="secondary" onClick={() => query.refetch()}>
            再試行
          </Button>
        </div>
      )}

      {/* 3. 商品が表示できている */}
      {products !== undefined && (
        <>
          <ProductGrid products={products} onAdd={onAdd} />

          {/* 続きの取得に失敗しても、すでに表示した商品は消さない */}
          {query.isFetchNextPageError && (
            <p role="alert" className="text-center text-sm text-pink">
              続きの商品を取得できませんでした。もう一度お試しください。
            </p>
          )}

          {query.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                disabled={query.isFetchingNextPage}
                onClick={() => query.fetchNextPage()}
              >
                {query.isFetchingNextPage ? '読み込み中…' : 'もっと見る'}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}