import { LinkButton } from '@/shared/components/LinkButton'
import { MYPAGE_COPY } from '../content'

export function EmptyHistory() {
  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      <p className="text-lg">{MYPAGE_COPY.emptyTitle}</p>
      <LinkButton to="/">{MYPAGE_COPY.emptyLink}</LinkButton>
    </div>
  )
}