import type { Card } from '@/shared/storage/schema'
import { loadLatest, save } from '@/shared/storage/storage'
import { useStorage } from '@/shared/storage/useStorage'

/** 保存されているカード(未作成ならnull)。変更されると自動で再描画される */
export function useCard(): Card | null {
  return useStorage('main').card
}

/** カードを保存する。カートや履歴など、他のデータはそのまま残す */
export function saveCard(card: Card): void {
  save('main', { ...loadLatest('main'), card })
}