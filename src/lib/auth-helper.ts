/**
 * Authentication helper utilities for role-based access control
 */

export type UserRole = 'admin' | 'staf' | 'lurah'

export interface AuthUser {
  username: string
  nama: string
  role: UserRole
}

export interface AuthSession {
  user: AuthUser
  token: string
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, role: UserRole | UserRole[]): boolean {
  if (!user) return false
  
  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(user.role)
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin')
}

/**
 * Check if user is staff or admin
 */
export function isStaffOrHigher(user: AuthUser | null): boolean {
  return hasRole(user, ['staf', 'admin'])
}

/**
 * Get user from localStorage
 */
export function getUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('adminUser')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr) as AuthUser
  } catch (e) {
    return null
  }
}

/**
 * Get token from localStorage
 */
export function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('adminToken')
}

/**
 * Save session to localStorage
 */
export function saveSessionToStorage(user: AuthUser, token: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('adminUser', JSON.stringify(user))
  localStorage.setItem('adminToken', token)
}

/**
 * Clear session from localStorage
 */
export function clearSessionFromStorage(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('adminUser')
  localStorage.removeItem('adminToken')
}

/**
 * Server-side: Extract and decode user from token (for API endpoints)
 * This function verifies the user's identity from the Authorization header
 * 
 * @param authHeader - The Authorization header value (e.g., "Bearer <token>")
 * @param supabaseUrl - Supabase project URL for JWT verification
 * @param supabaseKey - Supabase service key for database queries
 * @returns User info if valid, null if invalid
 */
export async function verifyAndDecodeToken(
  authHeader: string | null,
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<AuthUser | null> {
  if (!authHeader) return null

  // Extract token from "Bearer <token>"
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) return null

  const token = match[1]
  const adminToken = process.env.ADMIN_TOKEN || 'admin-token-skm-questionnaire-default-12345678'

  // For now, we validate against ADMIN_TOKEN
  // The actual user info is stored in localStorage on the client and needs to be queried from DB
  // This is a placeholder that will be enhanced if JWT signing is implemented
  if (token !== adminToken) {
    return null
  }

  // For the current implementation, token validation alone is not enough
  // We need to either:
  // 1. Use Supabase JWT and extract user info from it, or
  // 2. Query the database with a "current_user" identifier
  // For now, return null to indicate token needs to be paired with user info from body
  // This will be enhanced when JWT implementation is added

  return null
}

/**
 * Server-side: Extract user info from request body
 * Used in profile update endpoint where user identifies themselves via username
 * 
 * @param username - The username claiming to make the change
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns User info from database, or null if not found
 */
export async function getUserFromDatabase(
  username: string,
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<(AuthUser & { id: string; password_hash: string; email?: string }) | null> {
  if (!username || !supabaseUrl || !supabaseKey) {
    return null
  }

  try {
    // eslint-disable-next-line global-require
    const { createClient } = require('@supabase/supabase-js')
    const client = createClient(supabaseUrl, supabaseKey)

    const { data: dbUser, error } = await client
      .from('admin_users')
      .select('id, username, nama, role, email, password_hash, is_active')
      .eq('username', username.toLowerCase())
      .eq('is_active', true)
      .maybeSingle()

    if (error || !dbUser) {
      return null
    }

    return {
      username: dbUser.username,
      nama: dbUser.nama,
      role: dbUser.role || 'staf',
      id: dbUser.id,
      password_hash: dbUser.password_hash,
      email: dbUser.email,
    }
  } catch (err) {
    console.error('[Auth Helper] Database error:', err)
    return null
  }
}

/**
 * Check if a user can perform an action
 * - Users can modify their own profile
 * - Only admin users can modify other users' profiles
 * 
 * @param currentUser - The user making the request
 * @param targetUsername - The username being modified
 * @returns true if authorized, false otherwise
 */
export function canModifyProfile(currentUser: AuthUser | null, targetUsername: string): boolean {
  if (!currentUser) return false
  
  // User can modify their own profile
  if (currentUser.username === targetUsername) return true
  
  // Admin can modify any profile
  if (currentUser.role === 'admin') return true
  
  return false
}

/**
 * Check if a user can add new users (staff only requirement)
 * According to requirements: "Tambah pengguna untuk akun staf saja" (Add users for staff accounts only)
 * 
 * @param userRole - The role of the user attempting to add a user
 * @returns true if authorized to add users, false otherwise
 */
export function canAddUsers(userRole: UserRole | null): boolean {
  if (!userRole) return false
  return ['staf', 'admin'].includes(userRole)
}
