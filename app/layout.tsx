import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nashpoint.ai'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Nash Point - AI Poker Training | GTO + Exploitative Strategy',
    template: '%s | Nash Point',
  },
  description: 'The first poker trainer that blends GTO and exploitative strategies. Master Nash Equilibrium principles while learning to exploit human irrationality. AI-powered hand review, game simulation, and training quizzes.',
  keywords: [
    'poker training',
    'GTO poker',
    'poker solver',
    'AI poker trainer',
    'Nash equilibrium poker',
    'exploitative poker strategy',
    'poker hand review',
    'poker simulation',
    'learn poker online',
    'poker quiz',
  ],
  authors: [{ name: 'Nash Point' }],
  creator: 'Nash Point',
  publisher: 'Nash Point',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Nash Point',
    title: 'Nash Point - AI Poker Training | GTO + Exploitative Strategy',
    description: 'The first poker trainer that blends GTO and exploitative strategies. Master Nash Equilibrium while exploiting human irrationality.',
    images: [
      {
        url: '/assets/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nash Point - AI Poker Training',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nash Point - AI Poker Training',
    description: 'The first poker trainer that blends GTO and exploitative strategies.',
    images: ['/assets/images/og-image.png'],
  },
  alternates: {
    canonical: baseUrl,
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <JsonLd type="software" />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
