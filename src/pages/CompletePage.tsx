import { LinkButton } from '@/shared/components/LinkButton'

export function CompletePage() {
  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      <h1 className="text-2xl">決済が完了しました</h1>
      <p>(決済額の表示は feature/checkout で実装します)</p>
      <LinkButton to="/">トップに戻る</LinkButton>
    </div>
  )
}