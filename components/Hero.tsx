import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-bg via-brand-primary to-brand-bg py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-text-primary mb-6 tracking-tight">
            Master the <span className="text-brand-accent">Nash Equilibrium</span>
            <br />
            Exploit Human <span className="text-brand-accent">Irrationality</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-brand-text-secondary mb-8 font-light">
            Where perfect game theory meets imperfect opponents.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/early-access"
              className="bg-brand-accent text-brand-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-accent/90 transition-all duration-200 hover:scale-105"
            >
              Join the Waitlist
            </Link>
            <Link
              href="/demo"
              className="border-2 border-brand-accent text-brand-accent px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-accent/10 transition-all duration-200"
            >
              See Demo
            </Link>
          </div>

          {/* Mockup Placeholder */}
          <div className="mt-16 bg-brand-surface rounded-lg p-8 shadow-2xl border border-brand-accent/20">
            <div className="aspect-video bg-brand-primary rounded-md flex items-center justify-center">
              <p className="text-brand-text-secondary">
                [Tool Mockup Preview]
              </p>
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
