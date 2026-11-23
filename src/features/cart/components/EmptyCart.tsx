import { LinkButton } from '@/shared/components/LinkButton'
import { CowImage } from '@/shared/components/CowImage'

export function EmptyCart() {
  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      <div className="flex justify-center">
        <CowImage variant="front" priority className="w-40" />
      </div>
      <p className="text-lg">カートは空です</p>
      <LinkButton to="/shop">お買い物へ</LinkButton>
    </div>
  )
}