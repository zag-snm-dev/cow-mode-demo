import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialImages } from '@/shared/storage/schema'
import { resetStorageForTests, save } from '@/shared/storage/storage'
import { sampleDataUrl, sampleNewApiItem, sampleNewUploadItem } from '@/test/fixtures'
import { ItemImage } from './ItemImage'

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

describe('ItemImage', () => {
  it('API商品は、画像URLを表示する(飾りなのでaltは空)', () => {
    const { container } = render(<ItemImage item={sampleNewApiItem} />)

    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://cdn.dummyjson.com/test/1.webp')
    expect(img).toHaveAttribute('alt', '')
  })

  it('アップロード品は、保存済みの画像を表示する', () => {
    save('images', { ...createInitialImages(), images: { 'img-1': sampleDataUrl } })

    const { container } = render(<ItemImage item={sampleNewUploadItem} />)

    expect(container.querySelector('img')).toHaveAttribute('src', sampleDataUrl)
  })

  it('アップロード品の画像が見つからないときは、「画像なし」の枠を表示する', () => {
    const { container, getByText } = render(<ItemImage item={sampleNewUploadItem} />)

    expect(container.querySelector('img')).toBeNull()
    expect(getByText('画像なし')).toBeInTheDocument()
  })
})