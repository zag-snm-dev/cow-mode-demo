export const USD_TO_JPY_RATE = 150

/** 入力値の上限・下限 */
export const LIMITS = {
  /** 価格(円) */
  priceYen: { min: 1, max: 9_999_999_999 },
  /** 1商品あたりの個数 */
  quantity: { min: 1, max: 99 },
  /** 保存できる画像の総数(履歴が参照している分も含む) */
  imageCount: 50,
  /** カードの名前 / ニックネームの文字数 */
  cardName: { min: 1, max: 10 },
  /** アップロード商品の名前の文字数 */
  itemName: { min: 1, max: 20 },
  /** 外部API(DummyJSON)の商品名の文字数。入力欄の上限(itemName)とは別に、広くとる */
  apiItemName: { min: 1, max: 200 },
  /** 読み込み前のファイルサイズ上限(5MB) */
  fileSizeBytes: 5 * 1024 * 1024,
} as const

/** 画像の保存設定 */
export const IMAGE = {
  /** 縦横のピクセル数(300x300) */
  size: 300,
  /** JPEGの品質(0〜1) */
  jpegQuality: 0.7,
} as const

/** お買い物ページで1回に表示する商品数 */
export const PRODUCTS_PER_PAGE = 5

/** 画面に出す文言 */
export const MESSAGES = {
  noHistory: '履歴はありません。商品の決済をしてみましょう',
  addedToCart: '商品をカートに追加しました',
  quantityLimit: `1商品あたり${LIMITS.quantity.max}個までです`,
  addFailed: '追加できませんでした。もう一度お試しください',
  imageLimit: `保存できる画像は${LIMITS.imageCount}枚までです`,
} as const