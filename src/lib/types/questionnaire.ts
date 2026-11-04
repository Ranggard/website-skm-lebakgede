/**
 * Core types for SKM Questionnaire
 * Implements Indonesian Standard SKM (Survei Kepuasan Masyarakat)
 * Ref: AC2 (Standard SKM structure), AC15 (SKM compliance)
 */

import type { SKMCategory } from '../constants'

/**
 * Individual question response (for a single SKM question)
 */
export interface QuestionResponse {
  questionId: string // e.g., 'Q1', 'Q2'
  category: SKMCategory
  rating: number // 1-5 Likert scale
  timestamp: Date
}

/**
 * Complete questionnaire response (all 20+ mandatory SKM questions + optional feedback)
 * Implements AC2 requirement: 15-25 questions with proper structure
 */
export interface QuestionnaireResponse {
  // Core SKM Questions (Q1-Q20) - All mandatory Likert scale ratings (1-5)
  Q1?: number // Accessibility - Access to facilities
  Q2?: number // Accessibility - Information availability
  Q3?: number // Accessibility - Service procedure clarity
  Q4?: number // Service Quality - Overall quality
  Q5?: number // Service Quality - Accuracy and precision
  Q6?: number // Service Quality - Consistency
  Q7?: number // Professionalism - Staff competence
  Q8?: number // Professionalism - Problem-solving ability
  Q9?: number // Courtesy - Courtesy and respect
  Q10?: number // Courtesy - Friendliness and hospitality
  Q11?: number // Reliability - Service consistency
  Q12?: number // Reliability - Promise fulfillment
  Q13?: number // Reliability - Freedom from errors
  Q14?: number // Security - Personal information protection
  Q15?: number // Security - Transaction confidentiality
  Q16?: number // Response Time - Speed of service
  Q17?: number // Response Time - Process efficiency
  Q18?: number // Response Time - Minimal waiting time
  Q19?: number // Facilities - Physical facilities adequacy
  Q20?: number // Facilities - Equipment functionality

  // Optional Question
  Q21?: string // Open-ended suggestions or comments

  // Demographic Information (Optional)
  demographic_age?: string
  demographic_gender?: string
  demographic_education?: string
  demographic_service?: string

  // System fields (added by backend)
  id?: string
  timestamp?: Date
  user_agent?: string
  ip_hash?: string
  completionPercentage?: number
}

/**
 * Analytics aggregation data based on SKM responses
 * Groups responses by dimension/category and calculates statistics
 */
export interface AnalyticsData {
  // Overall statistics
  totalResponses: number
  avgSatisfaction: number
  satisfactionRate: number // Percentage of satisfied+very satisfied

  // Satisfaction Distribution (5-point Likert scale)
  satisfactionDistribution: {
    verySatisfied: number // rating 5
    satisfied: number // rating 4
    neutral: number // rating 3
    dissatisfied: number // rating 2
    veryDissatisfied: number // rating 1
  }

  // SKM Dimension Averages (by the 8 main categories)
  dimensionAverages: {
    accessibility: number // Q1, Q2, Q3
    serviceQuality: number // Q4, Q5, Q6
    professionalism: number // Q7, Q8
    courtesy: number // Q9, Q10
    reliability: number // Q11, Q12, Q13
    security: number // Q14, Q15
    responseTime: number // Q16, Q17, Q18
    facilities: number // Q19, Q20
  }

  // Dimension Response Counts (for weighted calculations)
  dimensionResponseCounts?: Record<SKMCategory, number>

  // Time-based trends
  dailyTrend?: Array<{
    date: Date
    count: number
    avgSatisfaction: number
  }>

  // Completion metrics
  completionRate?: number // Percentage of respondents who completed all mandatory questions
  averageCompletionTime?: number // in seconds

  // Additional insights
  mostPositiveCategory?: SKMCategory
  mostNegativeCategory?: SKMCategory

  // Extended SKM Statistics & Real-time Database
  ikmKonversi?: number
  ikmSkala4?: number
  mutuPelayanan?: string
  kinerjaUnitPelayanan?: string
  elements?: Record<string, { name: string; score: number }>
  demographics?: {
    gender?: Record<string, number>
    age?: Record<string, number>
    education?: Record<string, number>
    serviceType?: Record<string, number>
  }
  responses?: any[]
  lastUpdated?: string
}

/**
 * Form state management for multi-step questionnaire
 */
export interface FormState {
  currentStep: number
  totalSteps: number
  responses: Partial<QuestionnaireResponse>
  isValid: boolean
  errors: Record<string, string>
  isSubmitting: boolean
  completedSteps: number[]
}

/**
 * API response after successful questionnaire submission
 */
export interface SubmitResponse {
  id: string
  message: string
  timestamp: Date
  referenceCode?: string
}

/**
 * Standard error response from API
 */
export interface ApiError {
  error: string
  message: string
  details?: Record<string, string>
  retryAfter?: number
  code?: string
}
