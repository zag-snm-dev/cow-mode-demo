import { LinkButton } from '@/shared/components/LinkButton'

export function NeedCardPage() {
  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      <h1 className="text-2xl">カードを作成してください</h1>
      <p>
        COW MODEを使うには、まずカードが必要です。トップページでカードを作成すると、お買い物を始められます。
      </p>
      <LinkButton to="/">トップページへ</LinkButton>
    </div>
  )
}