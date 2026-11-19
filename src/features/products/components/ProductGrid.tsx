import type { Product } from '../schema'
import { ProductCard } from './ProductCard'

type Props = {
  products: Product[]
  onAdd?: (product: Product) => void
}

export function ProductGrid({ products, onAdd }: Props) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-4 min-[599px]:grid-cols-2 md:grid-cols-5">
      {products.map((product) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} onAdd={onAdd} />
        </li>
      ))}
    </ul>
  )
}