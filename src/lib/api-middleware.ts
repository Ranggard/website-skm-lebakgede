/**
 * API Middleware and Response Utilities
 * Provides consistent response formatting and error handling across all API endpoints
 * Ref: Design Document (Error Handling section)
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limiting: track requests per IP (max 100 per minute per IP)
 * Module-level Map with IP addresses as keys and request timestamps as values
 */
const rateLimitStore = new Map<string, number[]>()

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string
  message: string
  details?: Record<string, string>
  retryAfter?: number
  code?: string
}

/**
 * Standard success response format
 */
export interface SuccessResponse<T> {
  data?: T
  message?: string
  [key: string]: any
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  }
  if (message) {
    response.message = message
  }
  return NextResponse.json(response, { status })
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  status: number = 400,
  details?: Record<string, string>,
  code?: string,
  retryAfter?: number
): NextResponse {
  const response: ErrorResponse = {
    error,
    message,
    ...(details && { details }),
    ...(code && { code }),
    ...(retryAfter && { retryAfter }),
  }
  return NextResponse.json(response, { status })
}

/**
 * Validation error response
 */
export function createValidationErrorResponse(
  details: Record<string, string>
): NextResponse {
  return createErrorResponse(
    'Validation failed',
    'One or more validation errors occurred. See details for more information.',
    400,
    details,
    'VALIDATION_ERROR'
  )
}

/**
 * Authentication error response
 */
export function createAuthErrorResponse(message: string = 'Unauthorized'): NextResponse {
  return createErrorResponse(
    'Unauthorized',
    message,
    401,
    undefined,
    'AUTH_ERROR'
  )
}

/**
 * Forbidden error response (authenticated but not authorized)
 */
export function createForbiddenResponse(
  message: string = 'Forbidden'
): NextResponse {
  return createErrorResponse(
    'Forbidden',
    message,
    403,
    undefined,
    'FORBIDDEN'
  )
}

/**
 * Not found error response
 */
export function createNotFoundResponse(message: string = 'Not found'): NextResponse {
  return createErrorResponse(
    'Not found',
    message,
    404,
    undefined,
    'NOT_FOUND'
  )
}

/**
 * Rate limit error response
 */
export function createRateLimitResponse(
  retryAfter: number = 60
): NextResponse {
  return createErrorResponse(
    'Rate limit exceeded',
    'Too many requests. Please wait before trying again.',
    429,
    undefined,
    'RATE_LIMIT',
    retryAfter
  )
}

/**
 * Service unavailable error response
 */
export function createServiceUnavailableResponse(
  message: string = 'Backend service temporarily offline',
  retryAfter: number = 60
): NextResponse {
  return createErrorResponse(
    'Service unavailable',
    message,
    503,
    undefined,
    'SERVICE_UNAVAILABLE',
    retryAfter
  )
}

/**
 * Internal server error response
 */
export function createInternalErrorResponse(
  message: string = 'An unexpected error occurred'
): NextResponse {
  return createErrorResponse(
    'Internal server error',
    message,
    500,
    undefined,
    'INTERNAL_ERROR'
  )
}

/**
 * Parse and validate JSON body from request
 */
export async function parseRequestBody<T>(
  request: NextRequest,
  schema?: (data: unknown) => { success: boolean; data?: T; error?: string; details?: Record<string, string> }
): Promise<
  | { success: true; data: T }
  | { success: false; response: NextResponse }
> {
  try {
    const body = await request.json()

    if (schema) {
      const validation = schema(body)
      if (!validation.success) {
        return {
          success: false,
          response: createValidationErrorResponse(validation.details || {}),
        }
      }
      return { success: true, data: validation.data as T }
    }

    return { success: true, data: body as T }
  } catch (error) {
    return {
      success: false,
      response: createErrorResponse(
        'Invalid request body',
        'Request body must be valid JSON',
        400,
        undefined,
        'INVALID_JSON'
      ),
    }
  }
}

/**
 * Parse and validate query parameters from request
 */
export async function parseQueryParams<T>(
  request: NextRequest,
  schema: (data: unknown) => { success: boolean; data?: T; error?: string; details?: Record<string, string> }
): Promise<
  | { success: true; data: T }
  | { success: false; response: NextResponse }
> {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryObj: Record<string, string | string[]> = {}

    searchParams.forEach((value, key) => {
      if (queryObj[key]) {
        // Handle multiple values for same key
        if (Array.isArray(queryObj[key])) {
          ;(queryObj[key] as string[]).push(value)
        } else {
          queryObj[key] = [queryObj[key] as string, value]
        }
      } else {
        queryObj[key] = value
      }
    })

    const validation = schema(queryObj)
    if (!validation.success) {
      return {
        success: false,
        response: createErrorResponse(
          'Invalid query parameters',
          'One or more query parameters are invalid',
          400,
          validation.details,
          'INVALID_QUERY'
        ),
      }
    }

    return { success: true, data: validation.data as T }
  } catch (error) {
    return {
      success: false,
      response: createErrorResponse(
        'Query parameter error',
        'Failed to parse query parameters',
        400,
        undefined,
        'QUERY_ERROR'
      ),
    }
  }
}

/**
 * Extract and validate admin authentication token
 * Supports two methods:
 * 1. Authorization header: "Bearer <token>"
 * 2. Query parameter: ?token=<token>
 * 3. Cookie: admin_token=<token>
 */
export function extractAndValidateAdminToken(
  request: NextRequest,
  expectedToken?: string
): { success: true; token: string } | { success: false; response: NextResponse } {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i)
    if (match) {
      const token = match[1]
      if (expectedToken && token !== expectedToken) {
        return {
          success: false,
          response: createAuthErrorResponse('Invalid authentication token'),
        }
      }
      return { success: true, token }
    }
  }

  // Try query parameter
  const tokenParam = request.nextUrl.searchParams.get('token')
  if (tokenParam) {
    if (expectedToken && tokenParam !== expectedToken) {
      return {
        success: false,
        response: createAuthErrorResponse('Invalid authentication token'),
      }
    }
    return { success: true, token: tokenParam }
  }

  // Try cookie
  const tokenCookie = request.cookies.get('admin_token')
  if (tokenCookie) {
    if (expectedToken && tokenCookie.value !== expectedToken) {
      return {
        success: false,
        response: createAuthErrorResponse('Invalid authentication token'),
      }
    }
    return { success: true, token: tokenCookie.value }
  }

  return {
    success: false,
    response: createAuthErrorResponse('Missing authentication token'),
  }
}

/**
 * Check rate limit for a given IP address
 * Returns true if request is allowed, false if rate limit exceeded
 * 
 * Rate limit: 100 requests per minute per IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 60 seconds
  const maxRequests = 100

  // Get or create timestamps array for this IP
  let timestamps = rateLimitStore.get(ip) || []

  // Remove timestamps older than the window
  timestamps = timestamps.filter((timestamp) => now - timestamp < windowMs)

  // Check if limit exceeded
  if (timestamps.length >= maxRequests) {
    rateLimitStore.set(ip, timestamps)
    return false
  }

  // Add current timestamp and store
  timestamps.push(now)
  rateLimitStore.set(ip, timestamps)

  // Periodically cleanup old entries from the store (every 1000 operations)
  if (Math.random() < 0.001) {
    const allIps = Array.from(rateLimitStore.keys())
    for (const ipKey of allIps) {
      const ipTimestamps = rateLimitStore.get(ipKey) || []
      const filtered = ipTimestamps.filter((ts) => now - ts < windowMs)
      if (filtered.length === 0) {
        rateLimitStore.delete(ipKey)
      } else {
        rateLimitStore.set(ipKey, filtered)
      }
    }
  }

  return true
}

/**
 * Parse and verify Supabase JWT without full validation
 * Just checks for required fields (sub, exp) and expiration
 */
function verifySupabaseJWT(token: string): boolean {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false
    }

    // Decode payload (middle part)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    )

    // Check required fields
    if (!payload.sub || !payload.exp) {
      return false
    }

    // Check expiration (exp is in seconds)
    const expirationMs = payload.exp * 1000
    if (expirationMs < Date.now()) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Middleware for admin-only endpoints
 */
export function requireAdminAuth(
  handler: (request: NextRequest, token: string) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get client IP for rate limiting
      const ip = request.headers.get('x-forwarded-for') 
        || request.headers.get('x-real-ip')
        || request.ip
        || 'unknown'

      // Check rate limit
      if (!checkRateLimit(ip)) {
        return createRateLimitResponse(60)
      }

      // Get backend type to determine auth strategy
      const backendType = process.env.BACKEND_TYPE || 'google-sheets'
      const adminToken = process.env.ADMIN_TOKEN

      // Try to extract token from request
      // For Google Sheets, validate immediately against static token
      // For Supabase, extract token and validate with JWT verification
      let authResult
      if (backendType === 'supabase') {
        // For Supabase, extract token without immediate validation (JWT will be verified below)
        authResult = extractAndValidateAdminToken(request)
      } else {
        // For Google Sheets, validate token against ADMIN_TOKEN
        authResult = extractAndValidateAdminToken(request, adminToken)
      }

      if (!authResult.success) {
        return authResult.response
      }

      const token = authResult.token

      // Validate token based on backend type
      if (backendType === 'supabase') {
        // For Supabase, accept either the static ADMIN_TOKEN or a valid Supabase JWT
        const isValidAdminToken = adminToken && token === adminToken
        const isValidJWT = !isValidAdminToken && verifySupabaseJWT(token)

        if (!isValidAdminToken && !isValidJWT) {
          return createAuthErrorResponse('Invalid or expired authentication token')
        }
      }
      // For Google Sheets, token already validated in extractAndValidateAdminToken call above

      return await handler(request, token)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return createInternalErrorResponse()
    }
  }
}

/**
 * Catch-all error handler for API routes
 */
export async function handleApiError(
  error: unknown,
  context?: { operation: string }
): Promise<NextResponse> {
  console.error(`[API Error${context ? ` - ${context.operation}` : ''}]:`, error)

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('backend') || error.message.includes('Backend')) {
      return createServiceUnavailableResponse(
        'Backend service temporarily unavailable',
        60
      )
    }

    if (error.message.includes('validation')) {
      return createValidationErrorResponse({
        error: error.message,
      })
    }

    if (error.message.includes('not found') || error.message.includes('404')) {
      return createNotFoundResponse()
    }

    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return createAuthErrorResponse()
    }
  }

  return createInternalErrorResponse()
}
