type BadgeVariant = 'default' | 'accent' | 'muted' | 'warning'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent',
  accent: 'bg-brand-accent text-brand-primary border-transparent',
  muted: 'bg-brand-text-secondary text-brand-primary border-transparent',
  warning: 'bg-brand-accent/20 border-brand-accent text-brand-accent',
}

const baseStyles = 'inline-flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-medium'

export default function Badge({ 
  children, 
  variant = 'default',
  className = '' 
}: BadgeProps) {
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
