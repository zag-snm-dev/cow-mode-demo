import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScreenshotFrame } from './ScreenshotFrame'

describe('ScreenshotFrame', () => {
  it('画像がないときは、仮の枠を表示する(読み上げの対象にしない)', () => {
    const { container } = render(<ScreenshotFrame src={null} alt="説明" />)

    expect(screen.getByText('スクリーンショット(仮画像)')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('画像があるときは、代替テキストと縦横の大きさを持つ画像を、遅延読み込みで表示する', () => {
    render(<ScreenshotFrame src="/shot.webp" alt="カート画面のスクリーンショット" />)

    const img = screen.getByAltText('カート画面のスクリーンショット')
    expect(img).toHaveAttribute('src', '/shot.webp')
    expect(img).toHaveAttribute('width', '1200')
    expect(img).toHaveAttribute('height', '900')
    expect(img).toHaveAttribute('loading', 'lazy')
  })
})