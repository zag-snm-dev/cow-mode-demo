import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Product } from '../schema'
import { ProductCard } from './ProductCard'

const product: Product = {
  id: 1,
  title: 'テスト商品1',
  price: 10,
  thumbnail: 'https://cdn.dummyjson.com/test/1.webp',
}

describe('ProductCard', () => {
  it('商品名と、円に換算した価格を表示する(ドルは出さない)', () => {
    render(<ProductCard product={product} />)

    expect(screen.getByRole('heading', { name: 'テスト商品1' })).toBeInTheDocument()
    expect(screen.getByText('\u00a51,500')).toBeInTheDocument()
    expect(screen.queryByText(/\$|ドル/)).not.toBeInTheDocument()
  })

  it('画像は、飾りとして扱う(altが空)', () => {
    const { container } = render(<ProductCard product={product} />)

    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('onAddがないときは、追加ボタンを押せない', () => {
    render(<ProductCard product={product} />)

    expect(screen.getByRole('button', { name: 'テスト商品1をカートに追加' })).toBeDisabled()
  })

  it('追加ボタンを押すと、onAddが商品付きで呼ばれる', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<ProductCard product={product} onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: 'テスト商品1をカートに追加' }))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith(product)
  })
})