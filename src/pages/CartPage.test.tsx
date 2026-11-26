import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { simulatePayment } from '@/features/checkout/simulatePayment'
import { MESSAGES } from '@/shared/constants'
import { createInitialImages, createInitialMain, type CartItem } from '@/shared/storage/schema'
import { load, save } from '@/shared/storage/storage'
import { sampleApiItem, sampleCard, sampleDataUrl, sampleUploadItem } from '@/test/fixtures'
import { renderApp } from '@/test/renderApp'

vi.mock('@/features/checkout/simulatePayment', () => ({ simulatePayment: vi.fn() }))

const mockedPay = vi.mocked(simulatePayment)
let finishPayment: () => void = () => {}

beforeEach(() => {
  mockedPay.mockReset()
  // 決済の待ちを、テストが好きなタイミングで終わらせられるようにする
  mockedPay.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finishPayment = resolve
      }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('商品があれば、決済ボタンを押せる', () => {
  seed()
  renderApp('/cart')

  expect(screen.getByRole('button', { name: '決済する' })).toBeEnabled()
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
    expect(screen.getByAltText('COW MODEのキャラクター(牛)')).toBeInTheDocument()
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

describe('CartPage(決済)', () => {
  const payButton = () => screen.getByRole('button', { name: '決済する' })

  it('決済すると、処理中は操作できず、終わったら履歴に保存して /complete へ移る', async () => {
    const user = userEvent.setup()
    seed()
    const { router } = renderApp('/cart')

    await user.click(payButton())

    // 処理中:ボタンの表示が変わり、数量の変更と削除もできない。まだ保存されていない
    expect(await screen.findByRole('button', { name: '決済しています…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'テスト商品1の数量を増やす' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'テスト商品1をカートから削除' })).toBeDisabled()
    expect(load('main').history).toEqual([])

    await act(async () => {
      finishPayment()
    })

    expect(await screen.findByRole('heading', { name: '決済が完了しました' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/complete')
    expect(load('main').cart).toEqual([])
    expect(load('main').history).toHaveLength(1)
    expect(load('main').history[0]).toMatchObject({ totalYen: 3800 })
    // ヘッダーのカートのバッジも消えている
    expect(screen.getAllByRole('link', { name: 'カート' })).toHaveLength(2)
  })

  it('続けて2回押しても、決済は1回だけ', async () => {
    const user = userEvent.setup()
    seed()
    renderApp('/cart')

    await user.dblClick(payButton())
    await screen.findByRole('button', { name: '決済しています…' })
    await act(async () => {
      finishPayment()
    })
    await screen.findByRole('heading', { name: '決済が完了しました' })

    expect(mockedPay).toHaveBeenCalledTimes(1)
    expect(load('main').history).toHaveLength(1)
  })

  it('保存に失敗したら、エラーを表示し、カートは残り、直してからもう一度決済できる', async () => {
    const user = userEvent.setup()
    seed()
    const { router } = renderApp('/cart')
    const original = Storage.prototype.setItem
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(function (this: Storage, key: string, value: string) {
        if (key === 'app:main') throw new DOMException('quota', 'QuotaExceededError')
        original.call(this, key, value)
      })

    await user.click(payButton())
    await act(async () => {
      finishPayment()
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('容量がいっぱいで、決済できませんでした')
    expect(router.state.location.pathname).toBe('/cart')
    expect(load('main').cart).toHaveLength(2)
    expect(load('main').history).toEqual([])
    expect(payButton()).toBeEnabled()
    expect(screen.getByRole('heading', { name: 'テスト商品1' })).toBeInTheDocument()

    // 直してから、もう一度
    spy.mockRestore()
    await user.click(payButton())
    await act(async () => {
      finishPayment()
    })

    expect(await screen.findByRole('heading', { name: '決済が完了しました' })).toBeInTheDocument()
  })
})