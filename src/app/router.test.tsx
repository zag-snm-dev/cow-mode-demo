import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MESSAGES } from '@/shared/constants'
import { createInitialMain, type CartItem, type Order } from '@/shared/storage/schema'
import { save } from '@/shared/storage/storage'
import { sampleApiItem, sampleCard, sampleOrder, sampleUploadItem } from '@/test/fixtures'
import { renderApp } from '@/test/renderApp'

type Seed = { card?: boolean; cart?: CartItem[]; history?: Order[] }

/** 保存データを用意してから、画面を描画する */
function seed({ card = false, cart = [], history = [] }: Seed = {}) {
  save('main', { ...createInitialMain(), card: card ? sampleCard : null, cart, history })
}

describe('アクセス制御', () => {
  it('カード未作成:/ ではトップを表示する', () => {
    const { router } = renderApp('/')

    expect(screen.getByRole('button', { name: 'カードを作成する' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('カード作成済み:/ から /shop へ移る', async () => {
    seed({ card: true })
    const { router } = renderApp('/')

    expect(await screen.findByRole('heading', { name: 'お買い物' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/shop')
  })

  it.each(['/shop', '/cart'])(
    'カード未作成:%s ではカード作成を促し、トップへのリンクを出す(自動では移動しない)',
    (path) => {
      const { router } = renderApp(path)

      expect(screen.getByRole('heading', { name: 'カードを作成してください' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'トップページへ' })).toHaveAttribute('href', '/')
      expect(router.state.location.pathname).toBe(path)
    },
  )

  it('カード未作成でも /mypage は表示する', () => {
    renderApp('/mypage')

    expect(screen.getByRole('heading', { name: 'マイページ' })).toBeInTheDocument()
  })

  it('カード作成済み:/shop と /cart を表示する', () => {
    seed({ card: true })

    renderApp('/shop')
    expect(screen.getByRole('heading', { name: 'お買い物' })).toBeInTheDocument()
  })

  it('カード作成済み:/cart を表示する', () => {
    seed({ card: true })

    renderApp('/cart')

    expect(screen.getByRole('heading', { name: 'カート' })).toBeInTheDocument()
  })

  it('カード作成済み・履歴なし:/complete は /shop に移り、お知らせを表示する', async () => {
    seed({ card: true })
    const { router } = renderApp('/complete')

    expect(await screen.findByRole('heading', { name: 'お買い物' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/shop')
    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.noHistory)
  })

  it('お知らせは「閉じる」で消える', async () => {
    const user = userEvent.setup()
    seed({ card: true })
    renderApp('/complete')
    await screen.findByRole('status')

    await user.click(screen.getByRole('button', { name: '閉じる' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('カード作成済み・履歴あり:/complete を表示する', () => {
    seed({ card: true, history: [sampleOrder] })

    renderApp('/complete')

    expect(screen.getByRole('heading', { name: '決済が完了しました' })).toBeInTheDocument()
  })

  it('カード未作成:/complete もカード作成を促す', () => {
    renderApp('/complete')

    expect(screen.getByRole('heading', { name: 'カードを作成してください' })).toBeInTheDocument()
  })

  it('存在しないURLは404を表示する', () => {
    renderApp('/no-such-page')

    expect(screen.getByRole('heading', { name: 'ページが見つかりません' })).toBeInTheDocument()
  })
})

describe('Layout', () => {
  it('カード未作成:ナビを出さない', () => {
    renderApp('/')

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('カード作成済み:ヘッダーのナビと、下部のタブバーを出す', () => {
    seed({ card: true })

    renderApp('/shop')

    expect(screen.getByRole('navigation', { name: 'メイン' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'タブ' })).toBeInTheDocument()
  })

  it('今のページのリンクに、aria-current が付く', () => {
    seed({ card: true })

    renderApp('/shop')

    const links = screen.getAllByRole('link', { name: 'お買い物' })
    links.forEach((link) => expect(link).toHaveAttribute('aria-current', 'page'))
  })

  it('カートの数量バッジは、数量の合計(2 + 1 = 3)', () => {
    seed({ card: true, cart: [sampleApiItem, sampleUploadItem] })

    renderApp('/shop')

    expect(screen.getAllByRole('link', { name: 'カート 3点' })).toHaveLength(2)
  })

  it('カートが空のときは、バッジを出さない', () => {
    seed({ card: true })

    renderApp('/shop')

    expect(screen.getAllByRole('link', { name: 'カート' })).toHaveLength(2)
  })

  it('ロゴのリンク先は、カードの有無で変わる', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: 'COW MODE' })).toHaveAttribute('href', '/')
  })

  it('ロゴのリンク先は、カード作成済みなら /shop', () => {
    seed({ card: true })

    renderApp('/shop')

    expect(screen.getByRole('link', { name: 'COW MODE' })).toHaveAttribute('href', '/shop')
  })
})