# Supabase RLS Policies Deployment Guide

## Task 16: Deploy Supabase Row-Level Security Policies

This guide explains how to deploy the RLS policies to your Supabase project.

---

## Prerequisites

1. **Supabase Project Created** (Task 15: Database Schema Setup)
   - Project URL: `https://[PROJECT-ID].supabase.co`
   - Anon key: `SUPABASE_ANON_KEY`
   - Service role key: `SUPABASE_SERVICE_KEY` (kept private)

2. **Database Schema Established** (Task 15)
   - `survey_responses` table created
   - `admin_users` table created
   - `analytics_cache` table created

3. **Access to Supabase SQL Editor**
   - Supabase Dashboard → SQL Editor

---

## Deployment Steps

### Step 1: Access Supabase SQL Editor

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to: **SQL Editor** (left sidebar)
4. Click: **New Query**

### Step 2: Apply RLS Migration

1. Copy the entire contents of:
   ```
   supabase/migrations/001_enable_rls_policies.sql
   ```

2. Paste into Supabase SQL Editor query window

3. Click: **Run** button (or press Ctrl+Enter)

4. Verify: No errors in output panel

### Step 3: Verify Deployment

Run the verification query in SQL Editor:

```sql
-- Verify RLS is enabled on tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('survey_responses', 'admin_users', 'analytics_cache')
ORDER BY tablename;
```

**Expected output**:
```
     tablename      | rowsecurity
--------------------+-------------
 admin_users        | t
 analytics_cache    | t
 survey_responses   | t
```

### Step 4: Verify Policies Created

Run:

```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, cmd, roles, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected policies**:

| Table | Policy Name | Operation | Roles |
|-------|-------------|-----------|-------|
| survey_responses | Allow public insert on survey_responses | INSERT | anon |
| survey_responses | Allow admin select on survey_responses | SELECT | authenticated |
| admin_users | Allow admins to view other admins | SELECT | authenticated |
| admin_users | Allow admins to update admin records | UPDATE | authenticated |
| analytics_cache | Allow admins to select analytics | SELECT | authenticated |
| analytics_cache | Allow service role to update analytics | UPDATE | service_role |

---

## Testing Deployment

### Test 1: Public Form Submission (Anon Key)

Use your frontend anon key to test INSERT:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAnon = createClient(
  'https://[PROJECT-ID].supabase.co',
  'YOUR_ANON_KEY'  // Public key - safe to expose
)

// Public user submits form
const { data, error } = await supabaseAnon
  .from('survey_responses')
  .insert({
    q1_accessibility: 4,
    q2_service_quality: 5,
    q3_professionalism: 4,
    q4_courtesy: 5,
    q5_reliability: 4,
    q6_security: 3,
    q7_response_time: 5,
    q8_facilities: 4,
  })

if (error) {
  console.error('INSERT failed:', error)
} else {
  console.log('✓ Form submitted successfully')
}
```

**Expected**: Success (201 Created)

### Test 2: Public Query Attempt (Anon Key - Should Fail)

```typescript
// Public user tries to view responses (should be denied)
const { data, error } = await supabaseAnon
  .from('survey_responses')
  .select('*')

if (error?.code === 'PGRST116') {
  console.log('✓ Public SELECT correctly denied by RLS')
} else if (!data || data.length === 0) {
  console.log('✓ Public SELECT returned empty (RLS policy working)')
} else {
  console.log('✗ PROBLEM: Public user can see responses!')
}
```

**Expected**: 
- Error `PGRST116` (row-level security policy violation), or
- Empty array `[]` (no SELECT policy for anon)

### Test 3: Admin Query (Authenticated Admin Key)

```typescript
// For testing only - use service_role key with caution
const supabaseService = createClient(
  'https://[PROJECT-ID].supabase.co',
  'YOUR_SERVICE_ROLE_KEY'  // Private key - backend only!
)

const { data, error } = await supabaseService
  .from('survey_responses')
  .select('*')
  .gte('created_at', '2024-01-01')
  .lte('created_at', '2024-12-31')

if (!error && data) {
  console.log(`✓ Admin SELECT returned ${data.length} responses`)
} else {
  console.log('✗ Admin SELECT failed:', error)
}
```

**Expected**: Success - returns all responses for date range

### Test 4: Verify Admin User Table

```typescript
// Verify admin_users table is created and populated
const { data: admins, error } = await supabaseService
  .from('admin_users')
  .select('*')

console.log('Admin users:', admins)
```

**Expected**: At least one admin user (created during Task 15)

---

## Troubleshooting

### Problem: "new row violates row-level security policy"

**Cause**: Policy check failed

**Solution 1**: Verify tables have RLS enabled
```sql
SELECT * FROM pg_tables 
WHERE tablename IN ('survey_responses', 'admin_users')
AND rowsecurity = true;
```

**Solution 2**: Check policies exist
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'survey_responses';
```

**Solution 3**: Verify using correct API key
- Frontend forms: Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public key)
- Admin dashboard: Use authenticated JWT token
- Backend migrations: Use `SUPABASE_SERVICE_KEY` (private key, backend only)

### Problem: Admins Cannot Access Dashboard

**Cause 1**: Admin user not in `admin_users` table

**Solution**:
```sql
-- Check if admin exists (use service_role)
SELECT * FROM admin_users WHERE email = 'admin@example.com';

-- If not found, create:
INSERT INTO admin_users (email, role, is_active)
VALUES ('admin@example.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;
```

**Cause 2**: Admin is marked as `is_active = false`

**Solution**:
```sql
UPDATE admin_users 
SET is_active = true 
WHERE email = 'admin@example.com';
```

**Cause 3**: JWT token doesn't match admin user ID

**Solution**: Verify JWT `sub` claim matches `admin_users.id`:
```typescript
// After authentication, check token
const authUser = await supabaseClient.auth.getUser()
console.log('Auth user ID:', authUser.user?.id)

// Verify this ID is in admin_users table
const { data: adminRecord } = await supabaseClient
  .from('admin_users')
  .select('*')
  .eq('id', authUser.user?.id)
  .single()

if (adminRecord) {
  console.log('✓ Admin user record found')
} else {
  console.log('✗ Admin user record NOT found - create it!')
}
```

### Problem: Service Role Key Doesn't Work

**Cause**: Service role key not configured properly

**Solution**:
```bash
# Verify in .env.local (backend only, never commit!)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...

# Make sure it's NOT exposed to frontend
# Check .env.example doesn't have secret keys
grep SERVICE_KEY .env.example  # Should be empty
```

### Problem: Indexes Not Created

**Cause**: Migration didn't complete fully

**Solution**: Manually create indexes:
```sql
-- Run these in SQL Editor
CREATE INDEX IF NOT EXISTS idx_admin_users_id_role_active 
  ON admin_users(id, role, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at 
  ON survey_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_cache_date 
  ON analytics_cache(metric_date DESC);

-- Verify indexes were created
SELECT * FROM pg_indexes 
WHERE tablename IN ('survey_responses', 'admin_users', 'analytics_cache');
```

---

## Configuration After Deployment

### Update Environment Variables

Once RLS policies are deployed, update your `.env.local`:

```bash
# Supabase Configuration (Task 16 completion)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend only (never expose to frontend)
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Backend URL (for admin operations)
SUPABASE_ADMIN_URL=https://[PROJECT-ID].supabase.co
```

### Update Verification in Code

Add health check endpoint to verify RLS:

```typescript
// pages/api/verify.ts
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Test 1: Anon can INSERT
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const { error } = await supabaseAnon
      .from('survey_responses')
      .select('id')
      .limit(1)

    // Should error (no SELECT policy for anon)
    if (error?.code === 'PGRST116') {
      // ✓ RLS working - anon denied SELECT
      console.log('✓ RLS verified: anon cannot SELECT')
    }
  } catch (err) {
    console.error('RLS verification failed:', err)
  }

  res.status(200).json({
    status: 'ok',
    backend: 'supabase',
    rls: 'enabled',
    timestamp: new Date().toISOString(),
  })
}
```

---

## Next Steps

After RLS policies are successfully deployed:

1. **Task 17**: Implement Supabase Backend Form Submission
   - Create `SupabaseBackend.submitResponse()`
   - Use anon key for public INSERT
   - Test with form page

2. **Task 18**: Implement Supabase Analytics
   - Create `SupabaseBackend.getAnalytics()`
   - Use authenticated key + admin JWT
   - Query with RLS policy enforcement

3. **Task 20**: Implement Supabase Authentication
   - Set up admin login flow
   - Create JWT tokens with `admin_users.id` as `sub`
   - Verify tokens in protected endpoints

4. **Task 40**: Test RLS Policies
   - Property tests for authorization
   - Verify RLS prevents unauthorized access
   - Test policy re-evaluation on admin status change

---

## Monitoring & Maintenance

### Monitor Policy Violations

```sql
-- View recent RLS policy violations
SELECT 
  event_message,
  user_id,
  resource_path,
  timestamp
FROM pg_stat_statements
WHERE query LIKE '%violates row-level security%'
ORDER BY timestamp DESC
LIMIT 10;
```

### Audit Admin Changes

```sql
-- View admin table modifications
SELECT 
  id, email, role, is_active, created_at, updated_at
FROM admin_users
ORDER BY updated_at DESC;
```

### Performance Monitoring

Monitor index performance:

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('survey_responses', 'admin_users', 'analytics_cache')
ORDER BY idx_scan DESC;
```

---

## Backup & Recovery

### Manual Backup of RLS Policies

Before making changes, back up the current policy configuration:

```sql
-- Export current policies
SELECT pg_get_policydefs(oid)
FROM pg_class
WHERE relname IN ('survey_responses', 'admin_users', 'analytics_cache');
```

### Restore from Backup

If policies need to be recreated:

```bash
# Re-run the migration
psql -h [HOST] -U postgres -d postgres -f supabase/migrations/001_enable_rls_policies.sql
```

---

## References

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Task 15: Database Schema Setup](./TASK_15_SETUP.md)
- [Task 17: Supabase Backend Implementation](./TASK_17_SETUP.md)

---

## Support

If you encounter issues:

1. Check [RLS_POLICIES.md](./RLS_POLICIES.md) for policy details
2. Review test cases in [rls_policies.test.sql](./tests/rls_policies.test.sql)
3. Check Supabase logs: Dashboard → Logs → Request logs
4. Review PostgreSQL system tables for policy state
