export default function ComparisonSection() {
  return (
    <section className="py-20 bg-brand-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">
            How We Compare to GTO Wizard
          </h2>
          <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto">
            Built for the real world, not just theory
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Our Tool */}
          <div className="bg-gradient-to-br from-brand-accent/20 to-brand-surface p-8 rounded-lg border-2 border-brand-accent">
            <div className="flex items-center mb-6">
              <div className="bg-brand-accent text-brand-primary px-4 py-2 rounded-full font-bold text-sm">
                Nash Point
              </div>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-brand-accent mr-3 text-xl">✓</span>
                <span className="text-brand-text-primary">
                  <strong>Nash Equilibrium foundation</strong> - GTO as your baseline
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-accent mr-3 text-xl">✓</span>
                <span className="text-brand-text-primary">
                  <strong>Exploit irrationality</strong> - Profit from human tendencies
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-accent mr-3 text-xl">✓</span>
                <span className="text-brand-text-primary">
                  <strong>AI explanations</strong> - Understand the &quot;why&quot;
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-accent mr-3 text-xl">✓</span>
                <span className="text-brand-text-primary">
                  <strong>Free solver integration</strong> - TexasSolver API
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-accent mr-3 text-xl">✓</span>
                <span className="text-brand-text-primary">
                  <strong>Opponent modeling</strong> - Adaptive strategies
                </span>
              </li>
            </ul>
          </div>

          {/* GTO Wizard */}
          <div className="bg-brand-surface p-8 rounded-lg border border-brand-surface">
            <div className="flex items-center mb-6">
              <div className="bg-brand-text-secondary text-brand-primary px-4 py-2 rounded-full font-bold text-sm">
                GTO Wizard
              </div>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-brand-text-secondary mr-3 text-xl">○</span>
                <span className="text-brand-text-secondary">
                  Assumes <strong>balanced opponents</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-text-secondary mr-3 text-xl">○</span>
                <span className="text-brand-text-secondary">
                  <strong>Pure GTO</strong> focus only
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-text-secondary mr-3 text-xl">○</span>
                <span className="text-brand-text-secondary">
                  Chart-based learning with <strong>limited context</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-text-secondary mr-3 text-xl">○</span>
                <span className="text-brand-text-secondary">
                  Proprietary solver (paid subscription)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-text-secondary mr-3 text-xl">○</span>
                <span className="text-brand-text-secondary">
                  Pre-computed solutions
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-brand-text-secondary italic">
            GTO Wizard is a great tool for learning baseline strategy. We build on that foundation to help you win in real games.
          </p>
        </div>
      </div>
    </section>
  )
}
