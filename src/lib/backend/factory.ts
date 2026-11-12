/**
 * Backend Factory Pattern Implementation
 * Provides runtime selection and singleton management of backend strategy
 * with environment-based configuration and validation
 * 
 * Task 9: GoogleSheetsBackend implementation complete
 * Task 17: SupabaseBackend implementation pending
 */

import { BackendStrategy, BackendType } from '../types/backend'
import { SupabaseBackend } from './strategies/supabase'

// Singleton instance storage
let backendInstance: BackendStrategy | null = null
let activeBackendType: BackendType | null = null

/**
 * Validates that BACKEND_TYPE environment variable is set to a valid value
 */
function validateBackendType(): BackendType {
  const backendType = process.env.BACKEND_TYPE

  if (!backendType) {
    throw new Error(
      'BACKEND_TYPE environment variable is not set. Must be: "supabase"'
    )
  }

  // Validate against allowed backend types
  const validBackends: BackendType[] = ['supabase']
  if (!validBackends.includes(backendType as BackendType)) {
    throw new Error(
      `Invalid BACKEND_TYPE: "${backendType}". Must be: ${validBackends.join(', ')}`
    )
  }

  return backendType as BackendType
}

export class BackendFactory {
  /**
   * Create a new backend instance based on the specified provider
   * @param provider Backend provider type ('google-sheets' or 'supabase')
   * @returns Configured backend strategy instance
   * @throws Error if provider is not recognized
   */
  static create(provider: BackendType): BackendStrategy {
    switch (provider) {
      case 'supabase':
        return new SupabaseBackend()

      default:
        const exhaustive: never = provider
        throw new Error(`Unknown backend provider: ${exhaustive}`)
    }
  }

  /**
   * Get or create the singleton backend instance based on BACKEND_TYPE env variable
   * Ensures only one backend is active at runtime
   * @returns The configured backend strategy singleton instance
   * @throws Error if BACKEND_TYPE is not set or invalid
   * @throws Error if multiple backends are being used simultaneously
   */
  static getInstance(): BackendStrategy {
    if (!backendInstance) {
      // Validate and get backend type from environment
      const backendType = validateBackendType()

      // Track the active backend to prevent runtime switching
      activeBackendType = backendType

      // Create and cache the singleton instance
      backendInstance = this.create(backendType)

      // Validate runtime constraint: only one backend active
      this.validateSingleBackendConstraint(backendType)
    } else {
      // Ensure the same backend type is being used throughout runtime
      const currentBackendType = validateBackendType()
      if (activeBackendType && activeBackendType !== currentBackendType) {
        throw new Error(
          `Runtime backend switch detected: was using "${activeBackendType}", ` +
            `now trying to use "${currentBackendType}". ` +
            `Only one backend can be active at runtime.`
        )
      }
    }

    return backendInstance
  }

  /**
   * Validates that only one backend is configured to be active
   * This prevents accidental misconfiguration where multiple backends could interfere
   * @param activeBackend The backend type being activated
   * @throws Error if multiple backends appear to be configured
   */
  private static validateSingleBackendConstraint(activeBackend: BackendType): void {
    // No need to validate multiple backends since we only support Supabase
    // This method is kept for backward compatibility but does nothing
  }

  /**
   * Returns the currently active backend type, if one has been instantiated
   * @returns The active backend type or null if getInstance() hasn't been called yet
   */
  static getActiveBackendType(): BackendType | null {
    return activeBackendType
  }

  /**
   * Reset the singleton instance and active backend type
   * Useful for testing and dynamic backend switching in test scenarios
   * WARNING: Should not be used in production code
   */
  static reset(): void {
    backendInstance = null
    activeBackendType = null
  }
}
