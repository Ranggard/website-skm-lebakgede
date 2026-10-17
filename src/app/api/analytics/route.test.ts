/**
 * Tests for /api/analytics endpoint
 * Tests admin authentication and analytics data retrieval
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

// Mock the backend factory
vi.mock('@/src/lib/backend/factory', () => ({
  BackendFactory: {
    getInstance: vi.fn(),
  },
}))

describe('/api/analytics GET endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set admin token in environment
    process.env.ADMIN_TOKEN = 'test-admin-token'
  })

  const createRequest = (
    queryParams?: Record<string, string>,
    headers?: Record<string, string>
  ): NextRequest => {
    const url = new URL('http://localhost:3000/api/analytics')
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    return new NextRequest(url.toString(), {
      method: 'GET',
      headers: {
        ...headers,
      },
    })
  }

  it('should reject request without authentication', async () => {
    const request = createRequest()
    const response = await GET(request)
    
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should accept request with valid Bearer token', async () => {
    const request = createRequest(undefined, {
      Authorization: 'Bearer test-admin-token',
    })
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
  })

  it('should reject request with invalid Bearer token', async () => {
    const request = createRequest(undefined, {
      Authorization: 'Bearer invalid-token',
    })
    
    const response = await GET(request)
    
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should accept token as query parameter', async () => {
    const request = createRequest({
      token: 'test-admin-token',
    })
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
  })

  it('should reject invalid token in query parameter', async () => {
    const request = createRequest({
      token: 'invalid-token',
    })
    
    const response = await GET(request)
    
    expect(response.status).toBe(401)
  })

  it('should return 200 OK with valid authentication', async () => {
    const request = createRequest(undefined, {
      Authorization: 'Bearer test-admin-token',
    })
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
  })

  it('should return analytics data structure', async () => {
    const request = createRequest(undefined, {
      Authorization: 'Bearer test-admin-token',
    })
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('totalResponses')
    expect(data.data).toHaveProperty('avgSatisfaction')
    expect(data.data).toHaveProperty('satisfactionDistribution')
    expect(data.data).toHaveProperty('dimensionAverages')
  })

  it('should validate start_date format', async () => {
    const request = createRequest(
      {
        start_date: 'invalid-date',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Invalid')
  })

  it('should validate end_date format', async () => {
    const request = createRequest(
      {
        end_date: 'not-a-date',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect(response.status).toBe(400)
  })

  it('should accept valid ISO 8601 date format', async () => {
    const request = createRequest(
      {
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
  })

  it('should reject date range where start_date > end_date', async () => {
    const request = createRequest(
      {
        start_date: '2024-12-31T00:00:00Z',
        end_date: '2024-01-01T00:00:00Z',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.message).toContain('Invalid date range')
  })

  it('should accept only start_date without end_date', async () => {
    const request = createRequest(
      {
        start_date: '2024-01-01T00:00:00Z',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
  })

  it('should accept only end_date without start_date', async () => {
    const request = createRequest(
      {
        end_date: '2024-12-31T23:59:59Z',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
  })

  it('should include message in response', async () => {
    const request = createRequest(undefined, {
      Authorization: 'Bearer test-admin-token',
    })
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(data).toHaveProperty('message')
    expect(data.message).toBe('Analytics retrieved successfully')
  })

  it('should have all required analytics fields', async () => {
    const request = createRequest(undefined, {
      Authorization: 'Bearer test-admin-token',
    })
    
    const response = await GET(request)
    const data = await response.json()
    
    const analytics = data.data
    expect(analytics.satisfactionDistribution).toHaveProperty('verySatisfied')
    expect(analytics.satisfactionDistribution).toHaveProperty('satisfied')
    expect(analytics.satisfactionDistribution).toHaveProperty('neutral')
    expect(analytics.satisfactionDistribution).toHaveProperty('dissatisfied')
    expect(analytics.satisfactionDistribution).toHaveProperty('veryDissatisfied')
    
    expect(analytics.dimensionAverages).toHaveProperty('accessibility')
    expect(analytics.dimensionAverages).toHaveProperty('serviceQuality')
    expect(analytics.dimensionAverages).toHaveProperty('professionalism')
    expect(analytics.dimensionAverages).toHaveProperty('courtesy')
    expect(analytics.dimensionAverages).toHaveProperty('reliability')
    expect(analytics.dimensionAverages).toHaveProperty('security')
    expect(analytics.dimensionAverages).toHaveProperty('responseTime')
    expect(analytics.dimensionAverages).toHaveProperty('facilities')
  })
})
