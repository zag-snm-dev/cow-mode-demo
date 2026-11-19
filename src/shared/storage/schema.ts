import { z } from 'zod'
import { LIMITS } from '@/shared/constants'

/** 保存データの形式の版。形式を変えたら上げる */
export const STORAGE_VERSION = 1

const priceYenSchema = z.number().int().min(LIMITS.priceYen.min).max(LIMITS.priceYen.max)
const quantitySchema = z.number().int().min(LIMITS.quantity.min).max(LIMITS.quantity.max)

/** カード(表の名前と、裏の番号) */
export const cardSchema = z.object({
  name: z.string().min(LIMITS.cardName.min).max(LIMITS.cardName.max),
  number: z.string().regex(/^\d{5}-\d{7}-\d{5}$/),
  createdAt: z.number().int().nonnegative(),
})

export const httpsUrlSchema = z
  .url()
  .refine((url) => url.startsWith('https://'), 'https のURLだけを受け付ける')

const lineBase = {
  /** 行のID。API商品は `api:商品ID`、アップロード品は `upload:UUID` にする */
  id: z.string().min(1),
  priceYen: priceYenSchema,
  quantity: quantitySchema,
}

const apiItemSchema = z.object({
  ...lineBase,
  source: z.literal('api'),
  /** 外部APIの商品名は20字を超えることがあるため、上限を広くとる */
  name: z.string().min(LIMITS.apiItemName.min).max(LIMITS.apiItemName.max),
  imageUrl: httpsUrlSchema,
})

const uploadItemSchema = z.object({
  ...lineBase,
  source: z.literal('upload'),
  name: z.string().min(LIMITS.itemName.min).max(LIMITS.itemName.max),
  /** `app:images` の画像ID */
  imageId: z.string().min(1),
})

/** カートの1行。履歴(Order)の商品も同じ形で持つ */
export const cartItemSchema = z.discriminatedUnion('source', [apiItemSchema, uploadItemSchema])

export const orderSchema = z.object({
  id: z.string().min(1),
  paidAt: z.number().int().nonnegative(),
  items: z.array(cartItemSchema).min(1),
  totalYen: z.number().int().nonnegative(),
})

/** `app:main` に保存する内容 */
export const mainStateSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  card: cardSchema.nullable(),
  cart: z.array(cartItemSchema),
  history: z.array(orderSchema),
})

/** 画像はCanvasで再エンコードしたJPEGのデータURLだけを受け付ける */
const jpegDataUrlSchema = z.string().startsWith('data:image/jpeg;base64,')

/** `app:images` に保存する内容(画像ID → データURL) */
export const imagesStateSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  images: z.record(z.string(), jpegDataUrlSchema),
})

export type Card = z.infer<typeof cardSchema>
export type CartItem = z.infer<typeof cartItemSchema>
export type Order = z.infer<typeof orderSchema>
export type MainState = z.infer<typeof mainStateSchema>
export type ImagesState = z.infer<typeof imagesStateSchema>

export function createInitialMain(): MainState {
  return { version: STORAGE_VERSION, card: null, cart: [], history: [] }
}

export function createInitialImages(): ImagesState {
  return { version: STORAGE_VERSION, images: {} }
}
