import { useEffect, useId, useRef, useState, type SubmitEvent } from 'react'
import { Button } from '@/shared/components/Button'
import { LIMITS } from '@/shared/constants'
import { StorageQuotaError } from '@/shared/storage/errors'
import type { Card } from '@/shared/storage/schema'
import { createCard } from '../createCard'
import { generateCardNumber } from '../generateCardNumber'
import { cardNameSchema } from '../schema'
import { saveCard } from '../useCard'
import { CardView } from './CardView'

type Props = {
  open: boolean
  /** 「×」やEscで閉じられたときに呼ばれる。呼び出し側で open を false にする */
  onClose: () => void
  /** カードを作成して保存したときに呼ばれる */
  onCreated: (card: Card) => void
}

function validateName(value: string): string | null {
  const result = cardNameSchema.safeParse(value)
  return result.success ? null : (result.error.issues[0]?.message ?? '入力内容を確認してください')
}

function CreateCardForm({ onCreated }: Pick<Props, 'onCreated'>) {
  const [name, setName] = useState('')
  // モーダルを開くたびに1回だけ作る。プレビューの番号と、保存される番号を同じにする
  const [number] = useState(() => generateCardNumber())
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const inputId = useId()
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`

  function handleChange(value: string) {
    setName(value)
    // 一度送信してからは、入力するたびに確認し直す
    if (submitted) setError(validateName(value))
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    const message = validateName(name)
    if (message !== null) {
      setError(message)
      return
    }

    try {
      const card = createCard({ name, number })
      saveCard(card)
      onCreated(card)
    } catch (e) {
      setError(
        e instanceof StorageQuotaError ? e.message : '保存できませんでした。もう一度お試しください',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-3">
      <CardView side="front" name={name} />
      <CardView side="back" number={number} />

      <div className="grid gap-1">
        <label htmlFor={inputId} className="text-sm font-bold text-gold">
          名前 / ニックネーム
        </label>
        <input
          id={inputId}
          data-autofocus
          value={name}
          onChange={(event) => handleChange(event.target.value)}
          autoComplete="off"
          aria-invalid={error !== null}
          aria-describedby={error === null ? hintId : `${hintId} ${errorId}`}
          className="min-h-11 rounded-lg border border-gold bg-ink px-3 text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
        />
        <p id={hintId} className="text-xs text-ivory/70">
          {LIMITS.cardName.min}〜{LIMITS.cardName.max}字
        </p>
        {error !== null && (
          <p id={errorId} role="alert" className="text-sm text-pink">
            {error}
          </p>
        )}
      </div>

      <p className="text-sm text-pink">架空のカードです。本物のカード情報は入力しないでください</p>

      <Button type="submit">作成してお買い物へ</Button>
    </form>
  )
}

export function CreateCardModal({ open, onClose, onCreated }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  // 「open」の値を、本物の<dialog>の開閉に合わせる
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto max-h-[90dvh] w-[min(92vw,26rem)] overflow-y-auto rounded-card border border-gold bg-surface p-4 text-ivory shadow-gold backdrop:bg-black/70"
    >
      <div className="flex items-center justify-between">
        <h2 id={titleId} className="text-lg">
          カードを作成
        </h2>
        <button
          type="button"
          aria-label="閉じる"
          onClick={onClose}
          className="inline-flex size-11 items-center justify-center rounded-lg border border-gold text-gold hover:bg-ink focus-visible:outline-2 focus-visible:outline-pink"
        >
          ×
        </button>
      </div>

      {open && <CreateCardForm onCreated={onCreated} />}
    </dialog>
  )
}
