/**
 * Backend Strategy interfaces and types
 */

import { QuestionnaireResponse, AnalyticsData } from './questionnaire'

export interface BackendStrategy {
  /**
   * Submit a questionnaire response to the backend
   */
  submitResponse(data: QuestionnaireResponse): Promise<string>

  /**
   * Retrieve aggregated analytics data
   */
  getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData>

  /**
   * Export responses in specified format
   */
  exportResponses(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer>

  /**
   * Delete a response by ID (admin only)
   */
  deleteResponse(responseId: string): Promise<void>

  /**
   * Get total response count
   */
  getResponseCount(): Promise<number>

  /**
   * Health check / verify backend connectivity
   */
  healthCheck(): Promise<{ status: 'ok' | 'error' }>
}

export type BackendType = 'google-sheets' | 'supabase'

export interface BackendConfig {
  type: BackendType
  [key: string]: any
}
