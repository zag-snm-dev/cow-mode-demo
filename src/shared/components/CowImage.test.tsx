import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CowImage } from './CowImage'

describe('CowImage', () => {
  it('正面:代替テキストと縦横の大きさを持ち、遅延読み込みになる', () => {
    render(<CowImage variant="front" />)

    const img = screen.getByAltText('COW MODEのキャラクター(牛)')
    expect(img).toHaveAttribute('width', '800')
    expect(img).toHaveAttribute('height', '800')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('お辞儀:代替テキストを持つ', () => {
    render(<CowImage variant="bow" />)

    expect(screen.getByAltText('お辞儀をするCOW MODEのキャラクター(牛)')).toBeInTheDocument()
  })

  it('priority のときは、すぐに読み込む', () => {
    render(<CowImage variant="front" priority />)

    expect(screen.getByAltText('COW MODEのキャラクター(牛)')).toHaveAttribute('loading', 'eager')
  })

  it('正面とお辞儀は、別の画像', () => {
    render(
      <>
        <CowImage variant="front" />
        <CowImage variant="bow" />
      </>,
    )

    const front = screen.getByAltText('COW MODEのキャラクター(牛)').getAttribute('src')
    const bow = screen.getByAltText('お辞儀をするCOW MODEのキャラクター(牛)').getAttribute('src')
    expect(front).not.toBe(bow)
  })
})