/** 重複しにくいIDを作る(UUID v4の形式) */
export function generateId(): string {
  const cryptoApi = globalThis.crypto

  // randomUUID は https / localhost でしか使えないので、使えないときは自前で作る
  if (typeof cryptoApi.randomUUID === 'function') return cryptoApi.randomUUID()

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // バージョン4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // 変種
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}