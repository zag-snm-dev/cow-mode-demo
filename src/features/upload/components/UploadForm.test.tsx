import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LIMITS, MESSAGES } from '@/shared/constants'
import { createInitialImages } from '@/shared/storage/schema'
import { load, save } from '@/shared/storage/storage'
import { getToast } from '@/shared/toast/toastStore'
import { sampleDataUrl } from '@/test/fixtures'
import { ImageProcessingError, resizeImageToJpeg } from '../resizeImage'
import { UploadForm } from './UploadForm'

vi.mock('../resizeImage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../resizeImage')>()
  return { ...actual, resizeImageToJpeg: vi.fn() }
})

const mockedResize = vi.mocked(resizeImageToJpeg)

const fileLabel = /画像を選ぶ/
const nameLabel = '商品名(1〜20字)'
const priceLabel = '価格(円)'
const quantityLabel = '個数(1〜99)'
const previewAlt = '選んだ画像のプレビュー'
const submitName = 'カートに追加'

beforeEach(() => {
  mockedResize.mockReset()
  mockedResize.mockResolvedValue(sampleDataUrl)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function setup() {
  // 形式のエラーを確かめるため、acceptによる絞り込みは無効にする
  const user = userEvent.setup({ applyAccept: false })
  render(<UploadForm />)
  return user
}

const jpeg = () => new File(['x'], 'photo.jpg', { type: 'image/jpeg' })

async function chooseImage(user: ReturnType<typeof userEvent.setup>) {
  await user.upload(screen.getByLabelText(fileLabel), jpeg())
  await screen.findByAltText(previewAlt)
}

async function fillFields(
  user: ReturnType<typeof userEvent.setup>,
  { name = '欲しい物', price = '1500', quantity }: { name?: string; price?: string; quantity?: string } = {},
) {
  await user.type(screen.getByLabelText(nameLabel), name)
  await user.type(screen.getByLabelText(priceLabel), price)
  if (quantity !== undefined) {
    await user.clear(screen.getByLabelText(quantityLabel))
    await user.type(screen.getByLabelText(quantityLabel), quantity)
  }
}

describe('UploadForm(表示)', () => {
  it('入力欄と、保存した画像の数を表示する', () => {
    setup()

    expect(screen.getByLabelText(fileLabel)).toBeInTheDocument()
    expect(screen.getByLabelText(nameLabel)).toHaveValue('')
    expect(screen.getByLabelText(priceLabel)).toHaveValue('')
    expect(screen.getByLabelText(quantityLabel)).toHaveValue('1')
    expect(screen.getByText('保存した画像 0 / 50枚')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: submitName })).toBeEnabled()
  })
})

describe('UploadForm(画像を選ぶ)', () => {
  it('選ぶと、縮小した画像のプレビューを表示する', async () => {
    const user = setup()

    await chooseImage(user)

    expect(mockedResize).toHaveBeenCalledTimes(1)
    expect(screen.getByAltText(previewAlt)).toHaveAttribute('src', sampleDataUrl)
  })

  it('形式が違うと、エラーを表示し、縮小もプレビューもしない', async () => {
    const user = setup()

    await user.upload(
      screen.getByLabelText(fileLabel),
      new File(['x'], 'a.gif', { type: 'image/gif' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('JPEG / PNG / WebP の画像を選んでください')
    expect(mockedResize).not.toHaveBeenCalled()
    expect(screen.queryByAltText(previewAlt)).not.toBeInTheDocument()
  })

  it('5MBを超えると、エラーを表示する', async () => {
    const user = setup()
    const big = new File(['x'], 'big.png', { type: 'image/png' })
    Object.defineProperty(big, 'size', { value: LIMITS.fileSizeBytes + 1 })

    await user.upload(screen.getByLabelText(fileLabel), big)

    expect(await screen.findByRole('alert')).toHaveTextContent('5MB以下の画像を選んでください')
    expect(mockedResize).not.toHaveBeenCalled()
  })

  it('画像として読み込めないときは、エラーを表示する', async () => {
    mockedResize.mockRejectedValue(new ImageProcessingError())
    const user = setup()

    await user.upload(screen.getByLabelText(fileLabel), jpeg())

    expect(await screen.findByRole('alert')).toHaveTextContent('画像を読み込めませんでした')
    expect(screen.queryByAltText(previewAlt)).not.toBeInTheDocument()
  })
})

describe('UploadForm(送信の検証)', () => {
  it('何も入力せずに送信すると、画像・商品名・価格のエラーを出し、カートに入れない', async () => {
    const user = setup()

    await user.click(screen.getByRole('button', { name: submitName }))

    expect(screen.getByText('画像を選んでください')).toBeInTheDocument()
    expect(screen.getByText('商品名を入力してください')).toBeInTheDocument()
    expect(screen.getByText('価格を入力してください')).toBeInTheDocument()
    expect(load('main').cart).toEqual([])
  })

  it('名前21字・価格0・個数100は、エラーになる', async () => {
    const user = setup()
    await chooseImage(user)

    await fillFields(user, { name: 'あ'.repeat(21), price: '0', quantity: '100' })
    await user.click(screen.getByRole('button', { name: submitName }))

    expect(screen.getByText('20文字以内で入力してください')).toBeInTheDocument()
    expect(screen.getByText('価格は1〜9,999,999,999円の整数で入力してください')).toBeInTheDocument()
    expect(screen.getByText('個数は1〜99の整数で入力してください')).toBeInTheDocument()
    expect(load('main').cart).toEqual([])
  })

  it('エラーを直すと、すぐにエラーが消える', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: submitName }))
    expect(screen.getByText('商品名を入力してください')).toBeInTheDocument()

    await user.type(screen.getByLabelText(nameLabel), '欲しい物')

    expect(screen.queryByText('商品名を入力してください')).not.toBeInTheDocument()
  })
})

describe('UploadForm(カートに追加)', () => {
  it('追加すると、画像とカートに保存され、通知が出て、入力欄が空に戻る', async () => {
    const user = setup()
    await chooseImage(user)
    await fillFields(user)

    await user.click(screen.getByRole('button', { name: submitName }))

    const [line] = load('main').cart
    expect(line).toMatchObject({ source: 'upload', name: '欲しい物', priceYen: 1500, quantity: 1 })
    expect(line.source === 'upload' && load('images').images[line.imageId]).toBe(sampleDataUrl)
    expect(getToast()).toMatchObject({ message: MESSAGES.addedToCart, tone: 'success' })

    expect(screen.getByLabelText(nameLabel)).toHaveValue('')
    expect(screen.getByLabelText(priceLabel)).toHaveValue('')
    expect(screen.getByLabelText(quantityLabel)).toHaveValue('1')
    expect(screen.queryByAltText(previewAlt)).not.toBeInTheDocument()
    expect(screen.getByText('保存した画像 1 / 50枚')).toBeInTheDocument()
  })

  it('個数と、全角・カンマ付きの価格も受け付ける', async () => {
    const user = setup()
    await chooseImage(user)

    await fillFields(user, { price: '１,５００', quantity: '3' })
    await user.click(screen.getByRole('button', { name: submitName }))

    expect(load('main').cart[0]).toMatchObject({ priceYen: 1500, quantity: 3 })
  })

  it('保存した画像が50枚に達していると、ボタンを押せず、理由を表示する', () => {
    save('images', {
      ...createInitialImages(),
      images: Object.fromEntries(
        Array.from({ length: LIMITS.imageCount }, (_, i) => [`img-${i}`, sampleDataUrl]),
      ),
    })
    setup()

    expect(screen.getByRole('button', { name: submitName })).toBeDisabled()
    expect(screen.getByText(MESSAGES.imageLimit)).toBeInTheDocument()
  })

  it('カートの保存に失敗したら、エラーを通知し、入力内容と画像は残さない', async () => {
    const user = setup()
    await chooseImage(user)
    await fillFields(user)
    load('main') // 保存先をlocalStorageに決めてから、書き込みを失敗させる
    const original = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === 'app:main') throw new DOMException('quota', 'QuotaExceededError')
      original.call(this, key, value)
    })

    await user.click(screen.getByRole('button', { name: submitName }))

    expect(getToast()).toMatchObject({ message: '容量がいっぱいです', tone: 'error' })
    expect(screen.getByLabelText(nameLabel)).toHaveValue('欲しい物')
    expect(load('images').images).toEqual({})
  })
})