import { forwardRef } from 'react'

type CardVariant = 'default' | 'elevated' | 'bordered' | 'accent'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hover?: boolean
  children: React.ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-brand-surface border border-brand-accent/20',
  elevated: 'bg-brand-surface/50 border border-brand-accent/10',
  bordered: 'bg-brand-surface border border-brand-surface',
  accent: 'bg-gradient-to-br from-brand-accent/20 to-brand-surface border-2 border-brand-accent',
}

const baseStyles = 'rounded-lg p-6 transition-all duration-200'
// More subtle hover: slight border change and shadow instead of scale transform
const hoverStyles = 'hover:border-brand-accent/50 hover:shadow-lg hover:shadow-brand-accent/10'

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, children, className = '', ...props }, ref) => {
    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${hover ? hoverStyles : ''} ${className}`

    return (
      <div ref={ref} className={combinedStyles} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
