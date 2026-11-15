import type { HowToStep } from '../content'
import { ScreenshotFrame } from './ScreenshotFrame'

type Props = {
  /** 1から始まる番号(画面の丸いバッジに表示する) */
  number: number
  step: HowToStep
}

export function HowToBlock({ number, step }: Props) {
  return (
    <li className="grid items-center gap-4 md:grid-cols-2">
      <div className="grid gap-3">
        <div className="flex items-center gap-3">
          {/* 番号は<ol>が伝えるので、バッジは読み上げない */}
          <span
            aria-hidden="true"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-ink"
          >
            {number}
          </span>
          <h3 className="text-lg">{step.title}</h3>
        </div>

        <p>{step.description}</p>

        {step.notes.length > 0 && (
          <div className="grid gap-1 rounded-card bg-surface p-3 text-sm">
            <p className="font-bold text-pink">注意事項</p>
            <ul className="grid gap-1 text-ivory/80">
              {step.notes.map((note) => (
                <li key={note} className="before:content-['・']">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ScreenshotFrame src={step.screenshot.src} alt={step.screenshot.alt} />
    </li>
  )
}