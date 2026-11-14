import type { Card } from '@/shared/storage/schema'
import { cardNameSchema } from './schema'

type CreateCardInput = {
  name: string
  /** 作成済みのカード番号(モーダルでプレビュー表示した番号をそのまま使う) */
  number: string
  /** 作成日時(ミリ秒)。省略すると今の時刻 */
  now?: number
}

/** 名前を検証して、保存用のCardを作る。名前が不正なら例外を投げる */
export function createCard({ name, number, now }: CreateCardInput): Card {
  return {
    name: cardNameSchema.parse(name),
    number,
    createdAt: now ?? Date.now(),
  }
}