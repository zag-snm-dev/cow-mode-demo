import { useState } from 'react'
import { CreateCardModal } from '@/features/card/components/CreateCardModal'
import { Button } from '@/shared/components/Button'

export function TopPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl">COW MODE</h1>
      <p>(使い方の説明は feature/top-page で実装します)</p>
      <Button onClick={() => setOpen(true)}>カードを作成する</Button>

      <CreateCardModal
        open={open}
        onClose={() => setOpen(false)}
        // 作成後の /shop への移動は、HomeRoute が「カードがある」と気づいて自動で行う
        onCreated={() => setOpen(false)}
      />
    </div>
  )
}