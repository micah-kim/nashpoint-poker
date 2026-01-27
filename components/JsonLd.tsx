import { siteConfig } from '@/lib/content'

interface JsonLdProps {
  type?: 'website' | 'software'
}

export default function JsonLd({ type = 'website' }: JsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nashpoint.ai'

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/PreOrder',
    },
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: baseUrl,
    },
    keywords: [
      'poker training',
      'GTO poker',
      'poker solver',
      'AI poker',
      'Nash equilibrium poker',
      'exploitative poker',
      'poker strategy',
    ],
  }

  const schema = type === 'software' ? softwareSchema : websiteSchema

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
