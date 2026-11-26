import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DISCLAIMER } from '@/features/top/content'
import { load } from '@/shared/storage/storage'
import { renderApp } from '@/test/renderApp'

const openButton = 'カードを作成する'
const nameLabel = '名前 / ニックネーム'
const submitName = '作成してお買い物へ'

describe('TopPage(表示)', () => {
  it('見出しと、キャッチコピーを表示する', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { level: 1, name: 'COW MODE' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '使い方' })).toBeInTheDocument()
    expect(screen.getByAltText('COW MODEのキャラクター(牛)')).toBeInTheDocument()
  })

  it('使い方を、3つのブロックで順に表示する', () => {
    renderApp('/')

    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)

    expect(titles).toEqual(['カードを作成', '欲しい商品をカートへ', '決済して物欲を解放'])
  })

  it('各ブロックに、スクリーンショットの画像を表示し、仮画像は残っていない', () => {
  renderApp('/')

  expect(screen.getAllByAltText(/スクリーンショット/)).toHaveLength(3)
  expect(screen.queryByText('スクリーンショット(仮画像)')).not.toBeInTheDocument()
})

  it('アップロードの注意事項を表示する', () => {
    renderApp('/')

    expect(screen.getByText('注意事項')).toBeInTheDocument()
    expect(screen.getByText('JPEG / PNG / WebP の画像(5MBまで)')).toBeInTheDocument()
    expect(screen.getByText('300x300に縮小して保存します')).toBeInTheDocument()
    expect(screen.getByText('保存できる画像は50枚までです')).toBeInTheDocument()
    expect(screen.getByText('商品名(20字まで)と価格の入力が必要です')).toBeInTheDocument()
  })

  it('「架空のカードです」の注意書きを表示する', () => {
    renderApp('/')

    expect(screen.getByText(DISCLAIMER)).toBeInTheDocument()
  })
})

describe('TopPage(カード作成の流れ)', () => {
  it('最初は、モーダルが閉じている', () => {
    renderApp('/')

    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')
  })

  it('「カードを作成する」を押すと、モーダルが開く', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: openButton }))

    expect(screen.getByRole('dialog', { name: 'カードを作成' })).toBeInTheDocument()
  })

  it('カードを作成すると、自動で /shop に移り、カードが保存される', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')

    await user.click(screen.getByRole('button', { name: openButton }))
    await user.type(screen.getByLabelText(nameLabel), 'TARO')
    await user.click(screen.getByRole('button', { name: submitName }))

    expect(await screen.findByRole('heading', { name: 'お買い物' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/shop')
    expect(load('main').card?.name).toBe('TARO')
  })

  it('「閉じる」でモーダルを閉じると、トップに残り、カードは作られない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')

    await user.click(screen.getByRole('button', { name: openButton }))
    await user.click(screen.getByRole('button', { name: '閉じる' }))

    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')
    expect(router.state.location.pathname).toBe('/')
    expect(load('main').card).toBeNull()
  })

  it('閉じて開き直すと、入力した内容は空に戻る', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: openButton }))
    await user.type(screen.getByLabelText(nameLabel), 'TARO')
    await user.click(screen.getByRole('button', { name: '閉じる' }))
    await user.click(screen.getByRole('button', { name: openButton }))

    expect(screen.getByLabelText(nameLabel)).toHaveValue('')
  })
})