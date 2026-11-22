import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PAYMENT_DELAY_MS } from '@/shared/constants'
import { simulatePayment } from './simulatePayment'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('simulatePayment', () => {
  it('指定した時間が過ぎるまで、終わらない', async () => {
    const done = vi.fn()
    void simulatePayment(500).then(done)

    await vi.advanceTimersByTimeAsync(499)
    expect(done).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(done).toHaveBeenCalledTimes(1)
  })

  it('時間を省略すると、1秒待つ', async () => {
    const done = vi.fn()
    void simulatePayment().then(done)

    await vi.advanceTimersByTimeAsync(PAYMENT_DELAY_MS - 1)
    expect(done).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(done).toHaveBeenCalledTimes(1)
  })
})