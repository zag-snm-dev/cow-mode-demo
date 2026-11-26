import { describe, expect, it } from 'vitest'
import { PRODUCTS_URL } from '@/features/products/api'
import indexHtml from '../../index.html?raw'
import vercelJson from '../../vercel.json?raw'

type Header = { key: string; value: string }
type VercelConfig = {
  rewrites: { source: string; destination: string }[]
  headers: { source: string; headers: Header[] }[]
}

const config = JSON.parse(vercelJson) as VercelConfig

/** 商品の画像の配信元(実際の配信元を、DevToolsで確かめて合わせる) */
const IMAGE_ORIGIN = 'https://cdn.dummyjson.com'

// ---- vercel.json ----

const allHeaders = config.headers
  .filter((rule) => rule.source === '/(.*)')
  .flatMap((rule) => rule.headers)

function headerValue(key: string): string | undefined {
  return allHeaders.find((header) => header.key.toLowerCase() === key.toLowerCase())?.value
}

function parseCsp(value: string): Record<string, string[]> {
  return Object.fromEntries(
    value
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...sources] = part.split(/\s+/)
        return [name, sources]
      }),
  )
}

const enforcing = headerValue('Content-Security-Policy') !== undefined
const cspValue = headerValue('Content-Security-Policy') ?? headerValue('Content-Security-Policy-Report-Only')
const csp = parseCsp(cspValue ?? '')

describe('vercel.json(rewrite)', () => {
  it('全パスを index.html に向ける', () => {
    expect(config.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' })
  })
})

describe('vercel.json(セキュリティヘッダー)', () => {
  it('基本のヘッダーが、すべて設定されている', () => {
    expect(headerValue('X-Content-Type-Options')).toBe('nosniff')
    expect(headerValue('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(headerValue('X-Frame-Options')).toBe('DENY')
    expect(headerValue('Permissions-Policy')).toContain('camera=()')
  })

  it('CSPが設定されている(Report-Only か、本物のどちらか)', () => {
    expect(cspValue).toBeDefined()
  })

  it('自分のJSだけを実行する(script-src は self だけ)', () => {
    expect(csp['default-src']).toEqual(["'self'"])
    expect(csp['script-src']).toEqual(["'self'"])
  })

  it('eval の許可と、ワイルドカードがない', () => {
    const sources = Object.values(csp).flat()

    expect(sources).not.toContain("'unsafe-eval'")
    expect(sources).not.toContain('*')
  })

  it('画像:自分のサイト・data:・blob:・商品の画像の配信元を許可する', () => {
    expect(csp['img-src']).toEqual(
      expect.arrayContaining(["'self'", 'data:', 'blob:', IMAGE_ORIGIN]),
    )
  })

  it('通信:自分のサイトと、商品を取得するAPIの送信先を許可する', () => {
    expect(csp['connect-src']).toEqual(
      expect.arrayContaining(["'self'", new URL(PRODUCTS_URL).origin]),
    )
  })

  it('プラグインの禁止、base と form の制限がある', () => {
    expect(csp['object-src']).toEqual(["'none'"])
    expect(csp['base-uri']).toEqual(["'self'"])
    expect(csp['form-action']).toEqual(["'self'"])
  })

  // frame-ancestors は、Report-Only では無視される。本物のCSPに切り替えたときから確かめる
  it.skipIf(!enforcing)('本物のCSPでは、iframe への埋め込みを禁止する', () => {
    expect(csp['frame-ancestors']).toEqual(["'none'"])
  })
})

// ---- index.html ----

const doc = new DOMParser().parseFromString(indexHtml, 'text/html')
const content = (selector: string) => doc.querySelector(selector)?.getAttribute('content')

describe('index.html(基本)', () => {
  it('言語・タイトル・説明・テーマカラーがある', () => {
    expect(doc.documentElement.lang).toBe('ja')
    expect(doc.title).toBe('COW MODE')
    expect(content('meta[name="description"]')).toBeTruthy()
    expect(content('meta[name="theme-color"]')).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('拡大を禁止していない(user-scalable / maximum-scale がない)', () => {
    expect(content('meta[name="viewport"]')).not.toMatch(/user-scalable|maximum-scale/)
  })
})

describe('index.html(OGP)', () => {
  it('基本のタグがある', () => {
    expect(content('meta[property="og:type"]')).toBe('website')
    expect(content('meta[property="og:site_name"]')).toBe('COW MODE')
    expect(content('meta[property="og:title"]')).toBe('COW MODE')
    expect(content('meta[property="og:url"]')).toBe('https://portfolio02-demo.vercel.app/')
    expect(content('meta[property="og:image"]')).toBe('https://portfolio02-demo.vercel.app/og-image.png')
    expect(content('meta[property="og:image:width"]')).toBe('1200')
    expect(content('meta[property="og:image:height"]')).toBe('630')
    expect(content('meta[property="og:image:alt"]')).toBe('COW MODEのキャラクター(牛)')
  })

  it('URLと画像は、httpsの絶対URLで、画像は同じものを指す', () => {
    const url = content('meta[property="og:url"]')
    const image = content('meta[property="og:image"]')

    expect(url).toMatch(/^https:\/\//)
    expect(image).toMatch(/^https:\/\/.+\/og-image\.png$/)
    expect(content('meta[name="twitter:image"]')).toBe(image)
  })

  it('プロジェクト名の仮の値(YOUR-PROJECT)が残っていない', () => {
    expect(indexHtml).not.toContain('YOUR-PROJECT')
  })
})