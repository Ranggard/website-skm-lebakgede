# Supabase Database Migrations and Configuration

This directory contains all database migrations and configuration for the SKM Questionnaire Website using Supabase as the backend.

## Directory Structure

```
supabase/
├── migrations/
│   └── 001_initial_schema.sql    # Initial database schema with tables, indexes, RLS policies
├── README.md                      # This file
└── functions/                     # Edge functions (optional, for future use)
```

## Quick Start

### 1. Create Supabase Project

Visit [supabase.com](https://supabase.com) and create a new project:

- Project Name: `skm-questionnaire`
- Database Password: (store securely)
- Region: (choose closest to your users)
- Pricing Plan: Free (for development)

### 2. Apply Initial Schema

After your project is created, apply the initial schema:

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to https://app.supabase.com/project/[your-project-id]/sql/new
2. Click "New query"
3. Copy and paste the entire content of `migrations/001_initial_schema.sql`
4. Click "Run"

#### Option B: Using Supabase CLI

```bash
# Install/update CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref [your-project-ref]

# Apply migrations
supabase db push
```

#### Option C: Using psql Command Line

```bash
psql "postgresql://postgres:[PASSWORD]@db.[region].supabase.co:6543/postgres?sslmode=require" \
  -f supabase/migrations/001_initial_schema.sql
```

### 3. Get Connection Credentials

1. Open https://app.supabase.com/project/[project-id]/settings/api
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role secret key** → `SUPABASE_SERVICE_KEY`

3. Create `.env.local` with these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
BACKEND_TYPE=supabase
NEXT_PUBLIC_BACKEND_TYPE=supabase
```

### 4. Verify Installation

Run the test query in SQL Editor to verify tables are created:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected result:
```
analytics_cache
audit_logs
survey_responses
```

## Database Schema Overview

### Tables

#### `survey_responses`
- **Purpose**: Stores all questionnaire responses
- **Key Columns**:
  - `id` (UUID): Unique response ID
  - `created_at`, `updated_at` (TIMESTAMP): Timestamps
  - `q1_accessibility` through `q8_facilities` (SMALLINT 1-5): SKM rating questions
  - `q9_suggestions` (TEXT): Optional feedback
  - `demographic_age`, `demographic_service` (VARCHAR): Optional demographics
  - `user_agent`, `ip_hash` (TEXT): Metadata
- **Constraints**: All core questions (q1-q8) required, ratings 1-5 only
- **Indexes**: 
  - `idx_survey_responses_created_at`: For date filtering
  - `idx_survey_responses_ip_hash`: For duplicate detection
  - `idx_survey_responses_suggestions_fts`: For search

#### `analytics_cache`
- **Purpose**: Pre-calculated metrics for performance
- **Key Columns**:
  - `metric_date` (DATE): Unique metric date
  - `total_responses`, `avg_satisfaction` (NUMBER): Overall metrics
  - `satisfaction_very_satisfied` through `satisfaction_very_dissatisfied`: Distribution counts
  - `dimension_*_avg`: Per-question averages
  - `daily_submissions` (BIGINT): Responses on that date
- **Usage**: Refreshed daily by `refresh_analytics_cache()` function
- **Indexes**: `idx_analytics_cache_date` for efficient queries

#### `audit_logs`
- **Purpose**: Tracks all administrative actions
- **Key Columns**:
  - `admin_id`, `admin_email` (UUID, VARCHAR): User reference
  - `action` (VARCHAR): Action type (LOGIN, EXPORT_CSV, etc.)
  - `status` (VARCHAR): success/failed
  - `ip_address`, `user_agent` (VARCHAR, TEXT): Request info
  - `request_params`, `details` (JSONB): Flexible metadata
- **Indexes**: Multiple for efficient audit queries

### Views

#### `v_survey_analytics`
- **Purpose**: Simplified analytics view combining multiple calculations
- **Returns**: Aggregated metrics over last 90 days
- **Usage**: Used by analytics dashboard endpoints

### Functions

#### `calculate_overall_satisfaction(q1, q2, q3, q4, q5, q6, q7, q8)`
- **Purpose**: Calculate average satisfaction score for a response
- **Returns**: NUMERIC (e.g., 4.25)
- **Usage**: Used in views and queries for consistent calculation

#### `refresh_analytics_cache()`
- **Purpose**: Recalculate analytics metrics for today
- **Returns**: void
- **Usage**: Called daily via scheduled job or manually
- **Behavior**: Upserts today's metrics, deletes old entries (>90 days)

## Security: Row-Level Security (RLS) Policies

All tables have RLS policies enabled. Here's the security model:

### Public Operations
- ✅ **Anyone** can INSERT into `survey_responses` (public form submission)
- ✅ All other insert/update/delete operations blocked for public

### Admin Operations (authenticated users with `role = 'admin'`)
- ✅ Can SELECT from `survey_responses` (view all responses)
- ✅ Can SELECT from `analytics_cache` (view analytics)
- ✅ Can SELECT from `audit_logs` (view audit trail)
- ✅ Cannot modify data (INSERT/UPDATE/DELETE blocked)

### Implementation

Policies check JWT claims for role:

```sql
-- Example: Allow only admins to SELECT
CREATE POLICY "Enable admin select" ON survey_responses
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

## Performance Optimization

### Indexes
The schema includes optimized indexes for common query patterns:

```sql
-- Date filtering (dashboards)
CREATE INDEX idx_survey_responses_created_at 
  ON survey_responses(created_at DESC);

-- IP-based duplicate detection
CREATE INDEX idx_survey_responses_ip_hash 
  ON survey_responses(ip_hash);

-- Full-text search on suggestions
CREATE INDEX idx_survey_responses_suggestions_fts 
  ON survey_responses USING gin(to_tsvector('english', q9_suggestions));
```

### Connection Pooling
Use Supabase's connection pooling for better performance:

- **Pooling Mode**: Session (recommended for web apps)
- **Max Connections**: 100
- **Connection URL**: `db.[region].supabase.co:6543` (instead of 5432)

### Caching Strategy
- Analytics are cached in `analytics_cache` table
- Refresh daily using `refresh_analytics_cache()` function
- Frontend caches with 5-minute TTL for dashboard

## Monitoring

### Check Database Size

```sql
-- Total database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Per-table breakdown
SELECT 
  schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor Connections

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- By role/database
SELECT usename, datname, count(*) 
FROM pg_stat_activity 
GROUP BY usename, datname;
```

### View Query Performance

1. Go to Supabase Dashboard → Database → Query Performance
2. Monitor slow queries and optimize
3. Check query plans using `EXPLAIN ANALYZE`

## Maintenance

### Regular Tasks

#### Daily
- Monitor `pg_stat_statements` for slow queries
- Check database size vs. free tier limits

#### Weekly
- Review audit logs for unauthorized access attempts
- Verify backups are complete

#### Monthly
- Analyze table statistics: `ANALYZE;`
- Reindex large tables if needed: `REINDEX TABLE survey_responses;`
- Archive old audit logs (>90 days) if needed

### Backup & Recovery

Supabase provides automatic daily backups:

1. Go to **Settings** → **Backups** in Supabase Dashboard
2. Download point-in-time recovery snapshots
3. Test recovery process quarterly

## Troubleshooting

### "Connection refused"
- Check project is running: Settings → Database
- Verify connection string is correct
- Check firewall/network settings

### "RLS policy violation"
- Verify JWT token has correct role claim
- Check user is authenticated
- Review RLS policy configuration

### "Slow queries"
- Run `ANALYZE` to update statistics
- Check if indexes are being used: `EXPLAIN ANALYZE`
- Consider upgrading to paid plan

### "Disk quota exceeded"
- Clean up test/old data
- Check with Supabase support for cleanup options
- Plan upgrade to paid plan

## Next Steps

1. ✅ **Task 15** (Current): Database schema creation
2. **Task 16**: Configure RLS policies (verify security)
3. **Task 17**: Implement form submission backend
4. **Task 18**: Implement analytics queries
5. **Task 19**: Implement data export

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase SQL Editor Guide](https://supabase.com/docs/guides/database/overview)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Connection Pooling Guide](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)

## Support

- Supabase Community: https://discord.supabase.io
- GitHub Issues: Report bugs in project repository
- Email Support: Available with paid plans
