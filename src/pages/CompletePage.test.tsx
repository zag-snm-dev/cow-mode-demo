import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createInitialMain, type Order } from '@/shared/storage/schema'
import { save } from '@/shared/storage/storage'
import { sampleCard, sampleOrder } from '@/test/fixtures'
import { renderApp } from '@/test/renderApp'

function seed(history: Order[]) {
  save('main', { ...createInitialMain(), card: sampleCard, history })
}

describe('CompletePage', () => {
  it('完了メッセージ・決済額・点数・お辞儀の牛(仮枠)・トップへのリンクを表示する', () => {
    seed([sampleOrder])
    renderApp('/complete')

    expect(screen.getByRole('heading', { name: '決済が完了しました' })).toBeInTheDocument()
    expect(screen.getByText('¥3,800')).toBeInTheDocument()
    expect(screen.getByText('(3点)')).toBeInTheDocument() // 2個 + 1個
    expect(screen.getByText('牛キャラ(お辞儀)・仮画像')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'トップに戻る' })).toHaveAttribute('href', '/')
  })

  it('履歴が複数あるときは、いちばん新しい決済を表示する', () => {
    const older = { ...sampleOrder, id: 'older', paidAt: 1000, totalYen: 100 }
    const newer = { ...sampleOrder, id: 'newer', paidAt: 2000, totalYen: 3800 }
    seed([newer, older])
    renderApp('/complete')

    expect(screen.getByText('¥3,800')).toBeInTheDocument()
    expect(screen.queryByText('¥100')).not.toBeInTheDocument()
  })

  it('「トップに戻る」を押すと、お買い物ページに移る', async () => {
    const user = userEvent.setup()
    seed([sampleOrder])
    const { router } = renderApp('/complete')

    await user.click(screen.getByRole('link', { name: 'トップに戻る' }))

    expect(await screen.findByRole('heading', { name: 'お買い物' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/shop')
  })
})