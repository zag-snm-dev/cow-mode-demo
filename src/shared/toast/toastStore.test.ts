import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  dismissToast,
  getToast,
  showToast,
  subscribeToast,
  TOAST_LEAVE_MS,
  TOAST_VISIBLE_MS,
} from './toastStore'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('showToast', () => {
  it('表示し、3秒後に消える動きになり、さらに0.2秒後に消える', () => {
    showToast('追加しました')
    expect(getToast()).toMatchObject({ message: '追加しました', tone: 'success', phase: 'visible' })

    vi.advanceTimersByTime(TOAST_VISIBLE_MS - 1)
    expect(getToast()?.phase).toBe('visible')

    vi.advanceTimersByTime(1)
    expect(getToast()?.phase).toBe('leaving')

    vi.advanceTimersByTime(TOAST_LEAVE_MS)
    expect(getToast()).toBeNull()
  })

  it('toneを指定できる', () => {
    showToast('失敗しました', 'error')

    expect(getToast()?.tone).toBe('error')
  })

  it('新しい通知は古い通知を置き換え、時間も数え直す', () => {
    showToast('A')
    vi.advanceTimersByTime(2000)

    showToast('B')
    vi.advanceTimersByTime(2000)
    expect(getToast()).toMatchObject({ message: 'B', phase: 'visible' })

    vi.advanceTimersByTime(1000)
    expect(getToast()?.phase).toBe('leaving')
  })

  it('通知ごとに、idが増える', () => {
    showToast('A')
    const first = getToast()?.id

    showToast('A')

    expect(getToast()?.id).toBeGreaterThan(first ?? 0)
  })
})

describe('dismissToast', () => {
  it('すぐに消し、その後はタイマーが動かない', () => {
    showToast('A')

    dismissToast()
    expect(getToast()).toBeNull()

    vi.advanceTimersByTime(TOAST_VISIBLE_MS + TOAST_LEAVE_MS)
    expect(getToast()).toBeNull()
  })

  it('何も出ていないときに呼んでも、通知しない', () => {
    const listener = vi.fn()
    subscribeToast(listener)

    dismissToast()

    expect(listener).not.toHaveBeenCalled()
  })
})

describe('subscribeToast', () => {
  it('変化のたびに通知され、解除すると通知されない', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToast(listener)

    showToast('A')
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    showToast('B')
    expect(listener).toHaveBeenCalledTimes(1)
  })
})