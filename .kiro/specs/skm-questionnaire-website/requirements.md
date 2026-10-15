# Requirements Document

## Feature: SKM Questionnaire Website

## Introduction

SKM (Survei Kepuasan Masyarakat / Citizen Satisfaction Survey) Questionnaire Website is a public-facing form system with a protected analytics dashboard. The system collects survey responses using a comprehensive 15-25 question SKM template and provides administrators with analytics and data export capabilities. The system supports two backend options: Google Sheets and Supabase for data storage and management.

## Glossary

- **SKM (Survei Kepuasan Masyarakat)**: Citizen satisfaction survey - a standardized questionnaire to measure service satisfaction
- **Questionnaire Form**: The public-facing survey interface that collects respondent data
- **Dashboard**: The protected administrative interface for analytics and reporting
- **Template**: Predefined set of 15-25 SKM survey questions
- **Analytics**: Data analysis and visualization of survey responses
- **Backend Storage**: Data persistence layer (Google Sheets or Supabase)
- **Export**: Data output functionality in standard formats (CSV, Excel, PDF)
- **Respondent**: Individual completing the survey
- **Administrator**: User with dashboard access and export permissions
- **Authentication**: Process of verifying administrator identity
- **Session**: Authenticated connection between administrator and dashboard

## Requirements

### Requirement 1: Public Questionnaire Form

**User Story:** As a respondent, I want to complete an SKM survey through a simple web form, so that I can provide feedback on services.

#### Acceptance Criteria

1. THE Questionnaire Form SHALL display exactly 15-25 SKM survey questions with question numbering
2. THE Questionnaire Form SHALL support multiple question types (Likert scale, multiple choice, open text)
3. THE Questionnaire Form SHALL require all mandatory fields to be completed before submission
4. THE Questionnaire Form SHALL validate input data format (numeric ranges, text length) before accepting responses
5. WHEN a respondent submits the form, THE System SHALL save the response data to the configured backend storage
6. WHEN form submission succeeds, THE Questionnaire Form SHALL display a success message to the respondent
7. IF form submission fails, THEN THE System SHALL display a clear error message and preserve entered data
8. THE Questionnaire Form SHALL be accessible without authentication or login
9. THE Questionnaire Form SHALL display response timestamps in UTC timezone format
10. THE Questionnaire Form SHALL include respondent metadata fields (optional: name, email, department, visitor type)

### Requirement 2: SKM Template Definition

**User Story:** As an administrator, I want a complete standardized SKM template with 15-25 questions, so that survey responses are consistent and measurable.

#### Acceptance Criteria

1. THE System SHALL include a standard SKM template with minimum 15 and maximum 25 questions
2. THE Template SHALL include demographic questions (respondent category, service type, etc.)
3. THE Template SHALL include satisfaction-focused questions using Likert scale (strongly disagree to strongly agree)
4. THE Template SHALL include open-ended feedback questions for qualitative comments
5. THE Template SHALL be customizable at the deployment level (before form goes live)
6. THE Template questions SHALL be organized in logical sections (demographic, satisfaction, feedback)

### Requirement 3: Protected Dashboard Access

**User Story:** As an administrator, I want secure dashboard access with authentication, so that only authorized users can view survey data and analytics.

#### Acceptance Criteria

1. THE Dashboard SHALL require authentication before displaying any data or analytics
2. WHEN an unauthenticated user attempts to access the Dashboard, THE System SHALL redirect to authentication interface
3. THE System SHALL support authentication via configured method (local login, OAuth, or backend-specific)
4. THE Dashboard SHALL display session timeout warning at 5 minutes before automatic logout
5. WHEN session timeout expires, THE System SHALL terminate the session and require re-authentication
6. THE Dashboard SHALL provide a logout function that immediately terminates the current session
7. THE Dashboard interface SHALL be protected by secure cookies with HttpOnly and Secure flags set

### Requirement 4: Survey Response Analytics

**User Story:** As an administrator, I want to view comprehensive analytics of survey responses, so that I can analyze satisfaction trends and identify improvement areas.

#### Acceptance Criteria

1. THE Dashboard Analytics view SHALL display total number of responses received
2. THE Dashboard Analytics view SHALL calculate and display average satisfaction score (aggregated from Likert responses)
3. THE Dashboard Analytics view SHALL display response count by respondent type/category
4. THE Dashboard Analytics view SHALL display response count by service type
5. THE Dashboard Analytics view SHALL display response trends over time (responses per day/week)
6. THE Dashboard Analytics view SHALL display satisfaction distribution (pie chart or histogram)
7. THE Dashboard Analytics view SHALL display summary statistics for each survey question
8. THE Dashboard Analytics view SHALL display response timestamps in administrator's local timezone
9. WHERE time period filtering is available, THE Dashboard Analytics view SHALL allow filtering by date range (from date to date)

### Requirement 5: Data Export Functionality

**User Story:** As an administrator, I want to export survey data in multiple formats, so that I can perform additional analysis and create reports.

#### Acceptance Criteria

1. THE Dashboard SHALL provide export function for survey response data
2. THE Export function SHALL support CSV format with proper encoding and delimiters
3. THE Export function SHALL support Excel (.xlsx) format with headers and formatted columns
4. THE Export function SHALL support PDF format with summary statistics and charts
5. WHEN export is initiated, THE System SHALL include all response data within the selected date range
6. WHEN export is initiated, THE System SHALL include question numbers, questions text, and responses
7. THE Export file naming convention SHALL include export date and timestamp
8. WHEN administrator initiates export, THE System SHALL generate the file and offer immediate download
9. WHERE filtering is applied (date range, respondent type), THE Export function SHALL respect active filters and export only filtered data

### Requirement 6: Backend Storage Configuration

**User Story:** As a system administrator, I want to configure backend storage options, so that data can be persisted in either Google Sheets or Supabase based on requirements.

#### Acceptance Criteria

1. THE System SHALL support Google Sheets as a backend storage option
2. THE System SHALL support Supabase as a backend storage option
3. WHERE Google Sheets is configured, THE System SHALL authenticate and write responses to designated spreadsheet
4. WHERE Supabase is configured, THE System SHALL connect to Supabase project and write responses to configured table
5. WHEN form submission occurs, THE System SHALL persist response data atomically to the configured backend
6. IF backend connection fails, THEN THE System SHALL log error details and display user-friendly error message
7. WHERE backend is unavailable, THEN THE System SHALL queue responses locally until backend becomes available (if applicable for chosen backend)
8. THE System configuration SHALL specify which backend is active (environment variable or configuration file)

### Requirement 7: Response Data Integrity

**User Story:** As a system administrator, I want to ensure survey response data is not lost or corrupted, so that analytics remain reliable.

#### Acceptance Criteria

1. WHEN response data is submitted, THE System SHALL store complete response including all question answers
2. THE System SHALL maintain response metadata (submission timestamp, respondent IP if logged, user agent)
3. IF duplicate submission is detected, THE System SHALL handle based on configuration (accept, reject, deduplicate)
4. WHEN data export occurs, THE System SHALL preserve data accuracy and completeness
5. THE System SHALL log all administrative actions (logins, exports, data access) for audit purposes

### Requirement 8: User Experience

**User Story:** As a respondent/administrator, I want a responsive and intuitive interface, so that form completion and dashboard navigation are efficient.

#### Acceptance Criteria

1. THE Questionnaire Form SHALL be responsive on mobile, tablet, and desktop devices
2. THE Questionnaire Form SHALL complete loading within 2 seconds on standard broadband connection (3 Mbps)
3. THE Dashboard SHALL load within 3 seconds on standard broadband connection
4. THE Questionnaire Form SHALL indicate progress (current question / total questions)
5. THE Dashboard SHALL display loading indicators during data fetches
6. THE System error messages SHALL be clear and suggest corrective action
7. THE Dashboard navigation SHALL use consistent UI patterns and be intuitive to administrators

