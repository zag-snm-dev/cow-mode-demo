import { IMAGE, LIMITS } from '@/shared/constants'
import { NEED_CARD_COPY } from '@/features/card/content'
import addToCartShot from '@/assets/images/screenshots/how-to-2-add-to-cart.webp'
import checkoutShot from '@/assets/images/screenshots/how-to-3-checkout.webp'
import createCardShot from '@/assets/images/screenshots/how-to-1-create-card.webp'

export const HERO_COPY = {
  title: 'COW MODE',
  /** 1行ずつ区切って表示する(区切りの途中では、折り返さない) */
  leadLines: [
    '欲しい物を好きなだけカートへ。',
    '上限なしの架空カードで、',
    '物欲を思いきり解放しよう。',
  ],
} as const

export const DISCLAIMER = '架空のカードです。実際の決済は行われません'

export type HowToStep = {
  id: string
  title: string
  description: string
  /** 注意事項(ないときは空の配列) */
  notes: string[]
  /** src が null の間は、仮画像を表示する */
  screenshot: { src: string | null; alt: string }
}

const fileSizeMb = LIMITS.fileSizeBytes / (1024 * 1024)

export const HOW_TO_STEPS: HowToStep[] = [
  {
    id: 'create-card',
    title: 'カードを作成',
    description: NEED_CARD_COPY.description,
    notes: [],
    screenshot: {
      src: createCardShot,
      alt: 'カード作成画面のスクリーンショット。カードの表と裏の画像、名前の入力欄、作成ボタンが並んでいる。',
    },
  },
  {
    id: 'add-to-cart',
    title: '欲しい商品をカートへ',
    description: '欲しい商品の画像をアップロードしてカートに追加してください。',
    notes: [
      `JPEG / PNG / WebP の画像(${fileSizeMb}MBまで)`,
      `${IMAGE.size}x${IMAGE.size}に縮小して保存します`,
      `保存できる画像は${LIMITS.imageCount}枚までです`,
      `商品名(${LIMITS.itemName.max}字まで)と価格の入力が必要です`,
    ],
    screenshot: {
      src: addToCartShot,
      alt: '商品のアップロード画面のスクリーンショット。商品画像のアップロード欄、商品名と価格の入力欄、カートに追加ボタンが並んでいる。',
    },
  },
  {
    id: 'checkout',
    title: '決済して物欲を解放',
    description: 'カート画面で内容を確認して決済して、物欲を解放してください。',
    notes: [],
    screenshot: {
      src: checkoutShot,
      alt: 'カート画面のスクリーンショット。カートに入れた商品の一覧、合計金額、決済ボタンが表示されている。',
    },
  },
]
