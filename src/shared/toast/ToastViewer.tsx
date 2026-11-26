import { useSyncExternalStore } from 'react'
import { getToast, subscribeToast, type ToastTone } from './toastStore'

const toneClass: Record<ToastTone, string> = {
  success: 'border-gold text-ivory',
  error: 'border-pink text-pink',
}

export function ToastViewer() {
  const toast = useSyncExternalStore(subscribeToast, getToast)

  return (
    // 読み上げの領域は、中身が出る前から、常にページの中にある
    <div
      role="status"
      aria-label="通知"
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
    >
      {toast !== null && (
        <p
          key={toast.id}
          data-tone={toast.tone}
          className={`pointer-events-auto rounded-pill border bg-surface px-5 py-3 text-sm font-bold shadow-gold ${
            toneClass[toast.tone]
          } ${toast.phase === 'visible' ? 'motion-safe:animate-toast-in' : 'motion-safe:animate-toast-out'}`}
        >
          {toast.message}
        </p>
      )}
    </div>
  )
}