import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { load, resetStorageForTests } from '@/shared/storage/storage'
import { CreateCardModal } from './CreateCardModal'

beforeEach(() => {
  localStorage.clear()
  resetStorageForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function setup(open = true) {
  const onClose = vi.fn()
  const onCreated = vi.fn()
  render(<CreateCardModal open={open} onClose={onClose} onCreated={onCreated} />)
  return { user: userEvent.setup(), onClose, onCreated }
}

const nameLabel = '名前 / ニックネーム'
const submitName = '作成してお買い物へ'

describe('CreateCardModal', () => {
  it('閉じているときは、開いた状態にならない', () => {
    setup(false)

    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')
  })

  it('開くと、タイトル・入力欄・注意書き・カードが表示される', () => {
    setup()

    expect(screen.getByRole('dialog', { name: 'カードを作成' })).toBeInTheDocument()
    expect(screen.getByLabelText(nameLabel)).toBeInTheDocument()
    expect(
      screen.getByText('架空のカードです。本物のカード情報は入力しないでください'),
    ).toBeInTheDocument()
  })

  it('開いたとき、名前の入力欄にフォーカスが当たる', () => {
    setup()

    expect(screen.getByLabelText(nameLabel)).toHaveFocus()
  })

  it('入力した名前が、カード表にその場で表示される', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText(nameLabel), 'TARO')

    expect(screen.getByText('TARO')).toBeInTheDocument()
  })

  it('空の名前では作成できず、エラーが出る', async () => {
    const { user, onCreated } = setup()

    await user.click(screen.getByRole('button', { name: submitName }))

    expect(screen.getByRole('alert')).toHaveTextContent('名前を入力してください')
    expect(onCreated).not.toHaveBeenCalled()
    expect(load('main').card).toBeNull()
  })

  it('11字の名前では作成できず、エラーが出る', async () => {
    const { user, onCreated } = setup()

    await user.type(screen.getByLabelText(nameLabel), 'あ'.repeat(11))
    await user.click(screen.getByRole('button', { name: submitName }))

    expect(screen.getByRole('alert')).toHaveTextContent('10文字以内で入力してください')
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('正しい名前で、カードが保存される(前後の空白は除く)', async () => {
    const { user, onCreated } = setup()

    await user.type(screen.getByLabelText(nameLabel), '  TARO  ')
    await user.click(screen.getByRole('button', { name: submitName }))

    expect(onCreated).toHaveBeenCalledTimes(1)
    const card = onCreated.mock.calls[0][0]
    expect(card.name).toBe('TARO')
    expect(card.number).toMatch(/^\d{5}-\d{7}-\d{5}$/)
    expect(load('main').card).toEqual(card)
  })

  it('「×」ボタンで、onCloseが呼ばれる', async () => {
    const { user, onClose } = setup()

    await user.click(screen.getByRole('button', { name: '閉じる' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ダイアログが閉じられた(Escなど)ら、onCloseが呼ばれる', () => {
    const { onClose } = setup()

    fireEvent(screen.getByRole('dialog'), new Event('close'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('容量がいっぱいのときは、エラーを表示し、作成扱いにしない', async () => {
    const { user, onCreated } = setup()
    load('main') // 保存先をlocalStorageに決めてから、書き込みを失敗させる
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    await user.type(screen.getByLabelText(nameLabel), 'TARO')
    await user.click(screen.getByRole('button', { name: submitName }))

    expect(screen.getByRole('alert')).toHaveTextContent('容量がいっぱいです')
    expect(onCreated).not.toHaveBeenCalled()
  })
})