import { USD_TO_JPY_RATE } from './constants'

/** 半角の円記号(U+00A5) */
const YEN_SIGN = '\u00a5'

const numberFormatter = new Intl.NumberFormat('ja-JP')

/**
 * ドルの価格を円に換算し、四捨五入して整数にする。
 * 小数の誤差を避けるため、いったんセント(整数)にしてから計算する。
 */
export function usdToYen(usd: number, rate: number = USD_TO_JPY_RATE): number {
  const cents = Math.round(usd * 100)
  return Math.round((cents * rate) / 100)
}

/** 円の金額を「¥1,500」の形式の文字列にする */
export function formatYen(yen: number): string {
  return `${YEN_SIGN}${numberFormatter.format(yen)}`
}

/** 小計・合計の計算に必要な項目だけを持つ型 */
export type PricedLine = {
  priceYen: number
  quantity: number
}

/** 1行の小計(円単価 × 個数) */
export function calcSubtotal(line: PricedLine): number {
  return line.priceYen * line.quantity
}

/** 全行の合計 */
export function calcTotal(lines: readonly PricedLine[]): number {
  return lines.reduce((sum, line) => sum + calcSubtotal(line), 0)
}
