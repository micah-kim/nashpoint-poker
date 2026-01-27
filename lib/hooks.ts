'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * Hook to detect when an element enters the viewport.
 * @param threshold - The percentage of the element that must be visible (0-1)
 * @returns An object with a ref to attach to the element and a boolean indicating if it's in view
 */
export function useInView(threshold = 0.3) {
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

/**
 * Hook to create a typing animation effect.
 * @param text - The full text to animate
 * @param isActive - Whether the animation should be running
 * @param speed - The delay between characters in milliseconds
 * @returns An object with the currently displayed text and a boolean indicating if typing is complete
 */
export function useTypingAnimation(text: string, isActive: boolean, speed = 30) {
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
