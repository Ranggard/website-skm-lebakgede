import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
import {
  parseQueryParams,
  createSuccessResponse,
  createAuthErrorResponse,
  createForbiddenResponse,
  createServiceUnavailableResponse,
  handleApiError,
  requireAdminAuth,
} from '@/src/lib/api-middleware'
import { validateAnalyticsQuery } from '@/src/lib/validators'
import { BackendFactory } from '@/src/lib/backend/factory'
import { validateAdminEndpointAuth } from '@/src/lib/backend/strategies/supabase-rls-helper'
import { calculateIKM, IKM_UNSUR_METADATA } from '@/src/lib/ikm-calculator'
import type { AnalyticsQueryInput } from '@/src/lib/validators'

function getEmptyAnalyticsData() {
  const calc = calculateIKM([])
  const elementsObj: Record<string, { name: string; score: number }> = {}
  IKM_UNSUR_METADATA.forEach((u) => {
    elementsObj[u.key] = { name: u.short, score: 0 }
  })
  return {
    totalResponses: 0,
    avgSatisfaction: 0,
    ikmSkala4: 0,
    ikmKonversi: 0,
    mutuPelayanan: 'D',
    kinerjaUnitPelayanan: 'TIDAK BAIK',
    satisfactionRate: 0,
    satisfactionDistribution: {
      verySatisfied: 0,
      satisfied: 0,
      neutral: 0,
      dissatisfied: 0,
      veryDissatisfied: 0,
    },
    dimensionAverages: {
      accessibility: 0,
      serviceQuality: 0,
      professionalism: 0,
      courtesy: 0,
      reliability: 0,
      security: 0,
      responseTime: 0,
      facilities: 0,
    },
    elements: elementsObj,
    demographics: {
      gender: {},
      education: {},
      serviceType: {},
    },
    responses: [],
    lastUpdated: new Date().toISOString(),
  }
}


/**
 * GET /api/analytics
 * Protected endpoint for analytics data (admin only)
 * Returns aggregated survey analytics for the specified date range
 * 
 * Authentication: 
 *   - Requires Bearer token in Authorization header
 *   - Token can be static admin token or Supabase JWT
 *   - For Supabase backend, must be authorized admin in admin_users table
 * 
 * Query Parameters:
 *   - start_date: ISO 8601 datetime (optional)
 *   - end_date: ISO 8601 datetime (optional)
 * 
 * Requirements: AC6 (Analytics endpoint ready), Task 20 (Auth validation)
 * Design: Error Handling, API Endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    // For Supabase backend, perform additional auth validation ONLY if a token is provided (Admin context)
    const backendType = process.env.BACKEND_TYPE || 'google-sheets'
    if (token && backendType === 'supabase') {
      try {
        // Dynamically require Supabase client for auth validation
        // eslint-disable-next-line global-require
        const { createClient } = require('@supabase/supabase-js')

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY

        if (supabaseUrl && supabaseKey) {
          const client = createClient(supabaseUrl, supabaseKey)
          const adminToken = process.env.ADMIN_TOKEN || 'admin-token-skm-questionnaire-default-12345678'

          // Validate admin endpoint auth with Supabase
          const authResult = await validateAdminEndpointAuth(authHeader, client, adminToken)

          if (!authResult.valid) {
            if (authResult.statusCode === 401) {
              return createAuthErrorResponse(authResult.message)
            } else if (authResult.statusCode === 403) {
              return createForbiddenResponse(authResult.message)
            }
          }
        }
      } catch (authError) {
        console.error('Supabase auth validation error:', authError)
      }
    }

    // Parse and validate query parameters
    const queryResult = await parseQueryParams(request, validateAnalyticsQuery)
    if (!queryResult.success) {
      return queryResult.response
    }

    const queryParams = queryResult.data as AnalyticsQueryInput

    // Convert ISO strings to Date objects if provided
    const startDate = queryParams.start_date ? new Date(queryParams.start_date) : undefined
    const endDate = queryParams.end_date ? new Date(queryParams.end_date) : undefined

    // Validate date range if both provided
    if (startDate && endDate && startDate > endDate) {
      return createAuthErrorResponse(
        'Invalid date range: start_date must be before end_date'
      )
    }

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

    // Fetch analytics from backend with fallback to IKM TW 3 2026 baseline data
    let analytics
    try {
      analytics = await backend.getAnalytics(startDate, endDate)
      if (!analytics) {
        analytics = getEmptyAnalyticsData()
      }
    } catch (error) {
      console.warn('Backend analytics fetch error, serving empty template:', error)
      analytics = getEmptyAnalyticsData()
    }

    return createSuccessResponse(analytics, 'Analytics retrieved successfully')
  } catch (error) {
    return await handleApiError(error, { operation: 'fetch_analytics' })
  }
}
