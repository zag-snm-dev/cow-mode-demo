/**
 * 日時を「2026/11/06 14:30」の形にする。
 * timeZone を省略すると、利用者の端末の時刻(日本なら日本時間)で表示する。
 */
export function formatDateTime(timestamp: number, timeZone?: string): string {
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23', // 0時を「24:00」ではなく「00:00」にする
  })

  const parts = Object.fromEntries(
    formatter.formatToParts(timestamp).map((part) => [part.type, part.value]),
  )

  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}`
}