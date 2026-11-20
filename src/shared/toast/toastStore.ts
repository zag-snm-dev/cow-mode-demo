export type ToastTone = 'success' | 'error'

export type ToastState = {
  /** 通知ごとに増える番号。新しい通知を、別の要素として描画させるために使う */
  id: number
  message: string
  tone: ToastTone
  /** visible:表示中 / leaving:消える動きの最中 */
  phase: 'visible' | 'leaving'
}

/** 表示しておく時間 */
export const TOAST_VISIBLE_MS = 3000
/** 消える動きの時間(CSSの 0.2s に合わせる) */
export const TOAST_LEAVE_MS = 200

let state: ToastState | null = null
let nextId = 1
let leaveTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

function clearTimers(): void {
  clearTimeout(leaveTimer)
  clearTimeout(removeTimer)
}

export function getToast(): ToastState | null {
  return state
}

export function subscribeToast(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** 通知を出す。すでに出ているときは、置き換えて、時間を数え直す */
export function showToast(message: string, tone: ToastTone = 'success'): void {
  clearTimers()
  state = { id: nextId++, message, tone, phase: 'visible' }
  emit()

  leaveTimer = setTimeout(() => {
    if (state === null) return
    state = { ...state, phase: 'leaving' }
    emit()

    removeTimer = setTimeout(() => {
      state = null
      emit()
    }, TOAST_LEAVE_MS)
  }, TOAST_VISIBLE_MS)
}

/** 通知をすぐに消す */
export function dismissToast(): void {
  clearTimers()
  if (state === null) return
  state = null
  emit()
}

/** テスト専用:モジュール内の状態を最初に戻す */
export function resetToastForTests(): void {
  clearTimers()
  state = null
  nextId = 1
  listeners.clear()
}