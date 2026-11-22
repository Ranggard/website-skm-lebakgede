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
