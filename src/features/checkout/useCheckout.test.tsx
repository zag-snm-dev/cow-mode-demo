import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StorageQuotaError } from '@/shared/storage/errors'
import { createInitialMain } from '@/shared/storage/schema'
import { load, resetStorageForTests, save } from '@/shared/storage/storage'
import { sampleApiItem, sampleCard, sampleUploadItem } from '@/test/fixtures'
import { CheckoutError } from './errors'
import { simulatePayment } from './simulatePayment'
import { useCheckout } from './useCheckout'

vi.mock('./simulatePayment', () => ({ simulatePayment: vi.fn() }))

const mockedPay = vi.mocked(simulatePayment)
let finishPayment: () => void = () => {}

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
  mockedPay.mockReset()
  // 決済の待ちを、テストが好きなタイミングで終わらせられるようにする
  mockedPay.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finishPayment = resolve
      }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function seed(cart = [sampleApiItem, sampleUploadItem]) {
  save('main', { ...createInitialMain(), card: sampleCard, cart })
}

describe('useCheckout', () => {
  it('決済中は isPending で、待ちが終わるまで保存されず、終わると保存して onSuccess が呼ばれる', async () => {
    seed()
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCheckout({ onSuccess }), { wrapper: createWrapper() })

    act(() => {
      result.current.checkout()
    })
    await waitFor(() => expect(result.current.isPending).toBe(true))
    await waitFor(() => expect(mockedPay).toHaveBeenCalledTimes(1))
    expect(load('main').history).toHaveLength(0)
    expect(load('main').cart).toHaveLength(2)

    await act(async () => {
      finishPayment()
    })

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ totalYen: 3800 }), undefined, undefined, expect.anything(),)
    expect(load('main').history).toHaveLength(1)
    expect(load('main').cart).toEqual([])
    await waitFor(() => expect(result.current.isPending).toBe(false))
  })

  it('続けて2回呼んでも、決済は1回だけ', async () => {
    seed()
    const { result } = renderHook(() => useCheckout(), { wrapper: createWrapper() })

    act(() => {
      result.current.checkout()
      result.current.checkout()
    })
    await waitFor(() => expect(mockedPay).toHaveBeenCalledTimes(1))

    await act(async () => {
      finishPayment()
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(mockedPay).toHaveBeenCalledTimes(1)
    expect(load('main').history).toHaveLength(1)
  })

  it('容量がいっぱいで失敗したら、errorを持ち、カートは残り、onSuccessは呼ばれず、もう一度試せる', async () => {
    seed()
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCheckout({ onSuccess }), { wrapper: createWrapper() })
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    act(() => {
      result.current.checkout()
    })
    await waitFor(() => expect(mockedPay).toHaveBeenCalledTimes(1))
    await act(async () => {
      finishPayment()
    })

    await waitFor(() => expect(result.current.error).toBeInstanceOf(StorageQuotaError))
    expect(onSuccess).not.toHaveBeenCalled()
    expect(load('main').cart).toHaveLength(2)
    expect(load('main').history).toEqual([])

    // 直してから、もう一度(印が戻っているので、また実行できる)
    spy.mockRestore()
    act(() => {
      result.current.checkout()
    })
    await waitFor(() => expect(mockedPay).toHaveBeenCalledTimes(2))
    await act(async () => {
      finishPayment()
    })

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(load('main').history).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('カートが空のときは、CheckoutError になり、履歴は増えない', async () => {
    seed([])
    const { result } = renderHook(() => useCheckout(), { wrapper: createWrapper() })

    act(() => {
      result.current.checkout()
    })
    await waitFor(() => expect(mockedPay).toHaveBeenCalledTimes(1))
    await act(async () => {
      finishPayment()
    })

    await waitFor(() => expect(result.current.error).toBeInstanceOf(CheckoutError))
    expect(load('main').history).toEqual([])
  })
})