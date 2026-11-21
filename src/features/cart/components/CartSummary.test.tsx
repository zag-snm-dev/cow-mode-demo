import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CartSummary } from './CartSummary'

describe('CartSummary', () => {
  it('点数・合計・利用上限(∞)を表示する', () => {
    render(<CartSummary count={3} totalYen={3800} />)

    expect(screen.getByRole('region', { name: 'お支払い' })).toBeInTheDocument()
    expect(screen.getByText('3点')).toBeInTheDocument()
    expect(screen.getByText('¥3,800')).toBeInTheDocument()
    expect(screen.getByText('∞')).toBeInTheDocument()
  })

  it('使用カードが渡されたら、「使用カード」と一緒に表示する', () => {
    render(<CartSummary count={1} totalYen={100} cardPreview={<p>カード表示</p>} />)

    expect(screen.getByText('使用カード')).toBeInTheDocument()
    expect(screen.getByText('カード表示')).toBeInTheDocument()
  })

  it('使用カードがなければ、「使用カード」を出さない', () => {
    render(<CartSummary count={1} totalYen={100} />)

    expect(screen.queryByText('使用カード')).not.toBeInTheDocument()
  })

  it('onCheckoutがなければ、決済ボタンを押せない', () => {
    render(<CartSummary count={1} totalYen={100} />)

    expect(screen.getByRole('button', { name: '決済する' })).toBeDisabled()
  })

  it('onCheckoutがあれば、決済ボタンを押すと呼ばれる', async () => {
    const user = userEvent.setup()
    const onCheckout = vi.fn()
    render(<CartSummary count={1} totalYen={100} onCheckout={onCheckout} />)

    await user.click(screen.getByRole('button', { name: '決済する' }))

    expect(onCheckout).toHaveBeenCalledTimes(1)
  })
})