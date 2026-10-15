# Design Document: SKM Questionnaire Website

## Overview

This document details the architecture, technology stack, component structures, database schemas, and security considerations for the SKM Questionnaire Website. The design employs a **Backend Factory Pattern** to support dual implementations (Google Sheets and Supabase) with seamless switching at deployment time.

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React/Next.js)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Questionnaire│  │  Dashboard   │  │  Auth Pages  │       │
│  │    Form      │  │  (Analytics) │  │  (Conditional)       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼──────┐            ┌──────▼────┐
    │  API      │            │   Auth    │
    │ Gateway   │            │  Manager  │
    │           │            │           │
    └────┬──────┘            └──────┬────┘
         │                          │
    ┌────▼──────────────────────────▼────┐
    │     Backend Factory Pattern         │
    │  ┌──────────────────────────────┐  │
    │  │ BackendStrategy (Interface)  │  │
    │  └──────────────────────────────┘  │
    │    ▲              ▲                 │
    │    │              │                 │
    │  ┌─┴────┐      ┌──┴──┐             │
    │  │Google│      │Supa │             │
    │  │Sheets│      │base │             │
    │  │Impl  │      │Impl │             │
    │  └──────┘      └─────┘             │
    └────────────────────────────────────┘
         │              │
    ┌────▼──┐      ┌────▼────┐
    │Google  │      │Supabase │
    │ API    │      │PostgreSQL
    │        │      │Database │
    └────────┘      └─────────┘
```

### Backend Factory Pattern

The **Backend Factory Pattern** provides abstraction over backend implementations:

```typescript
// Backend Strategy Interface
interface BackendStrategy {
  submitResponse(data: QuestionnaireResponse): Promise<string>;
  getAnalytics(): Promise<AnalyticsData>;
  exportResponses(format: 'csv' | 'excel'): Promise<Buffer>;
  deleteResponse(responseId: string): Promise<void>;
  getResponseCount(): Promise<number>;
}

// Google Sheets Implementation
class GoogleSheetsBackend implements BackendStrategy {
  private authClient: google.auth.OAuth2;
  private sheetsApi: sheets_v4.Sheets;
  private scriptService: GoogleAppsScriptService;
  
  async submitResponse(data: QuestionnaireResponse): Promise<string> {
    // Appends row to Google Sheet
  }
  
  async getAnalytics(): Promise<AnalyticsData> {
    // Queries data from Google Sheet
  }
  
  async exportResponses(format): Promise<Buffer> {
    // Exports via Sheets API
  }
}

// Supabase Implementation
class SupabaseBackend implements BackendStrategy {
  private client: SupabaseClient;
  
  async submitResponse(data: QuestionnaireResponse): Promise<string> {
    // Inserts into responses table
  }
  
  async getAnalytics(): Promise<AnalyticsData> {
    // Queries PostgreSQL via Supabase
  }
  
  async exportResponses(format): Promise<Buffer> {
    // Exports from PostgreSQL
  }
}

// Factory
class BackendFactory {
  static create(provider: 'google-sheets' | 'supabase'): BackendStrategy {
    switch (provider) {
      case 'google-sheets':
        return new GoogleSheetsBackend();
      case 'supabase':
        return new SupabaseBackend();
      default:
        throw new Error('Unknown backend provider');
    }
  }
}
```

---

## Technology Stack

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | React meta-framework with SSR, built-in API routes, optimized for production |
| **Styling** | Tailwind CSS 3 | Utility-first CSS, responsive design, theme consistency |
| **State Management** | TanStack Query (React Query) | Server state management, caching, real-time updates |
| **UI Components** | Headless UI + Radix UI | Accessible, unstyled component primitives |
| **Charting** | Recharts | React charting library for analytics dashboard |
| **Forms** | React Hook Form + Zod | Form state, validation, type-safe schemas |
| **HTTP Client** | Fetch API / Axios | API communication |
| **PDF Generation** | jsPDF + html2canvas | Client-side PDF report generation |
| **CSV Export** | papaparse | Client-side CSV generation |
| **Authentication** | next-auth v5 (for Supabase option) | Session management, provider integration |
| **Date/Time** | date-fns | Date formatting and manipulation |
| **Icons** | Heroicons | SVG icon library matching Tailwind |

### Backend

#### Google Sheets Option
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Authorization** | OAuth 2.0 | Secure access to Google APIs |
| **Sheets API** | Google Sheets API v4 | Read/write spreadsheet data |
| **Apps Script** | Google Apps Script | Serverless scripts for custom logic |
| **Trigger Service** | Apps Script Time-based Triggers | Scheduled analytics recalculation |

#### Supabase Option
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | PostgreSQL 15+ | Relational database for responses |
| **Authentication** | Supabase Auth | User management and JWT sessions |
| **Real-time** | Supabase Realtime | WebSocket-based live updates |
| **Storage** | Supabase Storage | File uploads (reports, exports) |
| **Edge Functions** | Deno (Supabase) | Serverless compute for export logic |

### Deployment & Hosting

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Hosting** | Vercel (Free Tier) | Optimized Next.js deployment, CDN, auto-scaling |
| **Database (Supabase)** | PostgreSQL on AWS (Free Tier) | 500MB storage, 50k requests/month |
| **Version Control** | GitHub | Source code management, CI/CD triggers |
| **CI/CD** | GitHub Actions + Vercel | Automated deployment on push to main |
| **Monitoring** | Sentry (optional) | Error tracking and performance monitoring |

---

## Component Structure

### Frontend Components

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with global providers
│   ├── page.tsx                   # Landing page
│   ├── form/
│   │   ├── page.tsx              # Questionnaire form page
│   │   └── layout.tsx            # Form-specific layout
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard main page
│   │   ├── layout.tsx            # Protected layout with auth check
│   │   └── (dashboard)/
│   │       ├── analytics/        # Analytics subpages
│   │       ├── export/           # Export controls
│   │       └── reports/          # Report generation
│   └── api/
│       ├── submit/               # Form submission endpoint
│       ├── analytics/            # Analytics data endpoint
│       ├── export/               # Export endpoint
│       └── auth/                 # Authentication endpoints
│
├── components/
│   ├── form/
│   │   ├── QuestionnaireForm.tsx      # Main form component
│   │   ├── QuestionBlock.tsx          # Individual question with options
│   │   ├── FormSection.tsx            # Section grouping
│   │   ├── FormProgress.tsx           # Progress indicator
│   │   ├── SubmitButton.tsx           # Form submission handler
│   │   └── ConfirmationDialog.tsx     # Success message
│   │
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx        # Title and navigation
│   │   ├── StatCard.tsx              # KPI display card
│   │   ├── SatisfactionChart.tsx     # Pie chart of satisfaction levels
│   │   ├── TrendChart.tsx            # Line chart of submissions over time
│   │   ├── DimensionBreakdown.tsx    # Per-dimension satisfaction breakdown
│   │   ├── ResponseTable.tsx         # Table of recent responses (optional)
│   │   ├── ExportButton.tsx          # CSV/Excel export trigger
│   │   ├── PrintReport.tsx           # PDF generation trigger
│   │   └── DashboardGrid.tsx         # Layout container
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx             # Admin login (Supabase or token-based)
│   │   ├── LogoutButton.tsx          # Session logout
│   │   └── ProtectedRoute.tsx        # Auth guard component
│   │
│   ├── common/
│   │   ├── Header.tsx                # Site header
│   │   ├── Footer.tsx                # Site footer
│   │   ├── LoadingSpinner.tsx        # Loading indicator
│   │   ├── ErrorBoundary.tsx         # Error handling
│   │   └── Toast.tsx                 # Notification system
│
├── lib/
│   ├── backend/
│   │   ├── factory.ts                # BackendFactory implementation
│   │   ├── strategies/
│   │   │   ├── google-sheets.ts      # Google Sheets backend
│   │   │   └── supabase.ts           # Supabase backend
│   │   └── types.ts                  # BackendStrategy interface
│   │
│   ├── api-client.ts                 # HTTP client wrapper
│   ├── analytics.ts                  # Analytics calculations
│   ├── validators.ts                 # Zod schemas for validation
│   ├── constants.ts                  # SKM questions, scoring, dimensions
│   ├── auth.ts                       # Auth utility functions
│   └── export.ts                     # CSV/Excel generation logic
│
├── hooks/
│   ├── useForm.ts                    # Form state management
│   ├── useAnalytics.ts               # Analytics data fetching
│   ├── useAuth.ts                    # Authentication state
│   ├── useExport.ts                  # Export functionality
│   └── useResponsive.ts              # Responsive design utilities
│
├── types/
│   ├── questionnaire.ts              # Questionnaire and response types
│   ├── analytics.ts                  # Analytics data structures
│   └── backend.ts                    # Backend strategy types
│
├── styles/
│   ├── globals.css                   # Tailwind imports + global styles
│   ├── form.css                      # Form-specific styles
│   └── dashboard.css                 # Dashboard-specific styles
│
├── utils/
│   ├── format.ts                     # Date, number formatting
│   ├── calculations.ts               # Score calculations
│   └── storage.ts                    # LocalStorage utilities
│
└── public/
    ├── logo.svg
    ├── favicon.ico
    └── manifest.json

```

### Key Component Details

#### QuestionnaireForm.tsx
- Manages form state for all questions
- Handles progressive disclosure if needed
- Validates responses using React Hook Form + Zod
- Displays progress indicator
- Handles submission and loading states
- Mobile-optimized touch interactions

#### DashboardGrid.tsx
- Responsive grid layout (1 column mobile, 2-3 columns desktop)
- Real-time subscription to analytics updates (Supabase)
- Automatic refresh interval (Google Sheets)
- Error fallback UI
- Loading skeleton screens

#### ProtectedRoute.tsx
- Redirects to login if not authenticated
- Checks auth token or session
- Variant for Google Sheets (query param token) vs Supabase (JWT session)

---

## Components and Interfaces

### BackendStrategy Interface

```typescript
interface BackendStrategy {
  /**
   * Submit a questionnaire response to the backend
   */
  submitResponse(data: QuestionnaireResponse): Promise<string>;
  
  /**
   * Retrieve aggregated analytics data
   */
  getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData>;
  
  /**
   * Export responses in specified format
   */
  exportResponses(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer>;
  
  /**
   * Delete a response by ID (admin only)
   */
  deleteResponse(responseId: string): Promise<void>;
  
  /**
   * Get total response count
   */
  getResponseCount(): Promise<number>;
  
  /**
   * Health check / verify backend connectivity
   */
  healthCheck(): Promise<{ status: 'ok' | 'error' }>;
}
```

### React Component Interfaces

#### QuestionnaireFormProps
```typescript
interface QuestionnaireFormProps {
  onSuccess?: (responseId: string) => void;
  onError?: (error: Error) => void;
  showProgress?: boolean;
  successRedirectUrl?: string;
}
```

#### DashboardGridProps
```typescript
interface DashboardGridProps {
  refreshInterval?: number; // milliseconds
  enableRealtime?: boolean;
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
}
```

#### StatCardProps
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  loading?: boolean;
}
```

---

## Data Models

### Core Type Definitions

#### QuestionnaireResponse
```typescript
interface QuestionnaireResponse {
  // Required: 8 SKM core questions (1-5 rating)
  q1_accessibility: number;
  q2_service_quality: number;
  q3_professionalism: number;
  q4_courtesy: number;
  q5_reliability: number;
  q6_security: number;
  q7_response_time: number;
  q8_facilities: number;
  
  // Optional: Additional fields
  q9_suggestions?: string;
  demographic_age?: string;
  demographic_service?: string;
  
  // System fields (added by backend)
  id?: string;
  timestamp?: Date;
  user_agent?: string;
  ip_hash?: string;
}
```

#### AnalyticsData
```typescript
interface AnalyticsData {
  totalResponses: number;
  avgSatisfaction: number;
  
  satisfactionDistribution: {
    verySatisfied: number;    // rating 5
    satisfied: number;         // rating 4
    neutral: number;           // rating 3
    dissatisfied: number;      // rating 2
    verydissatisfied: number;  // rating 1
  };
  
  dimensionAverages: {
    accessibility: number;
    serviceQuality: number;
    professionalism: number;
    courtesy: number;
    reliability: number;
    security: number;
    responseTime: number;
    facilities: number;
  };
  
  dailyTrend: Array<{
    date: Date;
    count: number;
  }>;
  
  completionRate: number;
}
```

#### AuthContext
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email?: string;
    role: 'admin' | 'viewer';
  };
  token?: string;
  expiresAt?: Date;
}
```

#### FormState
```typescript
interface FormState {
  currentStep: number;
  totalSteps: number;
  responses: Partial<QuestionnaireResponse>;
  isValid: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
}
```

---

## Error Handling

### Error Categories

#### Validation Errors
- Invalid satisfaction ratings (outside 1-5 range)
- Missing required fields
- Text field exceeding length limits
- Malformed request payloads

**Handling**: Return 400 Bad Request with detailed error messages

```json
{
  "error": "Validation failed",
  "details": {
    "q1_accessibility": "Must be between 1 and 5"
  }
}
```

#### Authentication Errors
- Missing or invalid admin token (Google Sheets)
- Expired JWT token (Supabase)
- Invalid credentials

**Handling**: Return 401 Unauthorized or 403 Forbidden

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token"
}
```

#### Backend Service Errors
- Google Sheets API quota exceeded
- Supabase database connection timeout
- Network failures

**Handling**: Return 503 Service Unavailable with retry guidance

```json
{
  "error": "Service unavailable",
  "retryAfter": 60,
  "message": "Backend service temporarily offline. Please try again later."
}
```

#### Rate Limiting
- Too many submissions from same IP
- Too many export requests from admin

**Handling**: Return 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 600,
  "message": "Too many requests. Please wait before trying again."
}
```

### Error Recovery Strategies

#### Frontend
- Display user-friendly toast notifications
- Preserve form state on network errors
- Implement exponential backoff for retries
- Fallback to cached data when backend unavailable

#### Backend
- Circuit breaker pattern to prevent cascading failures
- Async queuing for failed submissions (retry with exponential backoff)
- Fallback to secondary backend if primary unavailable

---

## Testing Strategy

### Unit Tests

#### Form Validation
- Test Zod schemas with valid and invalid inputs
- Verify all satisfaction ratings (1-5) accepted
- Verify out-of-range values rejected
- Test optional field validation

#### Calculations
- Verify average satisfaction calculation correctness
- Test satisfaction distribution counting
- Test per-dimension averages with edge cases

#### Backend Factory
- Verify correct backend instance created based on provider
- Test interface compliance for both implementations

### Integration Tests

#### Form Submission
- Submit complete questionnaire to each backend
- Verify response stored and retrievable
- Test with various demographic data combinations
- Test form submission under network latency

#### Analytics API
- Submit multiple responses
- Query analytics endpoint
- Verify aggregations are correct
- Test date range filtering

#### Export Functionality
- Generate CSV export from multiple responses
- Generate Excel export
- Verify data integrity round-trip (export → re-parse)
- Test with 100+ responses

#### Authentication
- Test Google Sheets token-based access
- Test Supabase JWT authentication and expiry
- Test unauthorized access rejection

### Property-Based Tests

#### Form Data Persistence (Property 1)
- Generate random valid responses
- Submit to backend
- Verify response queryable in analytics within 5 seconds
- Test with 100+ iterations across both backends

#### Analytics Aggregation (Property 3)
- Generate sets of responses with known satisfaction ratings
- Calculate average satisfaction
- Verify matches arithmetic mean
- Test with 50+ different response sets

#### Backend Interchangeability (Property 10)
- Run same test suite against both backends
- Verify identical results
- Compare response times and data consistency

### E2E Tests

#### Complete User Journey
- Navigate to form page
- Fill questionnaire on mobile/tablet/desktop
- Submit form
- Verify confirmation message
- Login to admin dashboard
- View analytics
- Export data

#### Admin Workflows
- Login with credentials
- View analytics dashboard
- Export to CSV and Excel
- Generate PDF report
- Logout

### Performance Tests

#### Load Testing (Supabase)
- Simulate 100+ concurrent form submissions
- Verify response times under 500ms
- Monitor database connection pool
- Verify no data loss

#### Query Performance
- Execute analytics queries with 10k+ responses
- Verify results return within 5 seconds
- Monitor query execution plans

### Security Tests

#### OWASP Top 10 Validation
- SQL Injection: Parameterized queries verified
- XSS Prevention: Input sanitization tested
- CSRF Protection: Token validation verified
- Rate Limiting: Verify limits enforced

#### Authentication & Authorization
- Verify unauthenticated access denied to admin endpoints
- Verify token expiry enforced
- Verify session invalidation on logout

### Accessibility Tests

#### WCAG 2.1 Level AA
- Keyboard navigation on form
- Screen reader testing with NVDA/JAWS
- Color contrast verification
- Form label associations

---

---

## Database Schemas

### Google Sheets Backend

**Primary Sheet: "responses"**

| Column | Type | Description |
|--------|------|-------------|
| `id` | String | Unique response ID (UUID) |
| `timestamp` | Timestamp | Submission datetime |
| `q1_accessibility` | Number | 1-5 rating |
| `q2_service_quality` | Number | 1-5 rating |
| `q3_professionalism` | Number | 1-5 rating |
| `q4_courtesy` | Number | 1-5 rating |
| `q5_reliability` | Number | 1-5 rating |
| `q6_security` | Number | 1-5 rating |
| `q7_response_time` | Number | 1-5 rating |
| `q8_facilities` | Number | 1-5 rating |
| `q9_suggestions` | String | Optional text feedback |
| `demographic_age` | String | Age group if collected |
| `demographic_service` | String | Service category if collected |
| `user_agent` | String | Browser/device identifier |
| `ip_hash` | String | Hashed IP for analytics |

**Secondary Sheet: "analytics"** (cache, updated hourly)

| Column | Type | Description |
|--------|------|-------------|
| `metric_date` | Date | Date of metric calculation |
| `total_responses` | Number | Count of responses to date |
| `avg_satisfaction` | Number | Overall average rating |
| `satisfaction_very_satisfied` | Number | Count (1-5 rating) |
| `satisfaction_satisfied` | Number | Count (4 rating) |
| `satisfaction_neutral` | Number | Count (3 rating) |
| `satisfaction_dissatisfied` | Number | Count (2 rating) |
| `satisfaction_very_dissatisfied` | Number | Count (1 rating) |
| `dimension_accessibility_avg` | Number | Q1 average |
| `dimension_quality_avg` | Number | Q2 average |
| `dimension_professionalism_avg` | Number | Q3 average |
| `dimension_courtesy_avg` | Number | Q4 average |
| `dimension_reliability_avg` | Number | Q5 average |
| `dimension_security_avg` | Number | Q6 average |
| `dimension_response_time_avg` | Number | Q7 average |
| `dimension_facilities_avg` | Number | Q8 average |
| `daily_submissions` | Number | Submissions on metric_date |

### Supabase Backend

#### Table: `responses`

```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- SKM Questions (1-5 rating)
  q1_accessibility SMALLINT CHECK (q1_accessibility BETWEEN 1 AND 5),
  q2_service_quality SMALLINT CHECK (q2_service_quality BETWEEN 1 AND 5),
  q3_professionalism SMALLINT CHECK (q3_professionalism BETWEEN 1 AND 5),
  q4_courtesy SMALLINT CHECK (q4_courtesy BETWEEN 1 AND 5),
  q5_reliability SMALLINT CHECK (q5_reliability BETWEEN 1 AND 5),
  q6_security SMALLINT CHECK (q6_security BETWEEN 1 AND 5),
  q7_response_time SMALLINT CHECK (q7_response_time BETWEEN 1 AND 5),
  q8_facilities SMALLINT CHECK (q8_facilities BETWEEN 1 AND 5),
  
  -- Demographics (optional)
  q9_suggestions TEXT,
  demographic_age VARCHAR(20),
  demographic_service VARCHAR(100),
  
  -- Metadata
  user_agent TEXT,
  ip_hash VARCHAR(64),
  
  -- Full-text search index
  CONSTRAINT all_questions_filled CHECK (
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

CREATE INDEX idx_responses_created_at ON responses(created_at DESC);
CREATE INDEX idx_responses_ip_hash ON responses(ip_hash);
```

#### Table: `analytics_cache`

```sql
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  total_responses BIGINT DEFAULT 0,
  avg_satisfaction NUMERIC(3,2),
  
  -- Satisfaction distribution (counts)
  satisfaction_very_satisfied BIGINT DEFAULT 0,
  satisfaction_satisfied BIGINT DEFAULT 0,
  satisfaction_neutral BIGINT DEFAULT 0,
  satisfaction_dissatisfied BIGINT DEFAULT 0,
  satisfaction_very_dissatisfied BIGINT DEFAULT 0,
  
  -- Per-dimension averages
  dimension_accessibility_avg NUMERIC(3,2),
  dimension_quality_avg NUMERIC(3,2),
  dimension_professionalism_avg NUMERIC(3,2),
  dimension_courtesy_avg NUMERIC(3,2),
  dimension_reliability_avg NUMERIC(3,2),
  dimension_security_avg NUMERIC(3,2),
  dimension_response_time_avg NUMERIC(3,2),
  dimension_facilities_avg NUMERIC(3,2),
  
  -- Daily metrics
  daily_submissions BIGINT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(metric_date)
);

CREATE INDEX idx_analytics_cache_date ON analytics_cache(metric_date DESC);
```

#### Table: `admin_sessions` (Supabase Auth handles this)

Supabase Auth manages sessions automatically. Custom audit logging can be stored:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50),
  resource VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);

CREATE INDEX idx_audit_logs_admin_timestamp ON audit_logs(admin_id, timestamp DESC);
```

---

## API Endpoints

### Public Endpoints

#### `POST /api/submit`
- **Description**: Submit questionnaire response
- **Authentication**: None (public)
- **Request Body**:
```json
{
  "q1_accessibility": 4,
  "q2_service_quality": 5,
  "q3_professionalism": 4,
  "q4_courtesy": 5,
  "q5_reliability": 4,
  "q6_security": 3,
  "q7_response_time": 5,
  "q8_facilities": 4,
  "q9_suggestions": "Great service!",
  "demographic_age": "25-34",
  "demographic_service": "Health"
}
```
- **Response**: `{ id: "uuid", message: "Response submitted successfully" }`
- **Error Handling**: Validates all required fields; returns 400 Bad Request if invalid

#### `GET /api/verify` (Liveness check)
- **Response**: `{ status: "ok", backend: "google-sheets" | "supabase" }`

### Protected Endpoints (Admin Only)

#### `GET /api/analytics`
- **Authentication**: Bearer token (Google Sheets) or JWT (Supabase)
- **Query Params**: `?start_date=2024-01-01&end_date=2024-12-31` (optional)
- **Response**:
```json
{
  "total_responses": 1250,
  "avg_satisfaction": 4.2,
  "satisfaction_distribution": {
    "very_satisfied": 500,
    "satisfied": 450,
    "neutral": 200,
    "dissatisfied": 80,
    "very_dissatisfied": 20
  },
  "dimension_averages": {
    "accessibility": 4.1,
    "service_quality": 4.3,
    "professionalism": 4.2,
    "courtesy": 4.4,
    "reliability": 4.0,
    "security": 3.8,
    "response_time": 4.2,
    "facilities": 3.9
  },
  "daily_trend": [
    { "date": "2024-01-01", "count": 45 },
    { "date": "2024-01-02", "count": 52 }
  ]
}
```

#### `GET /api/export?format=csv|excel`
- **Authentication**: Bearer token or JWT
- **Query Params**: `?format=csv&start_date=2024-01-01&end_date=2024-12-31`
- **Response**: Binary file (CSV or Excel)
- **Headers**: `Content-Disposition: attachment; filename="responses_2024.csv"`

#### `GET /api/export/pdf`
- **Authentication**: Bearer token or JWT
- **Response**: PDF report with charts and summary
- **Generation**: Server-side (Supabase Edge Functions) or client-side (jsPDF)

#### `POST /api/auth/login` (Supabase Only)
- **Request**: `{ email, password }` or social login redirect
- **Response**: JWT token and session info

#### `POST /api/auth/logout` (Supabase Only)
- **Description**: Invalidate session
- **Response**: `{ message: "Logged out successfully" }`

---

## Security Considerations

### Authentication & Authorization

#### Google Sheets Option
- **Admin Token**: Random 32-character token stored in environment variables
- **URL-based Access**: `?admin=<token>` query parameter (HTTPS only)
- **Token Rotation**: Manual rotation recommended quarterly
- **No Session Management**: Stateless token verification
- **Limitations**:
  - Single shared token (no granular admin roles)
  - Token exposed in URL (visible in browser history, server logs)
  - Mitigation: Use HTTPS + short-lived session in frontend

#### Supabase Option
- **Email/Password or Social Login**: Supabase Auth handles secure authentication
- **JWT Tokens**: Issued by Supabase, verified on API routes
- **Refresh Tokens**: Long-lived tokens for session persistence
- **Session Expiry**: Configurable (default: 24 hours)
- **RBAC**: Future role-based access control via JWT claims

### Data Protection

#### In Transit
- **HTTPS/TLS 1.3**: All communication encrypted
- **CORS Policy**: Restrict requests to frontend domain
- **CSP Headers**: Content Security Policy to prevent XSS

#### At Rest
- **Google Sheets**:
  - Sheets stored in Google Cloud (encrypted by default)
  - Optional: client-side encryption for sensitive responses
  - Audit trail via Google Sheets audit log
  
- **Supabase**:
  - PostgreSQL encryption at rest (AWS managed keys)
  - Optional: Row-level security (RLS) policies
  - Automatic daily backups

### Input Validation & Sanitization

```typescript
// Zod schema for questionnaire submission
const QuestionnaireSchema = z.object({
  q1_accessibility: z.number().int().min(1).max(5),
  q2_service_quality: z.number().int().min(1).max(5),
  // ... other questions
  q9_suggestions: z.string().max(500).optional(),
  demographic_age: z.string().max(20).optional(),
  demographic_service: z.string().max(100).optional(),
});
```

- **Client-side Validation**: React Hook Form + Zod
- **Server-side Validation**: Zod on API routes (belt and suspenders)
- **Sanitization**: DOMPurify for any displayed user text
- **SQL Injection Prevention**: Parameterized queries (ORM-level with Supabase)

### CORS & CSRF Protection

```typescript
// CORS Headers (Next.js API route)
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  
  if (origin !== process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // CSRF Token in form submission (Next.js built-in)
  // ...
}
```

### Rate Limiting

#### Form Submission
- **Per IP**: Max 5 submissions per 10 minutes (prevents spam)
- **Per Session**: Max 1 submission per user (localStorage fingerprint)
- **Implementation**: Middleware on `/api/submit`

#### Admin Dashboard
- **Per User**: No rate limiting (trusted admin)
- **Export Endpoint**: Max 5 exports per hour per admin

### Error Handling & Information Disclosure

- **Generic Error Messages**: "An error occurred" instead of revealing backend details
- **No Stack Traces**: Server errors logged server-side only
- **Sentry Integration**: Non-sensitive error tracking for debugging
- **Admin-only Details**: Full error details visible only in admin dashboard audit logs

### PII & Privacy

- **Minimal Data Collection**: SKM core questions only (no names, emails by default)
- **IP Hashing**: SHA-256 hash of IP address (not reversible)
- **Data Retention**: Responses kept indefinitely (configurable retention policy)
- **GDPR Compliance**: Data export and deletion capabilities for future multi-region support
- **No Third-party Tracking**: No Google Analytics or external scripts on form page

### API Security Headers

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  return response;
}
```

### Deployment Security

#### Google Sheets
- OAuth 2.0 credentials stored in `.env.local` (never committed)
- Service account key rotated annually
- API key restricted to Sheets API only

#### Supabase
- Database password: Strong, randomly generated
- Anon key: Publicly exposed (RLS policies protect data)
- Service role key: Secret, stored only on backend
- Connection string: SSL enforced

#### Vercel
- Environment variables encrypted at rest
- GitHub OIDC for secure deployment tokens
- Preview deployments: Password protected (optional)

---

## Real-Time Updates

### Google Sheets Option
- **Polling**: Frontend polls `/api/analytics` every 30 seconds
- **Cache Invalidation**: Server caches responses for 30 seconds
- **Limitation**: Depends on Apps Script quota (limited API calls/day)

### Supabase Option
- **WebSocket Subscription**: Supabase Realtime listens to `responses` table
- **Live Dashboard**: Charts update within 1-2 seconds of new submission
- **Event System**: Custom events triggered on analytics_cache updates

```typescript
// Real-time subscription (Supabase)
const subscription = supabase
  .from('responses')
  .on('INSERT', (payload) => {
    // Trigger dashboard refresh
    queryClient.invalidateQueries(['analytics']);
  })
  .subscribe();
```

---

## Performance Optimization

### Frontend
- **Code Splitting**: Lazy load dashboard components (only loaded for admins)
- **Image Optimization**: Next.js Image component with automatic formats
- **CSS-in-JS**: Tailwind JIT compilation, only used classes in bundle
- **Bundling**: Minified production build (~50-80KB gzipped)

### Backend
- **Caching**:
  - Analytics cached for 30 seconds (Google Sheets) or 1 minute (Supabase)
  - Export generation cached for 5 minutes
- **Query Optimization**: Indexed timestamp columns for analytics queries
- **Pagination**: Export endpoint streams large datasets (prevents memory bloat)

### Database
- **Indexes**: Created on frequently queried columns (`created_at`, `ip_hash`)
- **Materialized Views** (Supabase): Pre-calculated analytics refreshed hourly
- **Query Timeout**: 10-second timeout to prevent runaway queries

---

## Error Handling & Resilience

### Graceful Degradation
- **Backend Unavailable**: Form still submits to alternative backend or queue
- **Analytics Offline**: Dashboard shows cached data with "last updated X minutes ago"
- **Export Timeout**: User receives in-progress indicator, email link when ready

### Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private failureCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }
    
    try {
      const result = await fn();
      this.failureCount = 0;
      this.state = 'CLOSED';
      return result;
    } catch (error) {
      this.failureCount++;
      if (this.failureCount > 5) {
        this.state = 'OPEN';
      }
      throw error;
    }
  }
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form Submission Persistence

*For any* valid questionnaire response with all required fields populated, submitting the form SHALL store the response in the selected backend and make it queryable for analytics within 5 seconds.

**Validates: Requirements AC3, AC9, AC10**

### Property 2: Response Data Integrity Round-Trip

*For any* stored response in the backend, exporting to CSV or Excel and re-parsing the data SHALL produce response values identical to the originally submitted values.

**Validates: Requirements AC7, AC8**

### Property 3: Analytics Aggregation Correctness

*For any* set of responses with known satisfaction ratings, the calculated average satisfaction score SHALL equal the arithmetic mean of all individual ratings.

**Validates: Requirements AC6**

### Property 4: Dashboard Protection

*For any* unauthenticated request to the admin dashboard API endpoint, the system SHALL return a 401/403 error and deny access to analytics data.

**Validates: Requirements AC5, AC12, AC13**

### Property 5: Form Accessibility on Mobile

*For any* smartphone viewport (320px-480px width), the questionnaire form layout SHALL render as single-column, all buttons SHALL be minimum 44x44 pixels, and form submission SHALL complete without requiring horizontal scrolling.

**Validates: Requirements AC1, AC14**

### Property 6: SKM Template Compliance

*For any* deployed questionnaire, the questions and scoring dimensions SHALL match the standard SKM format with 8 core satisfaction dimensions covering accessibility, quality, professionalism, courtesy, reliability, security, response time, and facilities.

**Validates: Requirements AC2, AC15**

### Property 7: Public Form Anonymity

*For any* form submission from an unauthenticated user, the system SHALL accept and store the response without requiring login, email, or user account creation.

**Validates: Requirements AC4**

### Property 8: Real-Time Analytics Update

*For any* Supabase backend deployment, submitting a new response SHALL cause the analytics dashboard to reflect the updated satisfaction metrics within 2 seconds without requiring manual refresh.

**Validates: Requirements AC6, AC10**

### Property 9: Export Format Consistency

*For any* export request (CSV or Excel format), the exported file SHALL contain all response records submitted to date with consistent column ordering and data types.

**Validates: Requirements AC7, AC8**

### Property 10: Backend Implementation Interchangeability

*For any* feature set (form submission, analytics, export), the Google Sheets backend and Supabase backend SHALL produce identical results and user experience when configured.

**Validates: Requirements AC9, AC10**

---

## Deployment Configuration

### Environment Variables

```env
# Common
NEXT_PUBLIC_BACKEND_PROVIDER=supabase|google-sheets
NEXT_PUBLIC_FRONTEND_URL=https://example.com
NEXT_PUBLIC_API_BASE=https://example.com/api

# Google Sheets Option
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_SHEETS_ID=...
ADMIN_TOKEN=...

# Supabase Option
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
```

### Vercel Deployment

```toml
# vercel.json
{
  "buildCommand": "npm run build",
  "env": {
    "NEXT_PUBLIC_BACKEND_PROVIDER": "@skm/backend_provider"
  },
  "functions": {
    "api/**": {
      "maxDuration": 10
    }
  }
}
```

---

## Future Extensions

1. **Multi-Language Support**: i18n for Indonesian/English
2. **Custom Question Builder**: Admin ability to configure questions
3. **Advanced Analytics**: Predictive trends, anomaly detection
4. **Mobile App**: React Native version for offline support
5. **Multi-Region Deployment**: Separate instances per region with data aggregation
6. **Role-Based Access**: Multiple admin roles (viewer, editor, admin)
7. **Webhooks**: Trigger external systems on new responses
8. **Email Notifications**: Automatic reports sent to stakeholders

---

## Summary

This design provides a robust, scalable architecture for the SKM Questionnaire Website with:

- **Factory Pattern**: Seamless backend switching between Google Sheets and Supabase
- **Modern Tech Stack**: React/Next.js + Tailwind for responsive, accessible UI
- **Comprehensive Database Schemas**: Normalized PostgreSQL (Supabase) and Google Sheets structure
- **Security-First Approach**: Authentication, input validation, rate limiting, HTTPS/TLS
- **Performance Optimized**: Caching, indexing, code splitting, real-time updates
- **Production Ready**: Error handling, monitoring, graceful degradation, deployment automation

The dual-backend approach allows users to start with zero-cost Google Sheets and scale to production-grade Supabase without code changes.
