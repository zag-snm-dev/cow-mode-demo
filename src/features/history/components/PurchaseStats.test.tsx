import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MYPAGE_COPY } from '../content'
import { PurchaseStats } from './PurchaseStats'

describe('PurchaseStats', () => {
  it('総決済額・決済回数・補足の一文を表示する', () => {
    render(<PurchaseStats totalYen={123456} orderCount={5} />)

    expect(screen.getByRole('region', { name: '購入の集計' })).toBeInTheDocument()
    expect(screen.getByText('総決済額')).toBeInTheDocument()
    expect(screen.getByText('¥123,456')).toBeInTheDocument()
    expect(screen.getByText('決済回数')).toBeInTheDocument()
    expect(screen.getByText('5回')).toBeInTheDocument()
    expect(screen.getByText(MYPAGE_COPY.savedCaption)).toBeInTheDocument()
  })
})