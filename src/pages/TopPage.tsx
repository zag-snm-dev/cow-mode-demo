import { useState } from 'react'
import { CreateCardModal } from '@/features/card/components/CreateCardModal'
import { Hero } from '@/features/top/components/Hero'
import { HowToBlock } from '@/features/top/components/HowToBlock'
import { DISCLAIMER, HOW_TO_STEPS } from '@/features/top/content'
import { Button } from '@/shared/components/Button'

export function TopPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="grid gap-12">
      <Hero />

      <section aria-labelledby="how-to-heading" className="grid gap-6">
        <h2 id="how-to-heading" className="text-xl">
          使い方
        </h2>
        <ol role="list" className="grid gap-10">
          {HOW_TO_STEPS.map((step, index) => (
            <HowToBlock key={step.id} number={index + 1} step={step} />
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="start-heading"
        className="grid justify-items-center gap-3 pb-6 text-center"
      >
        <h2 id="start-heading" className="text-xl">
          はじめよう
        </h2>
        <p className="text-sm text-pink">{DISCLAIMER}</p>
        <Button onClick={() => setOpen(true)}>カードを作成する</Button>
      </section>

      <CreateCardModal
        open={open}
        onClose={() => setOpen(false)}
        // 作成後の /shop への移動は、HomeRoute が「カードがある」と気づいて自動で行う
        onCreated={() => setOpen(false)}
      />
    </div>
  )
}