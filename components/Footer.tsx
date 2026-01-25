import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brand-primary border-t border-brand-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img 
              src="/assets/images/logo.png" 
              alt="Nash Point - AI Poker Training" 
              className="h-12 w-auto mb-4"
            />
            <p className="text-brand-text-secondary text-sm">
              Where game theory meets human irrationality.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-brand-text-primary font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-brand-text-secondary hover:text-brand-accent transition-colors duration-200 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-brand-text-secondary hover:text-brand-accent transition-colors duration-200 text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-brand-text-secondary hover:text-brand-accent transition-colors duration-200 text-sm">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/early-access" className="text-brand-text-secondary hover:text-brand-accent transition-colors duration-200 text-sm">
                  Early Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-brand-text-primary font-semibold mb-4">Get Updates</h3>
            <p className="text-brand-text-secondary text-sm mb-4">
              Join our waitlist to be the first to know when we launch.
            </p>
            <Link
              href="/early-access"
              className="inline-block bg-brand-accent text-brand-primary px-6 py-2 rounded-md font-semibold hover:bg-brand-accent/90 transition-colors duration-200 text-sm"
            >
              Join Waitlist
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-surface text-center">
          <p className="text-brand-text-secondary text-sm">
            © {new Date().getFullYear()} Nash Point. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
