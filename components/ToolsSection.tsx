'use client'

import { Button, SectionHeading, Icon, type IconName } from '@/components/ui'
import { demoContent } from '@/lib/content'
import { useInView } from '@/lib/hooks'
import { HandReviewMockup, GameSimulationMockup, QuizMockup } from '@/components/mockups'
import { Check } from 'lucide-react'

interface Tool {
  id: string
  title: string
  subtitle: string
  description: string
  features: string[]
  icon: IconName
}

// Wrapper component that passes isInView to mockups
function AnimatedMockup({ id, children }: { id: string, children: (isInView: boolean) => React.ReactNode }) {
  const { ref, isInView } = useInView(0.5)
  
  return (
    <div ref={ref}>
      {children(isInView)}
    </div>
  )
}

const tools: Tool[] = [
  {
    id: 'hand-review',
    title: 'Hand Review',
    subtitle: 'Analyze any hand with AI-powered feedback',
    description: 'Input details about any hand you played—your cards, the board, opponent types, and action sequences. Our AI combines GTO analysis with exploitative insights based on your table image and opponent tendencies.',
    features: [
      'Detailed hand input with full action history',
      'Specify opponent player types (TAG, LAG, fish, etc.)',
      'Get a decision rating with clear explanations',
      'Learn what you did right and how to improve',
    ],
    icon: 'search',
  },
  {
    id: 'game-simulation',
    title: 'Game Simulation',
    subtitle: 'Practice against AI opponents in realistic scenarios',
    description: 'Configure a virtual table with different player types—tight-aggressive pros, loose recreational players, or a mix. Play full sessions and receive comprehensive feedback on your overall performance.',
    features: [
      'Choose opponent profiles (pro, recreational, etc.)',
      'Play realistic multi-hand sessions',
      'Post-session breakdown of key hands',
      'Track progress with quantifiable metrics (BB/100, VPIP, etc.)',
    ],
    icon: 'gamepad',
  },
  {
    id: 'quizzes',
    title: 'Spot Training Quizzes',
    subtitle: 'Quick scenarios to sharpen your decision-making',
    description: 'Face specific hand situations and choose your action. Perfect for building intuition during short practice sessions. Each answer includes detailed feedback explaining the optimal play.',
    features: [
      'Pre-built scenarios for common situations',
      'Multiple choice format for quick practice',
      'Instant feedback with GTO + exploitative reasoning',
      'Track accuracy and identify weak spots',
    ],
    icon: 'help',
  },
]

function ToolMockup({ toolId }: { toolId: string }) {
  switch (toolId) {
    case 'hand-review':
      return (
        <AnimatedMockup id={toolId}>
          {(isInView) => <HandReviewMockup isInView={isInView} />}
        </AnimatedMockup>
      )
    case 'game-simulation':
      return <GameSimulationMockup />
    case 'quizzes':
      return (
        <AnimatedMockup id={toolId}>
          {(isInView) => <QuizMockup isInView={isInView} />}
        </AnimatedMockup>
      )
    default:
      return null
  }
}

export default function ToolsSection() {
  return (
    <section className="py-20 bg-brand-bg" aria-labelledby="tools-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeading
          title="What You'll Be Able to Do"
          subtitle="Three powerful tools designed to help you master both GTO fundamentals and exploitative adjustments"
        />

        {/* Tools Grid */}
        <div className="space-y-24">
          {tools.map((tool, index) => (
            <article
              key={tool.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon name={tool.icon} size="xl" />
                  <div>
                    <h3 className="text-2xl font-bold text-brand-text-primary">
                      {tool.title}
                    </h3>
                    <p className="text-brand-accent">{tool.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-brand-text-secondary mb-6 leading-relaxed">
                  {tool.description}
                </p>

                <ul className="space-y-3" role="list">
                  {tool.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="text-brand-accent mt-0.5 flex-shrink-0" size={18} aria-hidden="true" />
                      <span className="text-brand-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mockup with Animation */}
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="bg-brand-surface p-4 rounded-xl border border-brand-accent/20 shadow-2xl">
                  <ToolMockup toolId={tool.id} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <p className="text-brand-text-secondary mb-6">
            Be the first to experience these tools when we launch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/early-access" size="lg">
              Join the Waitlist
            </Button>
            <Button href="/demo" variant="outline" size="lg">
              {demoContent.linkCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
