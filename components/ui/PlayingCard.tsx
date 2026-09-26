const suitSymbols: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
const suitNames: Record<string, string> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
const rankNames: Record<string, string> = {
  A: 'ace', K: 'king', Q: 'queen', J: 'jack', T: 'ten',
}

type PlayingCardSize = 'sm' | 'md'

interface PlayingCardProps {
  /** Two-character notation: rank then suit, e.g. `Ah`, `Ts`, `9d`. */
  card: string
  size?: PlayingCardSize
  className?: string
}

const sizeStyles: Record<PlayingCardSize, string> = {
  sm: 'w-9 h-12 text-base rounded',
  md: 'w-12 h-16 text-lg rounded-md',
}

export default function PlayingCard({ card, size = 'md', className = '' }: PlayingCardProps) {
  const rank = card.slice(0, -1)
  const suit = card.slice(-1).toLowerCase()
  const isRed = suit === 'h' || suit === 'd'
  const label = `${rankNames[rank.toUpperCase()] ?? rank} of ${suitNames[suit] ?? suit}`

  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-flex flex-col items-center justify-center bg-white font-bold shadow-md ${
        isRed ? 'text-red-600' : 'text-neutral-900'
      } ${sizeStyles[size]} ${className}`}
    >
      <span aria-hidden="true">{rank === 'T' ? '10' : rank}</span>
      <span aria-hidden="true" className="leading-none">{suitSymbols[suit] ?? suit}</span>
    </span>
  )
}
