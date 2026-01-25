interface Feature {
  title: string
  description: string
  icon: string
}

const features: Feature[] = [
  {
    title: 'Nash Equilibrium Foundation',
    description: 'Learn GTO principles built on John Nash\'s game theory. Master the mathematically optimal baseline strategy.',
    icon: '⚖️',
  },
  {
    title: 'Exploit Human Irrationality',
    description: 'Understand when and how to deviate from equilibrium based on opponent tendencies and psychological patterns.',
    icon: '🧠',
  },
  {
    title: 'TexasSolver-Backed Accuracy',
    description: 'Built on industry-standard solver technology with free API integration. Get proven, accurate solutions.',
    icon: '🔬',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Not just charts. Understand the reasoning behind every decision with explanations of strategic concepts.',
    icon: '💡',
  },
]

export default function FeatureSection() {
  return (
    <section className="py-20 bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">
            Why Nash Point is Different
          </h2>
          <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto">
            Master Nash Equilibrium, then learn when to break it
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
