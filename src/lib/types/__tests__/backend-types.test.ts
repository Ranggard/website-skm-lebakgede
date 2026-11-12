/**
 * Type definition tests for backend abstraction layer
 * Validates that IBackend interface and related types are properly defined
 * 
 * Validates AC9 and AC10 requirements for backend preparation
 */

import { describe, it, expect } from 'vitest'
import type { IBackend, BackendStrategy, BackendType, BackendConfig, SubmitResponse as SubmitFormResponse, HealthCheckResponse } from '../backend'
import type { QuestionnaireResponse, AnalyticsData } from '../questionnaire'

describe('Backend Types - IBackend Interface', () => {
  it('should have all required methods defined', () => {
    // This is a compile-time check - if types are wrong, TypeScript will fail
    const backendMethods: (keyof IBackend)[] = [
      'submitResponse',
      'getAnalytics',
      'exportResponses',
      'deleteResponse',
      'getResponseCount',
      'healthCheck',
    ]

    expect(backendMethods).toHaveLength(6)
  })

  it('should support supabase backend type', () => {
    const supabase: BackendType = 'supabase'

    expect(supabase).toBe('supabase')
  })

  it('should have BackendConfig with type and optional properties', () => {
    const config: BackendConfig = {
      type: 'supabase',
      url: 'https://example.supabase.co',
      apiKey: 'test-key',
    }

    expect(config.type).toBe('supabase')
    expect(config.url).toBeDefined()
  })

  it('should have SubmitFormResponse with required fields', () => {
    const response: SubmitFormResponse = {
      responseId: 'uuid-123',
      timestamp: new Date(),
      message: 'Success',
    }

    expect(response.responseId).toBeDefined()
    expect(response.timestamp).toBeInstanceOf(Date)
    expect(response.message).toBeDefined()
  })

  it('should have HealthCheckResponse with status and backend info', () => {
    const healthCheck: HealthCheckResponse = {
      status: 'ok',
      backend: 'supabase',
      timestamp: new Date(),
    }

    expect(['ok', 'error']).toContain(healthCheck.status)
    expect(['supabase']).toContain(healthCheck.backend)
  })
})

describe('QuestionnaireResponse Type', () => {
  it('should support all 20 core SKM questions (Q1-Q20)', () => {
    const response: QuestionnaireResponse = {
      Q1: 5,
      Q2: 4,
      Q3: 3,
      Q4: 4,
      Q5: 5,
      Q6: 4,
      Q7: 3,
      Q8: 4,
      Q9: 5,
      Q10: 4,
      Q11: 3,
      Q12: 4,
      Q13: 5,
      Q14: 4,
      Q15: 3,
      Q16: 4,
      Q17: 5,
      Q18: 4,
      Q19: 3,
      Q20: 4,
    }

    // Validate questions 1-20 are present
    for (let i = 1; i <= 20; i++) {
      const question = `Q${i}` as keyof QuestionnaireResponse
      const value = response[question]
      if (typeof value === 'number') {
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(5)
      }
    }
  })

  it('should support optional Q21 open-ended question', () => {
    const response: QuestionnaireResponse = {
      Q1: 5,
      Q20: 4,
      Q21: 'Great service!',
    }

    expect(response.Q21).toBe('Great service!')
  })

  it('should support optional demographic fields', () => {
    const response: QuestionnaireResponse = {
      Q1: 5,
      Q20: 4,
      demographic_age: '25-34',
      demographic_gender: 'Male',
      demographic_education: 'Bachelor',
      demographic_service: 'Health',
    }

    expect(response.demographic_age).toBeDefined()
    expect(response.demographic_gender).toBeDefined()
    expect(response.demographic_education).toBeDefined()
    expect(response.demographic_service).toBeDefined()
  })

  it('should support system fields (id, timestamp, etc.)', () => {
    const response: QuestionnaireResponse = {
      Q1: 5,
      Q20: 4,
      id: 'response-uuid',
      timestamp: new Date(),
      user_agent: 'Mozilla/5.0...',
      ip_hash: 'hash123',
      completionPercentage: 100,
    }

    expect(response.id).toBeDefined()
    expect(response.timestamp).toBeInstanceOf(Date)
    expect(response.user_agent).toBeDefined()
    expect(response.ip_hash).toBeDefined()
    expect(response.completionPercentage).toBe(100)
  })
})

describe('AnalyticsData Type', () => {
  it('should have all required analytics fields', () => {
    const analytics: AnalyticsData = {
      totalResponses: 100,
      avgSatisfaction: 4.2,
      satisfactionRate: 85,
      satisfactionDistribution: {
        verySatisfied: 50,
        satisfied: 30,
        neutral: 15,
        dissatisfied: 4,
        veryDissatisfied: 1,
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
      dimensionResponseCounts: {
        accessibility: 100,
        quality: 100,
        professionalism: 100,
        courtesy: 100,
        reliability: 100,
        security: 100,
        response_time: 100,
        facilities: 100,
      },
      dailyTrend: [
        {
          date: new Date('2024-01-01'),
          count: 10,
          avgSatisfaction: 4.2,
        },
      ],
      completionRate: 95,
      averageCompletionTime: 300,
      mostPositiveCategory: 'courtesy',
      mostNegativeCategory: 'security',
    }

    expect(analytics.totalResponses).toBe(100)
    expect(analytics.avgSatisfaction).toBeGreaterThan(0)
    expect(analytics.satisfactionDistribution.verySatisfied).toBe(50)
    expect(analytics.dimensionAverages.accessibility).toBeDefined()
    expect(analytics.dailyTrend).toHaveLength(1)
  })

  it('should support per-dimension satisfaction averages', () => {
    const analytics: AnalyticsData = {
      totalResponses: 100,
      avgSatisfaction: 4.2,
      satisfactionRate: 85,
      satisfactionDistribution: {
        verySatisfied: 50,
        satisfied: 30,
        neutral: 15,
        dissatisfied: 4,
        veryDissatisfied: 1,
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
      dimensionResponseCounts: {
        accessibility: 100,
        quality: 100,
        professionalism: 100,
        courtesy: 100,
        reliability: 100,
        security: 100,
        response_time: 100,
        facilities: 100,
      },
      dailyTrend: [],
      completionRate: 95,
      averageCompletionTime: 300,
    }

    const dimensions = Object.keys(analytics.dimensionAverages)
    expect(dimensions).toContain('accessibility')
    expect(dimensions).toContain('serviceQuality')
    expect(dimensions).toContain('professionalism')
    expect(dimensions).toContain('courtesy')
    expect(dimensions).toContain('reliability')
    expect(dimensions).toContain('security')
    expect(dimensions).toContain('responseTime')
    expect(dimensions).toContain('facilities')
  })
})
