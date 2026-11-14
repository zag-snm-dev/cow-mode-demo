import { useState } from 'react'
import { CardView } from '@/features/card/components/CardView'
import { CreateCardModal } from '@/features/card/components/CreateCardModal'
import { useCard } from '@/features/card/useCard'
import { Button } from '@/shared/components/Button'

export default function App() {
  const [open, setOpen] = useState(false)
  const card = useCard()

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-5">
      <h1 className="text-2xl">カードの確認</h1>

      {card ? (
        <>
          <CardView side="front" name={card.name} />
          <CardView side="back" number={card.number} />
        </>
      ) : (
        <p>カード未作成</p>
      )}

      <Button onClick={() => setOpen(true)}>カードを作成する</Button>

      <CreateCardModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => setOpen(false)}
      />
    </div>
  )
}