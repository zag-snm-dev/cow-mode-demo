import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MYPAGE_COPY } from '@/features/history/content'
import { createInitialImages, createInitialMain, type Order } from '@/shared/storage/schema'
import { load, save } from '@/shared/storage/storage'
import { sampleApiItem, sampleCard, sampleDataUrl, sampleUploadItem } from '@/test/fixtures'
import { renderApp } from '@/test/renderApp'

// 3,000円(API商品 1,500円 x 2)の注文と、800円(アップロード商品)の注文
const orderA: Order = { id: 'a', paidAt: 1000, items: [sampleApiItem], totalYen: 3000 }
const orderB: Order = { id: 'b', paidAt: 2000, items: [sampleUploadItem], totalYen: 800 }

function seed({ card = true, history = [] as Order[] } = {}) {
  save('images', { ...createInitialImages(), images: { 'img-1': sampleDataUrl } })
  save('main', { ...createInitialMain(), card: card ? sampleCard : null, history })
}

const stats = () => within(screen.getByRole('region', { name: '購入の集計' }))

describe('MyPage(履歴がないとき)', () => {
  it('カードがあれば、カード表と名前を表示し、「購入履歴がありません」とリンクを出す', () => {
    seed()
    renderApp('/mypage')

    expect(screen.getByRole('heading', { name: 'マイページ' })).toBeInTheDocument()
    expect(screen.getByAltText('クレジットカード(表)')).toBeInTheDocument()
    expect(screen.getByText('TARO')).toBeInTheDocument()
    expect(screen.getByText(MYPAGE_COPY.emptyTitle)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: MYPAGE_COPY.emptyLink })).toHaveAttribute('href', '/')
    expect(screen.queryByText('総決済額')).not.toBeInTheDocument()
  })

  it('カード未作成でも表示でき、カードは出さずに、同じ案内を出す', () => {
    seed({ card: false })
    renderApp('/mypage')

    expect(screen.queryByAltText('クレジットカード(表)')).not.toBeInTheDocument()
    expect(screen.getByText(MYPAGE_COPY.emptyTitle)).toBeInTheDocument()
  })

  it('カード未作成の人がリンクを押すと、トップページ(カード作成)に移る', async () => {
    const user = userEvent.setup()
    seed({ card: false })
    const { router } = renderApp('/mypage')

    await user.click(screen.getByRole('link', { name: MYPAGE_COPY.emptyLink }))

    expect(router.state.location.pathname).toBe('/')
    expect(await screen.findByRole('button', { name: 'カードを作成する' })).toBeInTheDocument()
  })

  it('カード作成済みの人がリンクを押すと、お買い物ページに移る', async () => {
    const user = userEvent.setup()
    seed()
    const { router } = renderApp('/mypage')

    await user.click(screen.getByRole('link', { name: MYPAGE_COPY.emptyLink }))

    expect(await screen.findByRole('heading', { name: 'お買い物' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/shop')
  })
})

describe('MyPage(履歴があるとき)', () => {
  it('総決済額(履歴の合計)・決済回数・補足の一文を表示する', () => {
    seed({ history: [orderA, orderB] })
    renderApp('/mypage')

    expect(stats().getByText('¥3,800')).toBeInTheDocument() // 3,000円 + 800円
    expect(stats().getByText('2回')).toBeInTheDocument()
    expect(stats().getByText(MYPAGE_COPY.savedCaption)).toBeInTheDocument()
    expect(screen.queryByText(MYPAGE_COPY.emptyTitle)).not.toBeInTheDocument()
  })

  it('履歴を新しい順に一覧する', () => {
    seed({ history: [orderA, orderB] })
    renderApp('/mypage')

    expect(screen.getByRole('heading', { level: 2, name: '決済履歴' })).toBeInTheDocument()
    const rows = screen.getAllByRole('button', { name: /¥/ })
    expect(rows[0]).toHaveTextContent('¥800') // orderB(新しい)
    expect(rows[1]).toHaveTextContent('¥3,000') // orderA
  })

  it('履歴を開くと、画像・商品名・円単価×数量が見える', async () => {
    const user = userEvent.setup()
    seed({ history: [orderA, orderB] })
    const { container } = renderApp('/mypage')

    await user.click(screen.getAllByRole('button', { name: /¥/ })[0])

    expect(screen.getByText('欲しい物')).toBeVisible()
    expect(screen.getByText('¥800 × 1')).toBeVisible()
    expect(container.querySelector(`img[src="${sampleDataUrl}"]`)).not.toBeNull()
  })

  it('カード表と名前も、あわせて表示する', () => {
    seed({ history: [orderA] })
    renderApp('/mypage')

    expect(screen.getByAltText('クレジットカード(表)')).toBeInTheDocument()
    expect(screen.getByText('TARO')).toBeInTheDocument()
  })

  it('決済で履歴が増えると、開いたままでも、集計と一覧が自動で更新される', () => {
    seed({ history: [orderA] })
    renderApp('/mypage')
    expect(stats().getByText('1回')).toBeInTheDocument()

    act(() => {
      save('main', { ...load('main'), history: [orderA, orderB] })
    })

    expect(stats().getByText('2回')).toBeInTheDocument()
    expect(stats().getByText('¥3,800')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /¥/ })).toHaveLength(2)
  })
})