type Props = {
  src: string | null
  alt: string
}

export function ScreenshotFrame({ src, alt }: Props) {
  if (src === null) {
    return (
      <div
        aria-hidden="true"
        className="flex aspect-video items-center justify-center rounded-card border border-dashed border-gold bg-surface text-xs text-gold"
      >
        スクリーンショット(仮画像)
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-auto w-full rounded-card border border-gold/40"
    />
  )
}