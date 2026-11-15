/**
 * ページ移動のときに添えられたお知らせ(location.state の notice)を取り出す。
 * state は、ブラウザの履歴に残る「何でも入る箱」なので、形を確かめてから使う。
 */
export function readNotice(state: unknown): string | null {
  if (
    typeof state === 'object' &&
    state !== null &&
    'notice' in state &&
    typeof state.notice === 'string'
  ) {
    return state.notice
  }
  return null
}