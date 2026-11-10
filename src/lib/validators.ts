/**
 * Validation schemas using Zod
 * Provides server-side validation for all API endpoints
 */

import { z } from 'zod'
import { VALIDATION } from './constants'

/**
 * Schema for questionnaire response validation
 * Validates that all required SKM questions are answered with numeric ratings 1-4
 */
export const QuestionnaireResponseSchema = z.object({
  // Demographics
  jenis_kelamin: z.string(),
  usia: z.string(),
  pendidikan: z.string(),
  jenis_layanan: z.string(),

  // SKM Questions (9 questions) - All mandatory, numeric 1-4 scale
  u1_persyaratan: z.number().min(1).max(4),
  u2_prosedur: z.number().min(1).max(4),
  u3_waktu: z.number().min(1).max(4),
  u4_biaya: z.number().min(1).max(4),
  u5_produk: z.number().min(1).max(4),
  u6_kompetensi: z.number().min(1).max(4),
  u7_keramahan: z.number().min(1).max(4),
  u8_sarana: z.number().min(1).max(4),
  u9_pengaduan: z.number().min(1).max(4),

  // Optional feedback / suggestions
  saran: z.string().optional(),
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
      ;((error as any).issues || (error as any).errors || []).forEach((err: any) => {
        const path = Array.isArray(err.path) ? err.path.join('.') : String(err.path || '')
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
      ;((error as any).issues || (error as any).errors || []).forEach((err: any) => {
        const path = Array.isArray(err.path) ? err.path.join('.') : String(err.path || '')
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
      ;((error as any).issues || (error as any).errors || []).forEach((err: any) => {
        const path = Array.isArray(err.path) ? err.path.join('.') : String(err.path || '')
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
