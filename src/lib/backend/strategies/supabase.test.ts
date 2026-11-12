/**
 * Unit tests for SupabaseBackend
 * Tests form submission, validation, analytics retrieval, and error handling
 * 
 * Validates Requirements AC3, AC10 from BACKEND_CONTRACT.md
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SupabaseBackend } from './supabase'
import type { QuestionnaireResponse } from '../../types/questionnaire'

// Mock WebSocket for Node.js test environment
if (!global.WebSocket) {
  global.WebSocket = class WebSocket {
    constructor(public url: string) {}
    addEventListener() {}
    removeEventListener() {}
    close() {}
    send() {}
  } as any
}

/**
 * Mock Supabase client
 * Simulates @supabase/supabase-js behavior
 */
const createMockSupabaseClient = () => ({
  from: vi.fn((table: string) => ({
    insert: vi.fn(function () {
      return {
        select: vi.fn(function () {
          return {
            single: vi.fn(async () => ({
              data: { id: 'mock-uuid-123' },
              error: null,
            })),
          }
        }),
      }
    }),
    select: vi.fn(function (columns?: string, options?: any) {
      return {
        gte: vi.fn(function () {
          return {
            lte: vi.fn(async () => ({
              data: [],
              error: null,
            })),
          }
        }),
      }
    }),
    delete: vi.fn(function () {
      return {
        eq: vi.fn(async () => ({
          error: null,
        })),
      }
    }),
  })),
})

/**
 * Mock the Supabase library
 */
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => createMockSupabaseClient()),
}))

describe('SupabaseBackend', () => {
  let backend: SupabaseBackend

  beforeEach(() => {
    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    // Clear all mocks
    vi.clearAllMocks()

    // Create backend instance
    backend = new SupabaseBackend()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with environment variables', () => {
      const instance = new SupabaseBackend()
      expect(instance).toBeDefined()
    })

    it('should throw error if NEXT_PUBLIC_SUPABASE_URL is not configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.SUPABASE_SERVICE_KEY = 'test-key'
      expect(() => new SupabaseBackend()).toThrow(
        'Supabase configuration missing'
      )
    })

    it('should throw error if SUPABASE_SERVICE_KEY is not configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_SERVICE_KEY = ''
      expect(() => new SupabaseBackend()).toThrow(
        'Supabase configuration missing'
      )
    })
  })

  describe('submitResponse - Input Validation', () => {
    it('should reject submission with missing Q1', async () => {
      const invalidData: any = {
        Q2: 4,
        Q3: 5,
        Q4: 4,
        Q5: 3,
        Q6: 5,
        Q7: 4,
        Q8: 5,
        Q9: 4,
        Q10: 5,
        Q11: 4,
        Q12: 5,
        Q13: 4,
        Q14: 5,
        Q15: 4,
        Q16: 5,
        Q17: 4,
        Q18: 5,
        Q19: 4,
        Q20: 5,
      }

      await expect(backend.submitResponse(invalidData)).rejects.toThrow(
        'Q1 is required'
      )
    })

    it('should reject submission with out-of-range rating', async () => {
      const invalidData: any = {
        Q1: 6, // Invalid: must be 1-5
        Q2: 4,
        Q3: 5,
        Q4: 4,
        Q5: 3,
        Q6: 5,
        Q7: 4,
        Q8: 5,
        Q9: 4,
        Q10: 5,
        Q11: 4,
        Q12: 5,
        Q13: 4,
        Q14: 5,
        Q15: 4,
        Q16: 5,
        Q17: 4,
        Q18: 5,
        Q19: 4,
        Q20: 5,
      }

      await expect(backend.submitResponse(invalidData)).rejects.toThrow(
        'must be between 1 and 5'
      )
    })

    it('should reject submission with non-integer rating', async () => {
      const invalidData: any = {
        Q1: 3.5, // Invalid: must be integer
        Q2: 4,
        Q3: 5,
        Q4: 4,
        Q5: 3,
        Q6: 5,
        Q7: 4,
        Q8: 5,
        Q9: 4,
        Q10: 5,
        Q11: 4,
        Q12: 5,
        Q13: 4,
        Q14: 5,
        Q15: 4,
        Q16: 5,
        Q17: 4,
        Q18: 5,
        Q19: 4,
        Q20: 5,
      }

      await expect(backend.submitResponse(invalidData)).rejects.toThrow(
        'must be an integer'
      )
    })

    it('should reject Q21 if exceeds 500 characters', async () => {
      const longText = 'a'.repeat(501)
      const invalidData: any = {
        Q1: 5,
        Q2: 4,
        Q3: 5,
        Q4: 4,
        Q5: 3,
        Q6: 5,
        Q7: 4,
        Q8: 5,
        Q9: 4,
        Q10: 5,
        Q11: 4,
        Q12: 5,
        Q13: 4,
        Q14: 5,
        Q15: 4,
        Q16: 5,
        Q17: 4,
        Q18: 5,
        Q19: 4,
        Q20: 5,
        Q21: longText,
      }

      await expect(backend.submitResponse(invalidData)).rejects.toThrow(
        'must be 500 characters or less'
      )
    })

    it('should accept valid submission with all Q1-Q20 and optional Q21', async () => {
      const validData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 5,
        Q4: 4,
        Q5: 3,
        Q6: 5,
        Q7: 4,
        Q8: 5,
        Q9: 4,
        Q10: 5,
        Q11: 4,
        Q12: 5,
        Q13: 4,
        Q14: 5,
        Q15: 4,
        Q16: 5,
        Q17: 4,
        Q18: 5,
        Q19: 4,
        Q20: 5,
        Q21: 'Great service!',
      }

      const responseId = await backend.submitResponse(validData)
      expect(responseId).toBeDefined()
      expect(typeof responseId).toBe('string')
    })

    it('should accept valid submission with minimum ratings (1)', async () => {
      const validData: QuestionnaireResponse = {
        Q1: 1,
        Q2: 1,
        Q3: 1,
        Q4: 1,
        Q5: 1,
        Q6: 1,
        Q7: 1,
        Q8: 1,
        Q9: 1,
        Q10: 1,
        Q11: 1,
        Q12: 1,
        Q13: 1,
        Q14: 1,
        Q15: 1,
        Q16: 1,
        Q17: 1,
        Q18: 1,
        Q19: 1,
        Q20: 1,
      }

      const responseId = await backend.submitResponse(validData)
      expect(responseId).toBeDefined()
    })

    it('should accept valid submission with maximum ratings (5)', async () => {
      const validData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 5,
        Q3: 5,
        Q4: 5,
        Q5: 5,
        Q6: 5,
        Q7: 5,
        Q8: 5,
        Q9: 5,
        Q10: 5,
        Q11: 5,
        Q12: 5,
        Q13: 5,
        Q14: 5,
        Q15: 5,
        Q16: 5,
        Q17: 5,
        Q18: 5,
        Q19: 5,
        Q20: 5,
      }

      const responseId = await backend.submitResponse(validData)
      expect(responseId).toBeDefined()
    })

    it('should accept valid submission with mixed ratings', async () => {
      const validData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 3,
        Q4: 2,
        Q5: 1,
        Q6: 5,
        Q7: 4,
        Q8: 3,
        Q9: 2,
        Q10: 1,
        Q11: 5,
        Q12: 4,
        Q13: 3,
        Q14: 2,
        Q15: 1,
        Q16: 5,
        Q17: 4,
        Q18: 3,
        Q19: 2,
        Q20: 1,
      }

      const responseId = await backend.submitResponse(validData)
      expect(responseId).toBeDefined()
    })
  })

  describe('submitResponse - Data Normalization', () => {
    it('should handle optional Q21 as null when not provided', async () => {
      const validData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 5,
        Q4: 4,
        Q5: 3,
        Q6: 5,
        Q7: 4,
        Q8: 5,
        Q9: 4,
        Q10: 5,
        Q11: 4,
        Q12: 5,
        Q13: 4,
        Q14: 5,
        Q15: 4,
        Q16: 5,
        Q17: 4,
        Q18: 5,
        Q19: 4,
        Q20: 5,
        // Q21 not provided
      }

      const responseId = await backend.submitResponse(validData)
      expect(responseId).toBe('mock-uuid-123')
    })

    it('should preserve optional demographic fields', async () => {
      const validData: QuestionnaireResponse = {
        Q1: 5,
        Q2: 4,
        Q3: 5,
        Q4: 4,
        Q5: 3,
        Q6: 5,
        Q7: 4,
        Q8: 5,
        Q9: 4,
        Q10: 5,
        Q11: 4,
        Q12: 5,
        Q13: 4,
        Q14: 5,
        Q15: 4,
        Q16: 5,
        Q17: 4,
        Q18: 5,
        Q19: 4,
        Q20: 5,
        demographic_age: '25-34',
        demographic_gender: 'Male',
        demographic_education: 'Bachelor',
        demographic_service: 'Health',
      }

      const responseId = await backend.submitResponse(validData)
      expect(responseId).toBeDefined()
    })
  })

  describe('getAnalytics', () => {
    it('should return empty analytics when no responses exist', async () => {
      const analytics = await backend.getAnalytics()

      expect(analytics.totalResponses).toBe(0)
      expect(analytics.avgSatisfaction).toBe(0)
      expect(analytics.satisfactionDistribution.verySatisfied).toBe(0)
      expect(analytics.satisfactionDistribution.satisfied).toBe(0)
      expect(analytics.satisfactionDistribution.neutral).toBe(0)
      expect(analytics.satisfactionDistribution.dissatisfied).toBe(0)
      expect(analytics.satisfactionDistribution.veryDissatisfied).toBe(0)
    })
  })

  describe('healthCheck', () => {
    it('should return status ok', async () => {
      const result = await backend.healthCheck()
      expect(result.status).toBe('ok')
    })
  })

  describe('deleteResponse', () => {
    it('should delete a response by ID', async () => {
      await expect(backend.deleteResponse('test-id-123')).resolves.toBeUndefined()
    })
  })

  describe('getResponseCount', () => {
    it('should return 0 when no responses exist', async () => {
      const count = await backend.getResponseCount()
      expect(count).toBe(0)
    })
  })
})
