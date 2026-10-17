# Google Apps Script Backend for SKM Questionnaire

This directory contains the Google Apps Script that serves as the backend webhook for collecting and managing SKM survey responses.

## Quick Start

1. **Read the full setup guide**: `/docs/GOOGLE_APPS_SCRIPT_SETUP.md`
2. **Create a Google Sheet** for data storage
3. **Deploy this script** as a Web App
4. **Configure environment variables** in your `.env` file
5. **Test the deployment** with the provided test commands

## Files

- **`Code.gs`** - Main Google Apps Script file (copy this to Google Apps Script editor)

## Key Features

### Form Submission (`doPost`)
- Receives survey responses from Next.js frontend
- Validates all required fields (8 core SKM questions)
- Enriches response with metadata (ID, timestamp, overall score)
- Appends validated row to Google Sheet
- Returns success/error response with response ID

### Analytics Queries (`doGet?action=analytics`)
- Retrieves aggregated analytics data
- Requires admin token authentication
- Returns satisfaction distribution and dimension averages
- Called by dashboard to display metrics

### Health Check (`doGet?action=health`)
- No authentication required
- Verifies deployment is working
- Returns status and timestamp

### Debug Logging
- Automatic logging to "debug_logs" sheet
- Includes timestamps, severity levels, and context
- Retrievable via admin API (`doGet?action=debug`)
- Auto-clears logs to prevent spreadsheet from growing too large

### Scheduled Analytics
- Optional hourly recalculation of analytics
- Stores time-series analytics data in "analytics" sheet
- Set up via Google Apps Script Triggers

## Configuration

Environment variables (set in your `.env` file):

```env
BACKEND_TYPE=google-sheets
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/{YOUR_DEPLOYMENT_ID}/usercallback
GOOGLE_SHEET_ID={YOUR_SHEET_ID}
ADMIN_TOKEN=your-secret-token-here
```

## Script Structure

### Main Handlers
- `doPost(e)` - POST request handler for form submissions
- `doGet(e)` - GET request handler for queries and health checks

### Validation & Processing
- `validateQuestionnaireResponse(data)` - Validates SKM questions and format
- `enrichQuestionnaireResponse(data)` - Adds system fields (ID, timestamp, scores)
- `calculateOverallScore(response)` - Computes average satisfaction score

### Sheet Operations
- `appendResponseToSheet(response)` - Appends validated response row
- `getResponseSheet()` - Gets or creates response sheet
- `initializeResponseSheetHeaders(sheet)` - Sets up headers and formatting

### Analytics
- `getAnalyticsData()` - Aggregates metrics from all responses
- `recalculateAnalytics()` - Scheduled trigger for hourly analytics updates
- `initializeAnalyticsSheetHeaders(sheet)` - Sets up analytics sheet

### Error Handling & Logging
- `createSuccessResponse(data)` - Formats successful response
- `createErrorResponse(code, type, message)` - Formats error response
- `logDebug(message, context)` - Debug logging
- `logError(message, error)` - Error logging
- `getDebugLogs()` - Retrieves debug logs
- `clearDebugLogs()` - Clears old logs

## API Endpoints

### Submit Response
```
POST /usercallback
Content-Type: application/json

{
  "q1_accessibility": 4,
  "q2_service_quality": 5,
  "q3_professionalism": 4,
  "q4_courtesy": 5,
  "q5_reliability": 4,
  "q6_security": 3,
  "q7_response_time": 5,
  "q8_facilities": 4,
  "q9_suggestions": "Optional feedback",
  "demographic_age": "25-34",
  "demographic_service": "Health"
}
```

### Get Analytics
```
GET /usercallback?action=analytics&token={ADMIN_TOKEN}
```

### Health Check
```
GET /usercallback?action=health
```

### Get Debug Logs (Admin)
```
GET /usercallback?action=debug&token={ADMIN_TOKEN}
```

### Clear Debug Logs (Admin)
```
GET /usercallback?action=clear-logs&token={ADMIN_TOKEN}
```

## Deployment Instructions

See `/docs/GOOGLE_APPS_SCRIPT_SETUP.md` for detailed step-by-step deployment guide.

### Quick Deploy
1. Copy `Code.gs` content
2. Paste into Google Apps Script editor
3. Update Sheet ID at the top of the file
4. Click Deploy → New Deployment → Web app → Anyone
5. Copy deployment URL
6. Save URL to `GOOGLE_APPS_SCRIPT_URL` in `.env`
7. Test with health check endpoint

## Data Structure

### Response Sheet Columns
- `id` - Unique UUID for each response
- `timestamp` - ISO 8601 timestamp of submission
- `q1_accessibility` - SKM question 1 (1-5 rating)
- `q2_service_quality` - SKM question 2 (1-5 rating)
- `q3_professionalism` - SKM question 3 (1-5 rating)
- `q4_courtesy` - SKM question 4 (1-5 rating)
- `q5_reliability` - SKM question 5 (1-5 rating)
- `q6_security` - SKM question 6 (1-5 rating)
- `q7_response_time` - SKM question 7 (1-5 rating)
- `q8_facilities` - SKM question 8 (1-5 rating)
- `q9_suggestions` - Optional open-ended feedback (max 1000 chars)
- `demographic_age` - Age group demographic (optional)
- `demographic_service` - Service type demographic (optional)
- `user_agent` - User agent string from client
- `ip_hash` - Hashed IP address (N/A in Apps Script)
- `overall_score` - Average of questions 1-8

### Analytics Sheet Columns
- `date` - Date of the analytics snapshot
- `total_responses` - Count of responses as of that date
- `avg_satisfaction` - Average overall score
- `satisfaction_*` - Distribution counts (very_satisfied, satisfied, neutral, dissatisfied, very_dissatisfied)
- `dimension_*_avg` - Average score per SKM dimension
- `updated_at` - ISO timestamp of when this record was created

### Debug Logs Sheet Columns
- `timestamp` - When the event occurred
- `level` - Log level (DEBUG, ERROR)
- `message` - Log message
- `context` - JSON object with additional context

## Error Handling

All API endpoints return standardized responses:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": 400,
    "type": "Validation failed",
    "message": "q1_accessibility: Must be integer between 1 and 5",
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

## Security

### Best Practices
- **Admin Token**: Store securely in environment variables, never in code
- **Public Endpoint**: Form submission is intentionally public (no auth required)
- **Private Analytics**: Analytics endpoint requires admin token
- **HTTPS**: Always use HTTPS in production (Google Apps Script enforces this)
- **Data Validation**: All inputs validated server-side

### Limiting Access
- Analytics endpoint can only be accessed with valid `ADMIN_TOKEN`
- Debug logs accessible only to admins
- Form submission accessible to anyone (intentional for public surveys)

## Troubleshooting

### Health Check Fails
- Verify deployment URL is correct
- Check that script is deployed with "Anyone" access
- Look for errors in Google Apps Script Logs → Executions

### Form Submission Fails
- Check validation errors in response message
- Verify all 8 core questions are in request
- Check that questions have values between 1-5
- Look at debug logs in Apps Script editor

### No Data in Google Sheet
- Verify Sheet ID in Code.gs is correct
- Check that sheet "responses" exists
- Review debug logs for errors
- Test with health check to ensure script is running

### Performance Issues
- Check log sheet isn't growing too large (auto-clears at 10,000 rows)
- Review analytics sheet size
- Consider archiving old data to separate sheet

## Testing

### curl Commands

Health check:
```bash
curl "https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercallback?action=health"
```

Test submission:
```bash
curl -X POST "https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercallback" \
  -H "Content-Type: application/json" \
  -d '{"q1_accessibility":4,"q2_service_quality":5,"q3_professionalism":4,"q4_courtesy":5,"q5_reliability":4,"q6_security":3,"q7_response_time":5,"q8_facilities":4}'
```

Get analytics:
```bash
curl "https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercallback?action=analytics&token={TOKEN}"
```

## Maintenance

- **Monitor logs**: Check debug logs regularly for errors
- **Archive data**: Periodically export and backup responses
- **Clear logs**: Logs auto-clear, but can manually clear via API
- **Update script**: Update Code.gs when needed (immediately live after Save)

## Integration with Frontend

The Next.js frontend integrates with this script via:

1. **Form Submission**: POST to `GOOGLE_APPS_SCRIPT_URL`
2. **Analytics Loading**: GET from `GOOGLE_APPS_SCRIPT_URL?action=analytics`
3. **Admin Authentication**: Uses `ADMIN_TOKEN` from environment

See `/src/lib/backend/` for the Next.js integration code.

## Related Files

- `/docs/GOOGLE_APPS_SCRIPT_SETUP.md` - Full deployment guide
- `/src/lib/backend/factory.ts` - Backend factory pattern
- `/src/lib/types/backend.ts` - TypeScript type definitions
- `/.env.example` - Environment variable template

## Support

For detailed setup instructions, troubleshooting, and advanced configuration, see:
**`/docs/GOOGLE_APPS_SCRIPT_SETUP.md`**

