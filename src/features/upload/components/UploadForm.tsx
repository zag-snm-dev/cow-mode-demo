import { useId, useRef, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { Button } from '@/shared/components/Button'
import { IMAGE, LIMITS, MESSAGES } from '@/shared/constants'
import { useStorage } from '@/shared/storage/useStorage'
import { addUploadedItemToCart } from '../addUploadedItem'
import { ImageProcessingError, resizeImageToJpeg } from '../resizeImage'
import { parseUploadForm, type UploadFormErrors, type UploadFormInput } from '../schema'
import { validateImageFile } from '../validateImageFile'

const INITIAL_VALUES: UploadFormInput = { name: '', price: '', quantity: '1' }

const maxMb = LIMITS.fileSizeBytes / (1024 * 1024)

const inputClass =
  'min-h-11 w-full rounded-lg border border-gold bg-ink px-3 text-ivory ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink'

function errorsOf(input: UploadFormInput): UploadFormErrors {
  const result = parseUploadForm(input)
  return result.ok ? {} : result.errors
}

type TextFieldProps = {
  id: string
  label: string
  value: string
  error?: string
  inputMode?: 'numeric'
  onChange: (value: string) => void
}

function TextField({ id, label, value, error, inputMode, onChange }: TextFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-bold text-gold">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        autoComplete="off"
        aria-invalid={error !== undefined}
        aria-describedby={error === undefined ? undefined : errorId}
        className={inputClass}
      />
      {error !== undefined && (
        <p id={errorId} role="alert" className="text-sm text-pink">
          {error}
        </p>
      )}
    </div>
  )
}

export function UploadForm() {
  const imageCount = Object.keys(useStorage('images').images).length
  const isFull = imageCount >= LIMITS.imageCount

  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [values, setValues] = useState<UploadFormInput>(INITIAL_VALUES)
  const [errors, setErrors] = useState<UploadFormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  /** 画像を続けて選び直したとき、古い処理の結果を捨てるための番号 */
  const latestRequest = useRef(0)

  const fileId = useId()
  const nameId = useId()
  const priceId = useId()
  const quantityId = useId()

  function updateField(field: keyof UploadFormInput, value: string) {
    const next = { ...values, [field]: value }
    setValues(next)
    // 一度送信してからは、入力するたびに確かめ直す
    if (submitted) setErrors(errorsOf(next))
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file === undefined) return

    const requestId = ++latestRequest.current
    setSubmitError(null)

    const check = validateImageFile(file)
    if (!check.ok) {
      setPreview(null)
      setFileError(check.message)
      return
    }

    setFileError(null)
    setProcessing(true)
    try {
      const dataUrl = await resizeImageToJpeg(file)
      if (requestId === latestRequest.current) setPreview(dataUrl)
    } catch (error) {
      if (requestId === latestRequest.current) {
        setPreview(null)
        setFileError(error instanceof ImageProcessingError ? error.message : MESSAGES.addFailed)
      }
    } finally {
      if (requestId === latestRequest.current) setProcessing(false)
    }
  }

  function reset() {
    latestRequest.current += 1
    setPreview(null)
    setFileError(null)
    setProcessing(false)
    setValues(INITIAL_VALUES)
    setErrors({})
    setSubmitted(false)
    setSubmitError(null)
    if (fileInputRef.current !== null) fileInputRef.current.value = ''
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setSubmitError(null)

    const parsed = parseUploadForm(values)
    setErrors(parsed.ok ? {} : parsed.errors)
    if (preview === null && fileError === null) setFileError('画像を選んでください')
    if (!parsed.ok || preview === null) return

    const result = addUploadedItemToCart({ dataUrl: preview, ...parsed.value })
    if (result === 'added') reset()
    if (result === 'image-limit') setSubmitError(MESSAGES.imageLimit)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid max-w-md gap-4 w-full">
      <div className="grid gap-2">
        <label htmlFor={fileId} className="text-sm font-bold text-gold">
          画像を選ぶ(JPEG / PNG / WebP、{maxMb}MBまで)
        </label>
        <input
          ref={fileInputRef}
          id={fileId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          aria-invalid={fileError !== null}
          className="block w-full text-sm text-ivory file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-pill file:border-0 file:bg-gold file:px-5 file:font-bold file:text-ink"
        />
        {processing && <p className="text-sm text-ivory/70">画像を処理しています…</p>}
        {fileError !== null && (
          <p role="alert" className="text-sm text-pink">
            {fileError}
          </p>
        )}
        <div className="flex justify-center">
          {preview !== null && (
            <img
              src={preview}
              alt="選んだ画像のプレビュー"
              width={IMAGE.size}
              height={IMAGE.size}
              className="aspect-square w-full max-w-60 rounded-card border border-gold/40 object-cover"
            />
          )}
        </div>
      </div>

      <TextField
        id={nameId}
        label={`商品名(${LIMITS.itemName.min}〜${LIMITS.itemName.max}字)`}
        value={values.name}
        error={errors.name}
        onChange={(value) => updateField('name', value)}
      />
      <TextField
        id={priceId}
        label="価格(円)"
        value={values.price}
        error={errors.price}
        inputMode="numeric"
        onChange={(value) => updateField('price', value)}
      />
      <TextField
        id={quantityId}
        label={`個数(${LIMITS.quantity.min}〜${LIMITS.quantity.max})`}
        value={values.quantity}
        error={errors.quantity}
        inputMode="numeric"
        onChange={(value) => updateField('quantity', value)}
      />

      <div className="grid gap-2">
        <p className="text-xs text-ivory/70">
          保存した画像 {imageCount} / {LIMITS.imageCount}枚
        </p>
        {isFull && <p className="text-sm text-pink">{MESSAGES.imageLimit}</p>}
        {submitError !== null && (
          <p role="alert" className="text-sm text-pink">
            {submitError}
          </p>
        )}
        <Button type="submit" disabled={processing || isFull}>
          カートに追加
        </Button>
      </div>
    </form>
  )
}
