'use client'

import { useState, useEffect } from 'react'

interface QuizMockupProps {
  isInView: boolean
}

const options = [
  { id: 'A', text: 'Fold', correct: false },
  { id: 'B', text: 'Call', correct: false },
  { id: 'C', text: '3-Bet to 9x', correct: true },
  { id: 'D', text: '3-Bet All-In', correct: false },
]

export default function QuizMockup({ isInView }: QuizMockupProps) {
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
              type="button"
              aria-label={`Option ${option.id}: ${option.text}`}
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
          type="button"
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
