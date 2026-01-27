import { Card, SectionHeading, Icon } from '@/components/ui'
import { featuresContent, features } from '@/lib/content'

export default function FeatureSection() {
  return (
    <section className="py-20 bg-brand-bg" aria-labelledby="features-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={featuresContent.title}
          subtitle={featuresContent.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="default"
              hover
            >
              <div className="mb-4">
                <Icon name={feature.icon} size="xl" />
              </div>
              <h3 className="text-xl font-bold text-brand-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-brand-text-secondary">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
