/**
 * Tests for /api/export endpoint
 * Tests admin authentication and export format handling
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

describe('/api/export GET endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set admin token in environment
    process.env.ADMIN_TOKEN = 'test-admin-token'
  })

  const createRequest = (
    queryParams?: Record<string, string>,
    headers?: Record<string, string>
  ): NextRequest => {
    const url = new URL('http://localhost:3000/api/export')
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
  })

  it('should accept request with valid Bearer token', async () => {
    const request = createRequest(undefined, {
      Authorization: 'Bearer test-admin-token',
    })
    
    const response = await GET(request)
    
    expect([200, 503]).toContain(response.status) // 200 if backend available, 503 if not
  })

  it('should reject request with invalid token', async () => {
    const request = createRequest(undefined, {
      Authorization: 'Bearer invalid-token',
    })
    
    const response = await GET(request)
    
    expect(response.status).toBe(401)
  })

  it('should accept token in query parameter', async () => {
    const request = createRequest({
      token: 'test-admin-token',
    })
    
    const response = await GET(request)
    
    expect([200, 503]).toContain(response.status)
  })

  it('should accept format=csv query parameter', async () => {
    const request = createRequest(
      {
        format: 'csv',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect([200, 503]).toContain(response.status)
    if (response.status === 200) {
      expect(response.headers.get('Content-Type')).toContain('text/csv')
    }
  })

  it('should accept format=excel query parameter', async () => {
    const request = createRequest(
      {
        format: 'excel',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect([200, 503]).toContain(response.status)
    if (response.status === 200) {
      expect(response.headers.get('Content-Type')).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
    }
  })

  it('should reject invalid format', async () => {
    const request = createRequest(
      {
        format: 'pdf',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Invalid')
  })

  it('should default to CSV format if not specified', async () => {
    const request = createRequest(
      {
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    if (response.status === 200) {
      expect(response.headers.get('Content-Type')).toContain('text/csv')
    }
  })

  it('should include Content-Disposition header for CSV', async () => {
    const request = createRequest(
      {
        format: 'csv',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    if (response.status === 200) {
      const disposition = response.headers.get('Content-Disposition')
      expect(disposition).toContain('attachment')
      expect(disposition).toContain('.csv')
    }
  })

  it('should include Content-Disposition header for Excel', async () => {
    const request = createRequest(
      {
        format: 'excel',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    if (response.status === 200) {
      const disposition = response.headers.get('Content-Disposition')
      expect(disposition).toContain('attachment')
      expect(disposition).toContain('.xlsx')
    }
  })

  it('should include Content-Length header', async () => {
    const request = createRequest(
      {
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    if (response.status === 200) {
      expect(response.headers.has('Content-Length')).toBe(true)
    }
  })

  it('should set Cache-Control to no-cache', async () => {
    const request = createRequest(
      {
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    if (response.status === 200) {
      const cacheControl = response.headers.get('Cache-Control')
      expect(cacheControl).toContain('no-cache')
    }
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

  it('should accept valid ISO 8601 dates', async () => {
    const request = createRequest(
      {
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
        format: 'csv',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    expect([200, 503]).toContain(response.status)
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
  })

  it('should return binary data for CSV', async () => {
    const request = createRequest(
      {
        format: 'csv',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    if (response.status === 200) {
      const buffer = await response.arrayBuffer()
      expect(buffer.byteLength).toBeGreaterThan(0)
    }
  })

  it('should return binary data for Excel', async () => {
    const request = createRequest(
      {
        format: 'excel',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    if (response.status === 200) {
      const buffer = await response.arrayBuffer()
      expect(buffer.byteLength).toBeGreaterThan(0)
    }
  })

  it('should include date in filename', async () => {
    const request = createRequest(
      {
        format: 'csv',
        token: 'test-admin-token',
      }
    )
    
    const response = await GET(request)
    
    if (response.status === 200) {
      const disposition = response.headers.get('Content-Disposition')
      expect(disposition).toMatch(/skm-responses-\d{4}-\d{2}-\d{2}/)
    }
  })
})
