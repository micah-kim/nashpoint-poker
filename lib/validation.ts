/**
 * Shared validation used by both the waitlist API route and the
 * WaitlistForm client component, so the two stay in sync.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface WaitlistFieldErrors {
  name?: string
  email?: string
}

export function validateWaitlistFields(name: string, email: string): WaitlistFieldErrors {
  const errors: WaitlistFieldErrors = {}

  if (!name.trim()) {
    errors.name = 'Name is required'
  }

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  return errors
}
