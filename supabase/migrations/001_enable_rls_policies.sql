-- Supabase Row-Level Security (RLS) Policies
-- Task 16: Configure Supabase row-level security policies
-- This migration enables RLS on the responses and admin_users tables
-- and creates policies for public form submissions and admin dashboard access

-- ============================================================================
-- Enable RLS on survey_responses table
-- ============================================================================

-- Enable RLS
ALTER TABLE IF EXISTS survey_responses ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public INSERT on survey_responses
-- Allows any anonymous user to insert their survey response
CREATE POLICY "Allow public insert on survey_responses"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Admin SELECT on survey_responses  
-- Allows authenticated admins to view all survey responses
CREATE POLICY "Allow admin select on survey_responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (
    -- Check if authenticated user is an admin
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role = 'admin' AND is_active = true
    )
  );

-- Policy 3: Public users cannot SELECT responses
-- Implicit: responses are not readable by public/anon users
-- (no SELECT policy defined for anon means implicit deny)

-- ============================================================================
-- Enable RLS on admin_users table
-- ============================================================================

-- Enable RLS
ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can select other admins
-- Allows authenticated admins to view other admin users
CREATE POLICY "Allow admins to view other admins"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    -- User can view admin if they are also an admin
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role = 'admin' AND is_active = true
    )
  );

-- Policy 2: Admins can update admin status
-- Allows authenticated admins to update admin records (enable/disable)
CREATE POLICY "Allow admins to update admin records"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (
    -- Only admins can update admin records
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role = 'admin' AND is_active = true
    )
  );

-- Policy 3: Users cannot delete admin records via RLS
-- (no DELETE policy defined means implicit deny)

-- ============================================================================
-- Enable RLS on analytics_cache table (if needed)
-- ============================================================================

-- Enable RLS
ALTER TABLE IF EXISTS analytics_cache ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can SELECT analytics
-- Allows authenticated admins to view cached analytics
CREATE POLICY "Allow admins to select analytics"
  ON analytics_cache
  FOR SELECT
  TO authenticated
  USING (
    -- Admin access
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role = 'admin' AND is_active = true
    )
  );

-- Policy 2: Service role can UPDATE analytics (for scheduled updates)
-- This allows the backend service role to refresh analytics cache
CREATE POLICY "Allow service role to update analytics"
  ON analytics_cache
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Grant role-based permissions
-- ============================================================================

-- Grant permissions to anon role (public form submission)
GRANT INSERT ON survey_responses TO anon;

-- Grant permissions to authenticated role (admin dashboard)
GRANT SELECT ON survey_responses TO authenticated;
GRANT SELECT, UPDATE ON admin_users TO authenticated;
GRANT SELECT ON analytics_cache TO authenticated;

-- Grant permissions to service_role (backend operations)
GRANT ALL ON survey_responses TO service_role;
GRANT ALL ON admin_users TO service_role;
GRANT ALL ON analytics_cache TO service_role;

-- ============================================================================
-- Create indexes for policy performance
-- ============================================================================

-- Index for admin lookups in policies (used in auth.uid() subqueries)
CREATE INDEX IF NOT EXISTS idx_admin_users_id_role_active 
  ON admin_users(id, role, is_active) 
  WHERE is_active = true;

-- Index for response queries
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at 
  ON survey_responses(created_at DESC);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_cache_date 
  ON analytics_cache(metric_date DESC);
