type Props = {
  /** 商品名(読み上げ用) */
  label: string
  value: number
  min: number
  max: number
  onChange: (next: number) => void
}

const buttonClass =
  'inline-flex size-11 items-center justify-center rounded-lg border border-gold text-lg font-bold ' +
  'text-gold hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink'

export function QuantityStepper({ label, value, min, max, onChange }: Props) {
  return (
    <div className="grid gap-1">
      <div role="group" aria-label={`${label}の数量`} className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label}の数量を減らす`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={buttonClass}
        >
          −
        </button>
        <span aria-live="polite" className="min-w-10 text-center text-lg font-bold">
          {value}
        </span>
        <button
          type="button"
          aria-label={`${label}の数量を増やす`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={buttonClass}
        >
          +
        </button>
      </div>
      {value >= max && <p className="text-xs text-pink">上限の{max}個です</p>}
    </div>
  )
}