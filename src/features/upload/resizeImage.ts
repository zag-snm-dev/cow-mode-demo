import { IMAGE } from '@/shared/constants'

/** 画像を読み込めない・加工できないときのエラー */
export class ImageProcessingError extends Error {
  constructor() {
    super('画像を読み込めませんでした。別の画像でお試しください')
    this.name = 'ImageProcessingError'
  }
}

/** 読み込み済みの画像 */
export type DecodedImage = {
  width: number
  height: number
  source: CanvasImageSource
  /** 読み込みに使った一時的なURLなどを片付ける */
  release: () => void
}

const JPEG_PREFIX = 'data:image/jpeg;base64,'

// ---- ① 純粋な計算:中央を正方形に切り抜く位置と大きさ ----

export function calcCenterCrop(
  width: number,
  height: number,
): { sx: number; sy: number; side: number } {
  const side = Math.min(width, height)
  return {
    sx: Math.floor((width - side) / 2),
    sy: Math.floor((height - side) / 2),
    side,
  }
}

// ---- ② ブラウザの機能:画像を読み込む ----

export async function decodeImage(file: Blob): Promise<DecodedImage> {
  const url = URL.createObjectURL(file)
  const release = () => URL.revokeObjectURL(url)

  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return { width: image.naturalWidth, height: image.naturalHeight, source: image, release }
  } catch (error) {
    release()
    throw error
  }
}

// ---- ③ ブラウザの機能:Canvasに描いて、JPEGのデータURLにする ----

export function drawSquareToJpeg(
  image: DecodedImage,
  size: number,
  quality: number,
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas'),
): string {
  if (image.width <= 0 || image.height <= 0) throw new ImageProcessingError()

  const canvas = createCanvas()
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (context === null) throw new ImageProcessingError()

  // JPEGは透明を持てないので、先に白で塗る(透過PNGが、黒くならないように)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, size, size)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  const { sx, sy, side } = calcCenterCrop(image.width, image.height)
  context.drawImage(image.source, sx, sy, side, side, 0, 0, size, size)

  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  if (!dataUrl.startsWith(JPEG_PREFIX)) throw new ImageProcessingError()
  return dataUrl
}

// ---- ④ 全体:読み込み → 縮小 → 片付け ----

export type ResizeDeps = {
  decode: (file: Blob) => Promise<DecodedImage>
  draw: (image: DecodedImage, size: number, quality: number) => string
}

const defaultDeps: ResizeDeps = {
  decode: decodeImage,
  draw: (image, size, quality) => drawSquareToJpeg(image, size, quality),
}

/** 画像を、中央を切り抜いた300x300のJPEG(データURL)にする */
export async function resizeImageToJpeg(file: Blob, deps: ResizeDeps = defaultDeps): Promise<string> {
  let decoded: DecodedImage
  try {
    decoded = await deps.decode(file)
  } catch {
    throw new ImageProcessingError()
  }

  try {
    return deps.draw(decoded, IMAGE.size, IMAGE.jpegQuality)
  } catch (error) {
    throw error instanceof ImageProcessingError ? error : new ImageProcessingError()
  } finally {
    decoded.release()
  }
}