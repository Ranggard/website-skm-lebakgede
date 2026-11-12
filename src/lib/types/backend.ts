/**
 * Backend Strategy interfaces and types
 * Supports multiple backend implementations (Google Sheets, Supabase, etc.)
 * 
 * Implements the Factory Pattern for runtime backend selection.
 * Each backend must implement the IBackend interface consistently.
 * 
 * AC9: Google Sheets backend preparation
 * AC10: Supabase backend preparation
 */

import type { QuestionnaireResponse, AnalyticsData } from './questionnaire'

/**
 * Backend response type for successful form submission
 */
export interface SubmitResponse {
  responseId: string
  timestamp: Date
  message: string
}

/**
 * Health check response type
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error'
  backend: BackendType
  message?: string
  timestamp: Date
}

/**
 * BackendStrategy interface defining all required backend methods
 * 
 * All backend implementations (Google Sheets, Supabase, etc.) must implement
 * this interface to ensure consistent behavior and interchangeability.
 * 
 * This interface serves as the IBackend contract required by:
 * - AC9: Google Sheets backend implementation
 * - AC10: Supabase backend implementation
 * 
 * See BACKEND_CONTRACT.md for detailed specifications of each method.
 */
export interface BackendStrategy {
  /**
   * Submit a questionnaire response to the backend
   * 
   * @param data - Complete QuestionnaireResponse with all question answers
   * @returns Promise with the response ID for confirmation
   * @throws Error if validation fails or backend is unavailable
   * 
   * Validates:
   * - All mandatory fields (Q1-Q20) are present and in valid range (1-5)
   * - Optional fields (Q21, demographics) are properly formatted
   * - Request atomicity: entire response stored or none (no partial data)
   */
  submitResponse(data: QuestionnaireResponse): Promise<string>

  /**
   * Retrieve aggregated analytics data from all stored responses
   * 
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns Promise with aggregated analytics including satisfaction distribution
   *          and per-dimension averages
   * @throws Error if backend is unavailable
   * 
   * Returns:
   * - totalResponses: Total number of responses in database
   * - avgSatisfaction: Arithmetic mean of all satisfaction ratings
   * - satisfactionDistribution: Count of responses by rating (1-5)
   * - dimensionAverages: Per-category averages (accessibility, quality, etc.)
   * - dailyTrend: Time-series data for visualization
   * - completionRate: Percentage of respondents who answered all mandatory questions
   */
  getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData>

  /**
   * Export all responses in the specified format
   * 
   * @param format - Export format: 'csv' or 'excel'
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns Promise with binary buffer of exported file
   * @throws Error if backend is unavailable or export fails
   * 
   * Exported file includes:
   * - All question responses (Q1-Q21)
   * - Response metadata (timestamp, respondent info if provided)
   * - Column headers with question text
   * - Proper encoding and formatting
   */
  exportResponses(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer>

  /**
   * Delete a specific response by ID (admin only)
   * 
   * @param responseId - Unique identifier of response to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if response not found or backend error
   * 
   * Security: This operation should be protected by authentication
   */
  deleteResponse(responseId: string): Promise<void>

  /**
   * Get total count of responses in the backend
   * 
   * @returns Promise with response count
   * @throws Error if backend is unavailable
   */
  getResponseCount(): Promise<number>

  /**
   * Health check to verify backend connectivity and availability
   * 
   * @returns Promise with status and backend type information
   * 
   * Used to:
   * - Verify backend service is operational
   * - Detect backend failures for error handling
   * - Monitor system health
   */
  healthCheck(): Promise<{ status: 'ok' | 'error' }>
}

/**
 * Type alias for BackendStrategy
 * IBackend name used in design document for clarity
 * Both names refer to the same interface
 */
export type IBackend = BackendStrategy

/**
 * Supported backend types
 * 
 * supabase - PostgreSQL via Supabase (only supported backend)
 */
export type BackendType = 'supabase'

/**
 * Backend configuration object for initialization
 * 
 * Specifies which backend is active and provides backend-specific configuration.
 * Selection happens at build time via BACKEND_TYPE environment variable.
 */
export interface BackendConfig {
  /**
   * Which backend to use
   */
  type: BackendType
  /**
   * Backend-specific configuration options
   */
  [key: string]: any
}

/**
 * Backend Factory Error
 */
export class BackendFactoryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackendFactoryError'
  }
}
