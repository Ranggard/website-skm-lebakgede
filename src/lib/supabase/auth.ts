/**
 * Supabase Authentication Helper
 * 
 * Provides client-side authentication functions for admin login/logout
 * Used by frontend AdminLogin component and API middleware
 * 
 * Session tokens are stored in localStorage under key 'skm_admin_token'
 * 
 * Usage:
 *   import { loginWithEmail, isAuthenticated } from '@/lib/supabase/auth'
 *   
 *   const result = await loginWithEmail(email, password)
 *   const authenticated = await isAuthenticated()
 *   await logout()
 */

import { supabaseClient } from './client'

/**
 * Session object structure
 */
export interface AuthSession {
  token: string
  user: {
    email: string
    id: string
  }
}

/**
 * Local storage key for admin token
 */
const TOKEN_STORAGE_KEY = 'skm_admin_token'

/**
 * Login with email and password
 * 
 * Uses Supabase Auth signInWithPassword to authenticate.
 * On success, stores the session token in localStorage and returns user info.
 * 
 * @param email User email address
 * @param password User password
 * @returns Promise resolving to authentication result with token and user info
 * @throws Error if authentication fails
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ token: string; user: { email: string; id: string } }> {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(`Login failed: ${error.message}`)
    }

    if (!data.session?.access_token || !data.user?.id || !data.user?.email) {
      throw new Error('Invalid response from authentication server')
    }

    // Store token in localStorage
    const token = data.session.access_token
    localStorage.setItem(TOKEN_STORAGE_KEY, token)

    console.log('[Auth] Login successful for:', email)

    return {
      token,
      user: {
        email: data.user.email,
        id: data.user.id,
      },
    }
  } catch (error) {
    console.error('[Auth] Login error:', error)
    throw error
  }
}

/**
 * Logout current user
 * 
 * Signs out the current session and clears the stored token from localStorage.
 * 
 * @returns Promise that resolves when logout is complete
 * @throws Error if logout fails
 */
export async function logout(): Promise<void> {
  try {
    const { error } = await supabaseClient.auth.signOut()

    if (error) {
      throw new Error(`Logout failed: ${error.message}`)
    }

    // Clear token from localStorage
    localStorage.removeItem(TOKEN_STORAGE_KEY)

    console.log('[Auth] Logout successful')
  } catch (error) {
    console.error('[Auth] Logout error:', error)
    throw error
  }
}

/**
 * Get current session
 * 
 * Retrieves the current session from Supabase and localStorage.
 * Returns null if no active session exists.
 * 
 * @returns Promise resolving to session object or null if not authenticated
 */
export async function getSession(): Promise<{ token: string; user: { email: string; id: string } } | null> {
  try {
    // Try to get session from Supabase first
    const { data, error } = await supabaseClient.auth.getSession()

    if (error) {
      console.warn('[Auth] Error getting session:', error.message)
      return null
    }

    if (data.session?.access_token && data.session.user?.id && data.session.user?.email) {
      // Session is valid, update localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, data.session.access_token)

      return {
        token: data.session.access_token,
        user: {
          email: data.session.user.email,
          id: data.session.user.id,
        },
      }
    }

    // Try to get token from localStorage as fallback
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (storedToken) {
      // Note: We have a stored token but no active session
      // This might indicate an expired session
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      return null
    }

    return null
  } catch (error) {
    console.error('[Auth] Error in getSession:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 * 
 * Returns true if a valid session exists, false otherwise.
 * 
 * @returns Promise resolving to authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession()
    return session !== null
  } catch (error) {
    console.error('[Auth] Error checking authentication:', error)
    return false
  }
}

/**
 * Get stored token from localStorage
 * 
 * Internal utility function to get the admin token stored locally.
 * Useful for making authenticated API calls from the client.
 * 
 * @returns Token string or null if not stored
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Clear stored token from localStorage
 * 
 * Internal utility function to clear the stored admin token.
 * Called during logout.
 */
export function clearStoredToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
