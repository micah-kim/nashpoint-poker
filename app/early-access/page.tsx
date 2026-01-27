import type { Metadata } from 'next'
import WaitlistForm from '@/components/WaitlistForm'
import { Card } from '@/components/ui'
import { earlyAccessContent, earlyAccessBenefits } from '@/lib/content'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Early Access - Nash Point',
  description: 'Join the waitlist for early access to Nash Point - where game theory meets human irrationality.',
}

export default function EarlyAccessPage() {
  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-brand-bg via-brand-primary to-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-text-primary mb-6">
              {earlyAccessContent.title}
            </h1>
            <p className="text-xl text-brand-text-secondary mb-4">
              {earlyAccessContent.subtitle}
            </p>
            <p className="text-brand-text-secondary">
              {earlyAccessContent.description}
            </p>
          </header>

          {/* Benefits */}
          <Card variant="default" className="mb-12">
            <h2 className="text-xl font-bold text-brand-text-primary mb-4">
              Early Access Benefits
            </h2>
            <ul className="space-y-3" role="list">
              {earlyAccessBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <Check className="text-brand-accent mr-3 flex-shrink-0 mt-0.5" size={18} aria-hidden="true" />
                  <span className="text-brand-text-secondary">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Form */}
          <div className="flex justify-center">
            <WaitlistForm />
          </div>

          {/* Privacy Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-brand-text-secondary">
              {earlyAccessContent.privacyNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
