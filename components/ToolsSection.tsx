'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

interface Tool {
  id: string
  title: string
  subtitle: string
  description: string
  features: string[]
  icon: string
  mockup: React.ReactNode
}

// Hook to detect when element is in viewport
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isInView }
}

// Typing animation hook
function useTypingAnimation(text: string, isActive: boolean, speed = 30) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setDisplayedText('')
      setIsComplete(false)
      return
    }

    let index = 0
    setDisplayedText('')
    setIsComplete(false)

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, isActive, speed])

  return { displayedText, isComplete }
}

const HandReviewMockup = ({ isInView }: { isInView: boolean }) => {
  const fullText = "Your river check was +EV. Against a TAG, betting here allows them to fold better hands while only getting called by nutted holdings. By checking, you induce bluffs and keep their bluffing range in play."
  const { displayedText, isComplete } = useTypingAnimation(fullText, isInView, 25)
  const [showRating, setShowRating] = useState(false)

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => setShowRating(true), 300)
      return () => clearTimeout(timer)
    } else {
      setShowRating(false)
    }
  }, [isComplete])

  return (
    <div className="bg-brand-primary rounded-lg p-4 border border-brand-surface">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-brand-accent font-semibold text-sm">Hand Review</span>
        <span className="text-brand-text-secondary text-xs">Session #24</span>
      </div>
      
      {/* Hand Input Section */}
      <div className="bg-brand-bg rounded-md p-3 mb-3">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-brand-text-secondary">Your Hand:</span>
          <div className="flex gap-1">
            <div className="w-8 h-10 bg-white rounded text-center flex items-center justify-center text-black font-bold text-xs">A♠</div>
            <div className="w-8 h-10 bg-white rounded text-center flex items-center justify-center text-black font-bold text-xs">K♠</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-text-secondary">Board:</span>
          <div className="flex gap-1">
            <div className="w-7 h-9 bg-white rounded text-center flex items-center justify-center text-red-600 font-bold text-xs">Q♥</div>
            <div className="w-7 h-9 bg-white rounded text-center flex items-center justify-center text-black font-bold text-xs">J♠</div>
            <div className="w-7 h-9 bg-white rounded text-center flex items-center justify-center text-red-600 font-bold text-xs">10♦</div>
            <div className="w-7 h-9 bg-white rounded text-center flex items-center justify-center text-black font-bold text-xs">2♣</div>
            <div className="w-7 h-9 bg-white rounded text-center flex items-center justify-center text-red-600 font-bold text-xs">7♥</div>
          </div>
        </div>
      </div>

      {/* Opponent Info */}
      <div className="bg-brand-surface/50 rounded-md p-2 mb-3">
        <div className="text-xs text-brand-text-secondary mb-1">Opponent: <span className="text-brand-accent">Tight-Aggressive</span></div>
        <div className="text-xs text-brand-text-secondary">Position: <span className="text-brand-text-primary">BTN vs BB</span></div>
      </div>

      {/* AI Feedback with typing animation */}
      <div className="border-l-2 border-brand-accent pl-3 min-h-[80px]">
        <div className="text-xs text-brand-accent mb-1 flex items-center gap-2">
          AI Analysis
          {isInView && !isComplete && (
            <span className="inline-block w-1.5 h-3 bg-brand-accent animate-pulse" />
          )}
        </div>
        <p className="text-xs text-brand-text-secondary leading-relaxed">
          {displayedText.split('+EV').map((part, i) => 
            i === 0 ? part : <span key={i}><span className="text-green-400">+EV</span>{part}</span>
          )}
          {!isComplete && isInView && <span className="inline-block w-1 h-3 bg-brand-text-secondary animate-pulse ml-0.5" />}
        </p>
      </div>

      {/* Rating - appears after typing completes */}
      <div className={`mt-3 flex items-center justify-between transition-all duration-500 ${showRating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <span className="text-xs text-brand-text-secondary">Decision Rating:</span>
        <div className="flex items-center gap-1">
          <span className="text-brand-accent font-bold text-lg">8.5</span>
          <span className="text-brand-text-secondary text-xs">/10</span>
        </div>
      </div>
    </div>
  )
}

const GameSimulationMockup = () => (
  <div className="bg-brand-primary rounded-lg p-4 border border-brand-surface">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <span className="text-brand-accent font-semibold text-sm">Live Session</span>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-green-400 text-xs">In Progress</span>
      </div>
    </div>

    {/* Poker Table Visualization */}
    <div className="relative bg-green-900/30 rounded-full w-full aspect-[2/1] mb-3 border-4 border-green-800/50 flex items-center justify-center">
      {/* Pot */}
      <div className="text-center">
        <div className="text-xs text-brand-text-secondary">Pot</div>
        <div className="text-brand-accent font-bold">$247</div>
      </div>
      
      {/* Players around table */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <div className="bg-brand-surface px-2 py-1 rounded text-xs">
          <span className="text-red-400">TAG</span>
        </div>
      </div>
      <div className="absolute top-1/2 -left-1 -translate-y-1/2">
        <div className="bg-brand-surface px-2 py-1 rounded text-xs">
          <span className="text-yellow-400">LAG</span>
        </div>
      </div>
      <div className="absolute top-1/2 -right-1 -translate-y-1/2">
        <div className="bg-brand-surface px-2 py-1 rounded text-xs">
          <span className="text-blue-400">Fish</span>
        </div>
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <div className="bg-brand-accent px-2 py-1 rounded text-xs text-brand-primary font-semibold">
          YOU
        </div>
      </div>
    </div>

    {/* Your Cards */}
    <div className="flex items-center justify-center gap-2 mb-3">
      <div className="w-10 h-14 bg-white rounded shadow-lg flex items-center justify-center text-black font-bold">K♣</div>
      <div className="w-10 h-14 bg-white rounded shadow-lg flex items-center justify-center text-red-600 font-bold">Q♥</div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2">
      <button className="flex-1 bg-red-600/80 text-white text-xs py-2 rounded font-medium">Fold</button>
      <button className="flex-1 bg-blue-600/80 text-white text-xs py-2 rounded font-medium">Call $45</button>
      <button className="flex-1 bg-green-600/80 text-white text-xs py-2 rounded font-medium">Raise</button>
    </div>

    {/* Session Stats */}
    <div className="mt-3 pt-3 border-t border-brand-surface flex justify-between text-xs">
      <span className="text-brand-text-secondary">Hands: <span className="text-brand-text-primary">47</span></span>
      <span className="text-brand-text-secondary">Win Rate: <span className="text-green-400">+12 BB/100</span></span>
    </div>
  </div>
)

const QuizMockup = ({ isInView }: { isInView: boolean }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [progress, setProgress] = useState(50)

  useEffect(() => {
    if (!isInView) {
      setSelectedOption(null)
      setSubmitted(false)
      setShowFeedback(false)
      setProgress(50)
      return
    }

    // Animation sequence
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000))
      setSelectedOption('C') // Select 3-bet
      
      await new Promise(r => setTimeout(r, 1200))
      setSubmitted(true)
      
      await new Promise(r => setTimeout(r, 600))
      setShowFeedback(true)
      setProgress(60)
    }

    sequence()
  }, [isInView])

  const options = [
    { id: 'A', text: 'Fold', correct: false },
    { id: 'B', text: 'Call', correct: false },
    { id: 'C', text: '3-Bet to 9x', correct: true },
    { id: 'D', text: '3-Bet All-In', correct: false },
  ]

  return (
    <div className="bg-brand-primary rounded-lg p-4 border border-brand-surface">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-brand-accent font-semibold text-sm">Quick Quiz</span>
        <span className="text-brand-text-secondary text-xs">Question 5/10</span>
      </div>

      {/* Scenario */}
      <div className="bg-brand-bg rounded-md p-3 mb-3">
        <p className="text-sm text-brand-text-primary mb-3">
          A <span className="text-brand-accent">tight player</span> opens <span className="text-brand-accent">3x UTG</span>. You&apos;re on the BTN with:
        </p>
        <div className="flex justify-center gap-2 mb-3">
          <div className="w-12 h-16 bg-white rounded shadow flex items-center justify-center text-black font-bold text-lg">A♠</div>
          <div className="w-12 h-16 bg-white rounded shadow flex items-center justify-center text-red-600 font-bold text-lg">Q♦</div>
        </div>
        <p className="text-sm text-brand-text-secondary text-center">What should you do?</p>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {options.map((option) => {
          let className = "w-full text-brand-text-primary text-sm py-2 px-3 rounded text-left transition-all duration-300 "
          
          if (showFeedback) {
            if (option.correct) {
              className += "bg-green-600/30 border border-green-500"
            } else if (selectedOption === option.id && !option.correct) {
              className += "bg-red-600/30 border border-red-500"
            } else {
              className += "bg-brand-surface/50 opacity-50"
            }
          } else if (selectedOption === option.id) {
            className += "bg-brand-accent/20 border border-brand-accent"
          } else {
            className += "bg-brand-surface hover:bg-brand-surface/80"
          }
          
          return (
            <button
              key={option.id}
              className={className}
            >
              {option.id}) {option.text}
              {showFeedback && option.correct && <span className="float-right">✓</span>}
              {showFeedback && selectedOption === option.id && !option.correct && <span className="float-right">✗</span>}
            </button>
          )
        })}
      </div>

      {/* Submit Button or Feedback */}
      {!showFeedback ? (
        <button 
          className={`w-full font-semibold py-2 rounded transition-all duration-300 text-sm ${
            submitted 
              ? 'bg-brand-accent/50 text-brand-primary animate-pulse' 
              : 'bg-brand-accent text-brand-primary hover:bg-brand-accent/90'
          }`}
        >
          {submitted ? 'Analyzing...' : 'Submit Answer'}
        </button>
      ) : (
        <div className="bg-green-900/30 border border-green-600/50 rounded-md p-3 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400 font-semibold text-sm">✓ Correct!</span>
          </div>
          <p className="text-xs text-brand-text-secondary">
            3-betting AQo from the BTN vs a tight UTG open is optimal. You have position and a strong hand that plays well postflop.
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="mt-3 pt-3 border-t border-brand-surface">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-brand-text-secondary">Progress</span>
          <span className="text-brand-accent">{progress}%</span>
        </div>
        <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-accent rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Wrapper component that passes isInView to mockups
const AnimatedMockup = ({ id, children }: { id: string, children: (isInView: boolean) => React.ReactNode }) => {
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
    icon: '🔍',
    mockup: <></>, // Will be replaced with AnimatedMockup
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
    icon: '🎮',
    mockup: <></>,
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
    icon: '❓',
    mockup: <></>,
  },
]

export default function ToolsSection() {
  return (
    <section className="py-20 bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">
            What You&apos;ll Be Able to Do
          </h2>
          <p className="text-xl text-brand-text-secondary max-w-3xl mx-auto">
            Three powerful tools designed to help you master both GTO fundamentals and exploitative adjustments
          </p>
        </div>

        {/* Tools Grid */}
        <div className="space-y-24">
          {tools.map((tool, index) => (
            <div
              key={tool.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{tool.icon}</span>
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

                <ul className="space-y-3">
                  {tool.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-brand-accent mt-0.5">✓</span>
                      <span className="text-brand-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mockup with Animation */}
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="bg-brand-surface p-4 rounded-xl border border-brand-accent/20 shadow-2xl">
                  {tool.id === 'hand-review' && (
                    <AnimatedMockup id={tool.id}>
                      {(isInView) => <HandReviewMockup isInView={isInView} />}
                    </AnimatedMockup>
                  )}
                  {tool.id === 'game-simulation' && (
                    <GameSimulationMockup />
                  )}
                  {tool.id === 'quizzes' && (
                    <AnimatedMockup id={tool.id}>
                      {(isInView) => <QuizMockup isInView={isInView} />}
                    </AnimatedMockup>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <p className="text-brand-text-secondary mb-6">
            Be the first to experience these tools when we launch
          </p>
          <Link
            href="/early-access"
            className="inline-block bg-brand-accent text-brand-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-accent/90 transition-all duration-200 hover:scale-105"
          >
            Join the Waitlist
          </Link>
        </div>
      </div>
    </section>
  )
}
