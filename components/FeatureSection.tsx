interface Feature {
  title: string
  description: string
  icon: string
}

const features: Feature[] = [
  {
    title: 'Opponent-Aware Strategies',
    description: 'Adjust your play based on opponent tendencies. Learn when to deviate from GTO for maximum profit.',
    icon: '🎯',
  },
  {
    title: 'TexasSolver-Backed Accuracy',
    description: 'Built on industry-standard solver technology with free API integration. Get proven, accurate solutions.',
    icon: '🔬',
  },
  {
    title: 'Explain-the-Why Training',
    description: 'Not just charts. Understand the reasoning behind every decision with AI-powered explanations.',
    icon: '💡',
  },
  {
    title: 'Real-World Scenario Analysis',
    description: 'Practice with randomized scenarios that mirror actual gameplay. Train smarter, not harder.',
    icon: '🎲',
  },
]

export default function FeatureSection() {
  return (
    <section className="py-20 bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">
            Why This Training Tool is Different
          </h2>
          <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto">
            Go beyond traditional GTO training with intelligent, adaptive strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-brand-surface p-6 rounded-lg border border-brand-accent/20 hover:border-brand-accent/40 transition-all duration-200 hover:transform hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-brand-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-brand-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
