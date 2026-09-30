import {
  Search,
  Gamepad2,
  HelpCircle,
  Scale,
  Brain,
  Microscope,
  Lightbulb,
  Target,
  Dices,
  Rocket,
  PartyPopper,
  Check,
  Circle,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react'

export type IconName =
  | 'search'
  | 'gamepad'
  | 'help'
  | 'scale'
  | 'brain'
  | 'microscope'
  | 'lightbulb'
  | 'target'
  | 'dice'
  | 'rocket'
  | 'party'
  | 'check'
  | 'circle'
  | 'refresh'

const iconMap: Record<IconName, LucideIcon> = {
  search: Search,
  gamepad: Gamepad2,
  help: HelpCircle,
  scale: Scale,
  brain: Brain,
  microscope: Microscope,
  lightbulb: Lightbulb,
  target: Target,
  dice: Dices,
  rocket: Rocket,
  party: PartyPopper,
  check: Check,
  circle: Circle,
  refresh: RotateCcw,
}

interface IconProps {
  name: IconName
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
}

export default function Icon({ name, size = 'md', className = '' }: IconProps) {
  const IconComponent = iconMap[name]
  if (!IconComponent) return null

  return (
    <IconComponent
      size={sizeMap[size]}
      className={`text-brand-accent ${className}`}
      aria-hidden="true"
    />
  )
}

export { iconMap }
