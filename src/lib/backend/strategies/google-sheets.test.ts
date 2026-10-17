/**
 * Unit tests for GoogleSheetsBackend
 * Tests form submission, retry logic, analytics retrieval, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GoogleSheetsBackend } from './google-sheets'
import type { QuestionnaireResponse, AnalyticsData } from '../../types/questionnaire'

// Mock fetch globally
global.fetch = vi.fn()

describe('GoogleSheetsBackend', () => {
  let backend: GoogleSheetsBackend

  beforeEach(() => {
    // Set up environment variables
    process.env.GOOGLE_APPS_SCRIPT_URL =
      'https://script.google.com/macros/d/test-script-id/usercontent'
    process.env.GOOGLE_SHEET_ID = 'test-sheet-id'
    process.env.ADMIN_TOKEN = 'test-admin-token'

    // Clear all mocks
    vi.clearAllMocks()

    // Create backend instance
    backend = new GoogleSheetsBackend()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with environment variables', () => {
      const instance = new GoogleSheetsBackend()
      expect(instance).toBeDefined()
    })

    it('should throw error if GOOGLE_APPS_SCRIPT_URL is not configured', () => {
      process.env.GOOGLE_APPS_SCRIPT_URL = ''
      expect(() => new GoogleSheetsBackend()).toThrow(
        'GOOGLE_APPS_SCRIPT_URL environment variable is not properly configured'
      )
    })

    it('should throw error if GOOGLE_SHEET_ID is not configured', () => {
      process.env.GOOGLE_APPS_SCRIPT_URL =
        'https://script.google.com/macros/d/test/usercontent'
      process.env.GOOGLE_SHEET_ID = ''
      expect(() => new GoogleSheetsBackend()).toThrow(
        'GOOGLE_SHEET_ID environment variable is not properly configured'
      )
    })

    it('should throw error if GOOGLE_APPS_SCRIPT_URL has placeholder value', () => {
      process.env.GOOGLE_APPS_SCRIPT_URL =
        'https://script.google.com/macros/d/your-script-id/usercontent'
      expect(() => new GoogleSheetsBackend()).toThrow(
        'GOOGLE_APPS_SCRIPT_URL environment variable is not properly configured'
      )
    })

    it('should throw error if GOOGLE_SHEET_ID has placeholder value', () => {
      process.env.GOOGLE_APPS_SCRIPT_URL =
        'https://script.google.com/macros/d/test/usercontent'
      process.env.GOOGLE_SHEET_ID = 'your-sheet-id'
      expect(() => new GoogleSheetsBackend()).toThrow(
        'GOOGLE_SHEET_ID environment variable is not properly configured'
      )
    })

    it('should warn if ADMIN_TOKEN is not configured', () => {
      process.env.ADMIN_TOKEN = ''
      const consoleWarnSpy = vi.spyOn(console, 'warn')
      new GoogleSheetsBackend()
      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })

  describe('submitResponse - Successful Submission', () => {
    it('should submit a valid questionnaire response and return response ID', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'test-response-id-123',
          timestamp: new Date().toISOString(),
          message: 'Response submitted successfully',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 5,
        Q4: 4,
        Q5: 5,
        Q6: 3,
        Q7: 4,
        Q8: 5,
        demographic_age: '25-34',
        demographic_service: 'Health',
      }

      const responseId = await backend.submitResponse(testData)

      expect(responseId).toBe('test-response-id-123')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        process.env.GOOGLE_APPS_SCRIPT_URL,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    it('should normalize response data from Q1-Q8 format to flat format', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'test-id' },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
        Q21: 'Great service!',
        demographic_age: '30-40',
        demographic_service: 'Education',
      }

      await backend.submitResponse(testData)

      const callArgs = vi.mocked(global.fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)

      expect(body).toEqual({
        q1_accessibility: 5,
        q2_service_quality: 4,
        q3_professionalism: 3,
        q4_courtesy: 2,
        q5_reliability: 1,
        q6_security: 5,
        q7_response_time: 4,
        q8_facilities: 3,
        q9_suggestions: 'Great service!',
        demographic_age: '30-40',
        demographic_service: 'Education',
      })
    })

    it('should handle optional fields gracefully', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'test-id' },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
        // Missing Q21, demographic_age, demographic_service
      }

      await backend.submitResponse(testData)

      const callArgs = vi.mocked(global.fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)

      expect(body.q9_suggestions).toBe('')
      expect(body.demographic_age).toBe('')
      expect(body.demographic_service).toBe('')
    })
  })

  describe('submitResponse - Error Handling and Retry', () => {
    it('should retry on network errors up to MAX_RETRY_ATTEMPTS', async () => {
      vi.mocked(global.fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'test-id' },
          }),
        } as any)

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
      }

      const responseId = await backend.submitResponse(testData)

      expect(responseId).toBe('test-id')
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('should throw error if validation error occurs (no retry)', async () => {
      const validationError = {
        success: false,
        error: {
          code: 400,
          type: 'Validation failed',
          message: 'q1_accessibility must be between 1 and 5',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => validationError,
      } as any)

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
      }

      await expect(backend.submitResponse(testData)).rejects.toThrow(
        'Apps Script error: Validation failed'
      )

      // Should only try once, not retry
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should throw error if all retries fail', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network timeout'))

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
      }

      await expect(backend.submitResponse(testData)).rejects.toThrow(
        'Failed to submit response after 3 attempts'
      )

      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('should throw error if response ID is missing from Apps Script', async () => {
      const invalidResponse = {
        success: true,
        data: { message: 'Success' },
        // Missing id field
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => invalidResponse,
      } as any)

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
      }

      await expect(backend.submitResponse(testData)).rejects.toThrow(
        'Response ID missing from Apps Script response'
      )
    })

    it('should throw error if HTTP response is not OK', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      } as any)

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
      }

      await expect(backend.submitResponse(testData)).rejects.toThrow('HTTP 500')
    })

    it('should throw error on request timeout', async () => {
      vi.mocked(global.fetch).mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Aborted')
            error.name = 'AbortError'
            reject(error)
          }, 100)
        })
      })

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
      }

      await expect(backend.submitResponse(testData)).rejects.toThrow(
        'Request timeout'
      )
    })
  })

  describe('getAnalytics', () => {
    it('should retrieve analytics data from Apps Script', async () => {
      const mockAnalytics = {
        success: true,
        data: {
          totalResponses: 100,
          avgSatisfaction: 4.2,
          satisfactionDistribution: {
            verySatisfied: 40,
            satisfied: 35,
            neutral: 15,
            dissatisfied: 8,
            veryDissatisfied: 2,
          },
          dimensionAverages: {
            accessibility: 4.1,
            serviceQuality: 4.3,
            professionalism: 4.2,
            courtesy: 4.4,
            reliability: 4.0,
            security: 3.8,
            responseTime: 4.2,
            facilities: 3.9,
          },
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      } as any)

      const analytics = await backend.getAnalytics()

      expect(analytics.totalResponses).toBe(100)
      expect(analytics.avgSatisfaction).toBe(4.2)
      expect(analytics.satisfactionDistribution.verySatisfied).toBe(40)
      expect(analytics.dimensionAverages.accessibility).toBe(4.1)

      const url = new URL(vi.mocked(global.fetch).mock.calls[0][0] as string)
      expect(url.searchParams.get('action')).toBe('analytics')
      expect(url.searchParams.get('token')).toBe('test-admin-token')
    })

    it('should include date filters in analytics request if provided', async () => {
      const mockAnalytics = {
        success: true,
        data: {
          totalResponses: 50,
          avgSatisfaction: 4.1,
          satisfactionDistribution: {
            verySatisfied: 20,
            satisfied: 18,
            neutral: 8,
            dissatisfied: 3,
            veryDissatisfied: 1,
          },
          dimensionAverages: {
            accessibility: 4.0,
            serviceQuality: 4.2,
            professionalism: 4.1,
            courtesy: 4.3,
            reliability: 4.0,
            security: 3.9,
            responseTime: 4.1,
            facilities: 3.8,
          },
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      } as any)

      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      await backend.getAnalytics(startDate, endDate)

      const url = new URL(vi.mocked(global.fetch).mock.calls[0][0] as string)
      expect(url.searchParams.get('startDate')).toBe(startDate.toISOString())
      expect(url.searchParams.get('endDate')).toBe(endDate.toISOString())
    })

    it('should throw error if analytics query fails', async () => {
      const errorResponse = {
        success: false,
        error: {
          message: 'Unauthorized access',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => errorResponse,
      } as any)

      await expect(backend.getAnalytics()).rejects.toThrow(
        'Analytics query failed: Unauthorized access'
      )
    })
  })

  describe('getResponseCount', () => {
    it('should return response count from analytics', async () => {
      const mockAnalytics = {
        success: true,
        data: {
          totalResponses: 250,
          avgSatisfaction: 4.0,
          satisfactionDistribution: {
            verySatisfied: 100,
            satisfied: 90,
            neutral: 40,
            dissatisfied: 15,
            veryDissatisfied: 5,
          },
          dimensionAverages: {
            accessibility: 4.0,
            serviceQuality: 4.1,
            professionalism: 4.0,
            courtesy: 4.2,
            reliability: 3.9,
            security: 3.8,
            responseTime: 4.0,
            facilities: 3.9,
          },
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      } as any)

      const count = await backend.getResponseCount()

      expect(count).toBe(250)
    })

    it('should throw error if getAnalytics fails', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Connection failed'))

      await expect(backend.getResponseCount()).rejects.toThrow()
    })
  })

  describe('healthCheck', () => {
    it('should return ok status if Apps Script is healthy', async () => {
      const mockResponse = {
        success: true,
        data: {
          status: 'ok',
          timestamp: new Date().toISOString(),
          backend: 'google-sheets',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const health = await backend.healthCheck()

      expect(health.status).toBe('ok')
    })

    it('should return error status if Apps Script is unavailable', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Connection refused'))

      const health = await backend.healthCheck()

      expect(health.status).toBe('error')
    })

    it('should return error status if response indicates failure', async () => {
      const errorResponse = {
        success: false,
        error: { message: 'Service error' },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => errorResponse,
      } as any)

      const health = await backend.healthCheck()

      expect(health.status).toBe('error')
    })
  })

  describe('exportResponses', () => {
    it('should export responses in CSV format with BOM', async () => {
      const mockCsvData = 'Timestamp,Q1,Q2,Q3\n2024-01-15T10:00:00Z,5,4,3\n2024-01-14T09:00:00Z,4,3,2'
      const mockResponse = {
        success: true,
        data: {
          csvContent: mockCsvData,
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const buffer = await backend.exportResponses('csv')

      expect(buffer).toBeInstanceOf(Buffer)
      // Check BOM is present
      expect(buffer.slice(0, 3)).toEqual(Buffer.from('\uFEFF', 'utf-8'))
      // Check content is present
      expect(buffer.toString('utf-8').substring(3)).toContain('Timestamp')

      const url = new URL(vi.mocked(global.fetch).mock.calls[0][0] as string)
      expect(url.searchParams.get('action')).toBe('export')
      expect(url.searchParams.get('format')).toBe('csv')
    })

    it('should export responses in Excel format', async () => {
      const mockCsvData = 'Timestamp,Q1,Q2,Q3\n2024-01-15T10:00:00Z,5,4,3\n2024-01-14T09:00:00Z,4,3,2'
      const mockResponse = {
        success: true,
        data: {
          csvContent: mockCsvData,
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const buffer = await backend.exportResponses('excel')

      expect(buffer).toBeInstanceOf(Buffer)
      // XLSX files start with specific magic bytes
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should include date filters in export request if provided', async () => {
      const mockCsvData = 'Timestamp,Q1,Q2\n2024-01-15T10:00:00Z,5,4'
      const mockResponse = {
        success: true,
        data: {
          csvContent: mockCsvData,
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      await backend.exportResponses('csv', startDate, endDate)

      const url = new URL(vi.mocked(global.fetch).mock.calls[0][0] as string)
      expect(url.searchParams.get('startDate')).toBe(startDate.toISOString())
      expect(url.searchParams.get('endDate')).toBe(endDate.toISOString())
    })

    it('should throw 400 error if startDate is after endDate', async () => {
      const startDate = new Date('2024-01-31')
      const endDate = new Date('2024-01-01')

      await expect(backend.exportResponses('csv', startDate, endDate)).rejects.toThrow(
        'Invalid date range: startDate cannot be after endDate'
      )
    })

    it('should throw 400 error if date is invalid', async () => {
      const invalidDate = new Date('invalid')

      await expect(backend.exportResponses('csv', invalidDate)).rejects.toThrow(
        'Invalid startDate format'
      )
    })

    it('should throw error if no CSV content is returned', async () => {
      const mockResponse = {
        success: true,
        data: {},
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      await expect(backend.exportResponses('csv')).rejects.toThrow(
        'No CSV content returned from Apps Script'
      )
    })

    it('should throw error if export fails', async () => {
      const errorResponse = {
        success: false,
        error: {
          message: 'Unauthorized access',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => errorResponse,
      } as any)

      await expect(backend.exportResponses('csv')).rejects.toThrow(
        'Export failed: Unauthorized access'
      )
    })

    it('should sort CSV data by timestamp descending', async () => {
      const mockCsvData = 'Timestamp,Q1,Q2\n2024-01-10T10:00:00Z,5,4\n2024-01-15T10:00:00Z,3,2\n2024-01-12T10:00:00Z,4,3'
      const mockResponse = {
        success: true,
        data: {
          csvContent: mockCsvData,
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const buffer = await backend.exportResponses('csv')
      const csvText = buffer.toString('utf-8').substring(3) // Skip BOM

      // Check that timestamps are in descending order
      const lines = csvText.split('\n')
      expect(lines[0]).toContain('Timestamp') // Header
      expect(lines[1]).toContain('2024-01-15') // Newest first
      expect(lines[2]).toContain('2024-01-12')
      expect(lines[3]).toContain('2024-01-10') // Oldest last
    })

    it('should handle CSV with quoted fields and commas', async () => {
      const mockCsvData = 'Timestamp,Q1,Comments\n2024-01-15T10:00:00Z,5,"Great, excellent service"\n2024-01-14T09:00:00Z,4,"Good"'
      const mockResponse = {
        success: true,
        data: {
          csvContent: mockCsvData,
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const buffer = await backend.exportResponses('csv')
      expect(buffer).toBeInstanceOf(Buffer)
    })
  })

  describe('deleteResponse', () => {
    it('should throw error indicating deletion not yet implemented', async () => {
      await expect(backend.deleteResponse('some-id')).rejects.toThrow(
        'Response deletion not yet implemented'
      )
    })
  })

  describe('BackendStrategy Interface Compliance', () => {
    it('should implement all required BackendStrategy methods', () => {
      expect(typeof backend.submitResponse).toBe('function')
      expect(typeof backend.getAnalytics).toBe('function')
      expect(typeof backend.exportResponses).toBe('function')
      expect(typeof backend.deleteResponse).toBe('function')
      expect(typeof backend.getResponseCount).toBe('function')
      expect(typeof backend.healthCheck).toBe('function')
    })

    it('should return correct types from implemented methods', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'test-id',
          timestamp: new Date().toISOString(),
          message: 'Success',
        },
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const testData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
      }

      const responseId = await backend.submitResponse(testData)
      expect(typeof responseId).toBe('string')

      const health = await backend.healthCheck()
      expect(health.status).toMatch(/^(ok|error)$/)
    })
  })
})
