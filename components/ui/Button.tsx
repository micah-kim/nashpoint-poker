import Link from 'next/link'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-accent text-brand-primary hover:bg-brand-accent/90 focus-visible:ring-brand-accent',
  secondary: 'bg-brand-surface text-brand-text-primary hover:bg-brand-surface/80 focus-visible:ring-brand-surface',
  ghost: 'bg-transparent text-brand-accent hover:bg-brand-accent/10 focus-visible:ring-brand-accent',
  outline: 'border-2 border-brand-accent text-brand-accent bg-transparent hover:bg-brand-accent/10 focus-visible:ring-brand-accent',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-md',
  md: 'px-6 py-3 text-base rounded-md',
  lg: 'px-8 py-4 text-lg rounded-lg',
}

const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:opacity-50 disabled:cursor-not-allowed'

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', href, children, className = '', disabled, ...props }, ref) => {
    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

    if (href && !disabled) {
      return (
        <Link href={href} className={combinedStyles}>
          {children}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        className={combinedStyles}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
