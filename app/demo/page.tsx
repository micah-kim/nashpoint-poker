import type { Metadata } from 'next'
import DemoContent from '@/components/DemoContent'

export const metadata: Metadata = {
  title: 'Demo - Preview the Training Interface',
  description: 'Preview the Nash Point poker training interface. See how our AI-powered hand review, GTO analysis, and exploitative adjustments work together.',
  openGraph: {
    title: 'Nash Point Demo - Preview the Training Interface',
    description: 'See how AI-powered hand review combines GTO and exploitative strategies.',
  },
}

export default function DemoPage() {
  return <DemoContent />
}
