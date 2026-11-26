/** スクリーンショットの大きさ(4:3)。読み込み前から場所を確保して、周りの文字がずれないようにする */
const SIZE = { width: 1200, height: 900 } as const

type Props = {
  src: string | null
  alt: string
}

export function ScreenshotFrame({ src, alt }: Props) {
  if (src === null) {
    return (
      <div
        aria-hidden="true"
        className="flex aspect-4/3 items-center justify-center rounded-card border border-dashed border-gold bg-surface text-xs text-gold"
      >
        スクリーンショット(仮画像)
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={SIZE.width}
      height={SIZE.height}
      loading="lazy"
      decoding="async"
      className="h-auto w-full rounded-card border border-gold/40"
    />
  )
}