/**
 * Backend Factory Pattern Implementation
 * Provides runtime selection of backend strategy
 */

import { BackendStrategy, BackendType } from '../types/backend'

let backendInstance: BackendStrategy | null = null

export class BackendFactory {
  /**
   * Create and return a backend instance based on configuration
   */
  static create(provider: BackendType): BackendStrategy {
    switch (provider) {
      case 'google-sheets':
        // TODO: Implement GoogleSheetsBackend in Task 9
        throw new Error('Google Sheets backend not yet implemented')

      case 'supabase':
        // TODO: Implement SupabaseBackend in Task 17
        throw new Error('Supabase backend not yet implemented')

      default:
        throw new Error(`Unknown backend provider: ${provider}`)
    }
  }

  /**
   * Get or create singleton instance of the configured backend
   */
  static getInstance(): BackendStrategy {
    if (!backendInstance) {
      const backendType = (process.env.BACKEND_TYPE || 'google-sheets') as BackendType
      backendInstance = this.create(backendType)
    }
    return backendInstance
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  static reset(): void {
    backendInstance = null
  }
}
