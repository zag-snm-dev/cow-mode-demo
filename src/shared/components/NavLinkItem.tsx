import { NavLink } from 'react-router'

type Props = {
  to: string
  label: string
  /** バッジに出す数。0なら出さない */
  count?: number
  variant: 'header' | 'tab'
}

const base =
  'inline-flex items-center justify-center gap-1.5 font-bold ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink'

const variants = {
  header: 'min-h-11 rounded-pill px-3 text-sm',
  tab: 'min-h-14 flex-1 text-xs',
} as const

export function NavLinkItem({ to, label, count = 0, variant }: Props) {
  const ariaLabel = count > 0 ? `${label} ${count}点` : label

  return (
    <NavLink
      to={to}
      aria-label={ariaLabel}
      className={({ isActive }) =>
        `${base} ${variants[variant]} ${
          isActive ? 'text-gold underline underline-offset-2' : 'text-ivory hover:text-gold'
        }`
      }
    >
      {label}
      {count > 0 && (
        <span
          aria-hidden="true"
          className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pink px-1 text-xs text-ink"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </NavLink>
  )
}