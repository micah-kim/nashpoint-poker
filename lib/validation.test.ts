import { describe, expect, it } from 'vitest'
import { EMAIL_REGEX, validateWaitlistFields } from './validation'

describe('validateWaitlistFields', () => {
  it('requires a name', () => {
    expect(validateWaitlistFields('', 'jane@example.com').name).toBe('Name is required')
  })

  it('treats a whitespace-only name as missing', () => {
    expect(validateWaitlistFields('   ', 'jane@example.com').name).toBe('Name is required')
  })

  it('requires an email', () => {
    expect(validateWaitlistFields('Jane', '').email).toBe('Email is required')
  })

  it('rejects an email missing a domain', () => {
    expect(validateWaitlistFields('Jane', 'jane@').email).toBe('Enter a valid email address')
  })

  it('rejects an email missing the @', () => {
    expect(validateWaitlistFields('Jane', 'jane.example.com').email).toBe('Enter a valid email address')
  })

  it('rejects an email with internal whitespace', () => {
    expect(validateWaitlistFields('Jane', 'jane doe@example.com').email).toBe('Enter a valid email address')
  })

  it('returns no errors for valid input', () => {
    expect(validateWaitlistFields('Jane', 'jane@example.com')).toEqual({})
  })

  it('trims surrounding whitespace before validating', () => {
    expect(validateWaitlistFields('  Jane  ', '  jane@example.com  ')).toEqual({})
  })
})

describe('EMAIL_REGEX', () => {
  it.each([
    'jane@example.com',
    'jane.doe+waitlist@sub.example.co',
  ])('accepts %s', (email) => {
    expect(EMAIL_REGEX.test(email)).toBe(true)
  })

  it.each([
    'jane@',
    '@example.com',
    'jane example.com',
    'jane@example',
  ])('rejects %s', (email) => {
    expect(EMAIL_REGEX.test(email)).toBe(false)
  })
})
