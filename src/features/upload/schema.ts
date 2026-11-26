import { z } from 'zod'
import { LIMITS } from '@/shared/constants'

const numberFormatter = new Intl.NumberFormat('ja-JP')

/** 全角の数字を半角にし、カンマを取り除く(日本語入力で打った数字も受け付ける) */
export function normalizeNumberInput(value: string): string {
  return value
    .trim()
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[,，]/g, '')
}

function integerField(emptyMessage: string, rangeMessage: string, min: number, max: number) {
  return z
    .string()
    .min(1, emptyMessage)
    .regex(/^\d+$/, rangeMessage)
    .transform(Number)
    .pipe(z.number().min(min, rangeMessage).max(max, rangeMessage))
}

export const uploadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(LIMITS.itemName.min, '商品名を入力してください')
    .max(LIMITS.itemName.max, `${LIMITS.itemName.max}文字以内で入力してください`),
  price: integerField(
    '価格を入力してください',
    `価格は${LIMITS.priceYen.min}〜${numberFormatter.format(LIMITS.priceYen.max)}円の整数で入力してください`,
    LIMITS.priceYen.min,
    LIMITS.priceYen.max,
  ),
  quantity: integerField(
    '個数を入力してください',
    `個数は${LIMITS.quantity.min}〜${LIMITS.quantity.max}の整数で入力してください`,
    LIMITS.quantity.min,
    LIMITS.quantity.max,
  ),
})

/** 入力欄の中身(すべて文字列) */
export type UploadFormInput = { name: string; price: string; quantity: string }
export type UploadFormValue = { name: string; priceYen: number; quantity: number }
export type UploadFormErrors = Partial<Record<keyof UploadFormInput, string>>

export type ParseResult =
  | { ok: true; value: UploadFormValue }
  | { ok: false; errors: UploadFormErrors }

/** 入力欄の文字列を検証して、数値に直す。失敗したときは、項目ごとの最初のエラーを返す */
export function parseUploadForm(input: UploadFormInput): ParseResult {
  const result = uploadFormSchema.safeParse({
    name: input.name,
    price: normalizeNumberInput(input.price),
    quantity: normalizeNumberInput(input.quantity),
  })

  if (result.success) {
    const { name, price, quantity } = result.data
    return { ok: true, value: { name, priceYen: price, quantity } }
  }

  const errors: UploadFormErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if ((key === 'name' || key === 'price' || key === 'quantity') && errors[key] === undefined) {
      errors[key] = issue.message
    }
  }
  return { ok: false, errors }
}