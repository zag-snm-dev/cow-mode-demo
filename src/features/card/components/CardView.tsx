import cardBack from '@/assets/images/card-back.png'
import cardFront from '@/assets/images/card-front.png'

type Props = { className?: string } & (
  | { side: 'front'; name: string }
  | { side: 'back'; number: string }
)

// 文字の位置。%はカード画像の大きさに対する割合なので、画面幅が変わってもずれない。
// 画像の余白に合わせて、数字を調整する。
const NAME_POSITION = 'absolute right-[5%] bottom-[19%] left-[12%]'
const NUMBER_POSITION = 'absolute right-[5%] bottom-[19%] left-[12%]'

export function CardView(props: Props) {
  const { className = '' } = props

  if (props.side === 'front') {
    const hasName = props.name.trim() !== ''

    return (
      <div className={`@container relative ${className}`}>
        <img
          src={cardFront}
          alt="クレジットカード(表)"
          className="block h-auto w-full rounded-card"
        />
        <p
          className={`${NAME_POSITION} truncate text-[4.5cqw] font-bold tracking-wider text-ink ${
            hasName ? '' : 'opacity-50'
          }`}
        >
          {hasName ? props.name : 'YOUR NAME'}
        </p>
      </div>
    )
  }

  return (
    <div className={`@container relative ${className}`}>
      <img
        src={cardBack}
        alt="クレジットカード(裏)"
        className="block h-auto w-full rounded-card"
      />
      <p
        className={`${NUMBER_POSITION} font-mono text-[5.5cqw] tracking-[0.12em] text-ink tabular-nums`}
      >
        {props.number}
      </p>
    </div>
  )
}