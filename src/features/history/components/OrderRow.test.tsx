import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createInitialImages } from '@/shared/storage/schema'
import { save } from '@/shared/storage/storage'
import { sampleDataUrl, sampleOrder } from '@/test/fixtures'
import { OrderRow } from './OrderRow'

function setup() {
  const user = userEvent.setup()
  const view = render(
    <ul>
      <OrderRow order={sampleOrder} />
    </ul>,
  )
  return { user, ...view }
}

const toggle = () => screen.getByRole('button', { name: /¥3,800/ })

describe('OrderRow(閉じた状態)', () => {
  it('日時・決済額・点数を表示し、中身は見えない', () => {
    const { container } = setup()

    const time = container.querySelector('time')
    expect(time).toHaveAttribute('datetime', '2023-11-14T22:15:00.000Z')
    expect(time?.textContent).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/)
    expect(screen.getByText('¥3,800')).toBeInTheDocument()
    expect(screen.getByText('(3点)')).toBeInTheDocument()

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('テスト商品1')).not.toBeVisible()
  })

  it('履歴の見出し(h3)の中にボタンがある', () => {
    setup()

    expect(screen.getByRole('heading', { level: 3, name: /¥3,800/ })).toContainElement(toggle())
  })
})

describe('OrderRow(開く)', () => {
  it('押すと、画像・名前・円単価×数量・小計が見える', async () => {
    const { user } = setup()

    await user.click(toggle())

    expect(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('テスト商品1')).toBeVisible()
    expect(screen.getByText('¥1,500 × 2')).toBeVisible()
    expect(screen.getByText('¥3,000')).toBeVisible() // 1,500円 x 2
    expect(screen.getByText('欲しい物')).toBeVisible()
    expect(screen.getByText('¥800 × 1')).toBeVisible()
    expect(screen.getByText('¥800')).toBeVisible()
  })

  it('もう一度押すと、閉じる', async () => {
    const { user } = setup()

    await user.click(toggle())
    await user.click(toggle())

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('テスト商品1')).not.toBeVisible()
  })

  it('API商品は保存したURL、アップロード品は保存済みの画像を表示する', () => {
    save('images', { ...createInitialImages(), images: { 'img-1': sampleDataUrl } })
    const { container } = setup()

    expect(container.querySelector('img[src="https://cdn.dummyjson.com/test/1.webp"]')).not.toBeNull()
    expect(container.querySelector(`img[src="${sampleDataUrl}"]`)).not.toBeNull()
  })

  it('アップロード品の画像が見つからないときは、「画像なし」を表示する', () => {
    setup()

    expect(screen.getByText('画像なし')).toBeInTheDocument()
  })
})