# Backend Abstraction Layer Contract

## Overview

The Backend Abstraction Layer defines a unified interface (`BackendStrategy`) that all backend implementations must implement. This contract ensures consistent behavior across different storage solutions (Google Sheets, Supabase, etc.) and enables seamless runtime switching between backends.

**Status**: Task 5 - Type definitions and interfaces complete  
**Last Updated**: 2024  
**Implementation Requirements**: AC9 (Google Sheets), AC10 (Supabase)

---

## Core Concepts

### Backend Strategy Interface

The `BackendStrategy` interface defines all required methods that a backend implementation must provide:

```typescript
interface BackendStrategy {
  submitResponse(data: QuestionnaireResponse): Promise<string>
  getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData>
  exportResponses(format: 'csv' | 'excel', startDate?: Date, endDate?: Date): Promise<Buffer>
  deleteResponse(responseId: string): Promise<void>
  getResponseCount(): Promise<number>
  healthCheck(): Promise<{ status: 'ok' | 'error' }>
}
```

### Shared Type System

All backends share common data types to ensure interoperability:

- **`QuestionnaireResponse`** (alias: `SurveyResponse`): Complete survey response with all answers
- **`AnalyticsData`** (alias: `DashboardMetrics`): Aggregated analytics and statistics
- **`SubmitResponse`** (alias: `SubmitFormResponse`): Response confirmation after submission
- **`BackendType`**: Union type indicating which backend is active
- **`BackendConfig`**: Configuration object for backend initialization

---

## Method Specifications

### 1. submitResponse(data: QuestionnaireResponse): Promise<string>

**Purpose**: Submit a complete questionnaire response to the backend.

**Parameters**:
- `data: QuestionnaireResponse` - Complete survey response with all question answers

**Returns**: 
- `Promise<string>` - Unique response ID for the submitted questionnaire

**Behavior**:
- Validates all mandatory questions (Q1-Q20) are present and in valid range (1-5)
- Validates optional fields (Q21, demographics) are properly formatted
- Performs atomic storage: entire response stored or none (no partial data)
- Stores response metadata (timestamp, user agent, IP hash)
- Returns unique identifier for confirmation to respondent

**Error Handling**:
- Throws `Error` if validation fails with descriptive message
- Throws `Error` if backend connection fails
- Throws `Error` if data cannot be atomically stored

**Validation Rules**:
```typescript
// All mandatory questions (Q1-Q20) must be:
- Present in the data object
- Numbers in range 1-5 (integer)

// Optional question (Q21) if provided must be:
- String with maximum 500 characters

// Demographics if provided must be:
- demographic_age: string, valid from predefined list
- demographic_gender: string, valid from predefined list
- demographic_education: string, valid from predefined list
- demographic_service: string, valid from predefined list
```

**Example Request**:
```json
{
  "Q1": 5,
  "Q2": 4,
  "Q3": 5,
  "Q4": 4,
  "Q5": 4,
  "Q6": 3,
  "Q7": 4,
  "Q8": 5,
  "Q9": 4,
  "Q10": 5,
  "Q11": 4,
  "Q12": 4,
  "Q13": 5,
  "Q14": 4,
  "Q15": 4,
  "Q16": 5,
  "Q17": 4,
  "Q18": 5,
  "Q19": 4,
  "Q20": 4,
  "Q21": "Great service!",
  "demographic_age": "25-34",
  "demographic_service": "Health"
}
```

**Example Response**:
```
"550e8400-e29b-41d4-a716-446655440000"
```

---

### 2. getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData>

**Purpose**: Retrieve aggregated analytics data from all stored responses.

**Parameters**:
- `startDate?: Date` - Optional start date filter (inclusive)
- `endDate?: Date` - Optional end date filter (inclusive)

**Returns**: 
- `Promise<AnalyticsData>` - Aggregated analytics and statistics

**Behavior**:
- Queries all responses in the backend (optionally filtered by date range)
- Calculates aggregated metrics:
  - Total response count
  - Average satisfaction score (arithmetic mean of all ratings 1-5)
  - Satisfaction distribution (count by rating)
  - Per-dimension averages (8 SKM dimensions)
  - Daily submission trends
  - Completion rate (% of all mandatory questions answered)
- Returns complete analytics object for dashboard visualization

**Error Handling**:
- Throws `Error` if backend connection fails
- Throws `Error` if date range is invalid (startDate > endDate)
- Returns zero values if no responses match filter

**Analytics Object Structure**:
```typescript
interface AnalyticsData {
  // Overall statistics
  totalResponses: number                    // Total surveys submitted
  avgSatisfaction: number                   // Mean of all satisfaction ratings (1-5)
  satisfactionRate: number                  // % who answered 4-5 (satisfied+very satisfied)

  // Distribution of satisfaction levels (1-5 Likert scale)
  satisfactionDistribution: {
    verySatisfied: number      // Count of responses with rating 5
    satisfied: number          // Count of responses with rating 4
    neutral: number            // Count of responses with rating 3
    dissatisfied: number       // Count of responses with rating 2
    veryDissatisfied: number   // Count of responses with rating 1
  }

  // Per-dimension averages (8 SKM dimensions)
  dimensionAverages: {
    accessibility: number      // Q1, Q2, Q3 average
    serviceQuality: number     // Q4, Q5, Q6 average
    professionalism: number    // Q7, Q8 average
    courtesy: number           // Q9, Q10 average
    reliability: number        // Q11, Q12, Q13 average
    security: number           // Q14, Q15 average
    responseTime: number       // Q16, Q17, Q18 average
    facilities: number         // Q19, Q20 average
  }

  // Per-dimension response counts
  dimensionResponseCounts: Record<SKMCategory, number>

  // Time-series data for trend visualization
  dailyTrend: Array<{
    date: Date                              // Date of submissions
    count: number                           // Number of submissions on that date
    avgSatisfaction: number                 // Average satisfaction for that date
  }>

  // Completion metrics
  completionRate: number                    // % who completed all 20 mandatory questions
  averageCompletionTime: number             // Avg time in seconds to complete form

  // Dimensional insights
  mostPositiveCategory?: SKMCategory        // Highest scoring dimension
  mostNegativeCategory?: SKMCategory        // Lowest scoring dimension
}
```

**Example Response**:
```json
{
  "totalResponses": 1250,
  "avgSatisfaction": 4.2,
  "satisfactionRate": 75.5,
  "satisfactionDistribution": {
    "verySatisfied": 500,
    "satisfied": 450,
    "neutral": 200,
    "dissatisfied": 80,
    "veryDissatisfied": 20
  },
  "dimensionAverages": {
    "accessibility": 4.1,
    "serviceQuality": 4.3,
    "professionalism": 4.2,
    "courtesy": 4.4,
    "reliability": 4.0,
    "security": 3.8,
    "responseTime": 4.2,
    "facilities": 3.9
  },
  "dailyTrend": [
    {
      "date": "2024-01-01",
      "count": 45,
      "avgSatisfaction": 4.1
    }
  ],
  "completionRate": 98.5,
  "averageCompletionTime": 420,
  "mostPositiveCategory": "courtesy",
  "mostNegativeCategory": "security"
}
```

---

### 3. exportResponses(format: 'csv' | 'excel', startDate?: Date, endDate?: Date): Promise<Buffer>

**Purpose**: Export all responses in specified format (CSV or Excel).

**Parameters**:
- `format: 'csv' | 'excel'` - Export format
- `startDate?: Date` - Optional start date filter
- `endDate?: Date` - Optional end date filter

**Returns**: 
- `Promise<Buffer>` - Binary file buffer ready for download

**Behavior**:
- Queries all responses matching date filter
- Converts to specified format (CSV or XLSX)
- Includes complete question text and response data
- Adds metadata columns (timestamp, respondent info if provided)
- Formats for easy import into analysis tools

**Error Handling**:
- Throws `Error` if format is invalid
- Throws `Error` if backend connection fails
- Returns empty file structure if no responses match filter

**CSV Structure**:
```
ID,Timestamp,Q1,Q2,Q3,...,Q20,Q21,Age,Gender,Education,Service
<uuid>,2024-01-01T10:30:00Z,5,4,5,...,4,Great service!,25-34,Male,Bachelor,Health
...
```

**Excel Structure**:
- Single sheet named "Responses"
- Column headers: ID, Timestamp, Q1, Q2, ..., Q20, Q21, demographics
- One row per response
- Formatted with borders and headers

---

### 4. deleteResponse(responseId: string): Promise<void>

**Purpose**: Delete a specific response by ID (admin only).

**Parameters**:
- `responseId: string` - Unique identifier of response to delete

**Returns**: 
- `Promise<void>` - Resolves when deletion is complete

**Behavior**:
- Finds response by unique ID
- Permanently deletes the response record
- Audit logs the deletion action

**Error Handling**:
- Throws `Error` if response not found
- Throws `Error` if backend connection fails
- Throws `Error` if admin authentication fails (handled by API middleware)

**Security Considerations**:
- This method should only be called after admin authentication is verified
- API middleware must validate admin credentials before calling this method
- Deletion action should be logged for audit trail

---

### 5. getResponseCount(): Promise<number>

**Purpose**: Get total count of responses in the backend.

**Parameters**: None

**Returns**: 
- `Promise<number>` - Total number of responses

**Behavior**:
- Returns total count of all stored responses
- Does not include deleted responses
- Used for dashboard metrics and pagination calculations

**Error Handling**:
- Throws `Error` if backend connection fails
- Returns 0 if no responses exist

---

### 6. healthCheck(): Promise<{ status: 'ok' | 'error' }>

**Purpose**: Verify backend connectivity and availability.

**Parameters**: None

**Returns**: 
- `Promise<{ status: 'ok' | 'error' }>` - Health status

**Behavior**:
- Performs simple connectivity test to backend service
- Verifies database/sheet is accessible
- Detects backend failures for error handling and monitoring

**Error Handling**:
- Never throws error; always returns status object
- Returns `{ status: 'error' }` if backend unreachable
- Returns `{ status: 'ok' }` if backend is operational

---

## Data Types

### QuestionnaireResponse (alias: SurveyResponse)

```typescript
interface QuestionnaireResponse {
  // Mandatory SKM questions (Q1-Q20): Likert scale 1-5
  Q1?: number    // Accessibility - Access to facilities
  Q2?: number    // Accessibility - Information availability
  Q3?: number    // Accessibility - Service procedure clarity
  Q4?: number    // Service Quality - Overall quality
  Q5?: number    // Service Quality - Accuracy and precision
  Q6?: number    // Service Quality - Consistency
  Q7?: number    // Professionalism - Staff competence
  Q8?: number    // Professionalism - Problem-solving ability
  Q9?: number    // Courtesy - Courtesy and respect
  Q10?: number   // Courtesy - Friendliness and hospitality
  Q11?: number   // Reliability - Service consistency
  Q12?: number   // Reliability - Promise fulfillment
  Q13?: number   // Reliability - Freedom from errors
  Q14?: number   // Security - Personal information protection
  Q15?: number   // Security - Transaction confidentiality
  Q16?: number   // Response Time - Speed of service
  Q17?: number   // Response Time - Process efficiency
  Q18?: number   // Response Time - Minimal waiting time
  Q19?: number   // Facilities - Physical facilities adequacy
  Q20?: number   // Facilities - Equipment functionality

  // Optional question
  Q21?: string   // Open-ended suggestions (max 500 chars)

  // Optional demographic information
  demographic_age?: string
  demographic_gender?: string
  demographic_education?: string
  demographic_service?: string

  // System-generated fields
  id?: string            // UUID assigned by backend
  timestamp?: Date       // Submission timestamp
  user_agent?: string    // Browser/device identifier
  ip_hash?: string       // SHA-256 hash of respondent IP
  completionPercentage?: number  // % of questions answered
}
```

### AnalyticsData (alias: DashboardMetrics)

See getAnalytics() method specification above for complete structure.

### BackendType

```typescript
type BackendType = 'google-sheets' | 'supabase'
```

---

## Implementation Examples

### Google Sheets Backend

```typescript
export class GoogleSheetsBackend implements BackendStrategy {
  private sheetsApi: sheets_v4.Sheets
  private scriptService: GoogleAppsScriptService

  async submitResponse(data: QuestionnaireResponse): Promise<string> {
    // 1. Validate input data (all Q1-Q20 present, in range 1-5)
    // 2. Call Google Apps Script webhook with response data
    // 3. Apps Script appends row to Google Sheet
    // 4. Return response ID
  }

  async getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    // 1. Query all rows from Google Sheet
    // 2. Filter by date range if provided
    // 3. Calculate aggregations (averages, distributions, trends)
    // 4. Return AnalyticsData object
  }

  async exportResponses(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer> {
    // 1. Query all rows from Google Sheet
    // 2. Filter by date range if provided
    // 3. Convert to CSV or XLSX format
    // 4. Return as Buffer
  }

  // ... other methods
}
```

### Supabase Backend

```typescript
export class SupabaseBackend implements BackendStrategy {
  private client: SupabaseClient

  async submitResponse(data: QuestionnaireResponse): Promise<string> {
    // 1. Validate input data (all Q1-Q20 present, in range 1-5)
    // 2. Insert row into PostgreSQL 'responses' table
    // 3. Database generates UUID
    // 4. Return UUID
  }

  async getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    // 1. Query PostgreSQL 'responses' table
    // 2. Filter by date range if provided
    // 3. Use PostgreSQL aggregation functions (AVG, COUNT, GROUP BY)
    // 4. Return AnalyticsData object
  }

  async exportResponses(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer> {
    // 1. Query PostgreSQL 'responses' table
    // 2. Filter by date range if provided
    // 3. Convert to CSV or XLSX format
    // 4. Return as Buffer
  }

  // ... other methods
}
```

---

## Backend Factory Pattern

The `BackendFactory` class manages backend instantiation and ensures only one backend is active:

```typescript
export class BackendFactory {
  /**
   * Create a new backend instance
   */
  static create(provider: BackendType): BackendStrategy

  /**
   * Get singleton instance based on BACKEND_TYPE env var
   */
  static getInstance(): BackendStrategy

  /**
   * Get currently active backend type
   */
  static getActiveBackendType(): BackendType | null

  /**
   * Reset singleton (testing only)
   */
  static reset(): void
}
```

**Usage**:
```typescript
// Get singleton instance
const backend = BackendFactory.getInstance()

// Submit response
const responseId = await backend.submitResponse(questionnaireData)

// Get analytics
const analytics = await backend.getAnalytics()

// Export data
const csvBuffer = await backend.exportResponses('csv')
```

---

## Environment Configuration

Backend selection happens at deployment time via environment variables:

```bash
# Required: Specify active backend
BACKEND_TYPE=supabase  # or 'google-sheets'

# Google Sheets Configuration
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/{SCRIPT_ID}/usercallable
GOOGLE_SHEET_ID={SHEET_ID}
ADMIN_TOKEN=<32-character random token>

# Supabase Configuration
SUPABASE_URL=https://{PROJECT_ID}.supabase.co
SUPABASE_ANON_KEY=<anonymous key from Supabase dashboard>
SUPABASE_SERVICE_KEY=<service role key from Supabase dashboard>
```

---

## Error Handling Strategy

All backends follow consistent error handling:

### Validation Errors (400 Bad Request)
```json
{
  "error": "Validation failed",
  "details": {
    "Q1": "Must be between 1 and 5"
  }
}
```

### Authentication Errors (401/403)
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token"
}
```

### Backend Service Errors (503)
```json
{
  "error": "Service unavailable",
  "retryAfter": 60,
  "message": "Backend service temporarily offline"
}
```

---

## Testing Strategy

### Unit Tests
- Validate input data schemas with Zod
- Test calculation accuracy (averages, distributions)
- Test error handling and edge cases

### Integration Tests
- Test complete submission workflow
- Verify data persistence and retrieval
- Test export functionality with various datasets
- Verify date filtering works correctly

### Property-Based Tests
- Form Submission Atomicity: Verify complete response stored or none
- Dashboard Data Accuracy: Verify metrics include 100% of responses
- Admin Authorization: Verify auth enforcement
- Response Data Integrity: Verify no duplicates, unique IDs, all fields non-null

---

## Compliance & Acceptance Criteria

### AC9 (Google Sheets Backend)
✅ IBackend interface defines all required methods
✅ Google Sheets implementation must comply with interface
✅ Backend contract documents expected behavior
✅ Proper error handling and validation

### AC10 (Supabase Backend)
✅ IBackend interface defines all required methods
✅ Supabase implementation must comply with interface
✅ Backend contract documents expected behavior
✅ Proper error handling and validation

---

## Future Enhancements

1. **Caching Layer**: Implement Redis/in-memory caching for analytics with TTL
2. **Rate Limiting**: Add rate limit enforcement per IP/session
3. **Batch Operations**: Support bulk import/export
4. **Real-time Updates**: WebSocket subscriptions for live analytics (Supabase)
5. **Data Encryption**: Client-side or at-rest encryption for sensitive responses
6. **Audit Logging**: Track all admin actions
7. **Data Retention**: Automated deletion based on retention policy

