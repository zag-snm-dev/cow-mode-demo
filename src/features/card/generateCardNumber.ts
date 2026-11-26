/** 乱数の取得元。Uint32Array を乱数で埋める(テストで差し替えられる) */
export type RandomSource = (array: Uint32Array<ArrayBuffer>) => unknown

const defaultRandomSource: RandomSource = (array) => globalThis.crypto.getRandomValues(array)

/** 5桁 + 7桁 + 5桁 */
const CARD_NUMBER_DIGITS = 17

/** 2^32 のうち、10で割り切れる範囲の上限(4294967290)。これ以上の値は捨てる(偏りを避けるため) */
const UNBIASED_LIMIT = 2 ** 32 - (2 ** 32 % 10)

/** 0〜9の数字を、偏りなく1つ返す */
function randomDigit(random: RandomSource): number {
  const buffer = new Uint32Array(1)

  for (;;) {
    random(buffer)
    const value = buffer[0]
    if (value < UNBIASED_LIMIT) return value % 10
  }
}

/** Luhn検算(クレジットカード番号の末尾の検査数字のしくみ)に通るか */
export function isLuhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false

  let sum = 0
  let doubled = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i])
    if (doubled) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    doubled = !doubled
  }

  return sum % 10 === 0
}

/** 17桁の数字を「12345-1234567-12345」の形にする */
export function formatCardNumber(digits: string): string {
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

/** 架空のカード番号(5-7-5の17桁、Luhn検算に通らない)を作る */
export function generateCardNumber(random: RandomSource = defaultRandomSource): string {
  const digits = Array.from({ length: CARD_NUMBER_DIGITS }, () => randomDigit(random))

  // 偶然Luhn検算に通ってしまったら、最後の1桁をずらして、必ず通らないようにする
  if (isLuhnValid(digits.join(''))) {
    const last = CARD_NUMBER_DIGITS - 1
    digits[last] = (digits[last] + 1) % 10
  }

  return formatCardNumber(digits.join(''))
}
