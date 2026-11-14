import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialMain } from '@/shared/storage/schema'
import { load, resetStorageForTests, save } from '@/shared/storage/storage'
import { sampleApiItem, sampleCard } from '@/test/fixtures'
import { saveCard, useCard } from './useCard'

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

function CardName() {
  const card = useCard()
  return <p>{card?.name ?? 'カードなし'}</p>
}

describe('useCard / saveCard', () => {
  it('最初はカードなし', () => {
    render(<CardName />)

    expect(screen.getByText('カードなし')).toBeInTheDocument()
  })

  it('saveCardすると、画面に反映される', () => {
    render(<CardName />)

    act(() => {
      saveCard(sampleCard)
    })

    expect(screen.getByText('TARO')).toBeInTheDocument()
  })

  it('saveCardは、カートなど他のデータを消さない', () => {
    save('main', { ...createInitialMain(), cart: [sampleApiItem] })

    saveCard(sampleCard)

    expect(load('main').cart).toEqual([sampleApiItem])
    expect(load('main').card).toEqual(sampleCard)
  })
})