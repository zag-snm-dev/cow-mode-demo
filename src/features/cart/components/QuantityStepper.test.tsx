import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuantityStepper } from './QuantityStepper'

function setup(value: number) {
  const onChange = vi.fn()
  render(<QuantityStepper label="商品A" value={value} min={1} max={99} onChange={onChange} />)
  return { user: userEvent.setup(), onChange }
}

const decrease = '商品Aの数量を減らす'
const increase = '商品Aの数量を増やす'

describe('QuantityStepper', () => {
  it('現在の数量を表示する', () => {
    setup(3)

    expect(screen.getByRole('group', { name: '商品Aの数量' })).toHaveTextContent('3')
  })

  it('「+」で1増やした値、「−」で1減らした値を渡す', async () => {
    const { user, onChange } = setup(3)

    await user.click(screen.getByRole('button', { name: increase }))
    await user.click(screen.getByRole('button', { name: decrease }))

    expect(onChange).toHaveBeenNthCalledWith(1, 4)
    expect(onChange).toHaveBeenNthCalledWith(2, 2)
  })

  it('下限(1)では、「−」が押せない', () => {
    setup(1)

    expect(screen.getByRole('button', { name: decrease })).toBeDisabled()
    expect(screen.getByRole('button', { name: increase })).toBeEnabled()
  })

  it('上限(99)では、「+」が押せず、上限の文を表示する', () => {
    setup(99)

    expect(screen.getByRole('button', { name: increase })).toBeDisabled()
    expect(screen.getByRole('button', { name: decrease })).toBeEnabled()
    expect(screen.getByText('上限の99個です')).toBeInTheDocument()
  })

  it('上限より小さいときは、上限の文を出さない', () => {
    setup(98)

    expect(screen.queryByText('上限の99個です')).not.toBeInTheDocument()
  })
})