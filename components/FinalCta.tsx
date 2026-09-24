import { Button } from '@/components/ui'
import { finalCtaContent } from '@/lib/content'

export default function FinalCta() {
  return (
    <section className="py-20 bg-gradient-to-b from-brand-primary to-brand-bg" aria-labelledby="final-cta-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="final-cta-heading" className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">
          {finalCtaContent.title}
        </h2>
        <p className="text-xl text-brand-text-secondary mb-8 max-w-2xl mx-auto">
          {finalCtaContent.description}
        </p>
        <Button href="/early-access" size="lg">
          {finalCtaContent.cta}
        </Button>
      </div>
    </section>
  )
}
