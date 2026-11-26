import { PAYMENT_DELAY_MS } from '@/shared/constants'

/** 疑似決済:実際には何もせず、指定した時間だけ待つ */
export function simulatePayment(delayMs: number = PAYMENT_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs)
  })
}