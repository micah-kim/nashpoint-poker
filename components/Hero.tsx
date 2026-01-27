import { Button, Badge, Card, Icon } from '@/components/ui'
import { heroContent, heroTools } from '@/lib/content'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-bg via-brand-primary to-brand-bg py-20 sm:py-32" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge className="mb-6">
            {heroContent.badge}
          </Badge>

          {/* Main Headline */}
          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-text-primary mb-6 tracking-tight">
            {heroContent.headline}{' '}
            <span className="text-brand-accent">{heroContent.headlineAccent}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-brand-text-secondary mb-4 font-light">
            {heroContent.subheadline}
          </p>
          
          {/* Value Proposition */}
          <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl mx-auto">
            {heroContent.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button href="/early-access" size="lg">
              {heroContent.primaryCta}
            </Button>
            <Button href="#tools" variant="outline" size="lg">
              {heroContent.secondaryCta}
            </Button>
          </div>

          {/* Key Differentiators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {heroTools.map((tool) => (
              <Card key={tool.title} variant="elevated" className="p-4">
                <div className="mb-2 flex justify-center">
                  <Icon name={tool.icon} size="lg" />
                </div>
                <div className="text-brand-text-primary font-semibold mb-1">{tool.title}</div>
                <div className="text-brand-text-secondary text-sm">{tool.description}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
