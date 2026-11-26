import { Link } from 'react-router'
import { NAV_ITEMS } from './navItems'
import { NavLinkItem } from './NavLinkItem'

type Props = {
  hasCard: boolean
  cartCount: number
}

export function Header({ hasCard, cartCount }: Props) {
  return (
    <header className="border-b border-gold/30 bg-ink">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link
          to={hasCard ? '/shop' : '/'}
          className="font-serif text-lg font-bold text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
        >
          COW MODE
        </Link>

        {hasCard && (
          <nav aria-label="メイン" className="hidden items-center gap-2 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLinkItem
                key={item.to}
                {...item}
                count={item.to === '/cart' ? cartCount : 0}
                variant="header"
              />
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}