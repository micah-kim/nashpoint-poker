'use client'

import { useState } from 'react'

export default function WaitlistForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, notes }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Successfully joined the waitlist!')
        setName('')
        setEmail('')
        setNotes('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to submit. Please try again.')
    }
  }

  return (
    <div className="bg-brand-surface p-8 rounded-lg border border-brand-accent/20 max-w-md w-full">
      {status === 'success' ? (
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-brand-accent mb-4">You&apos;re on the list!</h3>
          <p className="text-brand-text-secondary mb-6">{message}</p>
          <button
            onClick={() => {
              setStatus('idle')
              setMessage('')
            }}
            className="text-brand-accent hover:text-brand-accent/80 transition-colors duration-200"
          >
            Join another email →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 className="text-2xl font-bold text-brand-text-primary mb-6">Join the Waitlist</h3>

          <div className="mb-4">
            <label htmlFor="name" className="block text-brand-text-secondary mb-2 text-sm">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-brand-primary border border-brand-surface rounded-md text-brand-text-primary focus:outline-none focus:border-brand-accent transition-colors duration-200"
              placeholder="Your name"
              disabled={status === 'loading'}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-brand-text-secondary mb-2 text-sm">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-brand-primary border border-brand-surface rounded-md text-brand-text-primary focus:outline-none focus:border-brand-accent transition-colors duration-200"
              placeholder="you@example.com"
              disabled={status === 'loading'}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="notes" className="block text-brand-text-secondary mb-2 text-sm">
              Notes / Suggestions (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-brand-primary border border-brand-surface rounded-md text-brand-text-primary focus:outline-none focus:border-brand-accent transition-colors duration-200 resize-none"
              placeholder="What features are you most interested in?"
              disabled={status === 'loading'}
            />
          </div>

          {status === 'error' && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-md text-red-400 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-brand-accent text-brand-primary py-3 rounded-md font-semibold hover:bg-brand-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Submitting...' : 'Join Waitlist'}
          </button>
        </form>
      )}
    </div>
  )
}
