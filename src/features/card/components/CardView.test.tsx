import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CardView } from './CardView'

describe('CardView(表)', () => {
  it('画像と、重ねた名前を表示する', () => {
    render(<CardView side="front" name="TARO" />)

    expect(screen.getByAltText('クレジットカード(表)')).toBeInTheDocument()
    expect(screen.getByText('TARO')).toBeInTheDocument()
  })

  it('名前が空のときは、YOUR NAMEを表示する', () => {
    render(<CardView side="front" name="" />)

    expect(screen.getByText('YOUR NAME')).toBeInTheDocument()
  })

  it('空白だけの名前も、YOUR NAMEを表示する', () => {
    render(<CardView side="front" name="   " />)

    expect(screen.getByText('YOUR NAME')).toBeInTheDocument()
  })
})

describe('CardView(裏)', () => {
  it('画像と、番号と、利用上限を表示する', () => {
    render(<CardView side="back" number="12345-1234567-12345" />)

    expect(screen.getByAltText('クレジットカード(裏)')).toBeInTheDocument()
    expect(screen.getByText('12345-1234567-12345')).toBeInTheDocument()
  })
})