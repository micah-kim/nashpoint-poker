import type { Metadata } from 'next'
import DemoContent from '@/components/DemoContent'

export const metadata: Metadata = {
  title: 'Demo - Play the Spot Trainer',
  description: 'Play three real poker spots against five opponent types. See the GTO baseline, the exploitative adjustment, and what each decision is worth in big blinds.',
  openGraph: {
    title: 'Nash Point Demo - Play the Spot Trainer',
    description: 'Three spots, five opponent types, and the EV behind every line.',
  },
}

export default function DemoPage() {
  return <DemoContent />
}
