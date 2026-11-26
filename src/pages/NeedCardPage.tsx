import { NEED_CARD_COPY } from '@/features/card/content'
import { CowImage } from '@/shared/components/CowImage'
import { LinkButton } from '@/shared/components/LinkButton'

export function NeedCardPage() {
  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      <CowImage variant="front" className="w-40" />
      <h1 className="text-2xl">{NEED_CARD_COPY.title}</h1>
      <p>{NEED_CARD_COPY.description}</p>
      <LinkButton to="/">{NEED_CARD_COPY.link}</LinkButton>
    </div>
  )
}