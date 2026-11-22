import { useNavigate } from 'react-router'
import { CardView } from '@/features/card/components/CardView'
import { useCard } from '@/features/card/useCard'
import { changeQuantityWithNotice, removeFromCartWithNotice } from '@/features/cart/cartActions'
import { CartItemRow } from '@/features/cart/components/CartItemRow'
import { CartSummary } from '@/features/cart/components/CartSummary'
import { EmptyCart } from '@/features/cart/components/EmptyCart'
import { useCart } from '@/features/cart/useCart'
import { checkoutErrorMessage } from '@/features/checkout/errors'
import { useCheckout } from '@/features/checkout/useCheckout'

export function CartPage() {
  const { items, count, totalYen } = useCart()
  const card = useCard()
  const navigate = useNavigate()

  const { checkout, isPending, error } = useCheckout({
    // 戻るボタンで、空のカートに戻らないよう、履歴を置き換えて移る
    onSuccess: () => navigate('/complete', { replace: true }),
  })

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl">カート</h1>

      {items.length === 0 ? (
        // 決済が終わった直後は、「カートは空です」を出さずに、/complete への移動を待つ
        isPending ? null : <EmptyCart />
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_20rem] md:items-start">
          <section aria-labelledby="cart-items-heading">
            <h2 id="cart-items-heading" className="sr-only">
              カートの商品
            </h2>
            {/* 決済中は、数量の変更と削除をできなくする(fieldset を disabled にすると、中のボタンがまとめて無効になる) */}
            <fieldset disabled={isPending} className="min-w-0">
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
            </fieldset>
          </section>

          <CartSummary
            count={count}
            totalYen={totalYen}
            cardPreview={
              card === null ? null : <CardView side="front" name={card.name} className="w-40" />
            }
            onCheckout={checkout}
            isProcessing={isPending}
            errorMessage={error === null ? null : checkoutErrorMessage(error)}
          />
        </div>
      )}
    </div>
  )
}