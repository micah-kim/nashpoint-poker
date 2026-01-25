import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, notes } = body

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Connect to Neon database
    const sql = neon(process.env.DATABASE_URL!)

    // Check for duplicate email
    const existingUser = await sql`
      SELECT email FROM waitlist WHERE LOWER(email) = LOWER(${email})
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 400 }
      )
    }

    // Insert new waitlist entry
    await sql`
      INSERT INTO waitlist (email, notes) VALUES (${email.toLowerCase().trim()}, ${notes?.trim() || ''})
    `

    // Log to console
    console.log('📧 New Waitlist Signup:', {
      email: email.toLowerCase().trim(),
      notes: notes?.trim() || '',
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
      SELECT id, email, notes, created_at FROM waitlist ORDER BY created_at DESC
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
