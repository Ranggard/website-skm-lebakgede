/**
 * Type definitions and interfaces index
 * Exports all shared types used throughout the application
 */

// Backend abstraction layer types
export type {
  BackendStrategy,
  IBackend,  // Alias for BackendStrategy (used in design doc)
  SubmitResponse,
  HealthCheckResponse,
  BackendType,
  BackendConfig,
} from './backend'

export { BackendFactoryError } from './backend'

// Type aliases for backward compatibility and clarity
export type { SubmitResponse as SubmitFormResponse } from './backend'

// Questionnaire and response types
export type {
  QuestionResponse,
  QuestionnaireResponse,
  AnalyticsData,
  FormState,
  SubmitResponse,
  ApiError,
} from './questionnaire'

// Alias for type consistency with design document
export type { QuestionnaireResponse as SurveyResponse } from './questionnaire'
export type { AnalyticsData as DashboardMetrics } from './questionnaire'

// Re-export commonly used constants for types
export type { SKMCategory } from '../constants'
export { SKM_CATEGORIES } from '../constants'
