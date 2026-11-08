import { useQueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useLocation } from 'react-router'
import { renderWithProviders } from './renderWithProviders'

function Probe() {
  const queryClient = useQueryClient()
  const location = useLocation()
  return (
    <p>
      {location.pathname}:{String(queryClient.getDefaultOptions().queries?.retry)}
    </p>
  )
}

describe('renderWithProviders', () => {
  it('指定したURLとQueryClientの設定で描画される', () => {
    renderWithProviders(<Probe />, { route: '/cart' })

    expect(screen.getByText('/cart:false')).toBeInTheDocument()
  })
})