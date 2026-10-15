/**
 * Placeholder implementations for backend strategies
 * These will be replaced with actual implementations in subsequent tasks
 */

import { BackendStrategy } from '../../types/backend'
import { QuestionnaireResponse, AnalyticsData } from '../../types/questionnaire'

export class PlaceholderBackend implements BackendStrategy {
  async submitResponse(data: QuestionnaireResponse): Promise<string> {
    throw new Error('Not implemented')
  }

  async getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    throw new Error('Not implemented')
  }

  async exportResponses(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer> {
    throw new Error('Not implemented')
  }

  async deleteResponse(responseId: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async getResponseCount(): Promise<number> {
    throw new Error('Not implemented')
  }

  async healthCheck(): Promise<{ status: 'ok' | 'error' }> {
    throw new Error('Not implemented')
  }
}
