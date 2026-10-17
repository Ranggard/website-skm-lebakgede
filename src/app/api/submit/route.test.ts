/**
 * Tests for /api/submit endpoint
 * Tests form submission validation and backend integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock the backend factory
vi.mock('@/src/lib/backend/factory', () => ({
  BackendFactory: {
    getInstance: vi.fn(),
  },
}))

describe('/api/submit POST endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/submit', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  const validFormData = {
    Q1: 5,
    Q2: 4,
    Q3: 4,
    Q4: 5,
    Q5: 5,
    Q6: 4,
    Q7: 5,
    Q8: 4,
    Q9: 4,
    Q10: 5,
    Q11: 5,
    Q12: 4,
    Q13: 5,
    Q14: 4,
    Q15: 5,
    Q16: 5,
    Q17: 4,
    Q18: 4,
    Q19: 5,
    Q20: 4,
  }

  it('should accept valid form submission with all required fields', async () => {
    const request = createRequest(validFormData)
    const response = await POST(request)
    
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('id')
    expect(data.data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('message')
  })

  it('should reject request with missing required fields', async () => {
    const invalidData = {
      Q1: 5,
      Q2: 4,
      // Missing Q3-Q20
    }
    
    const request = createRequest(invalidData)
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
    expect(data).toHaveProperty('details')
  })

  it('should reject invalid satisfaction rating (below 1)', async () => {
    const invalidData = {
      ...validFormData,
      Q1: 0,
    }
    
    const request = createRequest(invalidData)
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
    expect(data.details).toHaveProperty('Q1')
  })

  it('should reject invalid satisfaction rating (above 5)', async () => {
    const invalidData = {
      ...validFormData,
      Q5: 6,
    }
    
    const request = createRequest(invalidData)
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
    expect(data.details).toHaveProperty('Q5')
  })

  it('should accept valid form with optional Q21 text', async () => {
    const dataWithOptional = {
      ...validFormData,
      Q21: 'Great service!',
    }
    
    const request = createRequest(dataWithOptional)
    const response = await POST(request)
    
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.data).toHaveProperty('id')
  })

  it('should reject Q21 exceeding max length', async () => {
    const dataWithLongText = {
      ...validFormData,
      Q21: 'x'.repeat(501),
    }
    
    const request = createRequest(dataWithLongText)
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('should accept valid demographic data', async () => {
    const dataWithDemographics = {
      ...validFormData,
      demographic_age: '25-34',
      demographic_service: 'Health',
      demographic_gender: 'Male',
    }
    
    const request = createRequest(dataWithDemographics)
    const response = await POST(request)
    
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.data).toHaveProperty('id')
  })

  it('should reject non-integer ratings', async () => {
    const invalidData = {
      ...validFormData,
      Q1: 3.5,
    }
    
    const request = createRequest(invalidData)
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('should reject invalid JSON body', async () => {
    const request = new NextRequest('http://localhost:3000/api/submit', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid request body')
  })

  it('should return 201 status for successful submission', async () => {
    const request = createRequest(validFormData)
    const response = await POST(request)
    
    expect(response.status).toBe(201)
  })

  it('should generate unique response IDs for multiple submissions', async () => {
    const request1 = createRequest(validFormData)
    const response1 = await POST(request1)
    const data1 = await response1.json()
    
    const request2 = createRequest(validFormData)
    const response2 = await POST(request2)
    const data2 = await response2.json()
    
    expect(data1.data.id).not.toBe(data2.data.id)
  })

  it('should include timestamp in response', async () => {
    const request = createRequest(validFormData)
    const response = await POST(request)
    
    const data = await response.json()
    expect(data.data.timestamp).toBeDefined()
    // Check if it's a valid ISO date string
    expect(new Date(data.data.timestamp)).not.toBeNaN()
  })
})
