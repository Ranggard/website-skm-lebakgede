# Google Apps Script Setup & Deployment Guide

This guide provides step-by-step instructions for setting up and deploying the Google Apps Script backend for the SKM Questionnaire Website.

## Overview

The Google Apps Script serves as a backend webhook that:
- Receives survey responses from the Next.js frontend
- Validates and enriches response data
- Stores responses in a Google Sheet
- Provides analytics aggregation
- Implements admin authentication with token-based access

## Prerequisites

- A Google Account with access to Google Drive and Google Apps Script
- Access to Google Sheets API
- The deployment URL from this script (will be obtained after deployment)

---

## Part 1: Create a Google Sheet for Data Storage

### Step 1: Create a new Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ New"** to create a new blank spreadsheet
3. Rename it: **"SKM Responses"** (or your preferred name)
4. Note the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
   ```
   - Save this `SHEET_ID` - you'll need it later

### Step 2: Initialize the responses sheet

The Google Apps Script will automatically create the headers if they don't exist, but it's helpful to set them up manually:

1. In your Google Sheet, the first sheet should be named **"responses"**
2. In cell A1, add these headers (copy-paste the entire line):
   ```
   id	timestamp	q1_accessibility	q2_service_quality	q3_professionalism	q4_courtesy	q5_reliability	q6_security	q7_response_time	q8_facilities	q9_suggestions	demographic_age	demographic_service	user_agent	ip_hash	overall_score
   ```
   - Each column should be separated by a TAB character
   - Or manually type each header in successive columns

---

## Part 2: Create and Deploy Google Apps Script

### Step 1: Create a new Google Apps Script project

1. Go to [Google Apps Script](https://script.google.com)
2. Click **"+ New project"**
3. Name it: **"SKM Questionnaire Backend"**

### Step 2: Link the script to your Google Sheet

1. In the Apps Script editor, click the **"Files"** icon (folder) on the left
2. Click **"Project Settings"** at the bottom
3. Note the **Script ID** (you may need this for reference)
4. In the main editor, add this line at the top to link to your sheet:

```javascript
// At the very top of Code.gs, before the configuration section
const SPREADSHEET_ID = 'YOUR_SHEET_ID_HERE';  // Replace with your actual Sheet ID
```

### Step 3: Copy the scaffold code

1. Open the file: `/google-apps-script/Code.gs` from this repository
2. Copy **all the contents**
3. In your Google Apps Script project, replace the default `Code.gs` content with the copied code
4. Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID from Part 1

### Step 4: Set the admin token (optional but recommended)

For security, set a strong admin token:

1. In the Code.gs file, find this line near the top:
   ```javascript
   const ADMIN_TOKEN = process.env?.ADMIN_TOKEN || '';
   ```

2. Replace it with a strong random token:
   ```javascript
   const ADMIN_TOKEN = 'your-very-secret-admin-token-here-min-32-chars';
   ```
   - Use a strong, random string (at least 32 characters)
   - You'll need this token for admin API calls

### Step 5: Save the project

1. Click **"Save"** (or Ctrl+S / Cmd+S)
2. Confirm the project name

### Step 6: Deploy as a Web App

1. In the Google Apps Script editor, click **"Deploy"** (top right)
2. Click **"New Deployment"**
3. In the deployment dialog:
   - **Type**: Select "Web app"
   - **Execute as**: Select your Google account
   - **Who has access**: Select "Anyone"
4. Click **"Deploy"**
5. You'll see a deployment ID and a notification

### Step 7: Get your deployment URL

1. After deployment, a dialog will show your **Deployment URL**
2. It will look like: `https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercallback`
3. Copy this URL - this is your `GOOGLE_APPS_SCRIPT_URL`

### Step 8: Authorization

1. Click **"Authorization required"** if prompted
2. Select your Google account
3. Review the permissions (the script needs access to your Google Sheet)
4. Click **"Allow"**

---

## Part 3: Configure Environment Variables

### Create .env file

In your project root directory, create or update your `.env` file:

```env
# Backend selection
BACKEND_TYPE=google-sheets

# Google Sheets backend configuration
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/{YOUR_DEPLOYMENT_ID}/usercallback
GOOGLE_SHEET_ID={YOUR_SHEET_ID}
ADMIN_TOKEN=your-very-secret-admin-token-here-min-32-chars

# Next.js App URL (for CORS if needed)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Environment Variables Explanation:**

| Variable | Description | Example |
|----------|-------------|---------|
| `BACKEND_TYPE` | Backend provider to use | `google-sheets` |
| `GOOGLE_APPS_SCRIPT_URL` | Web app URL of your deployed script | `https://script.google.com/macros/d/ABC123/usercallback` |
| `GOOGLE_SHEET_ID` | ID of your Google Sheet | `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t` |
| `ADMIN_TOKEN` | Secret token for admin API calls | `your-secret-token` |
| `NEXT_PUBLIC_APP_URL` | Public URL of your app | `https://skm-survey.example.com` |

---

## Part 4: Test the Deployment

### Test 1: Health Check

Make a GET request to verify your deployment works:

```bash
curl "https://script.google.com/macros/d/{YOUR_DEPLOYMENT_ID}/usercallback?action=health"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "backend": "google-sheets"
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Test 2: Submit a Test Response

Using your deployed Next.js app or making a direct API call:

```bash
curl -X POST "https://script.google.com/macros/d/{YOUR_DEPLOYMENT_ID}/usercallback" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string-here",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "overallScore": "4.25",
    "rowIndex": 2,
    "message": "Response submitted successfully"
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Test 3: Retrieve Analytics

```bash
curl "https://script.google.com/macros/d/{YOUR_DEPLOYMENT_ID}/usercallback?action=analytics&token={YOUR_ADMIN_TOKEN}"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "totalResponses": 1,
    "avgSatisfaction": 4.25,
    "satisfactionDistribution": {
      "verySatisfied": 0,
      "satisfied": 1,
      "neutral": 0,
      "dissatisfied": 0,
      "veryDissatisfied": 0
    },
    "dimensionAverages": {
      "accessibility": 4,
      "serviceQuality": 5,
      "professionalism": 4,
      "courtesy": 5,
      "reliability": 4,
      "security": 3,
      "responseTime": 5,
      "facilities": 4
    },
    "lastUpdated": "2024-01-15T10:30:45.123Z"
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## Part 5: Verify Google Sheet Data

After sending a test response:

1. Go to your Google Sheet
2. You should see a new row with your test data
3. Verify all columns are populated correctly

---

## Part 6: Set Up Scheduled Analytics Recalculation (Optional)

The script includes a scheduled function to recalculate analytics hourly:

1. In Google Apps Script, click **"Triggers"** (clock icon on left)
2. Click **"Create new trigger"**
3. Configure:
   - **Function to run**: `recalculateAnalytics`
   - **Deployment**: `Head`
   - **Event source**: `Time-driven`
   - **Type of time based trigger**: `Hour timer`
   - **Interval**: `Every hour`
4. Click **"Save"**
5. Authorize if prompted

This will create an hourly snapshot of analytics data in the "analytics" sheet.

---

## Part 7: Troubleshooting

### Issue: "Script not found" or 404 error

- **Solution**: Verify your deployment URL is correct. Check that you copied the entire URL from the deployment dialog.

### Issue: "Unauthorized" error on health check

- **Solution**: The health check endpoint doesn't require authentication. If you're getting unauthorized, the URL may be incorrect.

### Issue: "Validation failed" error on form submission

- **Solution**: Ensure all 8 core questions (q1-q8) are present in your request with integer values between 1-5.

### Issue: No data appearing in Google Sheet

- **Solution**:
  1. Check the debug logs in your Apps Script project (View → Logs)
  2. Verify the Sheet ID is correct
  3. Ensure the sheet is named "responses"
  4. Check that your deployment URL is being called correctly

### Issue: Google Sheet not created or headers not initialized

- **Solution**: The script will automatically create the "responses" sheet if it doesn't exist. If headers aren't appearing:
  1. Manually create a sheet named "responses"
  2. Add the headers manually (see Part 1, Step 2)

### Issue: Script execution errors

- **Solution**:
  1. In Google Apps Script, click **"Execution log"** at the top
  2. Review recent errors
  3. Check the "debug_logs" sheet in your Google Sheet for detailed error information

---

## Part 8: Advanced Configuration

### Enable Verbose Debugging

To enable detailed debug logging:

1. In Code.gs, find this line:
   ```javascript
   const ENABLE_DEBUG_LOGGING = true;
   ```
   - Set to `true` to enable debug logging (default)
   - Set to `false` to disable (production)

### Modify Sheet Names

To use different sheet names:

1. Find these constants at the top of Code.gs:
   ```javascript
   const SHEET_NAME = 'responses';
   const ANALYTICS_SHEET_NAME = 'analytics';
   const LOG_SHEET_NAME = 'debug_logs';
   ```
2. Update to your preferred names (must match actual sheet names)

### Customize Question Structure

To modify the SKM questions or add new fields:

1. Update the `validateQuestionnaireResponse()` function
2. Update the `enrichQuestionnaireResponse()` function
3. Update the `calculateOverallScore()` function
4. Update the sheet headers in `initializeResponseSheetHeaders()`

---

## Part 9: Integration with Next.js Frontend

The frontend is already configured to call this Google Apps Script endpoint:

1. Ensure `.env` has `BACKEND_TYPE=google-sheets`
2. Ensure `.env` has the correct `GOOGLE_APPS_SCRIPT_URL`
3. The Next.js backend will:
   - POST form submissions to this endpoint
   - GET analytics data from this endpoint (with admin token)
   - Handle retries and error responses

### Testing Full Integration

1. Start the Next.js app: `npm run dev`
2. Navigate to `http://localhost:3000/form`
3. Fill out and submit the form
4. Verify the response appears in your Google Sheet
5. Check analytics dashboard to see the data

---

## Security Considerations

### Best Practices

1. **Use a strong admin token** - minimum 32 random characters
2. **Store admin token securely** - use environment variables, not in code
3. **Limit script access** - only share the public deployment URL
4. **Monitor analytics access** - log all admin token usage
5. **Backup your data** - periodically export your Google Sheet
6. **Review debug logs** - clear old logs to maintain performance
7. **Keep script updated** - review for security patches regularly

### Restricting Access

- The form submission endpoint (`doPost`) is public - this is intentional
- The analytics endpoint (`doGet?action=analytics`) requires `ADMIN_TOKEN`
- Debug logs are only accessible with `ADMIN_TOKEN`

---

## Maintenance & Operations

### Monitoring

1. **Check script execution logs** regularly in Google Apps Script
2. **Monitor debug logs** in the "debug_logs" sheet
3. **Review analytics** to ensure data is being collected

### Backups

1. Periodically download your Google Sheet as CSV/Excel
2. Store backups in a secure location
3. Consider setting up Google Drive backup systems

### Updates

To update the script:

1. Modify the Code.gs file in Google Apps Script
2. Click Save
3. Test with the health check endpoint
4. The changes are immediately live

---

## Support & Resources

### Documentation

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API Reference](https://developers.google.com/sheets/api/reference/rest)
- [Utilities Reference](https://developers.google.com/apps-script/reference/utilities)

### Debugging

- Google Apps Script Editor → View → Logs
- Google Sheet → Look for "debug_logs" sheet
- Check for error responses in your frontend console

### Common Issues

See "Troubleshooting" section above for detailed solutions.

---

## Next Steps

1. **Task 9**: Implement Google Sheets backend form submission client
2. **Task 10**: Configure the database schema with data validation
3. **Task 11**: Implement form validation and row insertion logic
4. **Task 12**: Set up analytics queries and caching

---

## Deployment Checklist

- [ ] Google Sheet created and named
- [ ] Sheet ID noted and saved
- [ ] Google Apps Script project created
- [ ] Code.gs content copied and configured
- [ ] Admin token set and secured
- [ ] Script deployed as Web App with "Anyone" access
- [ ] Deployment URL obtained and saved
- [ ] Environment variables configured in `.env`
- [ ] Health check endpoint tested
- [ ] Test form submission works
- [ ] Data appears in Google Sheet
- [ ] Analytics endpoint tested with admin token
- [ ] Scheduled analytics trigger configured (optional)
- [ ] Debugging enabled for testing (disable in production)
- [ ] Backup strategy implemented

