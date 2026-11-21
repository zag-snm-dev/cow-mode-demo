import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { sampleApiItem } from '@/test/fixtures'
import { CartItemRow } from './CartItemRow'

function setup() {
  const onChangeQuantity = vi.fn()
  const onRemove = vi.fn()
  render(
    <ul>
      <CartItemRow item={sampleApiItem} onChangeQuantity={onChangeQuantity} onRemove={onRemove} />
    </ul>,
  )
  return { user: userEvent.setup(), onChangeQuantity, onRemove }
}

describe('CartItemRow', () => {
  it('商品名・単価・小計(単価×数量)・数量を表示する', () => {
    setup()

    expect(screen.getByRole('heading', { name: 'テスト商品1' })).toBeInTheDocument()
    expect(screen.getByText('単価 ¥1,500')).toBeInTheDocument()
    expect(screen.getByText('¥3,000')).toBeInTheDocument() // 1,500円 x 2
    expect(screen.getByRole('group', { name: 'テスト商品1の数量' })).toHaveTextContent('2')
  })

  it('「+」「−」で、その行のidと新しい数量を渡す', async () => {
    const { user, onChangeQuantity } = setup()

    await user.click(screen.getByRole('button', { name: 'テスト商品1の数量を増やす' }))
    await user.click(screen.getByRole('button', { name: 'テスト商品1の数量を減らす' }))

    expect(onChangeQuantity).toHaveBeenNthCalledWith(1, 'api:1', 3)
    expect(onChangeQuantity).toHaveBeenNthCalledWith(2, 'api:1', 1)
  })

  it('「削除」で、その行のidを渡す', async () => {
    const { user, onRemove } = setup()

    await user.click(screen.getByRole('button', { name: 'テスト商品1をカートから削除' }))

    expect(onRemove).toHaveBeenCalledWith('api:1')
  })
})