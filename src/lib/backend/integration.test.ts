/**
 * Integration Tests for BackendFactory
 * Ensures factory works with actual backend implementations
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BackendFactory } from './factory'

describe('BackendFactory Integration', () => {
  beforeEach(() => {
    BackendFactory.reset()
    delete process.env.BACKEND_TYPE
  })

  it('should instantiate google-sheets backend and have all interface methods', async () => {
    process.env.BACKEND_TYPE = 'google-sheets'
    const backend = BackendFactory.getInstance()

    // Verify all BackendStrategy interface methods exist
    expect(backend.submitResponse).toBeDefined()
    expect(backend.getAnalytics).toBeDefined()
    expect(backend.exportResponses).toBeDefined()
    expect(backend.deleteResponse).toBeDefined()
    expect(backend.getResponseCount).toBeDefined()
    expect(backend.healthCheck).toBeDefined()

    // Verify methods are callable and return Promises
    expect(backend.submitResponse({})).toBeInstanceOf(Promise)
    expect(backend.getAnalytics()).toBeInstanceOf(Promise)
    expect(backend.exportResponses('csv')).toBeInstanceOf(Promise)
    expect(backend.deleteResponse('id')).toBeInstanceOf(Promise)
    expect(backend.getResponseCount()).toBeInstanceOf(Promise)
    expect(backend.healthCheck()).toBeInstanceOf(Promise)
  })

  it('should instantiate supabase backend and have all interface methods', async () => {
    process.env.BACKEND_TYPE = 'supabase'
    const backend = BackendFactory.getInstance()

    // Verify all BackendStrategy interface methods exist
    expect(backend.submitResponse).toBeDefined()
    expect(backend.getAnalytics).toBeDefined()
    expect(backend.exportResponses).toBeDefined()
    expect(backend.deleteResponse).toBeDefined()
    expect(backend.getResponseCount).toBeDefined()
    expect(backend.healthCheck).toBeDefined()

    // Verify methods are callable and return Promises
    expect(backend.submitResponse({})).toBeInstanceOf(Promise)
    expect(backend.getAnalytics()).toBeInstanceOf(Promise)
    expect(backend.exportResponses('csv')).toBeInstanceOf(Promise)
    expect(backend.deleteResponse('id')).toBeInstanceOf(Promise)
    expect(backend.getResponseCount()).toBeInstanceOf(Promise)
    expect(backend.healthCheck()).toBeInstanceOf(Promise)
  })

  it('should show placeholder error when calling unimplemented google-sheets method', async () => {
    process.env.BACKEND_TYPE = 'google-sheets'
    const backend = BackendFactory.getInstance()

    try {
      await backend.submitResponse({})
      expect.fail('Should have thrown error')
    } catch (error) {
      expect((error as Error).message).toContain('Google Sheets backend not yet implemented')
    }
  })

  it('should show placeholder error when calling unimplemented supabase method', async () => {
    process.env.BACKEND_TYPE = 'supabase'
    const backend = BackendFactory.getInstance()

    try {
      await backend.submitResponse({})
      expect.fail('Should have thrown error')
    } catch (error) {
      expect((error as Error).message).toContain('Supabase backend not yet implemented')
    }
  })

  it('should handle missing BACKEND_TYPE gracefully', () => {
    delete process.env.BACKEND_TYPE

    expect(() => {
      BackendFactory.getInstance()
    }).toThrow()
  })
})
