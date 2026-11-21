import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MESSAGES } from '@/shared/constants'
import { createInitialImages, createInitialMain, type CartItem } from '@/shared/storage/schema'
import { load, save } from '@/shared/storage/storage'
import { sampleApiItem, sampleCard, sampleDataUrl, sampleUploadItem } from '@/test/fixtures'
import { renderApp } from '@/test/renderApp'

function seed(cart: CartItem[] = [sampleApiItem, sampleUploadItem]) {
  save('images', { ...createInitialImages(), images: { 'img-1': sampleDataUrl } })
  save('main', { ...createInitialMain(), card: sampleCard, cart })
}

const summary = () => within(screen.getByRole('region', { name: 'お支払い' }))
const rowOf = (name: string) =>
  within(screen.getByRole('heading', { name }).closest('li') as HTMLElement)

describe('CartPage(表示)', () => {
  it('商品の行を表示する(単価・小計・数量)', () => {
    seed()
    renderApp('/cart')

    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    const first = rowOf('テスト商品1')
    expect(first.getByText('単価 ¥1,500')).toBeInTheDocument()
    expect(first.getByText('¥3,000')).toBeInTheDocument()
    expect(first.getByRole('group', { name: 'テスト商品1の数量' })).toHaveTextContent('2')

    const second = rowOf('欲しい物')
    expect(second.getByText('単価 ¥800')).toBeInTheDocument()
    expect(second.getByText('¥800')).toBeInTheDocument()
  })

  it('点数・合計・利用上限(∞)・使用カードを表示する', () => {
    seed()
    renderApp('/cart')

    expect(summary().getByText('3点')).toBeInTheDocument()
    expect(summary().getByText('¥3,800')).toBeInTheDocument()
    expect(summary().getByText('∞')).toBeInTheDocument()
    expect(summary().getByText('使用カード')).toBeInTheDocument()
    expect(summary().getByAltText('クレジットカード(表)')).toBeInTheDocument()
    expect(summary().getByText('TARO')).toBeInTheDocument()
  })

  it('アップロード商品は、保存済みの画像を表示する', () => {
    seed()
    const { container } = renderApp('/cart')

    expect(container.querySelector(`img[src="${sampleDataUrl}"]`)).not.toBeNull()
  })

  it('決済ボタンは、今は押せない(feature/checkout でつなぐ)', () => {
    seed()
    renderApp('/cart')

    expect(screen.getByRole('button', { name: '決済する' })).toBeDisabled()
  })
})

describe('CartPage(数量の変更)', () => {
  it('「+」で、小計・合計・点数・ヘッダーのバッジ・保存が更新される', async () => {
    const user = userEvent.setup()
    seed()
    renderApp('/cart')

    await user.click(screen.getByRole('button', { name: 'テスト商品1の数量を増やす' }))

    expect(rowOf('テスト商品1').getByText('¥4,500')).toBeInTheDocument()
    expect(summary().getByText('¥5,300')).toBeInTheDocument()
    expect(summary().getByText('4点')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'カート 4点' })).toHaveLength(2)
    expect(load('main').cart[0].quantity).toBe(3)
  })

  it('「−」で、数量が1減る', async () => {
    const user = userEvent.setup()
    seed()
    renderApp('/cart')

    await user.click(screen.getByRole('button', { name: 'テスト商品1の数量を減らす' }))

    expect(rowOf('テスト商品1').getByText('¥1,500')).toBeInTheDocument()
    expect(summary().getByText('¥2,300')).toBeInTheDocument()
    expect(load('main').cart[0].quantity).toBe(1)
  })

  it('数量1のときは、「−」が押せない', () => {
    seed()
    renderApp('/cart')

    expect(screen.getByRole('button', { name: '欲しい物の数量を減らす' })).toBeDisabled()
  })

  it('数量99のときは、「+」が押せず、上限の文を表示する', () => {
    seed([{ ...sampleApiItem, quantity: 99 }])
    renderApp('/cart')

    expect(screen.getByRole('button', { name: 'テスト商品1の数量を増やす' })).toBeDisabled()
    expect(screen.getByText('上限の99個です')).toBeInTheDocument()
  })
})

describe('CartPage(削除)', () => {
  it('削除すると、行が消え、合計・バッジ・保存が更新され、通知が出る', async () => {
    const user = userEvent.setup()
    seed()
    renderApp('/cart')

    await user.click(screen.getByRole('button', { name: 'テスト商品1をカートから削除' }))

    expect(screen.queryByRole('heading', { name: 'テスト商品1' })).not.toBeInTheDocument()
    expect(summary().getByText('1点')).toBeInTheDocument()
    expect(summary().getByText('¥800')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'カート 1点' })).toHaveLength(2)
    expect(load('main').cart).toHaveLength(1)
    expect(screen.getByRole('status', { name: '通知' })).toHaveTextContent(MESSAGES.removedFromCart)
  })

  it('アップロード商品を削除すると、使われなくなった画像も消える', async () => {
    const user = userEvent.setup()
    seed()
    renderApp('/cart')

    await user.click(screen.getByRole('button', { name: '欲しい物をカートから削除' }))

    expect(load('images').images).toEqual({})
  })

  it('すべて削除すると、空の表示になる', async () => {
    const user = userEvent.setup()
    seed()
    renderApp('/cart')

    await user.click(screen.getByRole('button', { name: 'テスト商品1をカートから削除' }))
    await user.click(screen.getByRole('button', { name: '欲しい物をカートから削除' }))

    expect(screen.getByText('カートは空です')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'お支払い' })).not.toBeInTheDocument()
  })
})

describe('CartPage(空のカート)', () => {
  it('カートが空のときは、牛キャラの仮枠と、お買い物へのリンクを表示する', () => {
    seed([])
    renderApp('/cart')

    expect(screen.getByText('カートは空です')).toBeInTheDocument()
    expect(screen.getByText('牛キャラ(正面)・仮画像')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'お買い物へ' })).toHaveAttribute('href', '/shop')
    expect(screen.queryByRole('button', { name: '決済する' })).not.toBeInTheDocument()
  })

  it('「お買い物へ」を押すと、/shop に移る', async () => {
    const user = userEvent.setup()
    seed([])
    const { router } = renderApp('/cart')

    await user.click(screen.getByRole('link', { name: 'お買い物へ' }))

    expect(router.state.location.pathname).toBe('/shop')
    expect(await screen.findByRole('heading', { name: 'お買い物' })).toBeInTheDocument()
  })
})