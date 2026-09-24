import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { EMAIL_REGEX } from '@/lib/validation'

// Postgres unique_violation error code, thrown if two requests race past the
// pre-insert duplicate check above.
const UNIQUE_VIOLATION = '23505'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { name, email, notes } = (body ?? {}) as {
    name?: unknown
    email?: unknown
    notes?: unknown
  }

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { error: 'Name is required' },
      { status: 400 }
    )
  }

  // Validate email
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { error: 'Valid email is required' },
      { status: 400 }
    )
  }

  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedNotes = typeof notes === 'string' ? notes.trim() : ''

  try {
    // Connect to Neon database
    const sql = neon(process.env.DATABASE_URL!)

    // Check for duplicate email
    const existingUser = await sql`
      SELECT email FROM waitlist WHERE LOWER(email) = LOWER(${trimmedEmail})
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 400 }
      )
    }

    // Insert new waitlist entry
    await sql`
      INSERT INTO waitlist (name, email, notes) VALUES (${trimmedName}, ${trimmedEmail}, ${trimmedNotes})
    `

    // Log to console
    console.log('📧 New Waitlist Signup:', {
      name: trimmedName,
      email: trimmedEmail,
      notes: trimmedNotes,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        message: 'Successfully joined the waitlist!',
        success: true
      },
      { status: 200 }
    )
  } catch (error) {
    // Two concurrent submissions for the same email can both pass the
    // SELECT check above; fall back to the DB's unique constraint.
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === UNIQUE_VIOLATION
    ) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 400 }
      )
    }

    console.error('Error processing waitlist signup:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// GET endpoint to view waitlist (for development/debugging)
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const entries = await sql`
      SELECT id, name, email, notes, created_at FROM waitlist ORDER BY created_at DESC
    `
    
    return NextResponse.json({
      count: entries.length,
      entries: entries,
    })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}
