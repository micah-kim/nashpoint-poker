import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for waitlist (for POC only)
const waitlist: Array<{ email: string; notes: string; timestamp: string }> = []

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

    // Check for duplicate
    const existingEntry = waitlist.find(entry => entry.email.toLowerCase() === email.toLowerCase())
    if (existingEntry) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 400 }
      )
    }

    // Store the entry
    const entry = {
      email: email.toLowerCase().trim(),
      notes: notes?.trim() || '',
      timestamp: new Date().toISOString(),
    }

    waitlist.push(entry)

    // Log to console (for POC)
    console.log('📧 New Waitlist Signup:', entry)
    console.log(`Total waitlist count: ${waitlist.length}`)

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

// Optional: GET endpoint to view waitlist (for development/debugging)
export async function GET() {
  return NextResponse.json({
    count: waitlist.length,
    entries: waitlist,
  })
}
