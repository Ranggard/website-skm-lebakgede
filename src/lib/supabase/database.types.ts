/**
 * Supabase Auto-Generated Database Types
 * 
 * These types are auto-generated from your Supabase database schema.
 * To regenerate these types, run:
 * 
 *   supabase gen types typescript --project-id xxxxx > src/lib/supabase/database.types.ts
 * 
 * For now, these are manually typed based on the schema in 001_initial_schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      survey_responses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          q1_accessibility: number
          q2_service_quality: number
          q3_professionalism: number
          q4_courtesy: number
          q5_reliability: number
          q6_security: number
          q7_response_time: number
          q8_facilities: number
          q9_suggestions: string | null
          demographic_age: string | null
          demographic_service: string | null
          user_agent: string | null
          ip_hash: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          q1_accessibility: number
          q2_service_quality: number
          q3_professionalism: number
          q4_courtesy: number
          q5_reliability: number
          q6_security: number
          q7_response_time: number
          q8_facilities: number
          q9_suggestions?: string | null
          demographic_age?: string | null
          demographic_service?: string | null
          user_agent?: string | null
          ip_hash?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          q1_accessibility?: number
          q2_service_quality?: number
          q3_professionalism?: number
          q4_courtesy?: number
          q5_reliability?: number
          q6_security?: number
          q7_response_time?: number
          q8_facilities?: number
          q9_suggestions?: string | null
          demographic_age?: string | null
          demographic_service?: string | null
          user_agent?: string | null
          ip_hash?: string | null
        }
        Relationships: []
      }
      analytics_cache: {
        Row: {
          id: string
          metric_date: string
          total_responses: number
          avg_satisfaction: number | null
          satisfaction_very_satisfied: number
          satisfaction_satisfied: number
          satisfaction_neutral: number
          satisfaction_dissatisfied: number
          satisfaction_very_dissatisfied: number
          dimension_accessibility_avg: number | null
          dimension_quality_avg: number | null
          dimension_professionalism_avg: number | null
          dimension_courtesy_avg: number | null
          dimension_reliability_avg: number | null
          dimension_security_avg: number | null
          dimension_response_time_avg: number | null
          dimension_facilities_avg: number | null
          daily_submissions: number
          updated_at: string
        }
        Insert: {
          id?: string
          metric_date: string
          total_responses?: number
          avg_satisfaction?: number | null
          satisfaction_very_satisfied?: number
          satisfaction_satisfied?: number
          satisfaction_neutral?: number
          satisfaction_dissatisfied?: number
          satisfaction_very_dissatisfied?: number
          dimension_accessibility_avg?: number | null
          dimension_quality_avg?: number | null
          dimension_professionalism_avg?: number | null
          dimension_courtesy_avg?: number | null
          dimension_reliability_avg?: number | null
          dimension_security_avg?: number | null
          dimension_response_time_avg?: number | null
          dimension_facilities_avg?: number | null
          daily_submissions?: number
          updated_at?: string
        }
        Update: {
          id?: string
          metric_date?: string
          total_responses?: number
          avg_satisfaction?: number | null
          satisfaction_very_satisfied?: number
          satisfaction_satisfied?: number
          satisfaction_neutral?: number
          satisfaction_dissatisfied?: number
          satisfaction_very_dissatisfied?: number
          dimension_accessibility_avg?: number | null
          dimension_quality_avg?: number | null
          dimension_professionalism_avg?: number | null
          dimension_courtesy_avg?: number | null
          dimension_reliability_avg?: number | null
          dimension_security_avg?: number | null
          dimension_response_time_avg?: number | null
          dimension_facilities_avg?: number | null
          daily_submissions?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          admin_id: string | null
          admin_email: string | null
          action: string
          resource: string | null
          status: string
          ip_address: string | null
          user_agent: string | null
          request_path: string | null
          request_params: Json | null
          response_status_code: number | null
          error_message: string | null
          created_at: string
          details: Json | null
        }
        Insert: {
          id?: string
          admin_id?: string | null
          admin_email?: string | null
          action: string
          resource?: string | null
          status?: string
          ip_address?: string | null
          user_agent?: string | null
          request_path?: string | null
          request_params?: Json | null
          response_status_code?: number | null
          error_message?: string | null
          created_at?: string
          details?: Json | null
        }
        Update: {
          id?: string
          admin_id?: string | null
          admin_email?: string | null
          action?: string
          resource?: string | null
          status?: string
          ip_address?: string | null
          user_agent?: string | null
          request_path?: string | null
          request_params?: Json | null
          response_status_code?: number | null
          error_message?: string | null
          created_at?: string
          details?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      v_survey_analytics: {
        Row: {
          total_responses: number | null
          avg_satisfaction: number | null
          very_satisfied_count: number | null
          satisfied_count: number | null
          neutral_count: number | null
          dissatisfied_count: number | null
          very_dissatisfied_count: number | null
          accessibility_avg: number | null
          service_quality_avg: number | null
          professionalism_avg: number | null
          courtesy_avg: number | null
          reliability_avg: number | null
          security_avg: number | null
          response_time_avg: number | null
          facilities_avg: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_overall_satisfaction: {
        Args: {
          q1: number
          q2: number
          q3: number
          q4: number
          q5: number
          q6: number
          q7: number
          q8: number
        }
        Returns: number
      }
      refresh_analytics_cache: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database['public']['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database['public']['CompositeTypes']
    ? Database['public']['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
