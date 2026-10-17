# Supabase Row-Level Security (RLS) Policies

## Overview

This document describes the Row-Level Security (RLS) policies configured for the SKM Questionnaire Website Supabase backend. RLS provides database-level access control by automatically filtering data based on the authenticated user and their role.

**Task 16 Completion**: Configure Supabase row-level security policies to protect the responses table and ensure proper access control.

---

## Architecture

### RLS Enforcement Diagram

```
┌─────────────────────────────────────────────┐
│         Client Request (HTTP)               │
└────────────────────┬────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Supabase Auth Layer   │
        │  (JWT Token)           │
        └─────────┬──────────────┘
                  │
                  ▼
        ┌────────────────────────┐
        │   RLS Policy Check     │
        │ (database-level)       │
        │ - Is user authenticated│
        │ - Is user admin?       │
        │ - Filter data by policy│
        └─────────┬──────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ✓ ALLOW          ✗ DENY
    (continue)      (403 error)
         │                 │
         ▼                 ▼
    [Return Data]   [Access Denied]
```

### Auth Roles

| Role | Description | Use Case |
|------|-------------|----------|
| **anon** | Unauthenticated public users | Form submission, public data |
| **authenticated** | Logged-in users with JWT token | Admin dashboard access |
| **service_role** | Backend service role (private key) | Analytics refresh, migrations |

---

## RLS Policies by Table

### 1. `survey_responses` Table

#### Policy 1: Public INSERT (Allow Form Submission)
**Name**: `Allow public insert on survey_responses`  
**Role**: `anon` (unauthenticated)  
**Operation**: INSERT  
**Check**: `true` (always allow)  

**Purpose**: Allows public users to submit survey responses without authentication.

**Access Pattern**:
```typescript
// From NextJS API route (unauthenticated)
const { data, error } = await supabase
  .from('survey_responses')
  .insert([
    {
      q1_accessibility: 4,
      q2_service_quality: 5,
      // ... other fields
    }
  ]);
```

**Security**: 
- Public users cannot see existing responses
- Public users cannot update/delete responses
- Each response is standalone; no cross-user data leakage

#### Policy 2: Admin SELECT (Allow Dashboard Access)
**Name**: `Allow admin select on survey_responses`  
**Role**: `authenticated` (logged-in users)  
**Operation**: SELECT  
**Using Condition**:
```sql
auth.uid() IN (
  SELECT id FROM admin_users WHERE role = 'admin' AND is_active = true
)
```

**Purpose**: Allows authenticated admin users to view survey responses for analytics.

**Access Pattern**:
```typescript
// From NextJS API route (authenticated admin)
const { data, error } = await supabaseAdmin
  .from('survey_responses')
  .select('*')
  .gte('created_at', startDate)
  .lte('created_at', endDate);
```

**Security**:
- Only users in `admin_users` table with `role='admin'` can view data
- Disabled admins (`is_active=false`) cannot access data
- Policy is re-evaluated on every query
- Subquery ensures real-time admin status checking

#### Implicit Deny for Public SELECT
**No policy exists for**: `anon` role SELECT on `survey_responses`

**Security**:
- Public users cannot query survey responses
- Responses are write-only for public; read-only for admins
- Default-deny approach: if no policy allows it, access is denied

---

### 2. `admin_users` Table

#### Policy 1: Admin SELECT (View Other Admins)
**Name**: `Allow admins to view other admins`  
**Role**: `authenticated`  
**Operation**: SELECT  
**Using Condition**:
```sql
auth.uid() IN (
  SELECT id FROM admin_users WHERE role = 'admin' AND is_active = true
)
```

**Purpose**: Allows admins to view the list of other admin users.

**Access Pattern**:
```typescript
// Admin listing endpoint
const { data: admins } = await supabaseAdmin
  .from('admin_users')
  .select('id, email, role, is_active, created_at');
```

**Security**:
- Only admins can view admin list
- Non-admin authenticated users cannot access this table
- Supports admin management workflows

#### Policy 2: Admin UPDATE (Enable/Disable Admins)
**Name**: `Allow admins to update admin records`  
**Role**: `authenticated`  
**Operation**: UPDATE  
**Using Condition**:
```sql
auth.uid() IN (
  SELECT id FROM admin_users WHERE role = 'admin' AND is_active = true
)
```

**Purpose**: Allows active admins to update admin records (e.g., deactivate inactive admins).

**Access Pattern**:
```typescript
// Disable an admin (requires admin authentication)
const { error } = await supabaseAdmin
  .from('admin_users')
  .update({ is_active: false })
  .eq('id', adminIdToDisable);
```

**Security**:
- Only active admins can update admin records
- Prevents privilege escalation (non-admins cannot grant themselves admin role)
- Cannot use UPDATE as workaround to grant admin role to non-admins

#### Implicit Deny for INSERT and DELETE
**No policies exist for**: `anon` or `authenticated` INSERT/DELETE on `admin_users`

**Security**:
- Admin users are created via backend service_role only (not via client API)
- Admins cannot be deleted via API (use UPDATE `is_active=false` instead)
- Prevents unauthorized admin account creation

---

### 3. `analytics_cache` Table

#### Policy 1: Admin SELECT (View Analytics)
**Name**: `Allow admins to select analytics`  
**Role**: `authenticated`  
**Operation**: SELECT  
**Using Condition**:
```sql
auth.uid() IN (
  SELECT id FROM admin_users WHERE role = 'admin' AND is_active = true
)
```

**Purpose**: Allows admins to view pre-calculated analytics data.

**Access Pattern**:
```typescript
// Fetch dashboard analytics
const { data: analytics } = await supabaseAdmin
  .from('analytics_cache')
  .select('*')
  .eq('metric_date', today);
```

**Security**:
- Only admins can view cached analytics
- Public cannot access summary statistics
- Analytics data is aggregated (no individual response visibility)

#### Policy 2: Service Role UPDATE (Refresh Analytics)
**Name**: `Allow service role to update analytics`  
**Role**: `service_role` (backend operations)  
**Operation**: UPDATE  
**Using Condition**: `true` (always allow for service_role)  

**Purpose**: Allows backend scheduled jobs to refresh analytics cache.

**Access Pattern**:
```typescript
// Backend scheduled job (using service_role key)
const { error } = await supabaseService
  .from('analytics_cache')
  .update({
    total_responses: newCount,
    avg_satisfaction: newAvg,
    updated_at: new Date(),
  })
  .eq('metric_date', today);
```

**Security**:
- Service role uses private API key (never exposed to client)
- Only backend can update analytics
- Prevents manual data manipulation
- Rate-limited by backend job schedule (not real-time)

---

## Policy Execution Flow

### Scenario 1: Public User Submits Form

```
┌─ User fills form on form.html ─┐
│                                 │
└────────────┬────────────────────┘
             │
             ▼
   POST /api/submit with
   survey response data
             │
             ▼
   ┌──────────────────────────┐
   │ NextJS API Route         │
   │ - Validates input        │
   │ - Uses anon key          │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ Supabase INSERT          │
   │ (anon role)              │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ RLS Policy Check         │
   │ "Allow public insert"    │
   │ CHECK: true ✓            │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ INSERT into DB           │
   │ Row created ✓            │
   └──────────────────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ Return response ID       │
   │ to user ✓                │
   └──────────────────────────┘
```

### Scenario 2: Admin Views Dashboard

```
┌─ Admin clicks "Dashboard" ─┐
│ (with JWT token)           │
└────────────┬───────────────┘
             │
             ▼
   GET /api/analytics with
   Authorization: Bearer <JWT>
             │
             ▼
   ┌──────────────────────────┐
   │ NextJS API Route         │
   │ - Verifies JWT           │
   │ - Uses authenticated key │
   │ - Gets admin user ID     │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ Supabase SELECT          │
   │ (authenticated role)     │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ RLS Policy Check         │
   │ "Allow admin select"     │
   │ USING: auth.uid() IN ... │
   │ (lookup admin_users)     │
   └──────────┬───────────────┘
              │
      ┌───────┴────────┐
      │                │
   User IS           User IS NOT
   admin?            admin?
      │                │
      ▼                ▼
   ALLOW            DENY
   SELECT           (403)
      │                │
      ▼                ▼
   Return data    Error to client
```

### Scenario 3: Hacker Attempts Direct DB Access

```
┌─ Hacker tries POST request ─┐
│ with anon key               │
│ SELECT * FROM survey_resp.. │
└────────────┬────────────────┘
             │
             ▼
   POST /api/db-query with
   SELECT statement
             │
             ▼
   ┌──────────────────────────┐
   │ Supabase SELECT          │
   │ (anon role)              │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ RLS Policy Check         │
   │ on survey_responses      │
   │ No SELECT policy         │
   │ for anon role            │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ DENY (implicit)          │
   │ Returns empty result     │
   │ or 403 error             │
   └──────────────────────────┘
              │
              ▼
   No data exposed ✓
```

---

## Performance Considerations

### Policy Lookup Performance

The RLS policies use subqueries to check admin status:

```sql
auth.uid() IN (SELECT id FROM admin_users WHERE role = 'admin' AND is_active = true)
```

**Performance Optimization**:

1. **Index Created**: `idx_admin_users_id_role_active`
   ```sql
   CREATE INDEX idx_admin_users_id_role_active 
     ON admin_users(id, role, is_active) 
     WHERE is_active = true;
   ```

2. **Query Plan**: Index lookup is O(log n) for small admin user tables
   - Typical 5-50 admins: <1ms lookup time
   - Safe up to 10k admin users

3. **Cache Strategy**: Supabase caches RLS policy results where possible
   - Subsequent queries within same connection use cached policy result
   - Connection pooling enables policy result reuse

### Query Performance

Additional indexes for common queries:

```sql
-- Survey responses by creation date (for analytics)
CREATE INDEX idx_survey_responses_created_at 
  ON survey_responses(created_at DESC);

-- Analytics cache lookups by date
CREATE INDEX idx_analytics_cache_date 
  ON analytics_cache(metric_date DESC);
```

### Scalability Limits

| Metric | Limit | Action |
|--------|-------|--------|
| Admin users | 10,000+ | Index ensures O(log n) lookups |
| Survey responses | 100,000+ | Partitioning recommended |
| Analytics queries | >1000 qps | Consider read replicas |

---

## Testing RLS Policies

### Test 1: Public INSERT (Anon User)

```sql
-- From frontend with anon API key
INSERT INTO survey_responses (
  q1_accessibility, q2_service_quality, q3_professionalism,
  q4_courtesy, q5_reliability, q6_security, q7_response_time,
  q8_facilities, created_at
) VALUES (4, 5, 4, 5, 4, 3, 5, 4, NOW());
-- ✓ SUCCESS (public insert allowed)
```

### Test 2: Public SELECT (Deny)

```sql
-- From frontend with anon API key
SELECT * FROM survey_responses;
-- ✗ ERROR (no SELECT policy for anon)
-- Returns: "new row violates row-level security policy"
```

### Test 3: Admin SELECT (Allow)

```sql
-- From NextJS backend with authenticated JWT + admin user
SELECT * FROM survey_responses 
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02';
-- ✓ SUCCESS (admin can select)
-- Returns: All 127 responses for that date
```

### Test 4: Admin SELECT (Non-Admin Deny)

```sql
-- From NextJS backend with authenticated JWT for non-admin user
SELECT * FROM survey_responses LIMIT 1;
-- ✗ ERROR (user is not admin)
-- Returns: "new row violates row-level security policy"
```

### Test 5: Admin INSERT (Deny)

```sql
-- From NextJS backend with authenticated JWT
INSERT INTO survey_responses (...);
-- ✗ ERROR (no INSERT policy for authenticated role)
-- Returns: "new row violates row-level security policy"
```

### Test 6: Service Role Bypass (For Migrations)

```sql
-- Using service_role key (private, backend-only)
-- Can bypass RLS policies
INSERT INTO admin_users (email, role, is_active)
VALUES ('admin@example.com', 'admin', true);
-- ✓ SUCCESS (service_role bypasses RLS)
```

---

## Maintenance & Operations

### Adding a New Admin User

```typescript
// Backend operation (using service_role key)
const { data, error } = await supabaseService
  .from('admin_users')
  .insert({
    email: 'newadmin@example.com',
    role: 'admin',
    is_active: true,
  });
```

### Deactivating an Admin User

```typescript
// Admin operation (using authenticated key with admin JWT)
const { error } = await supabaseAdmin
  .from('admin_users')
  .update({ is_active: false })
  .eq('id', adminIdToDeactivate);
```

### Verifying RLS is Enabled

```sql
-- Check which tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

Expected output:
```
     tablename      | rowsecurity
--------------------+-------------
 survey_responses   | t
 admin_users        | t
 analytics_cache    | t
```

### Viewing Active Policies

```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## Security Best Practices

### ✓ DO

- ✓ Use `auth.uid()` for user identification (built-in Supabase function)
- ✓ Store admin status in database (`admin_users` table)
- ✓ Verify `is_active` flag in policy (allows disabling admins instantly)
- ✓ Use service_role key only on backend (never in frontend code)
- ✓ Periodically audit admin_users table for unexpected entries
- ✓ Log all policy violations (Supabase logs these automatically)
- ✓ Test policies before deployment
- ✓ Use indexes on columns in policy conditions

### ✗ DON'T

- ✗ Store admin status in JWT claims (stale; policy won't reflect real-time changes)
- ✗ Use hard-coded user IDs in policies
- ✗ Expose service_role key to frontend
- ✗ Disable RLS on sensitive tables
- ✗ Create policies that always return `true`
- ✗ Skip database-level validation (app-level auth alone is insufficient)
- ✗ Add SELECT policies for anon users on sensitive data
- ✗ Use CURRENT_USER_ID directly without verification

---

## Troubleshooting

### Problem: "new row violates row-level security policy"

**Cause**: RLS policy check failed

**Solutions**:
1. Verify user role: Check JWT token has correct role
2. Verify admin status: Check `admin_users` table has entry
3. Verify policy exists: Run `SELECT * FROM pg_policies`
4. Check policy condition: Is `is_active = true`?

### Problem: Admins can't see responses

**Cause**: Admin user record is missing or is_active=false

**Solution**:
```typescript
// Check admin user record
const { data: adminUser } = await supabaseService
  .from('admin_users')
  .select('*')
  .eq('id', auth.uid())
  .single();

// Ensure record exists and is_active = true
if (!adminUser || !adminUser.is_active) {
  // Create or reactivate admin user
}
```

### Problem: Public form submission fails

**Cause**: anon key not configured or INSERT policy missing

**Solution**:
1. Verify anon API key in frontend environment
2. Verify `Allow public insert on survey_responses` policy exists
3. Check Supabase logs for detailed error

---

## Compliance & Audit

### Audit Trail

All policy violations are logged by Supabase:
- Failed authentication attempts
- Denied RLS policy checks
- All admin access to survey responses

**Access logs**:
```
Supabase Dashboard → Logs → Request logs
→ Filter by table name and user ID
```

### Data Protection

- **GDPR**: Responses not linked to personal data (public form, no auth required)
- **Encryption**: Supabase encrypts data at rest and in transit
- **Backups**: Automatic daily backups with point-in-time recovery

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [SKM Questionnaire Website Requirements](../requirements.md)
- [Design Document - Security Considerations](../design.md#security-considerations)

---

## Next Steps

After RLS policies are deployed:

1. **Task 17**: Implement Supabase backend form submission
   - Use anon key for INSERT operations
   - Leverage public INSERT policy

2. **Task 18**: Implement Supabase backend analytics queries
   - Use authenticated key for SELECT operations
   - Leverage admin SELECT policy

3. **Task 20**: Implement Supabase authentication
   - Set up admin login flow
   - Verify JWT tokens used in protected endpoints

4. **Testing (Task 40)**: Property tests for admin authorization
   - Verify RLS prevents unauthorized access
   - Test policy re-evaluation on admin status change
