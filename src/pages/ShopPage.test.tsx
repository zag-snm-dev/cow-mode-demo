import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MESSAGES } from '@/shared/constants'
import { createInitialMain } from '@/shared/storage/schema'
import { load, save } from '@/shared/storage/storage'
import { sampleCard } from '@/test/fixtures'
import { renderApp } from '@/test/renderApp'

const addButton = 'テスト商品1をカートに追加'

function seedCard() {
  save('main', { ...createInitialMain(), card: sampleCard })
}

describe('ShopPage(カートへの追加)', () => {
  it('追加すると、通知が出て、バッジが増え、カートに保存される', async () => {
    const user = userEvent.setup()
    seedCard()
    renderApp('/shop')

    await user.click(await screen.findByRole('button', { name: addButton }))

    expect(screen.getByRole('status', { name: '通知' })).toHaveTextContent(MESSAGES.addedToCart)
    expect(screen.getAllByRole('link', { name: 'カート 1点' })).toHaveLength(2)
    expect(load('main').cart).toEqual([
      {
        source: 'api',
        id: 'api:1',
        name: 'テスト商品1',
        priceYen: 1500,
        imageUrl: 'https://cdn.dummyjson.com/test/1.webp',
        quantity: 1,
      },
    ])
  })

  it('同じ商品をもう一度追加すると、数量が2になる', async () => {
    const user = userEvent.setup()
    seedCard()
    renderApp('/shop')
    const button = await screen.findByRole('button', { name: addButton })

    await user.click(button)
    await user.click(button)

    expect(screen.getAllByRole('link', { name: 'カート 2点' })).toHaveLength(2)
    expect(load('main').cart).toHaveLength(1)
    expect(load('main').cart[0].quantity).toBe(2)
  })

  it('別の商品を追加すると、行が増え、バッジは個数の合計になる', async () => {
    const user = userEvent.setup()
    seedCard()
    renderApp('/shop')

    await user.click(await screen.findByRole('button', { name: addButton }))
    await user.click(screen.getByRole('button', { name: 'テスト商品2をカートに追加' }))

    expect(load('main').cart).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'カート 2点' })).toHaveLength(2)
  })
})