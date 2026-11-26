import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/renderWithProviders'
import { ProductSection } from './ProductSection'

const PRODUCTS_URL = 'https://dummyjson.com/products'
const failing = http.get(PRODUCTS_URL, () => new HttpResponse(null, { status: 500 }))
const moreButton = 'もっと見る'

describe('ProductSection(取得と表示)', () => {
  it('最初は読み込み中を表示し、取得できたら5件を表示する', async () => {
    renderWithProviders(<ProductSection />)

    expect(screen.getByRole('status')).toHaveTextContent('商品を読み込み中')

    expect(await screen.findByText('テスト商品1')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(5)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('価格は、円に換算して表示する(price 10 → ¥1,500)', async () => {
    renderWithProviders(<ProductSection />)

    expect(await screen.findByText('\u00a51,500')).toBeInTheDocument()
  })
})

describe('ProductSection(もっと見る)', () => {
  it('押すたびに5件ずつ増え、最後まで取ると、ボタンが消える', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductSection />)
    await screen.findByText('テスト商品1')

    await user.click(screen.getByRole('button', { name: moreButton }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10))

    await user.click(screen.getByRole('button', { name: moreButton }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(12))

    expect(screen.queryByRole('button', { name: moreButton })).not.toBeInTheDocument()
  })
})

describe('ProductSection(エラー)', () => {
  it('最初の取得に失敗したら、エラーと再試行ボタンを表示し、再試行で表示できる', async () => {
    const user = userEvent.setup()
    server.use(failing)
    renderWithProviders(<ProductSection />)

    expect(await screen.findByRole('alert')).toHaveTextContent('商品を取得できませんでした')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: '再試行' }))

    expect(await screen.findByText('テスト商品1')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('続きの取得に失敗しても、表示済みの商品は残り、もう一度押すと取得できる', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductSection />)
    await screen.findByText('テスト商品1')

    server.use(failing)
    await user.click(screen.getByRole('button', { name: moreButton }))

    expect(await screen.findByRole('alert')).toHaveTextContent('続きの商品を取得できませんでした')
    expect(screen.getAllByRole('article')).toHaveLength(5)

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: moreButton }))

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('ProductSection(カートへの追加)', () => {
  it('onAddがあれば、ボタンを押すと、その商品で呼ばれる', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithProviders(<ProductSection onAdd={onAdd} />)

    await user.click(await screen.findByRole('button', { name: 'テスト商品1をカートに追加' }))

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ id: 1, title: 'テスト商品1' }))
  })

  it('onAddがなければ、追加ボタンは押せない', async () => {
    renderWithProviders(<ProductSection />)

    expect(await screen.findByRole('button', { name: 'テスト商品1をカートに追加' })).toBeDisabled()
  })
})