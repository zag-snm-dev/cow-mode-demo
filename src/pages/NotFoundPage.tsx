import { LinkButton } from '@/shared/components/LinkButton'

export function NotFoundPage() {
  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      <h1 className="text-2xl">ページが見つかりません</h1>
      <LinkButton to="/">トップへ戻る</LinkButton>
    </div>
  )
}