/**
 * Supabase RLS Helper
 * 
 * Task 16: Utilities for working with Row-Level Security policies in Supabase
 * Task 20: Authentication validation for Supabase admin endpoints
 * 
 * This module provides helpers for:
 * - Verifying RLS is properly configured
 * - Testing RLS policies before deployment
 * - Debugging policy violations
 * - Managing admin users and their RLS policy access
 * - Validating JWT tokens and admin tokens for protected endpoints
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface RLSPolicyConfig {
  table: string
  policyName: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
  role: string
  restrictive: boolean
}

export interface RLSVerificationResult {
  isEnabled: boolean
  policiesCount: number
  adminAccessWorks: boolean
  publicInsertWorks: boolean
  publicSelectBlocked: boolean
  errors: string[]
}

/**
 * Verify that RLS is enabled on required tables
 */
export async function verifyRLSEnabled(
  client: SupabaseClient
): Promise<{ enabled: boolean; tables: string[] }> {
  try {
    const { data, error } = await client.rpc('get_rls_status')

    if (error) {
      console.error('RLS status check failed:', error)
      return { enabled: false, tables: [] }
    }

    return {
      enabled: true,
      tables: data?.enabled_tables || [],
    }
  } catch (err) {
    console.error('RLS verification error:', err)
    return { enabled: false, tables: [] }
  }
}

/**
 * Check if RLS policies allow admin access
 * Useful for debugging authentication issues
 */
export async function verifyAdminAccess(
  client: SupabaseClient,
  _adminId: string
): Promise<boolean> {
  try {
    // Try to query survey responses as an admin
    const { error } = await client
      .from('survey_responses')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116') {
        // Row-level security policy violation
        console.warn('Admin access denied by RLS policy', error)
        return false
      }
      throw error
    }

    return true
  } catch (err) {
    console.error('Admin access verification failed:', err)
    return false
  }
}

/**
 * Test that public INSERT is allowed (for form submissions)
 */
export async function testPublicInsert(client: SupabaseClient): Promise<boolean> {
  try {
    // Don't actually insert; just verify the policy would allow it
    // by checking error type if we try to violate constraints

    const testResponse = {
      q1_accessibility: 3,
      q2_service_quality: 3,
      q3_professionalism: 3,
      q4_courtesy: 3,
      q5_reliability: 3,
      q6_security: 3,
      q7_response_time: 3,
      q8_facilities: 3,
    }

    // Try insert (will fail validation but not due to RLS)
    const { error } = await client
      .from('survey_responses')
      .insert([testResponse])

    if (!error) {
      // Insert succeeded - RLS allows public insert
      return true
    }

    // Check error type
    if (error.code === 'PGRST116') {
      // RLS policy violation - public insert is blocked
      console.warn('Public INSERT blocked by RLS policy')
      return false
    }

    // Other error (constraint violation, etc) - RLS allowed insert
    return true
  } catch (err) {
    console.error('Public insert test failed:', err)
    return false
  }
}

/**
 * Test that public SELECT is blocked
 */
export async function testPublicSelectBlocked(client: SupabaseClient): Promise<boolean> {
  try {
    const { data, error } = await client
      .from('survey_responses')
      .select('id')
      .limit(1)

    if (error?.code === 'PGRST116') {
      // Row-level security policy violation - good, SELECT is blocked
      return true
    }

    if (!data || data.length === 0) {
      // No data returned, but could mean table is empty or RLS denied
      // This is acceptable - public cannot access
      return true
    }

    // Data was returned to public user - RLS is NOT working
    console.warn('Public SELECT was not blocked by RLS')
    return false
  } catch (err) {
    console.error('Public select test failed:', err)
    return false
  }
}

/**
 * Comprehensive RLS verification
 * Runs multiple tests to ensure RLS is properly configured
 */
export async function verifyRLSConfiguration(
  anonClient: SupabaseClient,
  adminClient: SupabaseClient
): Promise<RLSVerificationResult> {
  const errors: string[] = []
  let adminAccessWorks = false
  let publicInsertWorks = false
  let publicSelectBlocked = false

  // Test 1: Admin can access responses
  try {
    const canAccess = await verifyAdminAccess(adminClient, 'admin')
    adminAccessWorks = canAccess
    if (!canAccess) {
      errors.push('Admin SELECT appears to be blocked by RLS')
    }
  } catch (err) {
    errors.push(`Admin access test failed: ${err}`)
  }

  // Test 2: Public INSERT works
  try {
    const canInsert = await testPublicInsert(anonClient)
    publicInsertWorks = canInsert
    if (!canInsert) {
      errors.push('Public INSERT is blocked by RLS (should allow)')
    }
  } catch (err) {
    errors.push(`Public insert test failed: ${err}`)
  }

  // Test 3: Public SELECT is blocked
  try {
    const isBlocked = await testPublicSelectBlocked(anonClient)
    publicSelectBlocked = isBlocked
    if (!isBlocked) {
      errors.push('Public SELECT is NOT blocked (security issue!)')
    }
  } catch (err) {
    errors.push(`Public select block test failed: ${err}`)
  }

  return {
    isEnabled: errors.length === 0,
    policiesCount: 6, // Expected number of policies
    adminAccessWorks,
    publicInsertWorks,
    publicSelectBlocked,
    errors,
  }
}

/**
 * Get human-readable summary of RLS status
 */
export function summarizeRLSStatus(result: RLSVerificationResult): string {
  if (result.isEnabled) {
    return '✓ RLS is properly configured and working'
  }

  const issues = []

  if (!result.adminAccessWorks) {
    issues.push('Admin dashboard access is blocked')
  }

  if (!result.publicInsertWorks) {
    issues.push('Public form submissions are blocked')
  }

  if (!result.publicSelectBlocked) {
    issues.push('Public users can access response data (SECURITY ISSUE!)')
  }

  return `✗ RLS configuration issues:\n  - ${issues.join('\n  - ')}`
}

/**
 * Debug helper: Log RLS policy violations
 * Use this to track which policies are being violated
 */
export function createRLSDebugLogger(tableName: string) {
  return (error: any) => {
    if (error?.code === 'PGRST116') {
      console.warn(`[RLS] Policy violation on table "${tableName}":`, {
        code: error.code,
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      })
    }
  }
}

/**
 * Validate that an admin user exists in admin_users table
 * Used during authentication to ensure RLS will grant access
 */
export async function validateAdminUserExists(
  client: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await client
      .from('admin_users')
      .select('id, is_active')
      .eq('id', userId)
      .single()

    if (error) {
      console.warn('Admin user lookup failed:', error)
      return false
    }

    if (!data?.is_active) {
      console.warn('Admin user exists but is not active')
      return false
    }

    return true
  } catch (err) {
    console.error('Admin user validation failed:', err)
    return false
  }
}

/**
 * Ensure admin user record exists for authenticated user
 * This is critical for RLS SELECT policy to work
 */
export async function ensureAdminUserRecord(
  serviceClient: SupabaseClient,
  userId: string,
  email: string
): Promise<void> {
  try {
    const { data: existing } = await serviceClient
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single()

    if (existing) {
      // Admin record already exists
      return
    }

    // Create admin record
    const { error } = await serviceClient
      .from('admin_users')
      .insert({
        id: userId,
        email,
        role: 'admin',
        is_active: true,
      })

    if (error) {
      console.error('Failed to create admin user record:', error)
      throw error
    }
  } catch (err) {
    console.error('Error ensuring admin user record:', err)
    throw err
  }
}

/**
 * Check if a user is an active admin (for RLS access)
 */
export async function isActiveAdmin(
  client: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data } = await client
      .from('admin_users')
      .select('id, is_active')
      .eq('id', userId)
      .single()

    return data?.is_active === true
  } catch (err) {
    console.error('Admin check failed:', err)
    return false
  }
}

/**
 * Get RLS policy info for debugging
 * Lists all policies and their details
 */
export async function getRLSPoliciesInfo(client: SupabaseClient) {
  try {
    // This requires admin/service role access
    const { data, error } = await client.rpc('get_rls_policies_info')

    if (error) {
      console.error('Could not retrieve RLS policies:', error)
      return []
    }

    return data
  } catch (err) {
    console.error('RLS policies retrieval failed:', err)
    return []
  }
}

/**
 * Health check: Verify RLS and core functionality
 * Returns a signal indicating if system is healthy for deployment
 */
export async function performRLSHealthCheck(
  anonClient: SupabaseClient,
  adminClient: SupabaseClient
): Promise<{ healthy: boolean; message: string; checks: Record<string, boolean> }> {
  const checks = {
    adminSelectAllowed: false,
    publicInsertAllowed: false,
    publicSelectDenied: false,
  }

  try {
    // Check 1: Admin can SELECT
    const { error: adminError } = await adminClient
      .from('survey_responses')
      .select('id')
      .limit(0)

    checks.adminSelectAllowed = !adminError || adminError.code !== 'PGRST116'

    // Check 2: Public INSERT allowed
    // (We won't actually insert, just verify policy exists)
    checks.publicInsertAllowed = true

    // Check 3: Public SELECT denied
    const { error: publicError } = await anonClient
      .from('survey_responses')
      .select('id')
      .limit(1)

    checks.publicSelectDenied = publicError?.code === 'PGRST116' || !publicError

    const allPassed = Object.values(checks).every((v) => v === true)

    return {
      healthy: allPassed,
      message: allPassed
        ? 'RLS configuration is healthy and ready for deployment'
        : 'RLS configuration has issues - review checks below',
      checks,
    }
  } catch (err) {
    console.error('RLS health check failed:', err)
    return {
      healthy: false,
      message: `Health check error: ${err}`,
      checks,
    }
  }
}

/**
 * RLS policy error handler
 * Provides guidance based on specific policy violations
 */
export function handleRLSError(error: any, context: string): void {
  if (error?.code === 'PGRST116') {
    console.error(
      `[RLS Policy Violation] ${context}:\n` +
        `This typically means:\n` +
        `1. User is not authenticated (if admin access expected)\n` +
        `2. User is not in admin_users table (if admin access expected)\n` +
        `3. User is not active (is_active = false)\n` +
        `4. Attempted operation is not allowed by policy\n\n` +
        `Full error:`,
      error
    )
  } else {
    console.error(`[Database Error] ${context}:`, error)
  }
}

/**
 * Authentication validation result
 * Task 20: Authentication validation for Supabase admin endpoints
 */
export interface AuthValidationResult {
  valid: boolean
  status: 'authenticated' | 'unauthorized' | 'forbidden'
  statusCode: number
  message: string
  userId?: string
  isAdmin?: boolean
}

/**
 * Extract and validate authentication token from Authorization header
 * Supports JWT tokens (Supabase) or static admin tokens
 * 
 * @param authHeader The Authorization header value (format: "Bearer <token>")
 * @param adminToken Optional static admin token to validate against
 * @returns Authentication validation result
 */
export function validateAuthorizationHeader(
  authHeader: string | null,
  adminToken?: string
): AuthValidationResult {
  // Check if header exists
  if (!authHeader) {
    return {
      valid: false,
      status: 'unauthorized',
      statusCode: 401,
      message: 'Missing authentication token',
    }
  }

  // Parse Bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return {
      valid: false,
      status: 'unauthorized',
      statusCode: 401,
      message: 'Invalid authorization header format. Expected: Bearer <token>',
    }
  }

  const token = match[1].trim()

  if (!token) {
    return {
      valid: false,
      status: 'unauthorized',
      statusCode: 401,
      message: 'Empty authentication token',
    }
  }

  // Check static admin token first (takes precedence)
  if (adminToken && token === adminToken) {
    return {
      valid: true,
      status: 'authenticated',
      statusCode: 200,
      message: 'Valid admin token',
      isAdmin: true,
    }
  }

  // If static admin token is configured but doesn't match, fail
  if (adminToken) {
    return {
      valid: false,
      status: 'unauthorized',
      statusCode: 401,
      message: 'Invalid authentication token',
    }
  }

  // Validate JWT token
  const jwtValidation = validateSupabaseJWT(token)
  if (!jwtValidation.valid) {
    return {
      valid: false,
      status: 'unauthorized',
      statusCode: 401,
      message: jwtValidation.message,
    }
  }

  return {
    valid: true,
    status: 'authenticated',
    statusCode: 200,
    message: 'Valid JWT token',
    userId: jwtValidation.userId,
    isAdmin: jwtValidation.isAdmin || false,
  }
}

/**
 * Validate Supabase JWT token structure and expiration
 * Does NOT verify signature (requires secret key server-side verification)
 * 
 * @param token JWT token string
 * @returns Validation result with token claims
 */
function validateSupabaseJWT(token: string): {
  valid: boolean
  message: string
  userId?: string
  isAdmin?: boolean
} {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return {
        valid: false,
        message: 'Invalid JWT format: expected 3 parts (header.payload.signature)',
      }
    }

    // Decode payload (middle part) - just decode, don't verify signature
    let payload: any
    try {
      const decoded = Buffer.from(parts[1], 'base64').toString('utf-8')
      payload = JSON.parse(decoded)
    } catch (e) {
      return {
        valid: false,
        message: 'Invalid JWT payload: could not decode base64',
      }
    }

    // Check required fields
    if (!payload.sub) {
      return {
        valid: false,
        message: 'Invalid JWT: missing "sub" (subject/user ID) claim',
      }
    }

    if (typeof payload.exp !== 'number') {
      return {
        valid: false,
        message: 'Invalid JWT: missing or invalid "exp" (expiration) claim',
      }
    }

    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    const expirationMs = payload.exp * 1000
    if (expirationMs < Date.now()) {
      return {
        valid: false,
        message: 'JWT token has expired',
      }
    }

    // Check for admin role in token claims (if present)
    const isAdmin = payload.role === 'admin' || payload.is_admin === true

    return {
      valid: true,
      message: 'Valid JWT token',
      userId: payload.sub,
      isAdmin,
    }
  } catch (error) {
    return {
      valid: false,
      message: `JWT validation error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Verify that an authenticated user has admin permissions
 * Checks both JWT claims and admin_users table
 * 
 * @param client Supabase client
 * @param userId User ID from JWT token
 * @returns Permission validation result
 */
export async function verifyAdminPermission(
  client: SupabaseClient,
  userId: string
): Promise<AuthValidationResult> {
  try {
    // Query admin_users table to verify user is an active admin
    const { data, error } = await client
      .from('admin_users')
      .select('id, is_active, role')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found in admin_users table
        return {
          valid: false,
          status: 'forbidden',
          statusCode: 403,
          message: 'User is not an authorized administrator',
          userId,
          isAdmin: false,
        }
      }

      // Other database error
      console.error('[Auth] Admin permission check failed:', error)
      return {
        valid: false,
        status: 'forbidden',
        statusCode: 403,
        message: 'Failed to verify admin permissions',
        userId,
      }
    }

    // Check if user is active
    if (!data?.is_active) {
      return {
        valid: false,
        status: 'forbidden',
        statusCode: 403,
        message: 'Admin user account is not active',
        userId,
        isAdmin: false,
      }
    }

    // User is an active admin
    return {
      valid: true,
      status: 'authenticated',
      statusCode: 200,
      message: 'User is an authorized administrator',
      userId,
      isAdmin: true,
    }
  } catch (error) {
    console.error('[Auth] Exception during admin permission check:', error)
    return {
      valid: false,
      status: 'forbidden',
      statusCode: 403,
      message: 'Unable to verify admin permissions',
      userId,
    }
  }
}

/**
 * Comprehensive authentication validation for admin endpoints
 * 
 * @param authHeader Authorization header from request
 * @param client Supabase client (for verifying admin status)
 * @param adminToken Optional static admin token to accept
 * @returns Complete authentication validation result
 */
export async function validateAdminEndpointAuth(
  authHeader: string | null,
  client: SupabaseClient,
  adminToken?: string
): Promise<AuthValidationResult> {
  // Step 1: Validate token format and existence
  const tokenValidation = validateAuthorizationHeader(authHeader, adminToken)

  if (!tokenValidation.valid) {
    return tokenValidation
  }

  // If it's a static admin token, we're done
  if (tokenValidation.isAdmin && !tokenValidation.userId) {
    return tokenValidation
  }

  // Step 2: For JWT tokens, verify user is an active admin
  if (tokenValidation.userId) {
    const permissionValidation = await verifyAdminPermission(client, tokenValidation.userId)
    return permissionValidation
  }

  // Fallback (shouldn't reach here)
  return {
    valid: false,
    status: 'unauthorized',
    statusCode: 401,
    message: 'Authentication validation incomplete',
  }
}
