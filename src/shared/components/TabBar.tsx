import { NAV_ITEMS } from './navItems'
import { NavLinkItem } from './NavLinkItem'

type Props = {
  cartCount: number
}

export function TabBar({ cartCount }: Props) {
  return (
    <nav
      aria-label="タブ"
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-gold/30 bg-ink pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map((item) => (
        <NavLinkItem
          key={item.to}
          {...item}
          count={item.to === '/cart' ? cartCount : 0}
          variant="tab"
        />
      ))}
    </nav>
  )
}