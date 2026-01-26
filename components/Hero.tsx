import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-bg via-brand-primary to-brand-bg py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/30 rounded-full px-4 py-2 mb-6">
            <span className="text-brand-accent text-sm font-medium">🚀 The First of Its Kind</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-text-primary mb-6 tracking-tight">
            The First Poker Trainer That{' '}
            <span className="text-brand-accent">Blends GTO + Exploits</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-brand-text-secondary mb-4 font-light">
            Stop memorizing charts. Start understanding decisions.
          </p>
          
          {/* Value Proposition */}
          <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl mx-auto">
            Nash Point uses AI to seamlessly combine game-theory optimal strategies with exploitative adjustments 
            based on your opponents. Review hands, simulate games, and master spots—all with feedback you can actually use.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/early-access"
              className="bg-brand-accent text-brand-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-accent/90 transition-all duration-200 hover:scale-105"
            >
              Join the Waitlist
            </Link>
            <Link
              href="#tools"
              className="border-2 border-brand-accent text-brand-accent px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-accent/10 transition-all duration-200"
            >
              See What&apos;s Coming
            </Link>
          </div>

          {/* Key Differentiators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-brand-surface/50 rounded-lg p-4 border border-brand-accent/10">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-brand-text-primary font-semibold mb-1">Hand Review</div>
              <div className="text-brand-text-secondary text-sm">Analyze any hand with AI</div>
            </div>
            <div className="bg-brand-surface/50 rounded-lg p-4 border border-brand-accent/10">
              <div className="text-2xl mb-2">🎮</div>
              <div className="text-brand-text-primary font-semibold mb-1">Game Simulation</div>
              <div className="text-brand-text-secondary text-sm">Practice vs AI opponents</div>
            </div>
            <div className="bg-brand-surface/50 rounded-lg p-4 border border-brand-accent/10">
              <div className="text-2xl mb-2">❓</div>
              <div className="text-brand-text-primary font-semibold mb-1">Spot Quizzes</div>
              <div className="text-brand-text-secondary text-sm">Sharpen your decisions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
