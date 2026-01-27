interface SectionHeadingProps {
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export default function SectionHeading({ 
  title, 
  subtitle, 
  centered = true,
  className = '' 
}: SectionHeadingProps) {
  return (
    <div className={`mb-16 ${centered ? 'text-center' : ''} ${className}`}>
      <h2 className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
