# Backend Abstraction Layer - Contract Documentation

This document defines the complete backend contract for the SKM Questionnaire Website. All backend implementations must comply with this interface to ensure consistent behavior and seamless switching.

## Table of Contents
1. [IBackend Interface](#ibackend-interface)
2. [Type Definitions](#type-definitions)
3. [Error Handling](#error-handling)
4. [Data Models](#data-models)
5. [Implementation Requirements](#implementation-requirements)

---

## IBackend Interface

### Location
`src/lib/types/backend.ts`

### Core Methods

#### `submitForm(data: QuestionnaireResponse): Promise<SubmitFormResponse>`

**Purpose:** Submit a complete questionnaire response to the backend storage.

**Parameters:**
- `data: QuestionnaireResponse` - Complete response with Q1-Q20 (mandatory) and Q21 (optional)

**Returns:** `Promise<SubmitFormResponse>`
```typescript
interface SubmitFormResponse {
  responseId: string      // Unique identifier for the response (UUID)
  timestamp: Date         // Submission timestamp in UTC
  message: string         // Success message
}
```

**Requirements:**
- ✅ Must validate all mandatory questions (Q1-Q20) are present
- ✅ Must validate satisfaction ratings are in range 1-5
- ✅ Must guarantee atomic submission (all or nothing)
- ✅ Must preserve all response data without truncation
- ✅ Must generate unique response ID
- ✅ Must timestamp submission in UTC
- ✅ Must handle duplicate detection if enabled

**Error Handling:**
- Throws `Error` if validation fails
- Throws `Error` if backend storage fails
- Throws `Error` if backend is unavailable

**Implementation Examples:**

**Google Sheets:**
```
1. POST to Google Apps Script webhook
2. Apps Script validates data
3. Apps Script appends row to sheet
4. Apps Script returns response ID (row index or UUID)
```

**Supabase:**
```
1. Insert into survey_responses table
2. Database validates constraints
3. Return UUID from INSERT ... RETURNING
```

---

#### `fetchAnalytics(options?: AnalyticsQueryOptions): Promise<AnalyticsData>`

**Purpose:** Retrieve aggregated analytics from all stored responses.

**Parameters:**
- `options?: AnalyticsQueryOptions` - Optional query filters
```typescript
interface AnalyticsQueryOptions {
  startDate?: Date                          // Filter responses after this date
  endDate?: Date                            // Filter responses before this date
  groupBy?: 'day' | 'week' | 'month'       // Trend grouping interval
}
```

**Returns:** `Promise<AnalyticsData>`
```typescript
interface AnalyticsData {
  // Overall statistics
  totalResponses: number                    // Total responses in database
  avgSatisfaction: number                   // Mean satisfaction (1-5)
  satisfactionRate: number                  // % very satisfied + satisfied

  // Satisfaction Distribution (5-point Likert scale)
  satisfactionDistribution: {
    verySatisfied: number                   // Count of rating 5
    satisfied: number                       // Count of rating 4
    neutral: number                         // Count of rating 3
    dissatisfied: number                    // Count of rating 2
    veryDissatisfied: number                // Count of rating 1
  }

  // SKM Dimension Averages (8 main categories)
  dimensionAverages: {
    accessibility: number                   // Q1, Q2, Q3
    serviceQuality: number                  // Q4, Q5, Q6
    professionalism: number                 // Q7, Q8
    courtesy: number                        // Q9, Q10
    reliability: number                     // Q11, Q12, Q13
    security: number                        // Q14, Q15
    responseTime: number                    // Q16, Q17, Q18
    facilities: number                      // Q19, Q20
  }

  // Dimension Response Counts
  dimensionResponseCounts: Record<SKMCategory, number>

  // Time-based trends
  dailyTrend: Array<{
    date: Date                              // Date (start of grouping period)
    count: number                           // Response count for period
    avgSatisfaction: number                 // Average satisfaction for period
  }>

  // Completion metrics
  completionRate: number                    // % who answered all mandatory questions
  averageCompletionTime: number             // Average time in seconds

  // Category insights
  mostPositiveCategory?: SKMCategory        // Highest average rating
  mostNegativeCategory?: SKMCategory        // Lowest average rating
}
```

**Requirements:**
- ✅ Must include 100% of submitted responses
- ✅ Must calculate accurate averages (arithmetic mean)
- ✅ Must support date range filtering
- ✅ Must provide per-dimension aggregation
- ✅ Must calculate completion rate accurately
- ✅ Must support optional grouping (day/week/month)
- ✅ Results must be consistent within 5 second latency

**Error Handling:**
- Throws `Error` if backend is unavailable
- Returns empty results if no responses available

**Implementation Examples:**

**Google Sheets:**
```
1. Query entire responses sheet
2. Filter by date range if provided
3. Calculate aggregates in-memory or on Apps Script
4. Cache results for 5 minutes
```

**Supabase:**
```
1. Query survey_responses table with date filters
2. Use SQL aggregates (AVG, COUNT) for performance
3. Join to analytics_cache table for pre-calculated daily trends
4. Return results from single query
```

---

#### `exportData(format: 'csv' | 'excel', startDate?: Date, endDate?: Date): Promise<Buffer>`

**Purpose:** Export all responses in specified format with optional filtering.

**Parameters:**
- `format: 'csv' | 'excel'` - Export format
- `startDate?: Date` - Optional start date filter
- `endDate?: Date` - Optional end date filter

**Returns:** `Promise<Buffer>` - Binary file contents ready for download

**Requirements:**
- ✅ Must include all question responses (Q1-Q21)
- ✅ Must include response metadata (timestamp, demographics)
- ✅ Must include question text as column headers
- ✅ Must use proper encoding (UTF-8 for CSV, XLSX for Excel)
- ✅ Must respect date range filters
- ✅ Must handle optional fields gracefully
- ✅ Must be deterministic (same data produces same file)

**File Format - CSV:**
```
Response ID,Timestamp,Q1,Q2,...,Q21,Age,Gender,...
uuid-123,2024-01-15T10:30:00Z,5,4,...,Great service!,25-34,Male,...
uuid-124,2024-01-15T11:45:00Z,4,3,...,,35-44,Female,...
```

**File Format - Excel:**
- Sheet name: "SKM Responses"
- Column headers: Response ID, Timestamp, Q1-Q21, Demographics
- Formatted columns with proper data types
- Frozen header row

**Error Handling:**
- Throws `Error` if backend is unavailable
- Throws `Error` if export generation fails
- Returns empty buffer if no responses match filters

---

#### `deleteResponse(responseId: string): Promise<void>`

**Purpose:** Delete a specific response (admin only).

**Parameters:**
- `responseId: string` - Unique identifier of response to delete

**Returns:** `Promise<void>`

**Requirements:**
- ✅ Must verify responseId exists before deletion
- ✅ Must be atomic (complete deletion or error)
- ✅ Should log deletion for audit trail
- ✅ Must not fail if response doesn't exist (idempotent)

**Error Handling:**
- Throws `Error` if backend is unavailable
- Does not throw if response not found (idempotent)

---

#### `getResponseCount(): Promise<number>`

**Purpose:** Get total count of responses in backend.

**Parameters:** None

**Returns:** `Promise<number>` - Total response count

**Requirements:**
- ✅ Must return accurate count
- ✅ Must complete within 1 second
- ✅ Can use cache if available

**Error Handling:**
- Throws `Error` if backend is unavailable
- Returns 0 if no responses exist

---

#### `healthCheck(): Promise<HealthCheckResponse>`

**Purpose:** Verify backend connectivity and availability.

**Parameters:** None

**Returns:** `Promise<HealthCheckResponse>`
```typescript
interface HealthCheckResponse {
  status: 'ok' | 'error'          // Backend status
  backend: BackendType            // Which backend ('google-sheets' or 'supabase')
  message?: string                // Optional status message
  timestamp: Date                 // Check timestamp
}
```

**Requirements:**
- ✅ Must complete within 2 seconds
- ✅ Must verify actual connectivity (not just initialization)
- ✅ Should test write capability if possible

**Error Handling:**
- Returns `{ status: 'error', ... }` if backend unavailable
- Does not throw exceptions

---

## Type Definitions

### QuestionnaireResponse

**Location:** `src/lib/types/questionnaire.ts`

Complete response structure for a single survey submission:

```typescript
interface QuestionnaireResponse {
  // Core SKM Questions (Q1-Q20) - Mandatory
  Q1?: number    // Accessibility - Access to facilities (1-5)
  Q2?: number    // Accessibility - Information availability (1-5)
  Q3?: number    // Accessibility - Service procedure clarity (1-5)
  Q4?: number    // Service Quality - Overall quality (1-5)
  Q5?: number    // Service Quality - Accuracy and precision (1-5)
  Q6?: number    // Service Quality - Consistency (1-5)
  Q7?: number    // Professionalism - Staff competence (1-5)
  Q8?: number    // Professionalism - Problem-solving ability (1-5)
  Q9?: number    // Courtesy - Courtesy and respect (1-5)
  Q10?: number   // Courtesy - Friendliness and hospitality (1-5)
  Q11?: number   // Reliability - Service consistency (1-5)
  Q12?: number   // Reliability - Promise fulfillment (1-5)
  Q13?: number   // Reliability - Freedom from errors (1-5)
  Q14?: number   // Security - Personal information protection (1-5)
  Q15?: number   // Security - Transaction confidentiality (1-5)
  Q16?: number   // Response Time - Speed of service (1-5)
  Q17?: number   // Response Time - Process efficiency (1-5)
  Q18?: number   // Response Time - Minimal waiting time (1-5)
  Q19?: number   // Facilities - Physical facilities adequacy (1-5)
  Q20?: number   // Facilities - Equipment functionality (1-5)

  // Optional Question
  Q21?: string   // Open-ended suggestions or comments

  // Demographics (Optional)
  demographic_age?: string           // e.g., "25-34", "35-44"
  demographic_gender?: string        // e.g., "Male", "Female"
  demographic_education?: string     // e.g., "Bachelor", "Master"
  demographic_service?: string       // Service type e.g., "Health"

  // System Fields (added by backend)
  id?: string                        // Response UUID
  timestamp?: Date                   // Submission datetime
  user_agent?: string                // Browser/device identifier
  ip_hash?: string                   // SHA-256 hash of IP address
  completionPercentage?: number      // 0-100
}
```

### SKMCategory Type

```typescript
type SKMCategory = 
  | 'accessibility'
  | 'quality'
  | 'professionalism'
  | 'courtesy'
  | 'reliability'
  | 'security'
  | 'response_time'
  | 'facilities'
```

### BackendType

```typescript
type BackendType = 'google-sheets' | 'supabase'
```

---

## Error Handling

### Standard Error Responses

All backend implementations should throw errors with descriptive messages:

```typescript
throw new Error('Validation failed: Q1 rating must be between 1 and 5')
throw new Error('Backend unavailable: connection timeout')
throw new Error('Response not found: uuid-123 does not exist')
```

### Error Categories

1. **Validation Errors** (400)
   - Invalid satisfaction rating (outside 1-5)
   - Missing mandatory questions
   - Malformed request data

2. **Authentication Errors** (401/403)
   - Missing or invalid admin token
   - Expired session
   - Insufficient permissions

3. **Not Found Errors** (404)
   - Response ID doesn't exist
   - Backend not configured

4. **Backend Service Errors** (503)
   - Database connection timeout
   - API rate limit exceeded
   - External service unavailable

---

## Data Models

### SKM Dimensions

8 main service quality dimensions used in aggregation:

| Dimension | Questions | Focus Area |
|-----------|-----------|-----------|
| Accessibility | Q1, Q2, Q3 | Ease of access, information availability, procedure clarity |
| Service Quality | Q4, Q5, Q6 | Overall quality, accuracy, consistency |
| Professionalism | Q7, Q8 | Staff competence, problem-solving ability |
| Courtesy | Q9, Q10 | Respect, friendliness, hospitality |
| Reliability | Q11, Q12, Q13 | Consistency, promise fulfillment, error-free service |
| Security | Q14, Q15 | Data protection, transaction confidentiality |
| Response Time | Q16, Q17, Q18 | Speed, efficiency, minimal waiting |
| Facilities | Q19, Q20 | Physical adequacy, equipment functionality |

### Satisfaction Scale

| Rating | Label | Description |
|--------|-------|-------------|
| 5 | Very Satisfied | Excellent service exceeds expectations |
| 4 | Satisfied | Good service meets expectations |
| 3 | Neutral | Adequate service meets basic needs |
| 2 | Dissatisfied | Service falls below expectations |
| 1 | Very Dissatisfied | Service is unacceptable |

---

## Implementation Requirements

### For Google Sheets Backend

- Must use Google Sheets API v4 for read/write
- Must use Google Apps Script for form submission handling
- Must use OAuth 2.0 for authentication
- Must support admin token-based API auth
- Must cache analytics with 5-minute TTL
- Must append responses atomically to sheet

### For Supabase Backend

- Must use Supabase PostgreSQL client
- Must use JWT authentication
- Must implement Row-Level Security (RLS) policies
- Must support real-time subscriptions (optional)
- Must use parameterized queries for SQL injection prevention
- Must support database transactions for atomic writes

### Shared Requirements

- ✅ All methods must be async (return Promises)
- ✅ Error messages must be descriptive
- ✅ Must handle network timeouts gracefully
- ✅ Must support concurrent requests
- ✅ Results must be deterministic
- ✅ All timestamps must be UTC

---

## Backward Compatibility

The backend strategy interface is exported with a type alias for backward compatibility:

```typescript
export type BackendStrategy = IBackend
```

Existing code using `BackendStrategy` will continue to work while new code should use `IBackend`.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial backend abstraction layer definition |

