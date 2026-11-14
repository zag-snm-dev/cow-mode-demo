import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetStorageForTests } from '@/shared/storage/storage'
import { server } from './msw/server'

// jsdomに<dialog>の開閉が無い場合の補助(あるときは何もしない)
if (typeof HTMLDialogElement !== 'undefined') {
  if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
  }
  if (typeof HTMLDialogElement.prototype.close !== 'function') {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      if (!this.hasAttribute('open')) return
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
}

beforeAll(() =>
  (server.listen as (options?: { onUnhandledRequest?: 'error' | 'warn' | 'bypass' }) => void)({
    onUnhandledRequest: 'error',
  }),
)

afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
  resetStorageForTests()
})

afterAll(() => server.close())