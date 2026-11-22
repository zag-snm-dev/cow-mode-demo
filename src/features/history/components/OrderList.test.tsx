import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sampleOrder } from '@/test/fixtures'
import { OrderList } from './OrderList'

const oldest = { ...sampleOrder, id: 'oldest', paidAt: 1000, totalYen: 100 }
const middle = { ...sampleOrder, id: 'middle', paidAt: 2000, totalYen: 3800 }
const newest = { ...sampleOrder, id: 'newest', paidAt: 3000, totalYen: 5000 }

describe('OrderList', () => {
  it('並び順に関係なく、新しい順に表示する', () => {
    render(<OrderList orders={[middle, newest, oldest]} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0]).toHaveTextContent('¥5,000')
    expect(buttons[1]).toHaveTextContent('¥3,800')
    expect(buttons[2]).toHaveTextContent('¥100')
  })

  it('1件ずつ、独立して開閉できる', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(<OrderList orders={[middle, newest]} />)

    await user.click(screen.getAllByRole('button')[0])

    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('button')[1]).toHaveAttribute('aria-expanded', 'false')
  })
})