/**
 * Core types for SKM Questionnaire
 */

export interface QuestionnaireResponse {
  // Required: 8 SKM core questions (1-5 rating)
  q1_accessibility: number
  q2_service_quality: number
  q3_professionalism: number
  q4_courtesy: number
  q5_reliability: number
  q6_security: number
  q7_response_time: number
  q8_facilities: number

  // Optional: Additional fields
  q9_suggestions?: string
  demographic_age?: string
  demographic_service?: string

  // System fields (added by backend)
  id?: string
  timestamp?: Date
  user_agent?: string
  ip_hash?: string
}

export interface AnalyticsData {
  totalResponses: number
  avgSatisfaction: number

  satisfactionDistribution: {
    verySatisfied: number // rating 5
    satisfied: number // rating 4
    neutral: number // rating 3
    dissatisfied: number // rating 2
    veryDissatisfied: number // rating 1
  }

  dimensionAverages: {
    accessibility: number
    serviceQuality: number
    professionalism: number
    courtesy: number
    reliability: number
    security: number
    responseTime: number
    facilities: number
  }

  dailyTrend: Array<{
    date: Date
    count: number
  }>

  completionRate: number
}

export interface FormState {
  currentStep: number
  totalSteps: number
  responses: Partial<QuestionnaireResponse>
  isValid: boolean
  errors: Record<string, string>
  isSubmitting: boolean
}

export interface SubmitResponse {
  id: string
  message: string
  timestamp: Date
}

export interface ApiError {
  error: string
  message: string
  details?: Record<string, string>
  retryAfter?: number
}
