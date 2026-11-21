import type { NewCartItem } from '@/shared/storage/schema'
import { useStorage } from '@/shared/storage/useStorage'

type Props = {
  /** カートの1行、または履歴の商品(個数があってもなくてもよい) */
  item: NewCartItem
  className?: string
}

/** 商品の画像を表示する。API商品はURL、アップロード品は保存済みの画像を使う */
export function ItemImage({ item, className = '' }: Props) {
  const { images } = useStorage('images')
  const src = item.source === 'api' ? item.imageUrl : (images[item.imageId] ?? null)

  if (src === null) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center justify-center bg-ink text-xs text-ivory/60 ${className}`}
      >
        画像なし
      </div>
    )
  }

  // すぐ近くに商品名の文字があるので、画像は飾りとして扱う(alt を空にする)
  return <img src={src} alt="" loading="lazy" className={`bg-ink object-cover ${className}`} />
}