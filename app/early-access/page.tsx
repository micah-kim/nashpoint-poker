import type { Metadata } from 'next'
import WaitlistForm from '@/components/WaitlistForm'

export const metadata: Metadata = {
  title: 'Early Access - AI Poker Training',
  description: 'Join the waitlist for early access to our AI-enhanced poker training tool.',
}

export default function EarlyAccessPage() {
  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-brand-bg via-brand-primary to-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-text-primary mb-6">
              Get Early Access
            </h1>
            <p className="text-xl text-brand-text-secondary mb-4">
              Be among the first to train with AI-enhanced poker strategy
            </p>
            <p className="text-brand-text-secondary">
              Join our waitlist and we'll notify you when we launch. 
              Early access members will get exclusive benefits and pricing.
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-12 bg-brand-surface p-6 rounded-lg border border-brand-accent/20">
            <h2 className="text-xl font-bold text-brand-text-primary mb-4">
              Early Access Benefits
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-brand-accent mr-3">✓</span>
                <span className="text-brand-text-secondary">
                  First access to the training platform
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-accent mr-3">✓</span>
                <span className="text-brand-text-secondary">
                  Special launch pricing
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-accent mr-3">✓</span>
                <span className="text-brand-text-secondary">
                  Direct input on feature development
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-accent mr-3">✓</span>
                <span className="text-brand-text-secondary">
                  Priority support
                </span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="flex justify-center">
            <WaitlistForm />
          </div>

          {/* Privacy Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-brand-text-secondary">
              We respect your privacy. Your email will only be used to notify you about product updates. 
              We'll never share your information with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
