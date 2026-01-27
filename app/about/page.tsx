import type { Metadata } from 'next'
import { Button, Card, SectionHeading, Icon } from '@/components/ui'
import { aboutContent, approachFeatures, roadmap } from '@/lib/content'

export const metadata: Metadata = {
  title: 'About - Inspired by John Nash',
  description: 'Learn how Nash Point combines John Nash\'s equilibrium theory with exploitative poker strategy. Master GTO principles while learning to profit from human irrationality.',
  openGraph: {
    title: 'About Nash Point - Where Game Theory Meets Poker',
    description: 'Inspired by John Nash\'s equilibrium theory and understanding of human irrationality.',
  },
}

export default function AboutPage() {
  return (
    <div className="py-20 bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-text-primary mb-6">
            {aboutContent.headline}
          </h1>
          <p className="text-xl text-brand-text-secondary">
            {aboutContent.subheadline}
          </p>
        </header>

        {/* Nash Point Origin */}
        <section className="mb-16" aria-labelledby="origin-heading">
          <Card variant="accent" className="p-8">
            <h2 id="origin-heading" className="text-2xl font-bold text-brand-accent mb-4">
              {aboutContent.nashPointOrigin.title}
            </h2>
            <div className="space-y-4 text-brand-text-secondary">
              <p>
                John Nash revolutionized game theory with the <strong className="text-brand-text-primary">Nash Equilibrium</strong> - 
                the foundation of GTO (Game Theory Optimal) poker strategy.
              </p>
              <p>
                But Nash also understood something profound: <strong className="text-brand-text-primary">humans are inherently irrational</strong>. 
                His own struggles with schizophrenia gave him unique insight into the gap between theoretical perfection and human reality.
              </p>
              <p>
                <strong className="text-brand-text-primary">Nash Point</strong> embodies this duality. We teach you GTO principles as your 
                foundation, then show you how to exploit the inevitable irrationality of your opponents.
              </p>
              <p className="text-brand-accent italic">
                {aboutContent.nashPointOrigin.tagline}
              </p>
            </div>
          </Card>
        </section>

        {/* The Problem */}
        <section className="mb-16" aria-labelledby="problem-heading">
          <Card variant="default" className="p-8">
            <h2 id="problem-heading" className="text-2xl font-bold text-brand-accent mb-4">
              {aboutContent.problem.title}
            </h2>
            <div className="space-y-4 text-brand-text-secondary">
              <p>
                Traditional GTO solvers like GTO Wizard are excellent for learning baseline strategy. 
                They show you how to play against perfectly balanced opponents who never make mistakes.
              </p>
              <p>
                But here&apos;s the reality: <strong className="text-brand-text-primary">your opponents aren&apos;t perfect</strong>.
              </p>
              <p>
                They over-fold to aggression. They call too wide. They have exploitable tendencies. 
                And if you&apos;re only playing pure GTO, you&apos;re leaving money on the table.
              </p>
            </div>
          </Card>
        </section>

        {/* Our Approach */}
        <section className="mb-16" aria-labelledby="approach-heading">
          <h2 id="approach-heading" className="text-3xl font-bold text-brand-text-primary mb-8">
            Why Our Training Method is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approachFeatures.map((feature, index) => (
              <div key={index} className="bg-brand-primary p-6 rounded-lg border border-brand-surface">
                <div className="mb-3">
                  <Icon name={feature.icon} size="lg" />
                </div>
                <h3 className="text-xl font-bold text-brand-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-brand-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-16" aria-labelledby="roadmap-heading">
          <h2 id="roadmap-heading" className="text-3xl font-bold text-brand-text-primary mb-8">
            Product Roadmap
          </h2>
          <div className="space-y-4">
            {roadmap.map((phase) => (
              <div key={phase.phase} className="flex items-start">
                <div className={`${phase.active ? 'bg-brand-accent text-brand-primary' : 'bg-brand-surface text-brand-text-primary border-2 border-brand-accent'} rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0`}>
                  {phase.phase}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-text-primary mb-1">
                    {phase.title}
                  </h3>
                  <p className="text-brand-text-secondary">
                    {phase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Solver Integration */}
        <section className="mb-16" aria-labelledby="solver-heading">
          <Card variant="accent" className="p-8">
            <h2 id="solver-heading" className="text-2xl font-bold text-brand-text-primary mb-4">
              How Our Solver Integration Works
            </h2>
            <div className="space-y-4 text-brand-text-secondary">
              <p>
                We leverage open-source GTO solver technology that provides the mathematical foundation for our training recommendations.
              </p>
              <p>
                When you input a scenario, we calculate the game-theory optimal baseline strategy. 
                Then, our AI layer analyzes how to adjust that strategy based on the opponent type you&apos;re facing.
              </p>
              <p>
                This gives you the best of both worlds: <strong className="text-brand-text-primary">GTO accuracy</strong> combined with <strong className="text-brand-text-primary">exploitative adjustments</strong>.
              </p>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-brand-text-primary mb-4">
            Be Part of the Beta
          </h2>
          <p className="text-xl text-brand-text-secondary mb-8">
            Join our waitlist to get early access when we launch
          </p>
          <Button href="/early-access" size="lg">
            Join the Waitlist
          </Button>
        </section>
      </div>
    </div>
  )
}
