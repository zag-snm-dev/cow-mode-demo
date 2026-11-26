import { z } from 'zod'
import { LIMITS } from '@/shared/constants'
import { httpsUrlSchema } from '@/shared/storage/schema'

/** DummyJSONの商品。使う項目だけを定義し、ほかの項目は無視する */
export const productSchema = z.object({
  id: z.number().int(),
  title: z.string().min(LIMITS.apiItemName.min).max(LIMITS.apiItemName.max),
  /** ドル建て(小数あり)。画面に出すときに、円に換算する */
  price: z.number().nonnegative(),
  thumbnail: httpsUrlSchema,
})

/** 商品一覧の応答(`/products?limit=5&skip=0`) */
export const productsResponseSchema = z.object({
  products: z.array(productSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
})

export type Product = z.infer<typeof productSchema>
export type ProductsResponse = z.infer<typeof productsResponseSchema>