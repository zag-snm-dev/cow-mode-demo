export type ButtonVariant = 'primary' | 'secondary'

const base =
  'inline-flex min-h-11 items-center justify-center rounded-pill px-6 font-bold ' +
  'transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-ink hover:brightness-110',
  secondary: 'border border-gold text-gold hover:bg-surface',
}

export function buttonClass(variant: ButtonVariant = 'primary', extra = ''): string {
  return `${base} ${variants[variant]} ${extra}`.trim()
}