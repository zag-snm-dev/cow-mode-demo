import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetStorageForTests } from '@/shared/storage/storage'
import { server } from './msw/server'

beforeAll(() => server.listen())

afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
  resetStorageForTests()
})

afterAll(() => server.close())