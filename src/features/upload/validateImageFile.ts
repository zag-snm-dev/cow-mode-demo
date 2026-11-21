import { LIMITS } from '@/shared/constants'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export type FileCheck = { ok: true } | { ok: false; message: string }

const maxMb = LIMITS.fileSizeBytes / (1024 * 1024)

/** 選ばれたファイルの形式とサイズを確かめる(画像として読めるかは、縮小のときに確かめる) */
export function validateImageFile(file: Pick<File, 'type' | 'size'>): FileCheck {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, message: 'JPEG / PNG / WebP の画像を選んでください' }
  }
  if (file.size === 0) {
    return { ok: false, message: '空のファイルです。別の画像を選んでください' }
  }
  if (file.size > LIMITS.fileSizeBytes) {
    return { ok: false, message: `${maxMb}MB以下の画像を選んでください` }
  }
  return { ok: true }
}