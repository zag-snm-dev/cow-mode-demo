import { CardView } from '@/features/card/components/CardView'
import { useCard } from '@/features/card/useCard'
import { changeQuantityWithNotice, removeFromCartWithNotice } from '@/features/cart/cartActions'
import { CartItemRow } from '@/features/cart/components/CartItemRow'
import { CartSummary } from '@/features/cart/components/CartSummary'
import { EmptyCart } from '@/features/cart/components/EmptyCart'
import { useCart } from '@/features/cart/useCart'

export function CartPage() {
  const { items, count, totalYen } = useCart()
  const card = useCard()

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl">カート</h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_20rem] md:items-start">
          <section aria-labelledby="cart-items-heading">
            <h2 id="cart-items-heading" className="sr-only">
              カートの商品
            </h2>
            <ul role="list" className="grid gap-3">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onChangeQuantity={changeQuantityWithNotice}
                  onRemove={removeFromCartWithNotice}
                />
              ))}
            </ul>
          </section>

          {/* onCheckout は、feature/checkout で渡す */}
          <CartSummary
            count={count}
            totalYen={totalYen}
            cardPreview={card === null ? null : <CardView side="front" name={card.name} className="w-40" />}
          />
        </div>
      )}
    </div>
  )
}