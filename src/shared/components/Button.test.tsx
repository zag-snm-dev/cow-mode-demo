import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('クリックするとonClickが呼ばれる', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>押す</Button>)

    await user.click(screen.getByRole('button', { name: '押す' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabledのときはonClickが呼ばれない', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        押す
      </Button>,
    )

    await user.click(screen.getByRole('button', { name: '押す' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('typeの初期値はbutton', () => {
    render(<Button>押す</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})