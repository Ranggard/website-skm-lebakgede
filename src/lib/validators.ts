/**
 * Validation schemas using Zod
 * Provides server-side validation for all API endpoints
 */

import { z } from 'zod'
import { VALIDATION } from './constants'

/**
 * Schema for questionnaire response validation
 * Validates that all required SKM questions are answered with A, B, C, or D
 */
export const QuestionnaireResponseSchema = z.object({
  // Survey metadata
  survey_date: z.string().optional(),
  survey_time: z.string().optional(),

  // Profile Information
  gender: z.string().optional(),
  age: z.string().optional(),
  education: z.string().optional(),
  service_type: z.string().optional(),

  // SKM Questions (9 questions) - All mandatory
  Q1: z.enum(['A', 'B', 'C', 'D']).describe('Kesesuaian persyaratan'),
  Q2: z.enum(['A', 'B', 'C', 'D']).describe('Kemudahan prosedur'),
  Q3: z.enum(['A', 'B', 'C', 'D']).describe('Kecepatan layanan'),
  Q4: z.enum(['A', 'B', 'C', 'D']).describe('Kewajaran biaya'),
  Q5: z.enum(['A', 'B', 'C', 'D']).describe('Kesesuaian produk'),
  Q6: z.enum(['A', 'B', 'C', 'D']).describe('Kompetensi petugas'),
  Q7: z.enum(['A', 'B', 'C', 'D']).describe('Kesopanan dan keramahan'),
  Q8: z.enum(['A', 'B', 'C', 'D']).describe('Kualitas sarana prasarana'),
  Q9: z.enum(['A', 'B', 'C', 'D']).describe('Penanganan pengaduan'),

  // Optional feedback / suggestions
  saran: z.string().optional(),
  Q21: z.string().optional(),
})

export type QuestionnaireResponseInput = z.infer<typeof QuestionnaireResponseSchema>

/**
 * Schema for analytics query parameters
 */
export const AnalyticsQuerySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})

export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>

/**
 * Schema for export endpoint query parameters
 */
export const ExportQuerySchema = z.object({
  format: z.enum(['csv', 'excel']).default('csv'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})

export type ExportQueryInput = z.infer<typeof ExportQuerySchema>

/**
 * Validation helper functions
 */

export function validateQuestionnaireResponse(data: unknown) {
  try {
    return {
      success: true,
      data: QuestionnaireResponseSchema.parse(data),
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        details[path] = err.message
      })
      return {
        success: false,
        error: 'Validation failed',
        details,
      }
    }
    return {
      success: false,
      error: 'Unknown validation error',
    }
  }
}

export function validateAnalyticsQuery(data: unknown) {
  try {
    return {
      success: true,
      data: AnalyticsQuerySchema.parse(data),
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        details[path] = err.message
      })
      return {
        success: false,
        error: 'Invalid query parameters',
        details,
      }
    }
    return {
      success: false,
      error: 'Unknown validation error',
    }
  }
}

export function validateExportQuery(data: unknown) {
  try {
    return {
      success: true,
      data: ExportQuerySchema.parse(data),
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        details[path] = err.message
      })
      return {
        success: false,
        error: 'Invalid query parameters',
        details,
      }
    }
    return {
      success: false,
      error: 'Unknown validation error',
    }
  }
}
