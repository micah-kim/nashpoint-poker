'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { siteConfig } from '@/lib/content'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Check if this is the first visit in this session
    const hasLoaded = sessionStorage.getItem('hasLoaded')
    
    if (hasLoaded) {
      setIsLoading(false)
      return
    }

    // Start fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 1500)

    // Remove loading screen after fade completes
    const hideTimer = setTimeout(() => {
      setIsLoading(false)
      sessionStorage.setItem('hasLoaded', 'true')
    }, 2000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-primary transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-label="Loading Nash Point"
      aria-live="polite"
    >
      {/* Logo with pulse animation */}
      <div className="animate-pulse">
        <Image
          src="/assets/images/logo.png"
          alt={siteConfig.name}
          width={144}
          height={96}
          className="h-24 w-auto mb-8"
          priority
        />
      </div>

      {/* Loading indicator */}
      <div className="flex space-x-2" aria-hidden="true">
        <div className="w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Tagline */}
      <p className="mt-8 text-brand-text-secondary text-sm">
        {siteConfig.tagline}
      </p>
      
      {/* Screen reader announcement */}
      <span className="sr-only">Loading application, please wait...</span>
    </div>
  )
}
