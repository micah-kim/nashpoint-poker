import type { Metadata } from 'next'
import DemoContent from '@/components/DemoContent'

export const metadata: Metadata = {
  title: 'Demo - Play the Spot Trainer',
  description: 'Play real poker spots against five opponent types, or take a randomly dealt drill. See the GTO baseline, the exploitative adjustment, and what each decision is worth in big blinds.',
  openGraph: {
    title: 'Nash Point Demo - Play the Spot Trainer',
    description: 'Pick your read or take a dealt drill. Five opponent types and the EV behind every line.',
  },
}

export default function DemoPage() {
  return <DemoContent />
}
