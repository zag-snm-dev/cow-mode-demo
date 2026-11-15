import { HERO_COPY } from '../content'

export function Hero() {
  return (
    <section className="grid items-center gap-6 py-6 md:grid-cols-2">
      <div className="grid gap-3">
        <h1 className="text-3xl md:text-4xl">{HERO_COPY.title}</h1>
        <p className="text-lg">{HERO_COPY.lead}</p>
      </div>

      {/* 牛キャラ(正面)の画像は、chore/assets-copy で差し替える */}
      <div
        aria-hidden="true"
        className="flex h-48 items-center justify-center rounded-card border border-dashed border-gold bg-surface text-xs text-gold"
      >
        牛キャラ(正面)・仮画像
      </div>
    </section>
  )
}