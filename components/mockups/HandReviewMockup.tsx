'use client'

import { useState, useEffect } from 'react'
import { useTypingAnimation } from '@/lib/hooks'

interface HandReviewMockupProps {
  isInView: boolean
}

export default function HandReviewMockup({ isInView }: HandReviewMockupProps) {
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
