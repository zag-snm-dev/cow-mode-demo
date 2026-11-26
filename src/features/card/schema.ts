import { z } from 'zod'
import { LIMITS } from '@/shared/constants'

/** カードの名前 / ニックネーム(前後の空白を除いて1〜20字) */
export const cardNameSchema = z
  .string()
  .trim()
  .min(LIMITS.cardName.min, '名前を入力してください')
  .max(LIMITS.cardName.max, `${LIMITS.cardName.max}文字以内で入力してください`)