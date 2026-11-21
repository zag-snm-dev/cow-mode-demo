import { LinkButton } from '@/shared/components/LinkButton'

export function EmptyCart() {
  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      {/* 牛キャラ(正面)の画像は、chore/assets-copy で差し替える */}
      <div
        aria-hidden="true"
        className="flex h-40 w-40 items-center justify-center rounded-card border border-dashed border-gold bg-surface text-xs text-gold"
      >
        牛キャラ(正面)・仮画像
      </div>
      <p className="text-lg">カートは空です</p>
      <LinkButton to="/shop">お買い物へ</LinkButton>
    </div>
  )
}