import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetStorageForTests } from '@/shared/storage/storage'
import { sampleNewApiItem, sampleNewUploadItem } from '@/test/fixtures'
import { addToCart, removeFromCart } from './cartStore'
import { useCart } from './useCart'

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

function Summary() {
  const { items, count, totalYen } = useCart()
  return (
    <p>
      {items.length}行 / {count}点 / {totalYen}円
    </p>
  )
}

describe('useCart', () => {
  it('空のカートは、0行・0点・0円', () => {
    render(<Summary />)

    expect(screen.getByText('0行 / 0点 / 0円')).toBeInTheDocument()
  })

  it('追加・削除に合わせて、行数・個数・金額が変わる', () => {
    render(<Summary />)

    act(() => {
      addToCart(sampleNewApiItem, 2) // 1,500円 x 2
      addToCart(sampleNewUploadItem, 1) // 800円 x 1
    })
    expect(screen.getByText('2行 / 3点 / 3800円')).toBeInTheDocument()

    act(() => {
      removeFromCart(sampleNewApiItem.id)
    })
    expect(screen.getByText('1行 / 1点 / 800円')).toBeInTheDocument()
  })
})