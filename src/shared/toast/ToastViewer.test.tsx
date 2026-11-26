import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { showToast, TOAST_LEAVE_MS, TOAST_VISIBLE_MS } from './toastStore'
import { ToastViewer } from './ToastViewer'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

const region = () => screen.getByRole('status', { name: '通知' })

describe('ToastViewer', () => {
  it('最初は、領域だけがあり、中身は空', () => {
    render(<ToastViewer />)

    expect(region()).toBeEmptyDOMElement()
  })

  it('showToastで表示され、3秒後に消える動きになり、その後に取り除かれる', () => {
    render(<ToastViewer />)

    act(() => {
      showToast('商品をカートに追加しました')
    })
    expect(region()).toHaveTextContent('商品をカートに追加しました')

    act(() => {
      vi.advanceTimersByTime(TOAST_VISIBLE_MS)
    })
    expect(region()).toHaveTextContent('商品をカートに追加しました')

    act(() => {
      vi.advanceTimersByTime(TOAST_LEAVE_MS)
    })
    expect(region()).toBeEmptyDOMElement()
  })

  it('新しい通知に置き換わる', () => {
    render(<ToastViewer />)

    act(() => {
      showToast('A')
      showToast('B')
    })

    expect(region()).toHaveTextContent('B')
    expect(region()).not.toHaveTextContent('A')
  })

  it('エラーの通知は、toneがerror', () => {
    render(<ToastViewer />)

    act(() => {
      showToast('容量がいっぱいです', 'error')
    })

    expect(screen.getByText('容量がいっぱいです')).toHaveAttribute('data-tone', 'error')
  })
})