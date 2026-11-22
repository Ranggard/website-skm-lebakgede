# Admin Dashboard & Edit Profile Implementation Plan

**Version**: 1.0  
**Date**: November 2026  
**Status**: Design Phase

---

## Overview

This document specifies the implementation of two key features:

1. **Edit Profile Page** (`/src/app/profile`) - Allows authenticated admin users to update their personal information (Nama, Email, Password)
2. **Admin Dashboard** (`/src/app/admin`) - Comprehensive role-based admin panel with statistics, audit trails, and user management

Both features integrate with the existing Supabase authentication system using the `admin_users` table and follow the established patterns from the login route (`/src/app/api/admin/login/route.ts`).

---

## Part 1: Edit Profile Page

### 1.1 Overview

The Edit Profile page enables admin users to modify their account details. It is accessible only to authenticated users (verified via the `admin_token` cookie) and enforces role-based visibility for certain fields.

**Location**: `/src/app/profile`  
**Route**: `/profile`  
**Access Level**: Authenticated admin users only

### 1.2 Functional Requirements

**F1.1**: User can change their full name (Nama)
- Field: `nama` in `admin_users` table
- Validation: 1-100 characters, non-empty
- Display: Text input, current value pre-filled

**F1.2**: User can change their email address
- Field: `email` in `admin_users` table
- Validation: Valid email format, unique in `admin_users` table, 1-255 characters
- Display: Email input, current value pre-filled

**F1.3**: User can change their password
- Field: `password_hash` in `admin_users` table
- Validation: Minimum 8 characters, must include uppercase, lowercase, and number
- Display: Password input (masked), confirmation field required, strength indicator
- Security: Hash with bcrypt before storing (bcryptjs already in dependencies)

**F1.4**: User can view their current role
- Field: `role` in `admin_users` table
- Display: Read-only, displays as badge (admin/staf/lurah)

**F1.5**: Changes are saved to the database immediately
- Success response includes confirmation message
- Error responses are user-friendly and specific

### 1.3 Non-Functional Requirements

**NF1.1**: API endpoint must follow existing middleware patterns
- Use consistent error response format from `/src/lib/api-middleware.ts`
- Include proper HTTP status codes

**NF1.2**: Client-side validation before API call
- Prevents unnecessary round-trips
- Server-side validation is redundant but required

**NF1.3**: Session validation for every request
- Verify `admin_token` cookie exists and is valid
- Reject unauthenticated requests with 401

**NF1.4**: UI must match existing dashboard styling
- Use Tailwind CSS classes consistent with dashboard
- Responsive design for mobile, tablet, desktop

### 1.4 Database Changes

**Table**: `admin_users` (existing)

No schema changes required. All fields already exist:
- `id`: UUID (primary key)
- `username`: Text (unique, required)
- `nama`: Text (required)
- `email`: Text (unique, required)
- `password_hash`: Text (required)
- `role`: Text (admin/staf/lurah, required)
- `is_active`: Boolean (required)

### 1.5 API Endpoint: POST /api/profile/update

**Route File**: `/src/app/api/profile/update/route.ts`

**Request Body** (Zod schema):
```typescript
{
  fieldType: 'nama' | 'email' | 'password'
  newValue: string        // The new value
  currentPassword?: string // Required only for password change
}
```

**Success Response** (200):
```typescript
{
  success: true
  message: 'Profil berhasil diperbarui'
  user: {
    username: string
    nama: string
    email: string
    role: string
  }
}
```

**Error Responses**:
- **400** - Validation error (invalid email format, password too weak, etc.)
  ```typescript
  {
    success: false
    error: { code: 'VALIDATION_ERROR', message: '...' }
  }
  ```

- **401** - Not authenticated or invalid token
  ```typescript
  {
    success: false
    error: { code: 'AUTH_ERROR', message: 'Silakan login terlebih dahulu' }
  }
  ```

- **409** - Conflict (email already in use by another user)
  ```typescript
  {
    success: false
    error: { code: 'CONFLICT', message: 'Email sudah digunakan' }
  }
  ```

- **500** - Server error
  ```typescript
  {
    success: false
    error: { code: 'INTERNAL_ERROR', message: '...' }
  }
  ```

**Error Handling**:
- Validation failure: User input is invalid → Return 400, describe validation error
  - Non-recoverable at API level, user must resubmit with valid data
  - Log at debug level
  
- Password mismatch (for password updates): Current password verification fails → Return 400, "Current password is incorrect"
  - Non-recoverable, user must try again
  - Log at debug level
  
- Email conflict: Email already exists → Return 409, describe conflict
  - Non-recoverable, user must choose different email
  - Log at info level
  
- Supabase failure: Database connectivity or query fails → Return 500, generic message
  - Potentially recoverable on retry
  - Log at error level with full details
  
- Authorization failure: User not authenticated or token invalid → Return 401
  - User must re-login
  - Log at debug level

### 1.6 Client Component: Edit Profile Page

**Component File**: `/src/app/profile/page.tsx`

**Features**:
- Client component with hooks (`'use client'`)
- Authentication check on mount (redirect to `/login` if not authenticated)
- Render edit form with three sections:
  - Change Name (input field)
  - Change Email (input field)
  - Change Password (password + confirmation fields with strength indicator)
- Loading state during API call
- Success/error toast notifications (or inline messages)
- Form reset after successful update
- Logout button for security

**Validation Logic** (client-side):
- Nama: 1-100 characters, non-empty
- Email: Valid email format, 1-255 characters
- Password: Min 8 chars, must contain uppercase, lowercase, digit
- Current password required for password change, must match confirmed

**Styling**:
- Use Tailwind CSS with existing dashboard classes
- Card layout with sections
- Button states (default, loading, disabled)
- Error messages in red, success in green
- Mobile-responsive layout

### 1.7 Integration Points

**Authentication**:
- Read `admin_token` from cookies using `document.cookie` or `next/headers` on server
- Validate token exists before rendering protected content
- Middleware or page-level check

**Navigation**:
- Link in dashboard sidebar under user profile menu
- Icon + "Edit Profile" text

**Supabase Client**:
- Use existing `createClient` pattern from login route
- Select current user data to pre-fill form
- Update user data with new values

---

## Part 2: Admin Dashboard

### 2.1 Overview

The Admin Dashboard is a comprehensive management interface for administrative users (role: admin, staf, lurah). It provides real-time statistics, audit trails, user management, and account management capabilities within a centralized hub.

**Location**: `/src/app/admin`  
**Route**: `/admin`  
**Access Level**: Admin users only (role-based routing)

### 2.2 Role-Based Access Control (RBAC)

**Roles**:
- **admin**: Full access to all dashboard menus and features
- **staf**: Limited access; can view statistics but cannot add users or access sensitive logs
- **lurah**: View-only access to statistics and reports

**Menu Visibility by Role**:

| Menu | Admin | Staf | Lurah |
|------|-------|------|-------|
| Semua Statistik | ✓ | ✓ | ✓ |
| Riwayat Responden | ✓ | ✓ | ✓ |
| Riwayat Login Dashboard | ✓ | ○ | ✗ |
| Tambah Pengguna Staf | ✓ | ✗ | ✗ |
| Logout Log | ✓ | ○ | ✗ |
| Settings | ✓ | ○ | ○ |

Legend: ✓ = Full access, ○ = View-only/Limited, ✗ = No access

### 2.3 Functional Requirements

#### Menu 1: Semua Statistik Dalam Satu Menu (All Statistics)

**F2.1**: Dashboard displays aggregated statistics
- Total responses received (count)
- Average satisfaction score (mean of all u1-u9 scores)
- Satisfaction distribution (pie chart: Sangat Puas, Puas, Cukup, Tidak Puas)
- Response rate by time period (line chart)
- Top feedback categories (keyword extraction from suggestions)
- Response trends over last 7 days

**F2.2**: Period selector for filtering data
- Options: TW1, TW2, TW3, TW4, Semester 1, Semester 2, 1 Tahun, Seluruh Data, Custom (date range)
- Applies to all statistics on this menu

**F2.3**: Data is refreshed automatically or on demand
- Initial load on page entry
- Manual refresh button (Refresh icon)
- Auto-refresh every 60 seconds optional (configurable)

**Data Sources**:
- Aggregate from `responses` table: count total, calculate avg u1-u9
- Group by dimension (u1=Persyaratan, u2=Prosedur, etc.)
- Filter by created_at timestamp based on period

#### Menu 2: Riwayat Responden (Respondent History)

**F2.4**: Table view of all responses
- Columns: No., Timestamp, Nama Responden (if provided), Usia, Jenis Kelamin, Layanan, Overall Score
- Sortable columns (click header)
- Pagination (10, 25, 50 responses per page)
- Search/filter by respondent name or service

**F2.5**: Click response row to view full details
- Modal or detail page opens showing all u1-u9 scores, suggestions (saran), demographics
- Export individual response as PDF option

**Data Sources**:
- Query `responses` table with pagination
- Filter by date range if applicable
- Order by created_at DESC (newest first)

#### Menu 3: Riwayat Login Dashboard (Dashboard Login History)

**F2.6**: Table view of admin login events
- Columns: No., Timestamp, Username, Role, IP Address (if captured), Status (Success/Failed)
- Pagination (10, 25, 50 entries per page)
- Filter by username or role
- Date range filter

**F2.7**: View failed login attempts separately
- Identify suspicious activity (multiple failed attempts from same IP)
- Warning indicator if threshold exceeded (e.g., 5+ failed attempts in 1 hour)

**Data Sources**:
- Requires new table: `login_history` (design in section 2.4)
- Schema: id, username, role, timestamp, success (boolean), ip_address, error_message

**Note**: This menu is **admin-only**; staf users cannot view this.

#### Menu 4: Tambah Pengguna Untuk Akun Staf Saja (Add Staff Users)

**F2.8**: Form to create new staff accounts
- Fields: Username (unique), Nama (full name), Email (unique), Password (temporary), Role dropdown
- Validation: Username alphanumeric 3-20 chars, Email format, Password 8+ chars
- Initial password is temporary; staff must change on first login
- Role selection: Can only create 'staf' users (admin-only functionality)

**F2.9**: Success confirmation
- Display new user credentials (username) for delivery to staff
- Password shown once; not retrievable later
- Send notification to admin confirming account creation

**F2.10**: User list with ability to deactivate/reactivate
- Table of existing admin_users
- Columns: Username, Nama, Email, Role, Status (Active/Inactive), Actions
- Deactivate button (soft delete, sets `is_active = false`)
- Reactivate button for inactive users

**Data Sources**:
- Read/write to `admin_users` table
- Role is 'staf' for newly created accounts
- Hash password with bcryptjs before storing

**Note**: This menu is **admin-only**; staf and lurah users cannot access.

#### Additional Menu 5: Logout Log (Suggested Addition)

**F2.11**: Track all logout events
- Columns: No., Timestamp, Username, Duration (session length), IP Address
- Useful for security monitoring and usage patterns
- Same filtering/pagination as login history

**Data Sources**:
- Requires new table: `logout_history` (design in section 2.4)
- Schema: id, username, role, timestamp, session_duration_seconds, ip_address

#### Additional Menu 6: Settings (Suggested Addition)

**F2.12**: Dashboard configuration
- General: Dashboard title, institution name, logo upload (future)
- Notifications: Email on suspicious activity, Daily summary (yes/no)
- Data retention: Auto-delete responses older than X days (yes/no), threshold
- Audit: Enable detailed logging (yes/no)

**Data Sources**:
- Requires new table: `dashboard_config` (design in section 2.4)
- Simple key-value store or separate columns
- Stored as JSON or individual fields

#### Additional Menu 7: User Management (Suggested Addition)

**F2.13**: Detailed user management interface
- List all admin users with filter by role
- Edit user details (name, email) without changing password (separate form)
- Reset password function (generate temporary password)
- Bulk deactivate users
- Audit trail of user creation/modification timestamps

---

### 2.4 Database Changes

#### Existing Tables (No Changes)
- `admin_users`: Already has all required fields
- `responses`: Already contains response data

#### New Tables Required

##### Table: `login_history`
```sql
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  role TEXT NOT NULL, -- admin/staf/lurah (denormalized for performance)
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT, -- Stored only if success=false
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_login_history_username ON login_history(username);
CREATE INDEX idx_login_history_timestamp ON login_history(timestamp DESC);
CREATE INDEX idx_login_history_success ON login_history(success);
```

##### Table: `logout_history`
```sql
CREATE TABLE logout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  role TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  session_duration_seconds INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logout_history_username ON logout_history(username);
CREATE INDEX idx_logout_history_timestamp ON logout_history(timestamp DESC);
```

##### Table: `dashboard_config` (Optional, for Settings menu)
```sql
CREATE TABLE dashboard_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by TEXT, -- username who last modified
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial config entries:
-- key: 'dashboard_title', value: '{"title": "SKM Dashboard"}'
-- key: 'institution_name', value: '{"name": "Kelurahan Lebakgede"}'
-- key: 'notifications_enabled', value: '{"enabled": true}'
-- key: 'data_retention_days', value: '{"days": 365}'
```

#### Audit Log Table (Optional, for detailed audit)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  action TEXT NOT NULL, -- LOGIN, LOGOUT, VIEW_ANALYTICS, ADD_USER, EDIT_PROFILE, etc.
  resource TEXT, -- What was affected (e.g., 'admin_users', 'responses')
  resource_id TEXT,
  old_value JSONB, -- For updates
  new_value JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_audit_logs_username ON audit_logs(username);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

---

### 2.5 API Endpoints

#### Endpoint 1: GET /api/admin/stats
**Purpose**: Fetch aggregated statistics for dashboard

**Query Parameters**:
```
?period=tw1|tw2|tw3|tw4|sem1|sem2|1y|all|custom
&startDate=2026-01-01 (required if period=custom)
&endDate=2026-12-31 (required if period=custom)
```

**Success Response** (200):
```typescript
{
  success: true
  data: {
    totalResponses: 1240
    avgSatisfaction: 3.42
    satisfactionDistribution: {
      sangatPuas: 450      // Score 4-4.49
      puas: 520            // Score 3.5-3.99
      cukup: 220           // Score 2.5-3.49
      tidakPuas: 50        // Score < 2.5
    }
    byDimension: {
      u1: 3.45
      u2: 3.38
      u3: 3.42
      // ... u4-u9
    }
    trend7Days: [
      { date: '2026-11-11', responses: 120, avgScore: 3.40 }
      // ... next 7 days
    ]
    topSuggestions: [
      { category: 'Petugas', count: 45 }
      { category: 'Waktu Layanan', count: 32 }
    ]
  }
}
```

**Error Responses**:
- **400** - Invalid period or date format
- **401** - Not authenticated
- **403** - Insufficient permission for user's role
- **500** - Database error

**Error Handling**:
- Invalid date range: Validation error (400)
- Missing required parameters for custom period: Validation error (400)
- Supabase query fails: Return 500, log error
- User not authenticated: Return 401
- User role doesn't have permission: Return 403

**Files**: `/src/app/api/admin/stats/route.ts`

---

#### Endpoint 2: GET /api/admin/responses
**Purpose**: Fetch paginated list of all responses

**Query Parameters**:
```
?page=1
&pageSize=10|25|50
&search=respondent_name (optional)
&startDate=2026-01-01 (optional)
&endDate=2026-12-31 (optional)
&sortBy=timestamp|score
&sortOrder=asc|desc
```

**Success Response** (200):
```typescript
{
  success: true
  data: {
    items: [
      {
        id: 'uuid'
        timestamp: '2026-11-18T10:30:00Z'
        nama: 'Budi Santoso'
        usia: '25-35'
        jenisKelamin: 'L'
        layanan: 'Surat Domisili'
        overallScore: 3.67
        u1: 4, u2: 3, u3: 4, u4: 3, u5: 4, u6: 4, u7: 3, u8: 4, u9: 3
        saran: 'Proses cepat, petugas ramah'
      }
      // ... more items
    ]
    total: 1240
    page: 1
    pageSize: 10
    totalPages: 124
  }
}
```

**Error Responses**:
- **400** - Invalid pagination or sort parameters
- **401** - Not authenticated
- **403** - User role cannot access this data
- **500** - Database error

**Error Handling**:
- Invalid pageSize: Return 400
- Supabase pagination query fails: Return 500, log error
- User not authenticated: Return 401
- Access denied for role: Return 403

**Files**: `/src/app/api/admin/responses/route.ts`

---

#### Endpoint 3: GET /api/admin/login-history
**Purpose**: Fetch login events (admin-only)

**Query Parameters**:
```
?page=1
&pageSize=10|25|50
&username=optional_filter
&role=admin|staf|lurah (optional)
&startDate=2026-01-01 (optional)
&endDate=2026-12-31 (optional)
&showFailedOnly=true|false
```

**Success Response** (200):
```typescript
{
  success: true
  data: {
    items: [
      {
        id: 'uuid'
        username: 'admin1'
        role: 'admin'
        timestamp: '2026-11-18T10:30:00Z'
        success: true
        ipAddress: '192.168.1.100'
        userAgent: 'Mozilla/5.0...'
        errorMessage: null
      }
      // ... more items
    ]
    total: 450
    page: 1
    pageSize: 10
    totalPages: 45
    suspiciousActivity: [
      {
        ipAddress: '10.0.0.5'
        failedAttempts: 7
        timeWindow: 'last 1 hour'
        usernames: ['user1', 'user2', 'admin']
      }
    ]
  }
}
```

**Error Responses**:
- **401** - Not authenticated
- **403** - Only admin can access
- **500** - Database error

**Error Handling**:
- Access denied for non-admin: Return 403
- Suspicious activity detection: Include in response
- Database query fails: Return 500, log error

**Files**: `/src/app/api/admin/login-history/route.ts`

---

#### Endpoint 4: POST /api/admin/users/add
**Purpose**: Create new staff user (admin-only)

**Request Body**:
```typescript
{
  username: string    // 3-20 alphanumeric
  nama: string        // 1-100 characters
  email: string       // Valid email, unique
  tempPassword: string // 8+ chars, temp password
}
```

**Success Response** (201):
```typescript
{
  success: true
  message: 'Pengguna staf berhasil ditambahkan'
  data: {
    id: 'uuid'
    username: 'newstaff'
    nama: 'Staff Baru'
    email: 'staff@example.com'
    role: 'staf'
    tempPassword: 'TempPass123!'
    isActive: true
  }
}
```

**Error Responses**:
- **400** - Validation error (invalid username format, weak password, etc.)
- **401** - Not authenticated
- **403** - Only admin can create users
- **409** - Username or email already exists
- **500** - Database error

**Error Handling**:
- Validation error: Return 400 with specific field errors
- Username/email conflict: Return 409, identify which field has conflict
- Authorization check: Return 403 if user is not admin role
- Supabase insert fails: Return 500, log error (don't expose DB error to client)
- Password hashing fails: Return 500, log error

**Files**: `/src/app/api/admin/users/add/route.ts`

---

#### Endpoint 5: GET /api/admin/users
**Purpose**: List existing admin users (admin-only)

**Query Parameters**:
```
?page=1
&pageSize=10
&role=admin|staf|lurah (optional filter)
&status=active|inactive|all
&search=username_or_name (optional)
```

**Success Response** (200):
```typescript
{
  success: true
  data: {
    items: [
      {
        id: 'uuid'
        username: 'admin1'
        nama: 'Admin Utama'
        email: 'admin@example.com'
        role: 'admin'
        isActive: true
        createdAt: '2026-01-01T00:00:00Z'
        lastLogin: '2026-11-18T10:30:00Z'
      }
      // ... more items
    ]
    total: 15
    page: 1
    pageSize: 10
    totalPages: 2
  }
}
```

**Error Responses**:
- **401** - Not authenticated
- **403** - Only admin can list users
- **500** - Database error

**Error Handling**:
- Access denied: Return 403
- Database query fails: Return 500, log error

**Files**: `/src/app/api/admin/users/route.ts`

---

#### Endpoint 6: PUT /api/admin/users/:id
**Purpose**: Update user status (activate/deactivate)

**URL Parameters**: `id` = user UUID

**Request Body**:
```typescript
{
  isActive: boolean
}
```

**Success Response** (200):
```typescript
{
  success: true
  message: 'Status pengguna berhasil diperbarui'
  data: {
    id: 'uuid'
    username: 'staf1'
    isActive: false
  }
}
```

**Error Responses**:
- **400** - Invalid request body
- **401** - Not authenticated
- **403** - Only admin can modify users
- **404** - User not found
- **500** - Database error

**Error Handling**:
- User not found: Return 404
- Access denied: Return 403
- Validation error: Return 400
- Database update fails: Return 500, log error

**Files**: `/src/app/api/admin/users/:id/route.ts`

---

### 2.6 Client Components

#### Main Admin Layout Component
**File**: `/src/app/admin/layout.tsx`

**Features**:
- Sidebar navigation menu (collapsible on mobile)
- Menu items based on user role (see section 2.2)
- User profile dropdown (name, role, Edit Profile link, Logout)
- Top navigation bar with:
  - Admin Dashboard title
  - User info display
  - Logout button
  - Refresh button for current page data

**Authentication**:
- Redirect to `/login` if not authenticated
- Redirect to `/` if user role is not admin/staf/lurah

**Styling**:
- Tailwind CSS, match existing dashboard sidebar
- Responsive layout (hamburger menu on mobile)
- Color scheme: Consistent with dashboard

---

#### Sub-Page Components

**Menu 1: Statistics Page**
- **File**: `/src/app/admin/statistics/page.tsx`
- Period selector dropdown
- Cards displaying key metrics
- Charts using Recharts (already in dependencies):
  - Pie chart for satisfaction distribution
  - Line chart for 7-day trend
  - Bar chart for dimension scores (u1-u9)
- Loading skeleton while data fetches
- Refresh button

**Menu 2: Respondent History Page**
- **File**: `/src/app/admin/respondents/page.tsx`
- Search/filter inputs at top
- Sortable data table with pagination
- Click row to open response detail modal
- Export button (future: export selected rows as CSV/PDF)

**Menu 3: Login History Page**
- **File**: `/src/app/admin/login-history/page.tsx`
- Admin-only access (403 for non-admin)
- Search/filter by username, role, date range
- Table with sortable columns
- Failed login badge/warning
- Suspicious activity alert section

**Menu 4: Add Staff User Page**
- **File**: `/src/app/admin/users/add/page.tsx`
- Admin-only access (403 for non-admin)
- Form with fields: Username, Nama, Email, Role (dropdown, default 'staf')
- Password strength indicator
- Submit button
- Success modal showing credentials
- User list table below form with deactivate/reactivate actions

**Menu 5: Logout Log Page** (Optional)
- **File**: `/src/app/admin/logout-log/page.tsx`
- Similar layout to Login History
- Shows session duration and logout timestamp
- Filter by username, role, date range

**Menu 6: Settings Page** (Optional)
- **File**: `/src/app/admin/settings/page.tsx`
- Admin-only access
- Sections for: General, Notifications, Data Retention, Audit
- Form inputs to update config
- Save button with success confirmation

---

### 2.7 Middleware / Route Protection

**File**: `/src/lib/auth-middleware.ts` (new utility)

**Purpose**: Utility function to check authentication and role-based access

**Function**: `requireAdmin(request: NextRequest)`
- Checks `admin_token` cookie
- Verifies token is valid (matches expected format)
- Checks user role from stored session/database
- Returns user object or throws error

**Usage in API routes**:
```typescript
import { requireAdmin } from '@/src/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request)
  if (error) return error  // Returns 401 or 403 response
  
  // Now user is authenticated, proceed with business logic
}
```

**Usage in page components** (via page-level checks):
- Check cookie in `page.tsx` using `cookies()` from `next/headers`
- If not authenticated, redirect using `redirect()` from `next/navigation`

---

### 2.8 Error Handling Summary

**At API Layer**:
1. **Authentication**: Verify cookie exists and is valid → 401 if missing/invalid
2. **Authorization**: Check user role against required role → 403 if insufficient
3. **Validation**: Validate request parameters, body schema → 400 if invalid
4. **Resource Not Found**: Query returns no results → 404
5. **Conflict**: Unique constraint violation (email, username) → 409
6. **External Failure**: Supabase query fails → 500 (log full error)

**At Client Layer**:
1. Form validation before submit (email format, password strength, required fields)
2. Display user-friendly error messages
3. Toast notifications for success/error
4. Disable buttons during API call (loading state)
5. Retry logic for transient failures (optional)

**Logging**:
- Debug: User input validation failures, auth checks
- Info: Successful user creation, profile updates
- Error: Database failures, unexpected errors
- Warn: Failed login attempts, suspicious activity

---

### 2.9 Security Considerations

**Authentication**:
- Session via `admin_token` cookie (httpOnly, secure, sameSite=lax)
- Token verification on every request
- Redirect to login on session expiry

**Authorization**:
- Role-based access control at API and page level
- Admin-only endpoints reject non-admin requests (403)

**Data Validation**:
- Input validation on client (UX)
- Input validation on server (security)
- Sanitize user input before database queries
- Use parameterized queries (Supabase client library handles this)

**Password Security**:
- Hash passwords with bcryptjs (cost = 10)
- Never log passwords or hashes
- Temporary password on account creation; user must change on first login

**Sensitive Data**:
- Login history (IP, user agent) collected but sanitized in display
- Error messages don't expose database schema or implementation details

---

### 2.10 Testing Strategy

**Unit Tests**:
- Password validation functions (strength checker)
- Date range parsing for period selector
- Score calculation and aggregation logic
- Role-based permission checks

**Integration Tests**:
- API endpoint tests with mock Supabase client
  - Valid request → correct response
  - Missing auth → 401
  - Invalid role → 403
  - Database error → 500
- Form submission with real API calls (staging environment)

**E2E Tests** (Future):
- User login → Navigate to Edit Profile → Update name → Verify change
- Admin login → Navigate to Admin Dashboard → View Statistics → Export data
- Admin login → Add new staff user → Verify in user list → Deactivate user

---

### 2.11 Performance Considerations

**Pagination**:
- Limit default page size to 10-25 items
- API enforces max page size (e.g., 100)
- Use database indexes on timestamp and foreign key columns

**Data Aggregation**:
- Pre-aggregate statistics on-demand (no caching initially)
- For future optimization: Use materialized views or background jobs to cache daily stats

**Client-Side Optimization**:
- Lazy load sub-pages (only fetch data when menu item clicked)
- Memoize chart components to avoid re-renders
- Use React.useMemo for derived state (e.g., satisfaction percentages)

**Database Indexes**:
- `login_history`: (username, timestamp), (success, timestamp)
- `logout_history`: (username, timestamp)
- `responses`: (created_at DESC) already exists, ensure it's optimized
- `admin_users`: (is_active) for filtering active users

---

### 2.12 Responsive Design

**Breakpoints**:
- Mobile: < 640px (Tailwind `sm`)
- Tablet: 640px - 1024px (`md` - `lg`)
- Desktop: > 1024px (`xl`)

**Layout Adjustments**:
- Mobile: Sidebar collapses to hamburger menu, full-width content
- Tablet: Sidebar remains visible but narrower, content adjusts
- Desktop: Normal sidebar + content layout

**Components**:
- Data tables: Horizontal scroll on mobile, full table on desktop
- Forms: Single column on mobile, potentially 2-column on larger screens
- Charts: Adjust size/font based on screen size

---

## Assumptions & Constraints

### Assumptions
1. **Supabase is always configured and available** - If not, the app falls back to hardcoded admin/staf/lurah accounts (per existing login route)
2. **User sessions are managed via cookies** - `admin_token` cookie indicates authenticated state
3. **Role values are always admin, staf, or lurah** - No other roles are introduced
4. **Email addresses are unique across admin_users** - Enforced by database constraint
5. **Usernames are unique** - Enforced by database constraint
6. **Passwords are always hashed with bcryptjs** - Plain text passwords not supported (but login route has fallback for migration)

### Constraints
1. **No real-time updates** - Statistics refresh on demand or manual button click (not WebSocket/polling)
2. **IP address capture depends on deployment** - Behind proxy, may require X-Forwarded-For header parsing
3. **No email notifications** - Emails are not sent; on-screen notifications only
4. **User passwords are write-only** - Cannot retrieve existing password, only reset
5. **Session timeout not explicitly enforced** - Cookie lasts 7 days; no forced logout
6. **Single admin dashboard instance** - No multi-tenant support

---

## Suggested Additional Menus (Prioritized)

### High Priority
1. **Logout Log** - Complements login history, provides complete session tracking
2. **Settings** - Allows customization of dashboard behavior without code changes

### Medium Priority
3. **User Management** - Detailed interface for user lifecycle (create, edit, deactivate)
4. **Audit Trail** - Comprehensive log of all admin actions (views, edits, exports)

### Low Priority
5. **Report Generation** - Export dashboard statistics as PDF report
6. **Backup & Restore** - Data backup management interface

---

## Implementation Phases

### Phase 1 (MVP - Weeks 1-2)
- Edit Profile page with name, email, password change
- POST /api/profile/update endpoint
- Admin dashboard main page with RBAC check
- Menu 1: Statistics (data fetching only, basic charts)
- Menu 2: Respondent History (table, basic filtering)

### Phase 2 (Weeks 3-4)
- Menu 3: Login History (admin-only, requires login_history table)
- Menu 4: Add Staff User (form, requires user creation logic)
- Logout Log page (optional but recommended)
- Improved filtering and search across all pages

### Phase 3 (Weeks 5+)
- Settings page for dashboard configuration
- Detailed User Management interface
- Audit trail implementation
- Performance optimization (caching, indexes)
- E2E test coverage

---

## Files to Create/Modify

### New Files to Create
```
/src/app/profile/
  ├── page.tsx                    # Edit Profile page
  └── components/
      ├── EditProfileForm.tsx
      └── PasswordStrengthIndicator.tsx

/src/app/admin/
  ├── layout.tsx                  # Admin layout with sidebar
  ├── page.tsx                    # Dashboard main/redirect
  ├── .design/
  │   └── IMPLEMENTATION_PLAN.md  # This file
  ├── statistics/
  │   └── page.tsx
  ├── respondents/
  │   └── page.tsx
  ├── login-history/
  │   └── page.tsx
  ├── users/
  │   ├── page.tsx
  │   └── add/
  │       └── page.tsx
  ├── logout-log/                 # Optional
  │   └── page.tsx
  └── settings/                   # Optional
      └── page.tsx

/src/app/api/
  ├── profile/
  │   └── update/
  │       └── route.ts
  └── admin/
      ├── stats/
      │   └── route.ts
      ├── responses/
      │   └── route.ts
      ├── login-history/
      │   └── route.ts
      ├── users/
      │   ├── route.ts
      │   ├── add/
      │   │   └── route.ts
      │   └── [id]/
      │       └── route.ts
      └── logout-history/         # Optional
          └── route.ts

/src/lib/
  ├── auth-middleware.ts          # Auth utility functions
  ├── password-validator.ts       # Password validation logic
  └── date-utils.ts               # Date range parsing
```

### Modified Files
```
/src/app/admin/layout.tsx         # Include from main layout if exists
/src/lib/api-middleware.ts        # May add new response types
/src/lib/types/                   # Add new types as needed
```

---

## Success Criteria

1. ✅ Edit Profile page functional: User can update name, email, password
2. ✅ Admin Dashboard accessible only to authenticated admin users
3. ✅ All 4 required menus rendered with proper RBAC
4. ✅ Statistics menu displays key metrics and charts
5. ✅ Respondent history table shows paginated responses
6. ✅ Login history visible to admin only
7. ✅ Staff user creation form works, adds user to database
8. ✅ All API endpoints return proper error responses (400, 401, 403, 500)
9. ✅ Client-side form validation prevents invalid submissions
10. ✅ UI is responsive on mobile, tablet, desktop
11. ✅ No sensitive data exposed in error messages
12. ✅ All pages have authentication checks

---

## Appendix: Technology Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18 (TypeScript)
- Tailwind CSS
- Recharts (for charts)
- Axios (for HTTP requests)

**Backend**:
- Next.js API Routes
- Supabase (PostgreSQL database)
- Bcryptjs (password hashing)
- Zod (data validation)

**Database**:
- PostgreSQL (via Supabase)
- Tables: admin_users, responses, login_history, logout_history, dashboard_config (optional), audit_logs (optional)

**Deployment**:
- Vercel (recommended for Next.js)
- Environment variables for Supabase credentials

---

**End of Implementation Plan**
