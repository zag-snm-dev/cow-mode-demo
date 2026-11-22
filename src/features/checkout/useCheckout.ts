import { useMutation } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import type { Order } from '@/shared/storage/schema'
import { completeCheckout } from './checkout'
import { simulatePayment } from './simulatePayment'

type Options = {
  /** 決済が完了したときに呼ばれる(画面の移動などを行う) */
  onSuccess?: (order: Order) => void
}

export function useCheckout({ onSuccess }: Options = {}) {
  /** 処理中かを、画面の更新を待たずに、すぐ判断するための印 */
  const inFlight = useRef(false)

  const mutation = useMutation({
    mutationFn: async (): Promise<Order> => {
      await simulatePayment()
      return completeCheckout()
    },
    onSuccess,
  })

  const { mutate } = mutation

  const checkout = useCallback(() => {
    if (inFlight.current) return
    inFlight.current = true

    mutate(undefined, {
      onSettled: () => {
        inFlight.current = false
      },
    })
  }, [mutate])

  return { checkout, isPending: mutation.isPending, error: mutation.error }
}