/**
 * Application constants and configuration
 */

export const SKM_QUESTIONS = {
  q1_accessibility: 'Accessibility of service facilities',
  q2_service_quality: 'Quality of service provided',
  q3_professionalism: 'Professionalism of staff',
  q4_courtesy: 'Courtesy and respect from staff',
  q5_reliability: 'Reliability of service delivery',
  q6_security: 'Security and confidentiality',
  q7_response_time: 'Speed of service delivery',
  q8_facilities: 'Adequacy of facilities and infrastructure',
  q9_suggestions: 'Additional suggestions or comments',
} as const

export const SATISFACTION_LEVELS = {
  5: 'Very Satisfied',
  4: 'Satisfied',
  3: 'Neutral',
  2: 'Dissatisfied',
  1: 'Very Dissatisfied',
} as const

export const SATISFACTION_COLORS = {
  5: '#10B981', // Green
  4: '#84CC16', // Lime
  3: '#F59E0B', // Amber
  2: '#F97316', // Orange
  1: '#EF4444', // Red
} as const

export const DEMOGRAPHIC_OPTIONS = {
  age: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
  serviceTypes: [
    'Health',
    'Education',
    'Transportation',
    'Administration',
    'Social Services',
    'Other',
  ],
} as const

export const API_ENDPOINTS = {
  submit: '/api/submit',
  analytics: '/api/analytics',
  export: '/api/export',
  healthCheck: '/api/health',
} as const

export const BACKEND_TYPES = {
  GOOGLE_SHEETS: 'google-sheets',
  SUPABASE: 'supabase',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

export const CACHE_TTL = {
  ANALYTICS: 5 * 60 * 1000, // 5 minutes in milliseconds
  RESPONSES: 1 * 60 * 1000, // 1 minute
} as const

export const VALIDATION = {
  MIN_SATISFACTION_RATING: 1,
  MAX_SATISFACTION_RATING: 5,
  MAX_TEXT_LENGTH: 500,
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 100,
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const
