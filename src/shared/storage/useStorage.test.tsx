import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sampleCard } from '@/test/fixtures'
import { createInitialMain } from './schema'
import { save } from './storage'
import { useStorage } from './useStorage'

function CardName() {
  const main = useStorage('main')
  return <p>{main.card?.name ?? 'カードなし'}</p>
}

describe('useStorage', () => {
  it('最初は初期値を表示する', () => {
    render(<CardName />)

    expect(screen.getByText('カードなし')).toBeInTheDocument()
  })

  it('saveすると、画面が更新される', () => {
    render(<CardName />)

    act(() => {
      save('main', { ...createInitialMain(), card: sampleCard })
    })

    expect(screen.getByText('TARO')).toBeInTheDocument()
  })

  it('他のタブの変更(storageイベント)でも、画面が更新される', () => {
    render(<CardName />)

    act(() => {
      localStorage.setItem('app:main', JSON.stringify({ ...createInitialMain(), card: sampleCard }))
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'app:main', storageArea: window.localStorage }),
      )
    })

    expect(screen.getByText('TARO')).toBeInTheDocument()
  })
})
