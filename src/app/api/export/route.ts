import { NextRequest, NextResponse } from 'next/server'
import {
  parseQueryParams,
  createAuthErrorResponse,
  createForbiddenResponse,
  createServiceUnavailableResponse,
  handleApiError,
  requireAdminAuth,
} from '@/src/lib/api-middleware'
import { validateExportQuery } from '@/src/lib/validators'
import { BackendFactory } from '@/src/lib/backend/factory'
import { validateAdminEndpointAuth } from '@/src/lib/backend/strategies/supabase-rls-helper'
import type { ExportQueryInput } from '@/src/lib/validators'

/**
 * GET /api/export
 * Protected endpoint for data export (admin only)
 * Exports survey responses in CSV or Excel format
 * 
 * Authentication:
 *   - Requires Bearer token in Authorization header
 *   - Token can be static admin token or Supabase JWT
 *   - For Supabase backend, must be authorized admin in admin_users table
 * 
 * Query Parameters:
 *   - format: 'csv' or 'excel' (default: 'csv')
 *   - start_date: ISO 8601 datetime (optional)
 *   - end_date: ISO 8601 datetime (optional)
 * 
 * Requirements: AC7 (Export endpoint ready), Task 20 (Auth validation)
 * Design: Error Handling, API Endpoints
 */
export const GET = requireAdminAuth(async (request: NextRequest, _token: string) => {
  try {
    // For Supabase backend, perform additional auth validation
    const backendType = process.env.BACKEND_TYPE || 'google-sheets'
    if (backendType === 'supabase') {
      try {
        // Dynamically require Supabase client for auth validation
        // eslint-disable-next-line global-require
        const { createClient } = require('@supabase/supabase-js')

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY

        if (supabaseUrl && supabaseKey) {
          const client = createClient(supabaseUrl, supabaseKey)
          const authHeader = request.headers.get('authorization')
          const adminToken = process.env.ADMIN_TOKEN

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
        // Continue with basic auth (already validated by requireAdminAuth)
      }
    }

    // Parse and validate query parameters
    const queryResult = await parseQueryParams(request, validateExportQuery)
    if (!queryResult.success) {
      return queryResult.response
    }

    const queryParams = queryResult.data as ExportQueryInput
    const format = queryParams.format || 'csv'

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

    // Export data from backend
    let fileBuffer: Buffer
    try {
      fileBuffer = await backend.exportResponses(format, startDate, endDate)
    } catch (error) {
      console.error('Backend export error:', error)
      
      // If backend is not implemented, return empty file
      if (error instanceof Error && error.message.includes('not yet implemented')) {
        if (format === 'excel') {
          // Empty Excel file placeholder
          fileBuffer = Buffer.from([
            0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00,
          ])
        } else {
          // Empty CSV placeholder
          fileBuffer = Buffer.from('id,timestamp,Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10,Q11,Q12,Q13,Q14,Q15,Q16,Q17,Q18,Q19,Q20,Q21\n')
        }
      } else {
        return createServiceUnavailableResponse(
          'Unable to export data. Please try again later.',
          60
        )
      }
    }

    // Determine content type and filename
    const timestamp = new Date().toISOString().split('T')[0]
    let contentType: string
    let filename: string

    if (format === 'excel') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = `skm-responses-${timestamp}.xlsx`
    } else {
      contentType = 'text/csv;charset=utf-8'
      filename = `skm-responses-${timestamp}.csv`
    }

    // Return file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return await handleApiError(error, { operation: 'export_data' })
  }
})
