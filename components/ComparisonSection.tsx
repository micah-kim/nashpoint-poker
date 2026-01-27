import { Card, SectionHeading, Badge } from '@/components/ui'
import { comparisonContent, nashPointFeatures, competitorFeatures, siteConfig } from '@/lib/content'
import { Check, Circle } from 'lucide-react'

export default function ComparisonSection() {
  return (
    <section className="py-20 bg-brand-primary" aria-labelledby="comparison-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={comparisonContent.title}
          subtitle={comparisonContent.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Our Tool */}
          <Card variant="accent" className="p-8">
            <div className="flex items-center mb-6">
              <Badge variant="accent">
                {siteConfig.name}
              </Badge>
            </div>
            <ul className="space-y-4" role="list">
              {nashPointFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="text-brand-accent mr-3 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                  <span className="text-brand-text-primary">
                    <strong>{feature.text}</strong>{feature.detail && ` - ${feature.detail}`}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* GTO Wizard */}
          <Card variant="bordered" className="p-8">
            <div className="flex items-center mb-6">
              <Badge variant="muted">
                GTO Wizard
              </Badge>
            </div>
            <ul className="space-y-4" role="list">
              {competitorFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Circle className="text-brand-text-secondary mr-3 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                  <span className="text-brand-text-secondary">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-brand-text-secondary italic">
            {comparisonContent.disclaimer}
          </p>
        </div>
      </div>
    </section>
  )
}
