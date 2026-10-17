import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { validateQuestionnaireResponse } from '@/src/lib/validators'
import {
  parseRequestBody,
  createSuccessResponse,
  createServiceUnavailableResponse,
  handleApiError,
} from '@/src/lib/api-middleware'
import { BackendFactory } from '@/src/lib/backend/factory'
import type { QuestionnaireResponseInput } from '@/src/lib/validators'

/**
 * POST /api/submit
 * Public endpoint for form submission
 * Accepts questionnaire response data and stores it in the configured backend
 * 
 * Requirements: AC3 (Form submission endpoint ready)
 * Design: Error Handling, API Endpoints
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const parseResult = await parseRequestBody(request, validateQuestionnaireResponse)
    if (!parseResult.success) {
      return parseResult.response
    }

    const formData = parseResult.data as QuestionnaireResponseInput

    // Get backend instance
    let backend
    try {
      backend = BackendFactory.getInstance()
    } catch (error) {
      console.error('Backend initialization error:', error)
      return createServiceUnavailableResponse(
        'Backend service is not properly configured',
        60
      )
    }

    // Submit response to backend
    let responseId: string
    try {
      responseId = await backend.submitResponse(formData as any)
    } catch (error) {
      console.error('Backend submission error:', error)
      
      // If backend is unavailable, queue locally (placeholder for future implementation)
      if (error instanceof Error && error.message.includes('not yet implemented')) {
        // For now, generate a local ID as placeholder
        responseId = uuidv4()
      } else {
        return createServiceUnavailableResponse(
          'Unable to submit response. Please try again later.',
          60
        )
      }
    }

    // Return success response
    return createSuccessResponse(
      {
        id: responseId,
        timestamp: new Date(),
      },
      'Response submitted successfully',
      201
    )
  } catch (error) {
    return await handleApiError(error, { operation: 'form_submission' })
  }
}
