import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { navLinks, footerContent, siteConfig } from '@/lib/content'

export default function Footer() {
  return (
    <footer className="bg-brand-primary border-t border-brand-surface" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Image 
              src="/assets/images/logo.png" 
              alt={siteConfig.name}
              width={144}
              height={48}
              className="h-12 w-auto mb-4"
            />
            <p className="text-brand-text-secondary text-sm">
              {footerContent.tagline}
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-brand-text-primary font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-brand-text-secondary hover:text-brand-accent transition-colors duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-brand-text-primary font-semibold mb-4">{footerContent.ctaTitle}</h3>
            <p className="text-brand-text-secondary text-sm mb-4">
              {footerContent.ctaDescription}
            </p>
            <Button href="/early-access" size="sm">
              Join Waitlist
            </Button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-surface text-center">
          <p className="text-brand-text-secondary text-sm">
            {footerContent.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
