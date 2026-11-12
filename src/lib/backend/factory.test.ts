/**
 * BackendFactory Tests
 * Tests environment-based backend selection, singleton pattern, and validation
 * 
 * NOW SUPABASE-ONLY: All google-sheets tests removed
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { BackendFactory } from './factory'
import { BackendType } from '../types/backend'

describe('BackendFactory', () => {
  // Clean up and reset environment state before each test
  beforeEach(() => {
    BackendFactory.reset()
    // Clear environment variables
    delete process.env.BACKEND_TYPE
    delete process.env.GOOGLE_APPS_SCRIPT_URL
    delete process.env.GOOGLE_SHEET_ID
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_ANON_KEY
    // Set minimum required env for tests
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
  })

  afterEach(() => {
    BackendFactory.reset()
  })

  describe('getInstance()', () => {
    it('should throw error when BACKEND_TYPE is not set', () => {
      delete process.env.BACKEND_TYPE

      expect(() => {
        BackendFactory.getInstance()
      }).toThrow('BACKEND_TYPE environment variable is not set')
    })

    it('should throw error when BACKEND_TYPE is invalid', () => {
      process.env.BACKEND_TYPE = 'invalid-backend'

      expect(() => {
        BackendFactory.getInstance()
      }).toThrow('Invalid BACKEND_TYPE: "invalid-backend"')
    })

    it('should return supabase backend when BACKEND_TYPE=supabase', () => {
      process.env.BACKEND_TYPE = 'supabase'

      const instance = BackendFactory.getInstance()

      expect(instance).toBeDefined()
      expect(BackendFactory.getActiveBackendType()).toBe('supabase')
    })

    it('should return same instance on multiple calls (singleton pattern)', () => {
      process.env.BACKEND_TYPE = 'supabase'

      const instance1 = BackendFactory.getInstance()
      const instance2 = BackendFactory.getInstance()

      expect(instance1).toBe(instance2)
    })

    it('should track active backend type after instantiation', () => {
      expect(BackendFactory.getActiveBackendType()).toBeNull()

      process.env.BACKEND_TYPE = 'supabase'
      BackendFactory.getInstance()

      expect(BackendFactory.getActiveBackendType()).toBe('supabase')
    })
  })

  describe('create()', () => {
    it('should create supabase backend instance', () => {
      const instance = BackendFactory.create('supabase')

      expect(instance).toBeDefined()
      expect(instance).toHaveProperty('submitResponse')
      expect(instance).toHaveProperty('getAnalytics')
      expect(instance).toHaveProperty('exportResponses')
      expect(instance).toHaveProperty('deleteResponse')
      expect(instance).toHaveProperty('getResponseCount')
      expect(instance).toHaveProperty('healthCheck')
    })

    it('should throw error for unknown backend type', () => {
      expect(() => {
        BackendFactory.create('unknown-backend' as BackendType)
      }).toThrow('Unknown backend provider')
    })

    it('should create different instances on successive create() calls', () => {
      const instance1 = BackendFactory.create('supabase')
      const instance2 = BackendFactory.create('supabase')

      expect(instance1).not.toBe(instance2)
    })
  })

  describe('reset()', () => {
    it('should clear singleton instance', () => {
      process.env.BACKEND_TYPE = 'supabase'
      const instance1 = BackendFactory.getInstance()

      BackendFactory.reset()

      process.env.BACKEND_TYPE = 'supabase'
      const instance2 = BackendFactory.getInstance()

      expect(instance1).not.toBe(instance2)
    })

    it('should reset active backend type', () => {
      process.env.BACKEND_TYPE = 'supabase'
      BackendFactory.getInstance()

      expect(BackendFactory.getActiveBackendType()).toBe('supabase')

      BackendFactory.reset()

      expect(BackendFactory.getActiveBackendType()).toBeNull()
    })

    it('should allow backend instantiation after reset()', () => {
      process.env.BACKEND_TYPE = 'supabase'
      const instance1 = BackendFactory.getInstance()

      BackendFactory.reset()

      process.env.BACKEND_TYPE = 'supabase'
      const instance2 = BackendFactory.getInstance()

      expect(BackendFactory.getActiveBackendType()).toBe('supabase')
      expect(instance2).toBeDefined()
      expect(instance1).not.toBe(instance2)
    })
  })

  describe('Backend instances implement BackendStrategy interface', () => {
    it('supabase backend should have all required methods', async () => {
      process.env.BACKEND_TYPE = 'supabase'
      const instance = BackendFactory.getInstance()

      // Verify all required methods exist and are callable
      expect(typeof instance.submitResponse).toBe('function')
      expect(typeof instance.getAnalytics).toBe('function')
      expect(typeof instance.exportResponses).toBe('function')
      expect(typeof instance.deleteResponse).toBe('function')
      expect(typeof instance.getResponseCount).toBe('function')
      expect(typeof instance.healthCheck).toBe('function')

      // Verify they are async functions (return promises)
      expect(instance.submitResponse('test')).toBeInstanceOf(Promise)
      expect(instance.getAnalytics()).toBeInstanceOf(Promise)
      expect(instance.exportResponses('csv')).toBeInstanceOf(Promise)
      expect(instance.deleteResponse('123')).toBeInstanceOf(Promise)
      expect(instance.getResponseCount()).toBeInstanceOf(Promise)
      expect(instance.healthCheck()).toBeInstanceOf(Promise)
    })
  })

  describe('Environment validation', () => {
    it('should accept supabase as valid BACKEND_TYPE', () => {
      process.env.BACKEND_TYPE = 'supabase'
      expect(() => BackendFactory.getInstance()).not.toThrow()
    })

    it('should reject null BACKEND_TYPE', () => {
      process.env.BACKEND_TYPE = ''
      expect(() => BackendFactory.getInstance()).toThrow()
    })

    it('should reject whitespace-only BACKEND_TYPE', () => {
      process.env.BACKEND_TYPE = '   '
      expect(() => BackendFactory.getInstance()).toThrow()
    })

    it('should be case-sensitive for BACKEND_TYPE', () => {
      process.env.BACKEND_TYPE = 'Supabase' // Wrong case
      expect(() => BackendFactory.getInstance()).toThrow()
    })
  })

  describe('Runtime singleton constraints', () => {
    it('should return correct backend type for supabase', () => {
      process.env.BACKEND_TYPE = 'supabase'
      BackendFactory.getInstance()

      expect(BackendFactory.getActiveBackendType()).toBe('supabase')
    })

    it('should enforce singleton after reset', () => {
      process.env.BACKEND_TYPE = 'supabase'
      const instance1 = BackendFactory.getInstance()

      BackendFactory.reset()

      process.env.BACKEND_TYPE = 'supabase'
      const instance2 = BackendFactory.getInstance()

      // Verify different instances
      expect(instance1).not.toBe(instance2)
      expect(BackendFactory.getActiveBackendType()).toBe('supabase')
    })
  })

  describe('Error messages', () => {
    it('should provide helpful error message for missing BACKEND_TYPE', () => {
      delete process.env.BACKEND_TYPE

      try {
        BackendFactory.getInstance()
        expect.fail('Should have thrown error')
      } catch (error) {
        expect((error as Error).message).toContain('BACKEND_TYPE')
        expect((error as Error).message).toContain('supabase')
      }
    })

    it('should provide helpful error message for invalid BACKEND_TYPE', () => {
      process.env.BACKEND_TYPE = 'mongodb'

      try {
        BackendFactory.getInstance()
        expect.fail('Should have thrown error')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid BACKEND_TYPE')
        expect((error as Error).message).toContain('mongodb')
        expect((error as Error).message).toContain('supabase')
      }
    })
  })
})
