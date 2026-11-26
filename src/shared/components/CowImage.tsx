import cowBow from '@/assets/images/cow-bow.png'
import cowFront from '@/assets/images/cow-front.png'

type Variant = 'front' | 'bow'

const IMAGES = {
  front: { src: cowFront, alt: 'COW MODEのキャラクター(牛)' },
  bow: { src: cowBow, alt: 'お辞儀をするCOW MODEのキャラクター(牛)' },
} as const

/** 画像の縦横の比(実際の画像の大きさに合わせる。比が分かれば、読み込み前に場所を確保できる) */
const SIZE = 800

type Props = {
  variant: Variant
  className?: string
  /** 画面の最初に見える場所の画像は、すぐに読み込む */
  priority?: boolean
}

export function CowImage({ variant, className = '', priority = false }: Props) {
  const { src, alt } = IMAGES[variant]

  return (
    <img
      src={src}
      alt={alt}
      width={SIZE}
      height={SIZE}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`h-auto ${className}`}
    />
  )
}