import { CowImage } from '@/shared/components/CowImage'
import { HERO_COPY } from '../content'

export function Hero() {
  return (
    <section className="grid items-center gap-6 py-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:py-10">
      {/* 文字:狭いときは中央、広いときは左寄せ */}
      <div className="grid justify-items-center gap-4 text-center lg:justify-items-start lg:text-left">
        <h1 className="text-4xl tracking-wide md:text-5xl">{HERO_COPY.title}</h1>
        <span aria-hidden="true" className="h-px w-16 bg-gold" />
        <p className="text-lg leading-relaxed md:text-xl">
          {HERO_COPY.leadLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      {/* 牛:狭いときは、文字より上に出す */}
      <div className="relative isolate order-first flex justify-center lg:order-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 -z-10 rounded-full bg-gold/30 blur-3xl"
        />
        <CowImage variant="front" priority className="w-48 sm:w-60 lg:w-full lg:max-w-sm" />
      </div>
    </section>
  )
}
