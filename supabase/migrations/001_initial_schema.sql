-- ========================================
-- Supabase Initial Schema for SKM Website
-- ========================================
-- This migration creates the core tables for SKM questionnaire survey system:
-- 1. survey_responses: Main table for storing questionnaire responses
-- 2. analytics_cache: Aggregated metrics table for performance
-- 3. audit_logs: Admin action audit trail

-- ========================================
-- TABLE: survey_responses
-- ========================================
-- Stores all incoming questionnaire responses with:
-- - UUID primary key for distributed generation
-- - Timestamps for tracking submission and updates
-- - 8 core SKM rating questions (1-5 Likert scale)
-- - Optional fields for suggestions and demographics
-- - Metadata for security and analytics

CREATE TABLE IF NOT EXISTS survey_responses (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ===== Core SKM Questions (1-5 Rating) =====
  q1_accessibility SMALLINT NOT NULL CHECK (q1_accessibility BETWEEN 1 AND 5),
  q2_service_quality SMALLINT NOT NULL CHECK (q2_service_quality BETWEEN 1 AND 5),
  q3_professionalism SMALLINT NOT NULL CHECK (q3_professionalism BETWEEN 1 AND 5),
  q4_courtesy SMALLINT NOT NULL CHECK (q4_courtesy BETWEEN 1 AND 5),
  q5_reliability SMALLINT NOT NULL CHECK (q5_reliability BETWEEN 1 AND 5),
  q6_security SMALLINT NOT NULL CHECK (q6_security BETWEEN 1 AND 5),
  q7_response_time SMALLINT NOT NULL CHECK (q7_response_time BETWEEN 1 AND 5),
  q8_facilities SMALLINT NOT NULL CHECK (q8_facilities BETWEEN 1 AND 5),
  
  -- ===== Optional Fields =====
  q9_suggestions TEXT DEFAULT NULL,
  demographic_age VARCHAR(20) DEFAULT NULL,
  demographic_service VARCHAR(100) DEFAULT NULL,
  
  -- ===== Metadata =====
  user_agent TEXT DEFAULT NULL,
  ip_hash VARCHAR(64) DEFAULT NULL,
  
  -- ===== Constraint: All core questions must be filled =====
  CONSTRAINT all_core_questions_filled CHECK (
    q1_accessibility IS NOT NULL AND
    q2_service_quality IS NOT NULL AND
    q3_professionalism IS NOT NULL AND
    q4_courtesy IS NOT NULL AND
    q5_reliability IS NOT NULL AND
    q6_security IS NOT NULL AND
    q7_response_time IS NOT NULL AND
    q8_facilities IS NOT NULL
  )
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at 
  ON survey_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_responses_ip_hash 
  ON survey_responses(ip_hash);

-- Enable full-text search on suggestions
CREATE INDEX IF NOT EXISTS idx_survey_responses_suggestions_fts 
  ON survey_responses USING gin(to_tsvector('english', q9_suggestions));

-- ========================================
-- TABLE: analytics_cache
-- ========================================
-- Materialized view data cached for performance.
-- Used by analytics queries to avoid expensive recalculations.
-- Updated by scheduled functions or on-demand.

CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  
  -- ===== Overall Metrics =====
  total_responses BIGINT DEFAULT 0,
  avg_satisfaction NUMERIC(3,2) DEFAULT 0,
  
  -- ===== Satisfaction Distribution (Counts) =====
  satisfaction_very_satisfied BIGINT DEFAULT 0,  -- Rating 5
  satisfaction_satisfied BIGINT DEFAULT 0,       -- Rating 4
  satisfaction_neutral BIGINT DEFAULT 0,         -- Rating 3
  satisfaction_dissatisfied BIGINT DEFAULT 0,    -- Rating 2
  satisfaction_very_dissatisfied BIGINT DEFAULT 0, -- Rating 1
  
  -- ===== Per-Dimension Averages =====
  dimension_accessibility_avg NUMERIC(3,2) DEFAULT 0,
  dimension_quality_avg NUMERIC(3,2) DEFAULT 0,
  dimension_professionalism_avg NUMERIC(3,2) DEFAULT 0,
  dimension_courtesy_avg NUMERIC(3,2) DEFAULT 0,
  dimension_reliability_avg NUMERIC(3,2) DEFAULT 0,
  dimension_security_avg NUMERIC(3,2) DEFAULT 0,
  dimension_response_time_avg NUMERIC(3,2) DEFAULT 0,
  dimension_facilities_avg NUMERIC(3,2) DEFAULT 0,
  
  -- ===== Daily Metrics =====
  daily_submissions BIGINT DEFAULT 0,
  
  -- ===== Update Tracking =====
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ===== Constraint: One record per date =====
  UNIQUE(metric_date)
);

-- Index for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_analytics_cache_date 
  ON analytics_cache(metric_date DESC);

-- ========================================
-- TABLE: audit_logs
-- ========================================
-- Tracks all administrative actions for security and compliance.
-- Includes login events, data exports, and other sensitive operations.

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ===== User Reference =====
  -- References auth.users table if using Supabase Auth
  admin_id UUID DEFAULT NULL,
  admin_email VARCHAR(255) DEFAULT NULL,
  
  -- ===== Action Details =====
  action VARCHAR(50) NOT NULL, -- e.g., 'LOGIN', 'EXPORT_CSV', 'EXPORT_EXCEL', 'VIEW_ANALYTICS'
  resource VARCHAR(100) DEFAULT NULL, -- e.g., 'analytics', 'export', 'settings'
  status VARCHAR(20) DEFAULT 'success', -- 'success' or 'failed'
  
  -- ===== Request Details =====
  ip_address VARCHAR(45) DEFAULT NULL, -- IPv4 or IPv6
  user_agent TEXT DEFAULT NULL,
  request_path VARCHAR(255) DEFAULT NULL,
  request_params JSONB DEFAULT NULL,
  
  -- ===== Response Details =====
  response_status_code INTEGER DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  
  -- ===== Timestamps =====
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ===== Additional Metadata =====
  details JSONB DEFAULT NULL -- Flexible field for action-specific data
);

-- Indexes for efficient audit querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_timestamp 
  ON audit_logs(admin_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
  ON audit_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
  ON audit_logs(created_at DESC);

-- ========================================
-- RLS POLICIES (Row-Level Security)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ===== survey_responses RLS Policies =====
-- Policy 1: Public INSERT (allow any unauthenticated user to submit)
CREATE POLICY "Enable public insert for survey_responses"
  ON survey_responses
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Admin-only SELECT (only authenticated admins can view)
CREATE POLICY "Enable admin select for survey_responses"
  ON survey_responses
  FOR SELECT
  USING (
    -- Check if user has admin role (will be set via JWT custom claims)
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy 3: Prevent updates and deletes
CREATE POLICY "Disable updates on survey_responses"
  ON survey_responses
  FOR UPDATE
  USING (false);

CREATE POLICY "Disable deletes on survey_responses"
  ON survey_responses
  FOR DELETE
  USING (false);

-- ===== analytics_cache RLS Policies =====
-- Policy: Admin-only SELECT
CREATE POLICY "Enable admin select for analytics_cache"
  ON analytics_cache
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Prevent public modification
CREATE POLICY "Disable public insert on analytics_cache"
  ON analytics_cache
  FOR INSERT
  USING (false);

CREATE POLICY "Disable public update on analytics_cache"
  ON analytics_cache
  FOR UPDATE
  USING (false);

CREATE POLICY "Disable public delete on analytics_cache"
  ON analytics_cache
  FOR DELETE
  USING (false);

-- ===== audit_logs RLS Policies =====
-- Policy: Admin-only SELECT of own logs (can see all if super_admin)
CREATE POLICY "Enable admin select for audit_logs"
  ON audit_logs
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- Policy: Prevent public modification (logs only created via server-side trigger)
CREATE POLICY "Disable public insert on audit_logs"
  ON audit_logs
  FOR INSERT
  USING (false);

CREATE POLICY "Disable public update on audit_logs"
  ON audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "Disable public delete on audit_logs"
  ON audit_logs
  FOR DELETE
  USING (false);

-- ========================================
-- VIEWS (Optional - for easier analytics queries)
-- ========================================

-- View for quick analytics access
CREATE OR REPLACE VIEW v_survey_analytics AS
SELECT
  COUNT(*) as total_responses,
  AVG((q1_accessibility + q2_service_quality + q3_professionalism + q4_courtesy + q5_reliability + q6_security + q7_response_time + q8_facilities) / 8.0) as avg_satisfaction,
  
  -- Satisfaction distribution
  COUNT(CASE WHEN ((q1_accessibility + q2_service_quality + q3_professionalism + q4_courtesy + q5_reliability + q6_security + q7_response_time + q8_facilities) / 8.0) >= 4.5 THEN 1 END) as very_satisfied_count,
  COUNT(CASE WHEN ((q1_accessibility + q2_service_quality + q3_professionalism + q4_courtesy + q5_reliability + q6_security + q7_response_time + q8_facilities) / 8.0) >= 3.5 AND ((q1_accessibility + q2_service_quality + q3_professionalism + q4_courtesy + q5_reliability + q6_security + q7_response_time + q8_facilities) / 8.0) < 4.5 THEN 1 END) as satisfied_count,
  COUNT(CASE WHEN ((q1_accessibility + q2_service_quality + q3_professionalism + q4_courtesy + q5_reliability + q6_security + q7_response_time + q8_facilities) / 8.0) >= 2.5 AND ((q1_accessibility + q2_service_quality + q3_professionalism + q4_courtesy + q5_reliability + q6_security + q7_response_time + q8_facilities) / 8.0) < 3.5 THEN 1 END) as neutral_count,
  COUNT(CASE WHEN ((q1_accessibility + q2_service_quality + q3_professionalism + q4_courtesy + q5_reliability + q6_security + q7_response_time + q8_facilities) / 8.0) >= 1.5 AND ((q1_accessibility + q2_service_quality + q3_professionalism + q4_courtesy + q5_reliability + q6_security + q7_response_time + q8_facilities) / 8.0) < 2.5 THEN 1 END) as dissatisfied_count,
  COUNT(CASE WHEN ((q1_accessibility + q2_service_quality + q3_professionalism + q4_courtesy + q5_reliability + q6_security + q7_response_time + q8_facilities) / 8.0) < 1.5 THEN 1 END) as very_dissatisfied_count,
  
  -- Per-dimension averages
  AVG(q1_accessibility) as accessibility_avg,
  AVG(q2_service_quality) as service_quality_avg,
  AVG(q3_professionalism) as professionalism_avg,
  AVG(q4_courtesy) as courtesy_avg,
  AVG(q5_reliability) as reliability_avg,
  AVG(q6_security) as security_avg,
  AVG(q7_response_time) as response_time_avg,
  AVG(q8_facilities) as facilities_avg
FROM survey_responses
WHERE created_at >= NOW() - INTERVAL '90 days';

-- ========================================
-- FUNCTIONS (Server-side helpers)
-- ========================================

-- Function to calculate overall satisfaction score for a single response
CREATE OR REPLACE FUNCTION calculate_overall_satisfaction(
  q1 SMALLINT,
  q2 SMALLINT,
  q3 SMALLINT,
  q4 SMALLINT,
  q5 SMALLINT,
  q6 SMALLINT,
  q7 SMALLINT,
  q8 SMALLINT
) RETURNS NUMERIC AS $$
BEGIN
  RETURN (q1 + q2 + q3 + q4 + q5 + q6 + q7 + q8) / 8.0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to refresh analytics cache (call via scheduled job)
CREATE OR REPLACE FUNCTION refresh_analytics_cache()
RETURNS void AS $$
BEGIN
  -- Delete old cache entries (keep last 90 days)
  DELETE FROM analytics_cache
  WHERE metric_date < CURRENT_DATE - INTERVAL '90 days';
  
  -- Upsert today's analytics
  INSERT INTO analytics_cache (
    metric_date,
    total_responses,
    avg_satisfaction,
    satisfaction_very_satisfied,
    satisfaction_satisfied,
    satisfaction_neutral,
    satisfaction_dissatisfied,
    satisfaction_very_dissatisfied,
    dimension_accessibility_avg,
    dimension_quality_avg,
    dimension_professionalism_avg,
    dimension_courtesy_avg,
    dimension_reliability_avg,
    dimension_security_avg,
    dimension_response_time_avg,
    dimension_facilities_avg,
    daily_submissions,
    updated_at
  )
  SELECT
    CURRENT_DATE,
    COUNT(*),
    ROUND(AVG(calculate_overall_satisfaction(q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities))::NUMERIC, 2),
    COUNT(CASE WHEN calculate_overall_satisfaction(q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities) >= 4.5 THEN 1 END),
    COUNT(CASE WHEN calculate_overall_satisfaction(q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities) >= 3.5 AND calculate_overall_satisfaction(q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities) < 4.5 THEN 1 END),
    COUNT(CASE WHEN calculate_overall_satisfaction(q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities) >= 2.5 AND calculate_overall_satisfaction(q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities) < 3.5 THEN 1 END),
    COUNT(CASE WHEN calculate_overall_satisfaction(q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities) >= 1.5 AND calculate_overall_satisfaction(q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities) < 2.5 THEN 1 END),
    COUNT(CASE WHEN calculate_overall_satisfaction(q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities) < 1.5 THEN 1 END),
    ROUND(AVG(q1_accessibility)::NUMERIC, 2),
    ROUND(AVG(q2_service_quality)::NUMERIC, 2),
    ROUND(AVG(q3_professionalism)::NUMERIC, 2),
    ROUND(AVG(q4_courtesy)::NUMERIC, 2),
    ROUND(AVG(q5_reliability)::NUMERIC, 2),
    ROUND(AVG(q6_security)::NUMERIC, 2),
    ROUND(AVG(q7_response_time)::NUMERIC, 2),
    ROUND(AVG(q8_facilities)::NUMERIC, 2),
    COUNT(*),
    CURRENT_TIMESTAMP
  FROM survey_responses
  WHERE DATE(created_at) = CURRENT_DATE
  ON CONFLICT (metric_date) DO UPDATE SET
    total_responses = EXCLUDED.total_responses,
    avg_satisfaction = EXCLUDED.avg_satisfaction,
    satisfaction_very_satisfied = EXCLUDED.satisfaction_very_satisfied,
    satisfaction_satisfied = EXCLUDED.satisfaction_satisfied,
    satisfaction_neutral = EXCLUDED.satisfaction_neutral,
    satisfaction_dissatisfied = EXCLUDED.satisfaction_dissatisfied,
    satisfaction_very_dissatisfied = EXCLUDED.satisfaction_very_dissatisfied,
    dimension_accessibility_avg = EXCLUDED.dimension_accessibility_avg,
    dimension_quality_avg = EXCLUDED.dimension_quality_avg,
    dimension_professionalism_avg = EXCLUDED.dimension_professionalism_avg,
    dimension_courtesy_avg = EXCLUDED.dimension_courtesy_avg,
    dimension_reliability_avg = EXCLUDED.dimension_reliability_avg,
    dimension_security_avg = EXCLUDED.dimension_security_avg,
    dimension_response_time_avg = EXCLUDED.dimension_response_time_avg,
    dimension_facilities_avg = EXCLUDED.dimension_facilities_avg,
    daily_submissions = EXCLUDED.daily_submissions,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMMENTS (Documentation)
-- ========================================

COMMENT ON TABLE survey_responses IS 'Stores all questionnaire responses with SKM survey questions and optional demographics';
COMMENT ON TABLE analytics_cache IS 'Cached analytics metrics for performance optimization';
COMMENT ON TABLE audit_logs IS 'Admin action audit trail for security and compliance';

COMMENT ON COLUMN survey_responses.q1_accessibility IS 'SKM Q1: Service accessibility and availability (1-5 Likert)';
COMMENT ON COLUMN survey_responses.q2_service_quality IS 'SKM Q2: Quality of service (1-5 Likert)';
COMMENT ON COLUMN survey_responses.q3_professionalism IS 'SKM Q3: Professional conduct (1-5 Likert)';
COMMENT ON COLUMN survey_responses.q4_courtesy IS 'SKM Q4: Staff courtesy and respect (1-5 Likert)';
COMMENT ON COLUMN survey_responses.q5_reliability IS 'SKM Q5: Service reliability (1-5 Likert)';
COMMENT ON COLUMN survey_responses.q6_security IS 'SKM Q6: Data security and privacy (1-5 Likert)';
COMMENT ON COLUMN survey_responses.q7_response_time IS 'SKM Q7: Response time and efficiency (1-5 Likert)';
COMMENT ON COLUMN survey_responses.q8_facilities IS 'SKM Q8: Facilities and infrastructure (1-5 Likert)';
