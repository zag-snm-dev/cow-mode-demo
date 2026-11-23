import { IMAGE, LIMITS } from '@/shared/constants'
import { NEED_CARD_COPY } from '@/features/card/content'

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
    screenshot: { src: null, alt: 'カード作成画面のスクリーンショット' },
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
    screenshot: { src: null, alt: '商品のアップロード画面のスクリーンショット' },
  },
  {
    id: 'checkout',
    title: '決済して物欲を解放',
    description: 'カート画面で内容を確認して決済して、物欲を解放してください。',
    notes: [],
    screenshot: { src: null, alt: 'カート画面のスクリーンショット' },
  },
]