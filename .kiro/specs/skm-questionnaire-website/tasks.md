# Implementation Plan: SKM Questionnaire Website

## Overview

This implementation plan breaks down the SKM Questionnaire Website into 38 detailed coding tasks organized by functional area. The design supports two parallel backend implementations (Google Sheets and Supabase) with a unified React frontend using a runtime backend switching pattern. Tasks are sequenced to establish infrastructure first, implement core features, then integrate analytics and deployment.

**Key Implementation Strategy**:
- Shared frontend with runtime backend abstraction
- Backend factory pattern for clean separation of concerns
- Parallel backend implementation with switching capability
- Incremental validation at each checkpoint

---

## Tasks

### Phase 1: Project Setup & Infrastructure

- [-] 1. Initialize project structure with Next.js and TypeScript
  - Create Next.js project with TypeScript configuration
  - Configure ESLint, Prettier, and TypeScript strict mode
  - Set up environment variable templates (.env.example)
  - _Requirements: AC11_
  - **Effort: 2 hours**

- [~] 2. Configure build tooling and dependency management
  - Install Tailwind CSS for styling
  - Install Recharts for dashboard visualizations
  - Install Zod for form validation
  - Install uuid for response ID generation
  - Install axios for HTTP requests
  - _Requirements: AC1_
  - **Effort: 1.5 hours**

- [~] 3. Set up testing framework and CI/CD pipeline
  - Configure Vitest for unit testing
  - Set up GitHub Actions for automated builds and tests
  - Create test configuration files
  - Set up branch protection rules for main branch
  - _Requirements: AC3, AC4_
  - **Effort: 2 hours**

- [~] 4. Create application configuration and constants
  - Define SKM question set (15-25 questions from SKM.docx)
  - Create constants for satisfaction levels, categories, themes
  - Set up configuration layers for different environments
  - Create configuration validation logic
  - _Requirements: AC2, AC15_
  - **Effort: 1 hour**

---

### Phase 2: Backend Abstraction & Factory Pattern

- [~] 5. Create backend abstraction layer and interfaces
  - Define `IBackend` interface with methods: `submitForm()`, `fetchAnalytics()`, `exportData()`
  - Define type definitions for SurveyResponse, DashboardMetrics
  - Create shared data models and enums
  - Document backend contract and expected behavior
  - _Requirements: AC9, AC10_
  - **Effort: 1.5 hours**

- [~] 6. Implement backend factory and runtime selection
  - Create `BackendFactory` class to instantiate correct backend
  - Implement environment-based backend selection (BACKEND_TYPE env var)
  - Add runtime validation that only one backend is active
  - Create singleton instance manager
  - _Requirements: AC9, AC10_
  - **Effort: 1 hour**

- [~] 7. Implement shared API endpoint structure (Next.js)
  - Create `/api/submit-form` endpoint wrapper
  - Create `/api/analytics` endpoint wrapper
  - Create `/api/export` endpoint wrapper
  - Implement request validation middleware
  - _Requirements: AC3, AC6, AC7_
  - **Effort: 1.5 hours**

---

### Phase 3: Google Sheets Backend Implementation

- [~] 8. Create Google Apps Script scaffold and deployment setup
  - Set up Google Apps Script project structure
  - Configure deployment as web app with public access
  - Create `doPost()` handler for form submissions
  - Set up error logging and debugging
  - _Requirements: AC9, AC3_
  - **Effort: 2 hours**

- [~] 9. Implement Google Sheets backend: form submission
  - Implement `GoogleSheetsBackend.submitForm()` method
  - Call Google Apps Script webhook from Next.js endpoint
  - Parse webhook response and return response ID
  - Add retry logic for failed submissions
  - _Requirements: AC3, AC9_
  - **Effort: 1.5 hours**

- [~] 10. Set up Google Sheets data storage
  - Create Google Sheet with columns for each SKM question
  - Configure sheet with headers: Timestamp, RespondentInfo, Q1, Q2, ..., OverallScore
  - Add data validation and cell formatting
  - Create backup sheet for reference
  - _Requirements: AC9, AC3_
  - **Effort: 1 hour**

- [~] 11. Implement Google Apps Script form validation and row insertion
  - Validate incoming request payload in Apps Script
  - Sanitize respondent information
  - Calculate overall score in Apps Script
  - Append validated row to Google Sheet
  - Return success response with row ID
  - _Requirements: AC3, AC9, AC15_
  - **Effort: 2 hours**

- [~] 12. Implement Google Sheets backend: analytics queries
  - Implement `GoogleSheetsBackend.fetchAnalytics()` method
  - Use Google Sheets API to retrieve all responses
  - Parse and aggregate metrics (total, satisfaction distribution, trends)
  - Cache results in memory with 5-minute TTL
  - _Requirements: AC6, AC9_
  - **Effort: 2.5 hours**

- [~] 13. Implement Google Sheets backend: data export
  - Implement `GoogleSheetsBackend.exportData()` method
  - Convert sheet data to CSV format
  - Convert sheet data to XLSX format (using xlsx library)
  - Add column headers and formatting
  - _Requirements: AC7, AC9_
  - **Effort: 1.5 hours**

- [~] 14. Implement Google Sheets backend: authentication
  - Create simple token-based admin authentication
  - Validate admin token from environment variable
  - Implement token validation middleware
  - Add rate limiting to admin endpoints
  - _Requirements: AC5, AC12_
  - **Effort: 1 hour**

---

### Phase 4: Supabase Backend Implementation

- [~] 15. Set up Supabase project and database schema
  - Create Supabase project
  - Create `survey_responses` table with UUID, timestamps, JSONB fields
  - Create `admin_users` table for authentication
  - Configure database connection pooling
  - _Requirements: AC10, AC3_
  - **Effort: 1.5 hours**

- [~] 16. Configure Supabase row-level security (RLS) policies
  - Create RLS policy for public INSERT on survey_responses
  - Create RLS policy for admin SELECT on survey_responses
  - Create RLS policy for admin users
  - Test policies with sample queries
  - _Requirements: AC4, AC5, AC10_
  - **Effort: 1.5 hours**

- [~] 17. Implement Supabase backend: form submission
  - Implement `SupabaseBackend.submitForm()` method
  - Insert survey response into PostgreSQL table
  - Handle validation at database layer
  - Return success with response ID (UUID)
  - Add error handling for constraint violations
  - _Requirements: AC3, AC10_
  - **Effort: 1.5 hours**

- [~] 18. Implement Supabase backend: analytics queries
  - Implement `SupabaseBackend.fetchAnalytics()` method
  - Query and aggregate responses using PostgreSQL
  - Calculate satisfaction distribution and trends
  - Implement real-time updates subscription (optional)
  - _Requirements: AC6, AC10_
  - **Effort: 2.5 hours**

- [~] 19. Implement Supabase backend: data export
  - Implement `SupabaseBackend.exportData()` method
  - Query all responses with admin privileges
  - Convert to CSV format
  - Convert to XLSX format
  - _Requirements: AC7, AC10_
  - **Effort: 1.5 hours**

- [~] 20. Implement Supabase authentication
  - Set up Supabase Auth (email/password)
  - Create admin login flow
  - Implement session management
  - Add logout functionality
  - _Requirements: AC5, AC13_
  - **Effort: 2 hours**

---

### Phase 5: Frontend - Core Components

- [~] 21. Create responsive page layout and navigation
  - Build main layout component with responsive grid
  - Create navigation header with responsive menu
  - Implement breadcrumbs (if needed)
  - Set up Tailwind CSS theme and breakpoints
  - _Requirements: AC1, AC14_
  - **Effort: 1.5 hours**

- [~] 22. Implement SKM form component
  - Create FormPage component with TypeScript
  - Render all 15-25 SKM questions
  - Implement Likert scale input (1-5 radio buttons or visual stars)
  - Add form validation using Zod schema
  - _Requirements: AC1, AC2, AC14_
  - **Effort: 2.5 hours**

- [~] 23. Implement respondent information collection
  - Add optional fields: Name, Email, Department
  - Create form section with proper labels and styling
  - Implement client-side validation for email format
  - Add conditional rendering based on SKM requirements
  - _Requirements: AC2, AC14_
  - **Effort: 1 hour**

- [~] 24. Implement form submission and confirmation flow
  - Handle form submit event with validation
  - Call `/api/submit-form` endpoint
  - Show loading indicator during submission
  - Display success confirmation message
  - Add retry mechanism for failed submissions
  - _Requirements: AC3, AC14_
  - **Effort: 1.5 hours**

- [~] 25. Implement form error handling and user feedback
  - Show validation errors inline on form fields
  - Display network error messages
  - Add success/error toast notifications
  - Implement field-level error styling
  - _Requirements: AC3, AC14_
  - **Effort: 1 hour**

- [~] 26. Make form fully responsive for mobile, tablet, desktop
  - Optimize form layout for mobile (single column, 44px buttons)
  - Test keyboard navigation and focus management
  - Ensure form fields don't get obscured by mobile keyboard
  - Test on iPhone 12 and Android devices
  - _Requirements: AC1, AC14_
  - **Effort: 1.5 hours**

---

### Phase 6: Frontend - Admin Dashboard

- [~] 27. Create admin login page
  - Build AdminLogin component with appropriate fields
  - Implement Google Sheets option: simple token input
  - Implement Supabase option: email/password form
  - Handle authentication based on backend type
  - _Requirements: AC5, AC12, AC13_
  - **Effort: 1.5 hours**

- [~] 28. Implement admin authentication state management
  - Create authentication context/store
  - Implement token/session storage and retrieval
  - Add route protection for dashboard pages
  - Implement logout functionality
  - _Requirements: AC5, AC12, AC13_
  - **Effort: 1 hour**

- [~] 29. Create dashboard header with controls
  - Build header with title, logout button
  - Implement date range filter component
  - Add refresh button for manual data reload
  - Style header for mobile and desktop
  - _Requirements: AC6_
  - **Effort: 1 hour**

- [~] 30. Implement overall satisfaction metrics and cards
  - Create metric cards component (total responses, avg score, completion rate)
  - Display key KPIs at top of dashboard
  - Implement loading states for metric cards
  - Format numbers and percentages appropriately
  - _Requirements: AC6_
  - **Effort: 1.5 hours**

- [~] 31. Implement satisfaction distribution pie chart
  - Create pie chart component using Recharts
  - Display satisfaction levels (5=Very Satisfied → 1=Very Dissatisfied)
  - Color-code satisfaction levels (green for satisfied, red for dissatisfied)
  - Add legend and percentage labels
  - _Requirements: AC6_
  - **Effort: 1.5 hours**

- [~] 32. Implement response trend line chart
  - Create line chart for submissions per day (7-day rolling view)
  - Display dates on X-axis, response count on Y-axis
  - Add tooltip with daily counts
  - Make chart responsive
  - _Requirements: AC6_
  - **Effort: 1.5 hours**

- [~] 33. Implement satisfaction by category bar chart
  - Create bar chart for per-dimension satisfaction scores
  - Display each SKM dimension (accessibility, quality, professionalism, etc.)
  - Color-code bars based on satisfaction level
  - Add value labels on bars
  - _Requirements: AC6_
  - **Effort: 1.5 hours**

- [~] 34. Implement recent responses table
  - Create table component to display sample of recent responses
  - Add columns: Timestamp, Respondent (if available), Overall Score, Responses
  - Implement sorting by date/score
  - Add pagination or "show more" loading
  - _Requirements: AC6_
  - **Effort: 1.5 hours**

- [~] 35. Implement CSV export functionality
  - Create export button that calls `/api/export?format=csv`
  - Handle file download and naming
  - Verify CSV contains all required columns
  - Test export with different response counts
  - _Requirements: AC7_
  - **Effort: 1 hour**

- [~] 36. Implement Excel export functionality
  - Create export button that calls `/api/export?format=excel`
  - Generate XLSX file with proper formatting
  - Add sheet name (e.g., "SKM Responses")
  - Include headers and data validation
  - _Requirements: AC7_
  - **Effort: 1 hour**

- [~] 37. Implement print-friendly report generation
  - Create printable report layout with all metrics and charts
  - Optimize CSS for print media (@media print)
  - Add page breaks and header/footer
  - Include timestamp and generated date on report
  - _Requirements: AC8_
  - **Effort: 1.5 hours**

---

### Phase 7: Testing & Validation

- [~] 38. Create unit tests for form validation and submission
  - Test Zod schema validation for all question types
  - Test form submission with valid data
  - Test form submission with invalid/missing fields
  - Mock backend responses
  - **Effort: 2 hours**

- [~] 39. Create integration tests for backend submission flow
  - Test Google Sheets backend end-to-end (mock Sheets API)
  - Test Supabase backend end-to-end (use test database)
  - Verify data is correctly stored and retrievable
  - Test error scenarios (network failure, validation error)
  - **Effort: 2.5 hours**

- [~] 40. Create property tests for dashboard accuracy and data integrity
  - **Property 1: Form Submission Atomicity**
    - Test that either entire response is stored or none (no partial data)
    - Generate random responses and verify all fields present
    - **Validates: Requirements AC3, AC9, AC10**
  
  - **Property 2: Dashboard Data Accuracy**
    - Test that metrics include 100% of submitted responses
    - Verify totalResponses equals sum of satisfaction distribution
    - **Validates: Requirements AC6, AC7, AC8**
  
  - **Property 3: Admin Authorization**
    - Test that unauthenticated requests get 401/403 responses
    - Test that authenticated admins can access all data
    - **Validates: Requirements AC5, AC12, AC13**
  
  - **Property 4: Response Data Integrity**
    - Test that no duplicate responses exist
    - Test that each response has unique ID
    - Test that all required fields are non-null
    - **Validates: Requirements AC2, AC3, AC15**
  
  - **Effort: 3 hours**

---

### Phase 8: Deployment & Optimization

- [~] 41. Deploy frontend to Vercel
  - Connect GitHub repository to Vercel
  - Configure environment variables for Vercel
  - Set up automatic deployments on push to main
  - Configure custom domain (if applicable)
  - Test production deployment
  - _Requirements: AC11_
  - **Effort: 1 hour**

- [~] 42. Deploy frontend to Netlify (alternative)
  - Connect GitHub repository to Netlify
  - Configure build commands and environment variables
  - Set up automatic deployments
  - Configure domain and SSL certificate
  - _Requirements: AC11_
  - **Effort: 1 hour**

- [~] 43. Performance optimization and caching
  - Implement localStorage caching for dashboard metrics (5-min TTL)
  - Enable image optimization in Next.js
  - Set up code splitting for dashboard components
  - Configure gzip compression on Vercel/Netlify
  - _Requirements: AC1, AC6_
  - **Effort: 1.5 hours**

- [~] 44. Final cross-browser and device testing
  - Test form on Chrome, Firefox, Safari, Edge
  - Test form on iPhone 12, iPad, Android device
  - Test dashboard on desktop, tablet, mobile
  - Verify all interactive elements work correctly
  - Test on 3G network speed (via DevTools)
  - _Requirements: AC1, AC14, AC6_
  - **Effort: 2 hours**

---

### Phase 9: Documentation & Handoff

- [~] 45. Create deployment and setup documentation
  - Document Google Sheets backend setup (create sheet, Apps Script, API keys)
  - Document Supabase backend setup (create project, tables, RLS policies)
  - Create Vercel deployment guide
  - Create .env configuration guide
  - _Requirements: AC9, AC10, AC11_
  - **Effort: 1.5 hours**

- [~] 46. Create user and admin guides
  - Write respondent guide for form usage
  - Write admin guide for dashboard navigation and export
  - Create troubleshooting section
  - Add FAQ for common issues
  - _Requirements: AC2, AC6, AC7_
  - **Effort: 1 hour**

---

## Notes

- Tasks marked with effort in hours are estimates; actual time may vary based on team experience
- Checkpoint tasks (implied between phases) ensure incremental validation:
  - After Phase 3: Verify Google Sheets backend can submit and retrieve data
  - After Phase 4: Verify Supabase backend can submit and retrieve data
  - After Phase 6: Verify frontend form and dashboard load and function
  - After Phase 7: All tests pass with >80% coverage
- Backend switching is done at **build time** via `BACKEND_TYPE` environment variable (prevents runtime switching issues)
- Each backend implementation is independent; switching between them requires rebuild and redeploy
- No cross-backend data mixing or migration tools included (each backend is isolated)
- Optional test tasks (marked with `*`) can be skipped for MVP, but are strongly recommended for production
- Total estimated effort: 70-85 hours for full implementation with both backends

---

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "2", "3", "4"],
      "description": "Project initialization and configuration"
    },
    {
      "id": 1,
      "tasks": ["5", "6", "7"],
      "description": "Backend abstraction layer and factory pattern"
    },
    {
      "id": 2,
      "tasks": ["8", "9", "10", "11", "15", "16", "17"],
      "description": "Google Sheets and Supabase setup with basic submission"
    },
    {
      "id": 3,
      "tasks": ["12", "13", "14", "18", "19", "20"],
      "description": "Analytics and authentication for both backends"
    },
    {
      "id": 4,
      "tasks": ["21", "22", "23", "24", "25"],
      "description": "Frontend form component and submission flow"
    },
    {
      "id": 5,
      "tasks": ["26", "27", "28"],
      "description": "Form responsiveness and admin authentication"
    },
    {
      "id": 6,
      "tasks": ["29", "30", "31", "32", "33", "34"],
      "description": "Dashboard UI components and visualizations"
    },
    {
      "id": 7,
      "tasks": ["35", "36", "37"],
      "description": "Export and report generation"
    },
    {
      "id": 8,
      "tasks": ["38", "39", "40"],
      "description": "Testing and validation"
    },
    {
      "id": 9,
      "tasks": ["41", "42"],
      "description": "Deployment to hosting platforms"
    },
    {
      "id": 10,
      "tasks": ["43", "44"],
      "description": "Performance optimization and cross-browser testing"
    },
    {
      "id": 11,
      "tasks": ["45", "46"],
      "description": "Documentation and handoff"
    }
  ],
  "parallel_safe_groups": {
    "wave_2": {
      "google_sheets": ["8", "9", "10", "11"],
      "supabase": ["15", "16", "17"],
      "note": "Backend implementations can be parallelized"
    },
    "wave_3": {
      "google_sheets": ["12", "13", "14"],
      "supabase": ["18", "19", "20"],
      "note": "Analytics and auth for each backend can be parallelized"
    },
    "wave_6": {
      "independent": ["29", "30", "31", "32", "33", "34"],
      "note": "All dashboard components can be built in parallel"
    },
    "wave_7": {
      "independent": ["35", "36", "37"],
      "note": "Export functions can be built in parallel"
    }
  }
}
```

---

## Key Implementation Patterns

### 1. Backend Factory Pattern
```typescript
// Usage throughout the app
const backend = BackendFactory.getInstance();
await backend.submitForm(response);
const metrics = await backend.fetchAnalytics();
```

### 2. Environment-Based Configuration
```typescript
// .env configuration
BACKEND_TYPE=supabase  # or 'google_sheets'
NEXT_PUBLIC_BACKEND_TYPE=supabase  # For frontend

# Supabase
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# Google Sheets
GOOGLE_APPS_SCRIPT_URL=https://...
GOOGLE_SHEET_ID=...
ADMIN_TOKEN=admin_secret_token_here
```

### 3. Dual Backend Verification
Each implementation includes:
- Identical `IBackend` interface compliance
- Same request/response schemas
- Equivalent error handling
- Equivalent auth mechanisms (token vs session)
- Equivalent data export formats

### 4. Testing Strategy for Dual Backend
- Mock both backends for unit tests
- Use real test databases (Supabase test instance, mock Sheets API)
- Verify both backends pass identical property tests
- Load test with backend-specific quotas in mind

