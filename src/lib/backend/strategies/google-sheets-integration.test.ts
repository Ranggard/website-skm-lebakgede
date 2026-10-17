/**
 * Integration tests for GoogleSheetsBackend
 * Tests the complete form submission flow and backend factory integration
 * 
 * AC9: Google Sheets backend for form submission (Task 9)
 * AC3: Form submission endpoint validation and storage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GoogleSheetsBackend } from './google-sheets'
import { BackendFactory } from '../factory'
import type { QuestionnaireResponse } from '../../types/questionnaire'

// Mock fetch globally
global.fetch = vi.fn()

describe('GoogleSheetsBackend Integration', () => {
  beforeEach(() => {
    // Reset factory singleton
    BackendFactory.reset()

    // Set up environment variables for Google Sheets
    process.env.BACKEND_TYPE = 'google-sheets'
    process.env.GOOGLE_APPS_SCRIPT_URL =
      'https://script.google.com/macros/d/test-script-id/usercontent'
    process.env.GOOGLE_SHEET_ID = 'test-sheet-id'
    process.env.ADMIN_TOKEN = 'test-admin-token'

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
    BackendFactory.reset()
  })

  describe('Factory Integration', () => {
    it('should create GoogleSheetsBackend instance via factory', () => {
      const backend = BackendFactory.create('google-sheets')
      expect(backend).toBeInstanceOf(GoogleSheetsBackend)
    })

    it('should return GoogleSheetsBackend from getInstance when BACKEND_TYPE is google-sheets', () => {
      const backend = BackendFactory.getInstance()
      expect(backend).toBeInstanceOf(GoogleSheetsBackend)
    })

    it('should maintain singleton instance across multiple getInstance calls', () => {
      const backend1 = BackendFactory.getInstance()
      const backend2 = BackendFactory.getInstance()
      expect(backend1).toBe(backend2)
    })

    it('should return correct active backend type', () => {
      BackendFactory.getInstance()
      expect(BackendFactory.getActiveBackendType()).toBe('google-sheets')
    })
  })

  describe('Complete Form Submission Flow', () => {
    it('should successfully submit a complete questionnaire form', async () => {
      // Mock successful Apps Script response
      const mockAppScriptResponse = {
        success: true,
        data: {
          id: 'response-uuid-123',
          timestamp: new Date().toISOString(),
          message: 'Response submitted successfully',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppScriptResponse,
      } as any)

      // Get backend via factory
      const backend = BackendFactory.getInstance()

      // Create complete questionnaire response
      const questionnaireData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 5,
        Q4: 4,
        Q5: 5,
        Q6: 3,
        Q7: 4,
        Q8: 5,
        Q21: 'Excellent service provided',
        demographic_age: '25-34',
        demographic_service: 'Health',
      }

      // Submit form
      const responseId = await backend.submitResponse(questionnaireData)

      // Verify response
      expect(responseId).toBe('response-uuid-123')
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Verify fetch was called with correct data
      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      expect(fetchCall[0]).toBe(process.env.GOOGLE_APPS_SCRIPT_URL)
      expect(fetchCall[1]?.method).toBe('POST')
    })

    it('should handle partial questionnaire data (missing optional fields)', async () => {
      const mockAppScriptResponse = {
        success: true,
        data: { id: 'response-uuid-456' },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppScriptResponse,
      } as any)

      const backend = BackendFactory.getInstance()

      // Minimal questionnaire - only required fields
      const questionnaireData: QuestionnaireResponse = {
        Q1: 3,
        Q2: 3,
        Q3: 3,
        Q4: 3,
        Q5: 3,
        Q6: 3,
        Q7: 3,
        Q8: 3,
        // No Q21, no demographic fields
      }

      const responseId = await backend.submitResponse(questionnaireData)

      expect(responseId).toBe('response-uuid-456')

      // Verify sent data includes empty strings for optional fields
      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const body = JSON.parse(fetchCall[1]?.body as string)
      expect(body.q9_suggestions).toBe('')
      expect(body.demographic_age).toBe('')
      expect(body.demographic_service).toBe('')
    })

    it('should handle extreme rating values correctly', async () => {
      const mockAppScriptResponse = {
        success: true,
        data: { id: 'response-uuid-789' },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppScriptResponse,
      } as any)

      const backend = BackendFactory.getInstance()

      // Test extreme values
      const questionnaireData: QuestionnaireResponse = {
        Q1: 1, // Minimum
        Q2: 5, // Maximum
        Q3: 1,
        Q4: 5,
        Q5: 1,
        Q6: 5,
        Q7: 1,
        Q8: 5,
      }

      const responseId = await backend.submitResponse(questionnaireData)

      expect(responseId).toBe('response-uuid-789')

      // Verify values are preserved
      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const body = JSON.parse(fetchCall[1]?.body as string)
      expect(body.q1_accessibility).toBe(1)
      expect(body.q2_service_quality).toBe(5)
    })
  })

  describe('Analytics Retrieval Flow', () => {
    it('should retrieve analytics after multiple form submissions', async () => {
      const mockAnalyticsResponse = {
        success: true,
        data: {
          totalResponses: 5,
          avgSatisfaction: 4.0,
          satisfactionDistribution: {
            verySatisfied: 2,
            satisfied: 2,
            neutral: 1,
            dissatisfied: 0,
            veryDissatisfied: 0,
          },
          dimensionAverages: {
            accessibility: 4.0,
            serviceQuality: 4.0,
            professionalism: 4.0,
            courtesy: 4.0,
            reliability: 4.0,
            security: 4.0,
            responseTime: 4.0,
            facilities: 4.0,
          },
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalyticsResponse,
      } as any)

      const backend = BackendFactory.getInstance()
      const analytics = await backend.getAnalytics()

      expect(analytics.totalResponses).toBe(5)
      expect(analytics.avgSatisfaction).toBe(4.0)
      expect(analytics.satisfactionDistribution.verySatisfied).toBe(2)
      expect(analytics.satisfactionDistribution.satisfied).toBe(2)
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('should retry on network failure and succeed on retry', async () => {
      vi.mocked(global.fetch)
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'recovered-id' },
          }),
        } as any)

      const backend = BackendFactory.getInstance()
      const questionnaireData: QuestionnaireResponse = {
        Q1: 4,
        Q2: 4,
        Q3: 4,
        Q4: 4,
        Q5: 4,
        Q6: 4,
        Q7: 4,
        Q8: 4,
      }

      const responseId = await backend.submitResponse(questionnaireData)

      expect(responseId).toBe('recovered-id')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should fail gracefully and provide meaningful error messages', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 500,
          type: 'Internal Server Error',
          message: 'Failed to append to sheet',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => errorResponse,
      } as any)

      const backend = BackendFactory.getInstance()
      const questionnaireData: QuestionnaireResponse = {
        Q1: 3,
        Q2: 3,
        Q3: 3,
        Q4: 3,
        Q5: 3,
        Q6: 3,
        Q7: 3,
        Q8: 3,
      }

      await expect(backend.submitResponse(questionnaireData)).rejects.toThrow(
        'Apps Script error: Internal Server Error'
      )
    })
  })

  describe('Health Monitoring', () => {
    it('should report healthy status when backend is available', async () => {
      const healthResponse = {
        success: true,
        data: {
          status: 'ok',
          timestamp: new Date().toISOString(),
          backend: 'google-sheets',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => healthResponse,
      } as any)

      const backend = BackendFactory.getInstance()
      const health = await backend.healthCheck()

      expect(health.status).toBe('ok')
    })

    it('should report error status when backend is unavailable', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(
        new Error('Connection refused')
      )

      const backend = BackendFactory.getInstance()
      const health = await backend.healthCheck()

      expect(health.status).toBe('error')
    })
  })

  describe('Compliance with AC9 Requirements', () => {
    it('should send requests to configured Google Apps Script URL', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'test-id' },
        }),
      } as any)

      const backend = BackendFactory.getInstance()
      await backend.submitResponse({
        Q1: 3,
        Q2: 3,
        Q3: 3,
        Q4: 3,
        Q5: 3,
        Q6: 3,
        Q7: 3,
        Q8: 3,
      })

      const url = vi.mocked(global.fetch).mock.calls[0][0] as string
      expect(url).toContain(process.env.GOOGLE_APPS_SCRIPT_URL)
    })

    it('should include admin token in analytics requests', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            totalResponses: 0,
            avgSatisfaction: 0,
            satisfactionDistribution: {
              verySatisfied: 0,
              satisfied: 0,
              neutral: 0,
              dissatisfied: 0,
              veryDissatisfied: 0,
            },
            dimensionAverages: {
              accessibility: 0,
              serviceQuality: 0,
              professionalism: 0,
              courtesy: 0,
              reliability: 0,
              security: 0,
              responseTime: 0,
              facilities: 0,
            },
          },
        }),
      } as any)

      const backend = BackendFactory.getInstance()
      await backend.getAnalytics()

      const url = new URL(vi.mocked(global.fetch).mock.calls[0][0] as string)
      expect(url.searchParams.get('token')).toBe(process.env.ADMIN_TOKEN)
    })

    it('should call Apps Script webhook with POST for form submissions', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'test-id' },
        }),
      } as any)

      const backend = BackendFactory.getInstance()
      await backend.submitResponse({
        Q1: 3,
        Q2: 3,
        Q3: 3,
        Q4: 3,
        Q5: 3,
        Q6: 3,
        Q7: 3,
        Q8: 3,
      })

      const fetchOptions = vi.mocked(global.fetch).mock.calls[0][1]
      expect(fetchOptions?.method).toBe('POST')
      expect(fetchOptions?.headers).toHaveProperty('Content-Type', 'application/json')
    })
  })
})
