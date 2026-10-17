/**
 * Supabase Type Definitions
 * 
 * Provides type-safe interfaces for Supabase database tables and operations.
 * Auto-generated types can be generated via Supabase CLI:
 * 
 *   supabase gen types typescript --project-id xxxxx > src/lib/types/supabase.ts
 */

/**
 * Survey Response Row
 * Represents a single questionnaire response with all SKM questions and metadata
 */
export interface SurveyResponse {
  // Primary key
  id: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // ===== Core SKM Questions (1-5 Likert) =====
  q1_accessibility: number;
  q2_service_quality: number;
  q3_professionalism: number;
  q4_courtesy: number;
  q5_reliability: number;
  q6_security: number;
  q7_response_time: number;
  q8_facilities: number;

  // ===== Optional Fields =====
  q9_suggestions: string | null;
  demographic_age: string | null;
  demographic_service: string | null;

  // ===== Metadata =====
  user_agent: string | null;
  ip_hash: string | null;
}

/**
 * Analytics Cache Row
 * Pre-calculated aggregated metrics for performance
 */
export interface AnalyticsCache {
  id: string;
  metric_date: string;

  // Overall metrics
  total_responses: number;
  avg_satisfaction: number;

  // Satisfaction distribution (counts)
  satisfaction_very_satisfied: number;
  satisfaction_satisfied: number;
  satisfaction_neutral: number;
  satisfaction_dissatisfied: number;
  satisfaction_very_dissatisfied: number;

  // Per-dimension averages
  dimension_accessibility_avg: number;
  dimension_quality_avg: number;
  dimension_professionalism_avg: number;
  dimension_courtesy_avg: number;
  dimension_reliability_avg: number;
  dimension_security_avg: number;
  dimension_response_time_avg: number;
  dimension_facilities_avg: number;

  // Daily metrics
  daily_submissions: number;

  // Update tracking
  updated_at: string;
}

/**
 * Audit Log Row
 * Tracks administrative actions for security and compliance
 */
export interface AuditLog {
  id: string;

  // User reference
  admin_id: string | null;
  admin_email: string | null;

  // Action details
  action: string;
  resource: string | null;
  status: 'success' | 'failed';

  // Request details
  ip_address: string | null;
  user_agent: string | null;
  request_path: string | null;
  request_params: Record<string, any> | null;

  // Response details
  response_status_code: number | null;
  error_message: string | null;

  // Timestamps
  created_at: string;

  // Additional metadata
  details: Record<string, any> | null;
}

/**
 * Survey Analytics View Result
 * Pre-calculated analytics from v_survey_analytics view
 */
export interface SurveyAnalytics {
  total_responses: number;
  avg_satisfaction: number;
  very_satisfied_count: number;
  satisfied_count: number;
  neutral_count: number;
  dissatisfied_count: number;
  very_dissatisfied_count: number;
  accessibility_avg: number;
  service_quality_avg: number;
  professionalism_avg: number;
  courtesy_avg: number;
  reliability_avg: number;
  security_avg: number;
  response_time_avg: number;
  facilities_avg: number;
}

/**
 * Insert Payload for Survey Responses
 * Used when creating new responses (omits generated fields)
 */
export interface SurveyResponseInsert {
  // Required: Core SKM questions
  q1_accessibility: number;
  q2_service_quality: number;
  q3_professionalism: number;
  q4_courtesy: number;
  q5_reliability: number;
  q6_security: number;
  q7_response_time: number;
  q8_facilities: number;

  // Optional: Additional questions
  q9_suggestions?: string | null;
  demographic_age?: string | null;
  demographic_service?: string | null;

  // Optional: Metadata
  user_agent?: string | null;
  ip_hash?: string | null;
}

/**
 * Update Payload for Survey Responses
 * Typically responses are immutable, but this is available if needed
 */
export interface SurveyResponseUpdate {
  q1_accessibility?: number;
  q2_service_quality?: number;
  q3_professionalism?: number;
  q4_courtesy?: number;
  q5_reliability?: number;
  q6_security?: number;
  q7_response_time?: number;
  q8_facilities?: number;
  q9_suggestions?: string | null;
  demographic_age?: string | null;
  demographic_service?: string | null;
  user_agent?: string | null;
  ip_hash?: string | null;
}

/**
 * Query Filters
 * Used for filtering analytics and responses
 */
export interface DateRangeFilter {
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface SurveyResponseFilter extends DateRangeFilter {
  demographicAge?: string;
  demographicService?: string;
  minSatisfaction?: number;
  maxSatisfaction?: number;
}

/**
 * Pagination
 * For list queries with pagination support
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

/**
 * Database Response
 * Standard response format from Supabase queries
 */
export interface SupabaseResponse<T> {
  data: T;
  error: SupabaseError | null;
}

export interface SupabaseListResponse<T> {
  data: T[];
  error: SupabaseError | null;
  count?: number;
}

/**
 * Supabase Error
 * Standard error format from Supabase
 */
export interface SupabaseError {
  message: string;
  code: string;
  hint?: string;
  details?: string;
}

/**
 * Auth User (when using Supabase Auth)
 */
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
  app_metadata?: {
    provider?: string;
    roles?: string[];
  };
  created_at: string;
  updated_at: string;
}

/**
 * Session
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'bearer';
  user: AuthUser;
}

/**
 * Overall Satisfaction Score Calculation Helper
 */
export function calculateOverallSatisfaction(response: SurveyResponse | SurveyResponseInsert): number {
  const questions = [
    response.q1_accessibility,
    response.q2_service_quality,
    response.q3_professionalism,
    response.q4_courtesy,
    response.q5_reliability,
    response.q6_security,
    response.q7_response_time,
    response.q8_facilities,
  ];

  const sum = questions.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / questions.length) * 100) / 100;
}

/**
 * Satisfaction Level Categories
 */
export enum SatisfactionLevel {
  VerySatisfied = 'very_satisfied',      // 4.5-5.0
  Satisfied = 'satisfied',                // 3.5-4.49
  Neutral = 'neutral',                    // 2.5-3.49
  Dissatisfied = 'dissatisfied',          // 1.5-2.49
  VeryDissatisfied = 'very_dissatisfied', // 1.0-1.49
}

/**
 * Get satisfaction level from score
 */
export function getSatisfactionLevel(score: number): SatisfactionLevel {
  if (score >= 4.5) return SatisfactionLevel.VerySatisfied;
  if (score >= 3.5) return SatisfactionLevel.Satisfied;
  if (score >= 2.5) return SatisfactionLevel.Neutral;
  if (score >= 1.5) return SatisfactionLevel.Dissatisfied;
  return SatisfactionLevel.VeryDissatisfied;
}

/**
 * SKM Question Keys
 */
export const SKM_QUESTIONS = [
  'q1_accessibility',
  'q2_service_quality',
  'q3_professionalism',
  'q4_courtesy',
  'q5_reliability',
  'q6_security',
  'q7_response_time',
  'q8_facilities',
] as const;

export type SKMQuestion = typeof SKM_QUESTIONS[number];

/**
 * SKM Question Descriptions
 */
export const SKM_QUESTION_DESCRIPTIONS: Record<SKMQuestion, string> = {
  q1_accessibility: 'Service accessibility and availability',
  q2_service_quality: 'Quality of service',
  q3_professionalism: 'Professional conduct',
  q4_courtesy: 'Staff courtesy and respect',
  q5_reliability: 'Service reliability',
  q6_security: 'Data security and privacy',
  q7_response_time: 'Response time and efficiency',
  q8_facilities: 'Facilities and infrastructure',
};

/**
 * Audit Log Actions
 */
export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  EXPORT_CSV = 'EXPORT_CSV',
  EXPORT_EXCEL = 'EXPORT_EXCEL',
  EXPORT_PDF = 'EXPORT_PDF',
  VIEW_RESPONSE = 'VIEW_RESPONSE',
  DELETE_RESPONSE = 'DELETE_RESPONSE',
  REFRESH_CACHE = 'REFRESH_CACHE',
}
