import { describe, expect, it, vi } from 'vitest'
import { IMAGE } from '@/shared/constants'
import {
  calcCenterCrop,
  drawSquareToJpeg,
  ImageProcessingError,
  resizeImageToJpeg,
  type DecodedImage,
} from './resizeImage'

const JPEG = 'data:image/jpeg;base64,AAAA'

function fakeImage(width: number, height: number): DecodedImage {
  return { width, height, source: {} as CanvasImageSource, release: vi.fn() }
}

describe('calcCenterCrop', () => {
  it('横長:左右を切り落とし、中央の正方形にする', () => {
    expect(calcCenterCrop(1000, 500)).toEqual({ sx: 250, sy: 0, side: 500 })
  })

  it('縦長:上下を切り落とす', () => {
    expect(calcCenterCrop(500, 1000)).toEqual({ sx: 0, sy: 250, side: 500 })
  })

  it('正方形:そのまま', () => {
    expect(calcCenterCrop(300, 300)).toEqual({ sx: 0, sy: 0, side: 300 })
  })

  it('割り切れないときは、切り捨てる', () => {
    expect(calcCenterCrop(301, 300)).toEqual({ sx: 0, sy: 0, side: 300 })
  })
})

describe('drawSquareToJpeg', () => {
  function fakeCanvas(dataUrl = JPEG) {
    const context = {
      fillStyle: '',
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    }
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
      toDataURL: vi.fn(() => dataUrl),
    }
    return { canvas: canvas as unknown as HTMLCanvasElement, context, raw: canvas }
  }

  it('300x300のCanvasに、白で塗ってから、中央を切り抜いて描き、JPEGにする', () => {
    const { canvas, context, raw } = fakeCanvas()
    const image = fakeImage(1000, 500)

    const result = drawSquareToJpeg(image, 300, 0.7, () => canvas)

    expect(raw.width).toBe(300)
    expect(raw.height).toBe(300)
    expect(context.fillStyle).toBe('#ffffff')
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 300, 300)
    expect(context.drawImage).toHaveBeenCalledWith(image.source, 250, 0, 500, 500, 0, 0, 300, 300)
    expect(raw.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.7)
    expect(result).toBe(JPEG)
  })

  it('白い塗りつぶしは、画像を描くより先に行う', () => {
    const { canvas, context } = fakeCanvas()

    drawSquareToJpeg(fakeImage(400, 400), 300, 0.7, () => canvas)

    const fillOrder = context.fillRect.mock.invocationCallOrder[0]
    const drawOrder = context.drawImage.mock.invocationCallOrder[0]
    expect(fillOrder).toBeLessThan(drawOrder)
  })

  it('大きさが0の画像は、ImageProcessingError', () => {
    const { canvas } = fakeCanvas()

    expect(() => drawSquareToJpeg(fakeImage(0, 100), 300, 0.7, () => canvas)).toThrow(
      ImageProcessingError,
    )
  })

  it('2D描画が使えないときは、ImageProcessingError', () => {
    const canvas = { getContext: () => null } as unknown as HTMLCanvasElement

    expect(() => drawSquareToJpeg(fakeImage(400, 400), 300, 0.7, () => canvas)).toThrow(
      ImageProcessingError,
    )
  })

  it('JPEGでないデータURLが返ってきたら、ImageProcessingError', () => {
    const { canvas } = fakeCanvas('data:,')

    expect(() => drawSquareToJpeg(fakeImage(400, 400), 300, 0.7, () => canvas)).toThrow(
      ImageProcessingError,
    )
  })
})

describe('resizeImageToJpeg', () => {
  const file = new Blob(['x'], { type: 'image/png' })

  it('読み込み → 縮小して、決まった大きさ・品質で描き、一時的なものを片付ける', async () => {
    const image = fakeImage(800, 600)
    const decode = vi.fn(async () => image)
    const draw = vi.fn(() => JPEG)

    const result = await resizeImageToJpeg(file, { decode, draw })

    expect(result).toBe(JPEG)
    expect(draw).toHaveBeenCalledWith(image, IMAGE.size, IMAGE.jpegQuality)
    expect(image.release).toHaveBeenCalledTimes(1)
  })

  it('読み込みに失敗したら、ImageProcessingError', async () => {
    const decode = vi.fn(async () => {
      throw new Error('decode failed')
    })

    await expect(resizeImageToJpeg(file, { decode, draw: vi.fn() })).rejects.toBeInstanceOf(
      ImageProcessingError,
    )
  })

  it('描画に失敗しても、ImageProcessingError になり、片付けは行う', async () => {
    const image = fakeImage(800, 600)
    const draw = vi.fn(() => {
      throw new Error('draw failed')
    })

    await expect(
      resizeImageToJpeg(file, { decode: async () => image, draw }),
    ).rejects.toBeInstanceOf(ImageProcessingError)
    expect(image.release).toHaveBeenCalledTimes(1)
  })
})