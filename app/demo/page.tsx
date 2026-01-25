'use client'

import type { Metadata } from 'next'
import { useState } from 'react'

export default function DemoPage() {
  const [selectedOpponent, setSelectedOpponent] = useState('TAG')
  const [board, setBoard] = useState('Ks Qh 7d')
  
  return (
    <div className="py-20 bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-text-primary mb-6">
            UI Demo
          </h1>
          <p className="text-xl text-brand-text-secondary mb-4">
            Preview of what the full training tool will look like
          </p>
          <div className="inline-block bg-brand-accent/20 border border-brand-accent px-4 py-2 rounded-full">
            <p className="text-brand-accent text-sm font-semibold">
              ⚠️ This is a non-functional mockup
            </p>
          </div>
        </div>

        {/* Main Demo Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hand Input */}
            <div className="bg-brand-surface p-6 rounded-lg border border-brand-accent/20">
              <h2 className="text-xl font-bold text-brand-text-primary mb-4">
                Hand Input
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-brand-text-secondary mb-2 text-sm">
                    Your Hand
                  </label>
                  <input
                    type="text"
                    value="Ah Kd"
                    readOnly
                    className="w-full px-4 py-2 bg-brand-primary border border-brand-surface rounded-md text-brand-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-secondary mb-2 text-sm">
                    Board
                  </label>
                  <input
                    type="text"
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-4 py-2 bg-brand-primary border border-brand-surface rounded-md text-brand-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-secondary mb-2 text-sm">
                    Position
                  </label>
                  <select className="w-full px-4 py-2 bg-brand-primary border border-brand-surface rounded-md text-brand-text-primary">
                    <option>BTN</option>
                    <option>CO</option>
                    <option>MP</option>
                    <option>UTG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-text-secondary mb-2 text-sm">
                    Action
                  </label>
                  <select className="w-full px-4 py-2 bg-brand-primary border border-brand-surface rounded-md text-brand-text-primary">
                    <option>Single Raised Pot</option>
                    <option>3-Bet Pot</option>
                    <option>4-Bet Pot</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Opponent Type Selector */}
            <div className="bg-brand-surface p-6 rounded-lg border border-brand-accent/20">
              <h2 className="text-xl font-bold text-brand-text-primary mb-4">
                Opponent Type
              </h2>
              <div className="space-y-2">
                {['TAG (Tight-Aggressive)', 'LAG (Loose-Aggressive)', 'Passive Fish', 'Micro Reg', 'Balanced GTO'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedOpponent(type)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-all duration-200 ${
                      selectedOpponent === type || (selectedOpponent === 'TAG' && type === 'TAG (Tight-Aggressive)')
                        ? 'bg-brand-accent text-brand-primary font-semibold'
                        : 'bg-brand-primary text-brand-text-secondary hover:bg-brand-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Evaluate Button */}
            <button className="w-full bg-brand-accent text-brand-primary py-3 rounded-md font-semibold hover:bg-brand-accent/90 transition-all duration-200">
              Evaluate Hand
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Commentary */}
            <div className="bg-brand-surface p-6 rounded-lg border border-brand-accent/20">
              <h2 className="text-xl font-bold text-brand-text-primary mb-4">
                AI Commentary
              </h2>
              <div className="space-y-4 text-brand-text-secondary">
                <p>
                  With <span className="text-brand-accent font-semibold">AK on Ks-Qh-7d</span>, you've flopped top pair with top kicker from the button in a single-raised pot.
                </p>
                <p>
                  Against a <span className="text-brand-accent font-semibold">TAG opponent</span>, this is a clear value betting situation. TAG players will call with worse kings, pocket pairs, and some straight draws.
                </p>
                <div className="bg-brand-primary p-4 rounded-md border-l-4 border-brand-accent">
                  <p className="font-semibold text-brand-text-primary mb-2">Recommended Action:</p>
                  <p>Bet 60-75% pot for value and protection. You're way ahead of their calling range but need to charge draws.</p>
                </div>
                <p>
                  Note: Against a passive fish, you could bet larger (80-100% pot) since they'll call with any pair or draw. Against LAG, consider checking to induce bluffs.
                </p>
              </div>
            </div>

            {/* GTO Baseline Chart */}
            <div className="bg-brand-surface p-6 rounded-lg border border-brand-accent/20">
              <h2 className="text-xl font-bold text-brand-text-primary mb-4">
                GTO Baseline Strategy
              </h2>
              <div className="bg-brand-primary p-4 rounded-md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-text-secondary">Bet 2/3 pot</span>
                    <div className="flex items-center">
                      <div className="w-48 bg-brand-surface rounded-full h-3 mr-3">
                        <div className="bg-brand-accent h-3 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-brand-accent font-semibold">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-text-secondary">Check</span>
                    <div className="flex items-center">
                      <div className="w-48 bg-brand-surface rounded-full h-3 mr-3">
                        <div className="bg-blue-500 h-3 rounded-full" style={{ width: '22%' }}></div>
                      </div>
                      <span className="text-blue-400 font-semibold">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-text-secondary">Bet 1/3 pot</span>
                    <div className="flex items-center">
                      <div className="w-48 bg-brand-surface rounded-full h-3 mr-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-green-400 font-semibold">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Opponent Adjustment */}
            <div className="bg-gradient-to-br from-brand-accent/20 to-brand-surface p-6 rounded-lg border border-brand-accent">
              <h2 className="text-xl font-bold text-brand-text-primary mb-4">
                📊 Exploitative Adjustment vs TAG
              </h2>
              <div className="space-y-3 text-brand-text-secondary">
                <div className="flex items-start">
                  <span className="text-brand-accent mr-2">▸</span>
                  <span>Increase bet frequency to 75% (from 68% baseline)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-brand-accent mr-2">▸</span>
                  <span>TAG opponents under-defend vs c-bets with marginal holdings</span>
                </div>
                <div className="flex items-start">
                  <span className="text-brand-accent mr-2">▸</span>
                  <span>Expected EV gain: +0.12 BB vs GTO baseline</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-brand-surface p-8 rounded-lg border border-brand-accent/20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-brand-text-primary mb-4">
              Want to use the real tool?
            </h2>
            <p className="text-brand-text-secondary mb-6">
              Join our waitlist to get notified when we launch
            </p>
            <a
              href="/early-access"
              className="inline-block bg-brand-accent text-brand-primary px-8 py-3 rounded-lg font-semibold hover:bg-brand-accent/90 transition-all duration-200"
            >
              Join the Waitlist
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
