import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/submit
 * Endpoint for form submission (public)
 * Will be implemented in Task 7
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Implement form validation using Zod schema
    // TODO: Route to configured backend (Google Sheets or Supabase)
    // TODO: Store response and return response ID

    return NextResponse.json(
      {
        error: 'Not yet implemented',
        message: 'Form submission endpoint will be implemented in Task 7',
      },
      { status: 501 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
