import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - AI Poker Training',
  description: 'Learn about our vision for the future of poker training and how we integrate TexasSolver technology.',
}

export default function AboutPage() {
  return (
    <div className="py-20 bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-text-primary mb-6">
            The Future of Poker Training
          </h1>
          <p className="text-xl text-brand-text-secondary">
            We're building a smarter way to learn poker
          </p>
        </div>

        {/* The Problem */}
        <section className="mb-16">
          <div className="bg-brand-surface p-8 rounded-lg border border-brand-accent/20">
            <h2 className="text-2xl font-bold text-brand-accent mb-4">
              The Problem with Current Solvers
            </h2>
            <div className="space-y-4 text-brand-text-secondary">
              <p>
                Traditional GTO solvers like GTO Wizard are excellent for learning baseline strategy. 
                They show you how to play against perfectly balanced opponents who never make mistakes.
              </p>
              <p>
                But here's the reality: <strong className="text-brand-text-primary">your opponents aren't perfect</strong>.
              </p>
              <p>
                They over-fold to aggression. They call too wide. They have exploitable tendencies. 
                And if you're only playing pure GTO, you're leaving money on the table.
              </p>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-brand-text-primary mb-8">
            Why Our Training Method is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-primary p-6 rounded-lg border border-brand-surface">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-brand-text-primary mb-3">
                Opponent Modeling
              </h3>
              <p className="text-brand-text-secondary">
                Train against specific opponent types: tight-aggressive, loose-passive, 
                micro-stakes regulars, and more. Learn when to adjust.
              </p>
            </div>

            <div className="bg-brand-primary p-6 rounded-lg border border-brand-surface">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="text-xl font-bold text-brand-text-primary mb-3">
                Explanation-Driven
              </h3>
              <p className="text-brand-text-secondary">
                Don't just memorize charts. Understand why each decision is optimal 
                with AI-powered explanations of the strategic concepts.
              </p>
            </div>

            <div className="bg-brand-primary p-6 rounded-lg border border-brand-surface">
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="text-xl font-bold text-brand-text-primary mb-3">
                Solver-Backed
              </h3>
              <p className="text-brand-text-secondary">
                Powered by TexasSolver, an open-source GTO solver. Get accurate, 
                reliable solutions without expensive subscriptions.
              </p>
            </div>

            <div className="bg-brand-primary p-6 rounded-lg border border-brand-surface">
              <div className="text-3xl mb-3">🎲</div>
              <h3 className="text-xl font-bold text-brand-text-primary mb-3">
                Randomized Training
              </h3>
              <p className="text-brand-text-secondary">
                Practice with scenarios that mirror real gameplay. Build intuition 
                through spaced repetition and adaptive difficulty.
              </p>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-brand-text-primary mb-8">
            Product Roadmap
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-brand-accent text-brand-primary rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text-primary mb-1">
                  Phase 1: Core Training Engine
                </h3>
                <p className="text-brand-text-secondary">
                  Hand input, opponent type selection, AI commentary, and TexasSolver integration
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-brand-surface text-brand-text-primary border-2 border-brand-accent rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text-primary mb-1">
                  Phase 2: Training Modes
                </h3>
                <p className="text-brand-text-secondary">
                  Random scenario generator, progress tracking, and spaced repetition system
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-brand-surface text-brand-text-primary border-2 border-brand-accent rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text-primary mb-1">
                  Phase 3: Advanced Features
                </h3>
                <p className="text-brand-text-secondary">
                  Hand history analysis, custom opponent profiles, and performance analytics
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TexasSolver Integration */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-brand-accent/20 to-brand-surface p-8 rounded-lg border border-brand-accent">
            <h2 className="text-2xl font-bold text-brand-text-primary mb-4">
              How TexasSolver Integration Works
            </h2>
            <div className="space-y-4 text-brand-text-secondary">
              <p>
                <a 
                  href="https://github.com/bupticybee/TexasSolver" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-accent hover:underline"
                >
                  TexasSolver
                </a> is an open-source GTO solver that provides the mathematical foundation for our training recommendations.
              </p>
              <p>
                When you input a scenario, we use TexasSolver to calculate the game-theory optimal baseline strategy. 
                Then, our AI layer analyzes how to adjust that strategy based on the opponent type you're facing.
              </p>
              <p>
                This gives you the best of both worlds: <strong className="text-brand-text-primary">GTO accuracy</strong> combined with <strong className="text-brand-text-primary">exploitative adjustments</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-brand-text-primary mb-4">
            Be Part of the Beta
          </h2>
          <p className="text-xl text-brand-text-secondary mb-8">
            Join our waitlist to get early access when we launch
          </p>
          <a
            href="/early-access"
            className="inline-block bg-brand-accent text-brand-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-accent/90 transition-all duration-200 hover:scale-105"
          >
            Join the Waitlist
          </a>
        </section>
      </div>
    </div>
  )
}
