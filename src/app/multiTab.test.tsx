import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createInitialImages, createInitialMain, type MainState } from '@/shared/storage/schema'
import { save } from '@/shared/storage/storage'
import { sampleApiItem, sampleCard, sampleDataUrl, sampleOrder, sampleUploadItem } from '@/test/fixtures'
import { clearFromOtherTab, writeFromOtherTab } from '@/test/otherTab'
import { renderApp } from '@/test/renderApp'
import { NEED_CARD_COPY } from '@/features/card/content'

const main = (overrides: Partial<MainState> = {}): MainState => ({
  ...createInitialMain(),
  ...overrides,
})

/** このタブの保存データを用意する */
function seed(overrides: Partial<MainState> = {}) {
  save('main', main(overrides))
}

/** 別のタブが書き込み、その通知が、このタブに届いた状態を再現する */
function fromOtherTab(overrides: Partial<MainState>) {
  act(() => {
    writeFromOtherTab('main', main(overrides))
  })
}

const summary = () => within(screen.getByRole('region', { name: 'お支払い' }))

describe('別のタブの変更が、画面に反映される', () => {
  it('M1:カード未作成のトップページは、別のタブでカードが作られると、お買い物ページに移る', async () => {
    const { router } = renderApp('/')
    expect(screen.getByRole('button', { name: 'カードを作成する' })).toBeInTheDocument()

    fromOtherTab({ card: sampleCard })

    expect(await screen.findByRole('heading', { name: 'お買い物' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/shop')
  })

  it('M1b:「カードを作成してください」の画面は、別のタブでカードが作られると、本来の画面に変わる', async () => {
    renderApp('/cart')
    expect(screen.getByRole('heading', { name: NEED_CARD_COPY.title })).toBeInTheDocument()

    fromOtherTab({ card: sampleCard })

    expect(await screen.findByText('カートは空です')).toBeInTheDocument()
  })

  it('M2:カートの数量バッジが、別のタブの追加・削除に合わせて変わる', () => {
    seed({ card: sampleCard })
    renderApp('/shop')
    expect(screen.getAllByRole('link', { name: 'カート' })).toHaveLength(2)

    fromOtherTab({ card: sampleCard, cart: [sampleApiItem] }) // 数量2
    expect(screen.getAllByRole('link', { name: 'カート 2点' })).toHaveLength(2)

    fromOtherTab({ card: sampleCard })
    expect(screen.getAllByRole('link', { name: 'カート' })).toHaveLength(2)
  })

  it('M3:カート画面が、別のタブの数量変更・削除に合わせて更新される', () => {
    seed({ card: sampleCard, cart: [sampleApiItem, sampleUploadItem] })
    renderApp('/cart')
    expect(summary().getByText('¥3,800')).toBeInTheDocument()

    fromOtherTab({ card: sampleCard, cart: [{ ...sampleApiItem, quantity: 5 }, sampleUploadItem] })
    expect(summary().getByText('¥8,300')).toBeInTheDocument() // 1,500円 x 5 + 800円

    fromOtherTab({ card: sampleCard, cart: [sampleUploadItem] })
    expect(screen.queryByRole('heading', { name: 'テスト商品1' })).not.toBeInTheDocument()
    expect(summary().getByText('¥800')).toBeInTheDocument()
  })

  it('M4:別のタブでアップロードした商品が、画像つきでカート画面に出る', () => {
    seed({ card: sampleCard })
    const { container } = renderApp('/cart')

    act(() => {
      writeFromOtherTab('images', { ...createInitialImages(), images: { 'img-1': sampleDataUrl } })
      writeFromOtherTab('main', main({ card: sampleCard, cart: [sampleUploadItem] }))
    })

    expect(screen.getByRole('heading', { name: '欲しい物' })).toBeInTheDocument()
    expect(container.querySelector(`img[src="${sampleDataUrl}"]`)).not.toBeNull()
  })

  it('M5:別のタブで決済されると、カートは空になり、マイページに履歴が出る', async () => {
    const user = userEvent.setup()
    seed({ card: sampleCard, cart: [sampleApiItem, sampleUploadItem] })
    renderApp('/cart')

    fromOtherTab({ card: sampleCard, cart: [], history: [sampleOrder] })

    expect(screen.getByText('カートは空です')).toBeInTheDocument()
    await user.click(screen.getAllByRole('link', { name: 'マイページ' })[0])
    const stats = within(await screen.findByRole('region', { name: '購入の集計' }))
    expect(stats.getByText('¥3,800')).toBeInTheDocument()
    expect(stats.getByText('1回')).toBeInTheDocument()
  })

  it('M7:別のタブでデータが全消去されると、カード作成を促す画面に変わる', () => {
    seed({ card: sampleCard })
    renderApp('/shop')
    expect(screen.getByRole('heading', { name: 'お買い物' })).toBeInTheDocument()

    act(() => {
      clearFromOtherTab()
    })

    expect(screen.getByRole('heading', { name: NEED_CARD_COPY.title })).toBeInTheDocument()
  })

  it('別のタブが壊れたデータを書いても、初期状態に戻り、壊れたデータは消える', () => {
    seed({ card: sampleCard })
    renderApp('/shop')

    act(() => {
      writeFromOtherTab('main', '{broken')
    })

    expect(screen.getByRole('heading', { name: NEED_CARD_COPY.title })).toBeInTheDocument()
    expect(localStorage.getItem('app:main')).toBeNull()
  })
})