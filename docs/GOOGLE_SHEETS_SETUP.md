# Google Sheets Data Storage Setup Guide

## Task 10: Set up Google Sheets data storage

This guide provides step-by-step instructions for creating and configuring the Google Sheet that will store SKM questionnaire responses.

### Overview

The Google Sheet serves as the backend data storage for the SKM Questionnaire Website when using the Google Sheets backend option. It contains:
- **responses** sheet: Stores all survey responses with 16 columns
- **analytics** sheet: Caches aggregated analytics data (updated hourly by Apps Script)
- **backup** sheet: Reference copy of the structure for documentation

### Prerequisites

- Google Account with access to Google Sheets
- Google Apps Script scaffold deployed (Task 8 completed)
- GOOGLE_APPS_SCRIPT_URL environment variable ready

---

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ New"** → **"Blank spreadsheet"**
3. Rename the spreadsheet to: **"SKM Questionnaire Responses"**
4. Share settings (optional but recommended):
   - Click **Share** button
   - Change from "Private" to "Restricted" (or "Anyone with link")
   - Grant access to team members if needed

---

## Step 2: Rename and Configure the Default Sheet

The default "Sheet1" will become the "responses" sheet:

1. Right-click on the **"Sheet1"** tab at the bottom
2. Select **"Rename"**
3. Enter: **"responses"**
4. Click OK

---

## Step 3: Create Response Sheet Headers and Structure

In the "responses" sheet, set up the following column headers in row 1:

| Column | Header Name | Type | Format | Validation |
|--------|-------------|------|--------|-----------|
| A | id | Text | UUID | N/A |
| B | timestamp | Text | ISO 8601 DateTime | N/A |
| C | q1_accessibility | Number | Integer | 1-5 |
| D | q2_service_quality | Number | Integer | 1-5 |
| E | q3_professionalism | Number | Integer | 1-5 |
| F | q4_courtesy | Number | Integer | 1-5 |
| G | q5_reliability | Number | Integer | 1-5 |
| H | q6_security | Number | Integer | 1-5 |
| I | q7_response_time | Number | Integer | 1-5 |
| J | q8_facilities | Number | Integer | 1-5 |
| K | q9_suggestions | Text | Text | Max 1000 chars |
| L | demographic_age | Text | Text | Optional |
| M | demographic_service | Text | Text | Optional |
| N | user_agent | Text | Text | Optional |
| O | ip_hash | Text | Text | Optional |
| P | overall_score | Number | Decimal | 1.0-5.0 |

### Adding Headers:

1. Click cell **A1**
2. Type: `id`
3. Press Tab to move to B1
4. Type: `timestamp`
5. Continue for all 16 columns as shown above

**Alternatively, copy and paste this header row:**

```
id	timestamp	q1_accessibility	q2_service_quality	q3_professionalism	q4_courtesy	q5_reliability	q6_security	q7_response_time	q8_facilities	q9_suggestions	demographic_age	demographic_service	user_agent	ip_hash	overall_score
```

---

## Step 4: Format Header Row

1. Select the entire first row by clicking the row number **"1"**
2. Apply formatting:
   - **Bold**: Click Bold button or press Ctrl+B
   - **Background color**: Click Fill color → choose **Light Blue** (#4285F4 or similar)
   - **Text color**: Click Text color → choose **White**
   - **Alignment**: Center align

3. Freeze the header row (optional but recommended):
   - Go to **View** → **Freeze** → **1 row**

---

## Step 5: Add Data Validation for Question Columns

This ensures only valid ratings (1-5) are entered in the response columns.

### For Questions Q1-Q8 (Columns C-J):

1. Select column C (q1_accessibility):
   - Click on the column header **"C"**
   
2. Extend selection to column J:
   - Hold Shift and click column **"J"** header

3. Go to **Data** → **Data validation**

4. Configure validation:
   - Criteria: **Number**
   - Condition: **Between**
   - Min: `1`
   - Max: `5`
   - Show warning: ✓ (checked)
   - Error message: "Please enter a value between 1 and 5"

5. Click **Done**

---

## Step 6: Set Column Widths and Formatting

Adjust column widths for better readability:

1. **ID Column (A)**: Set width to 40 (for UUID)
   - Click column A header
   - Right-click → "Resize column" → Set to 40

2. **Timestamp Column (B)**: Set width to 25
   - Click column B header
   - Right-click → "Resize column" → Set to 25

3. **Question Columns (C-J)**: Set width to 15
   - Select columns C-J
   - Right-click → "Resize column" → Set to 15

4. **Suggestion Column (K)**: Set width to 40
   - Click column K
   - Right-click → "Resize column" → Set to 40

5. **Demographic Columns (L-M)**: Set width to 20 each
   - Select columns L-M
   - Right-click → "Resize column" → Set to 20

6. **Optional Columns (N-O)**: Set width to 20 each
   - Select columns N-O
   - Right-click → "Resize column" → Set to 20

7. **Overall Score Column (P)**: Set width to 15
   - Click column P
   - Right-click → "Resize column" → Set to 15

---

## Step 7: Create Analytics Cache Sheet

This sheet stores aggregated analytics updated hourly by the Google Apps Script.

1. Right-click on an empty area next to the "responses" tab
2. Select **"Insert 1 below"**
3. Rename to **"analytics"**

4. Add headers in row 1:

| Column | Header Name |
|--------|------------|
| A | date |
| B | total_responses |
| C | avg_satisfaction |
| D | satisfaction_very_satisfied |
| E | satisfaction_satisfied |
| F | satisfaction_neutral |
| G | satisfaction_dissatisfied |
| H | satisfaction_very_dissatisfied |
| I | dimension_accessibility_avg |
| J | dimension_quality_avg |
| K | dimension_professionalism_avg |
| L | dimension_courtesy_avg |
| M | dimension_reliability_avg |
| N | dimension_security_avg |
| O | dimension_response_time_avg |
| P | dimension_facilities_avg |
| Q | updated_at |

5. Format the header row (bold, blue background, white text) the same as the responses sheet

---

## Step 8: Create Backup/Reference Sheet

This sheet documents the schema for reference.

1. Right-click on an empty area next to the "analytics" tab
2. Select **"Insert 1 below"**
3. Rename to **"backup"** or **"reference"**

4. Add documentation (optional):
   - Add a title in A1: "SKM Questionnaire Response Structure"
   - Add column definitions:
     - A2: "Column Name"
     - B2: "Type"
     - C2: "Description"
     - D2: "Example"

   Then list each column from the responses sheet:

```
Column Name              | Type    | Description                          | Example
id                      | Text    | Unique response ID (UUID)            | 550e8400-e29b-41d4-a716-446655440000
timestamp               | Text    | ISO 8601 DateTime                    | 2024-01-15T14:30:00Z
q1_accessibility        | Number  | Service accessibility rating (1-5)  | 4
q2_service_quality      | Number  | Service quality rating (1-5)        | 5
q3_professionalism      | Number  | Professionalism rating (1-5)        | 4
q4_courtesy             | Number  | Staff courtesy rating (1-5)         | 5
q5_reliability          | Number  | Service reliability rating (1-5)    | 4
q6_security             | Number  | Data security rating (1-5)          | 3
q7_response_time        | Number  | Response time rating (1-5)          | 5
q8_facilities           | Number  | Facilities rating (1-5)             | 4
q9_suggestions          | Text    | Open-ended feedback (max 1000)      | "Great service!"
demographic_age         | Text    | Age group (optional)                 | "25-34"
demographic_service     | Text    | Service category (optional)          | "Health"
user_agent              | Text    | Browser/device identifier           | "GoogleAppsScript"
ip_hash                 | Text    | Hashed IP address                   | "N/A"
overall_score           | Number  | Average of Q1-Q8 (1.0-5.0)          | 4.25
```

---

## Step 9: Link Google Apps Script to the Sheet

This step connects the Apps Script to this Google Sheet so it can read/write responses.

1. In your Google Sheet, go to **Extensions** → **Apps Script**

2. This will open the Apps Script editor (if not already done in Task 8)

3. In the Apps Script editor:
   - Click the **Projects Settings** icon (gear icon)
   - Scroll down to find "Google Cloud Platform (GCP) Project"
   - Note the GCP Project ID (you may need this for API setup later)

4. Link the sheet:
   - In the Apps Script editor, click the **Sheet icon** (left sidebar)
   - Select this Google Sheet from the dropdown

---

## Step 10: Set Up Google Apps Script Triggers

The Apps Script needs a trigger to recalculate analytics hourly.

1. In Apps Script editor, click the **Triggers** icon (clock icon) in the left sidebar

2. Click **"+ Create new trigger"** (bottom right)

3. Configure the trigger:
   - **Function to execute**: `recalculateAnalytics`
   - **Type of event**: **Time-driven**
   - **Frequency**: **Hour timer** → **Every hour**
   - **Failure notification**: Email me (optional)

4. Click **Save**

5. Grant permissions when prompted:
   - Review the requested permissions
   - Click **"Allow"**

---

## Step 11: Test the Setup

### Test 1: Verify Sheet Structure

1. Check that all 16 columns are present in the responses sheet
2. Verify header row is frozen and formatted
3. Verify data validation is applied to columns C-J

### Test 2: Deploy and Test Apps Script

1. In the Apps Script editor, click **Deploy** → **New Deployment**

2. Configure deployment:
   - **Type**: Select **Web app**
   - **Execute as**: Your Google Account
   - **Who has access**: **Anyone**

3. Click **Deploy**

4. Copy the deployment URL that appears:
   ```
   https://script.google.com/macros/d/{SCRIPT_ID}/userweb
   ```

5. Add this URL to your `.env` file:
   ```
   GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/{SCRIPT_ID}/userweb
   ```

### Test 3: Submit Test Response

1. In your Next.js application, submit a test form response
2. Verify that the response appears in the Google Sheet's responses table
3. Check that:
   - All questions are populated
   - Timestamp is correct
   - Overall score is calculated (average of Q1-Q8)
   - ID is a valid UUID

### Test 4: Verify Analytics Calculation

1. Wait for the top of the next hour (or manually trigger `recalculateAnalytics` from Apps Script editor)
2. Check the analytics sheet
3. Verify that:
   - total_responses = 1 (from test response)
   - avg_satisfaction is calculated correctly
   - satisfaction distribution shows 1 response at the correct rating level

---

## Sheet Security Recommendations

### 1. Protect the Analytics Sheet

To prevent accidental modifications to the analytics cache:

1. Right-click on "analytics" sheet tab
2. Select **"Protect sheets and ranges"**
3. Click **"Add protection"**
4. Select **"Sheet"** and choose the analytics sheet
5. Click **"Set permissions"**
6. Choose **"Restrict who can edit"**
7. Select your email/account
8. Click **Done**

### 2. Backup Sheet Protection

1. Right-click on "backup" sheet tab
2. Select **"Protect sheets and ranges"**
3. Follow steps 3-8 above

### 3. Share Settings

- Keep the main spreadsheet **"Restricted"** (shared only with authorized admins)
- Do NOT make it "Anyone with link" unless specifically required
- Use **Viewer only** access for team members who should only view data

---

## Accessing Sheet Data via API (Advanced)

For programmatic access to the sheet data (beyond the Apps Script webhook):

### Option 1: Google Sheets API (Read-only)

1. Enable Google Sheets API:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create or select your project
   - Search for "Google Sheets API"
   - Click **Enable**

2. Create Service Account credentials:
   - Go to **Credentials** → **Create Credentials** → **Service Account**
   - Follow the setup wizard
   - Download the JSON key file

3. Share the spreadsheet with the service account email

4. Use the credentials to read data from the sheet programmatically

### Option 2: Query Data via Apps Script

The existing Apps Script provides these endpoints:

- **Health check**: `?action=health`
- **Analytics**: `?action=analytics&token={ADMIN_TOKEN}`
- **Debug logs**: `?action=debug&token={ADMIN_TOKEN}`
- **Clear logs**: `?action=clear-logs&token={ADMIN_TOKEN}`

---

## Troubleshooting

### Issue: "Sheet not found" error from Apps Script

**Solution**:
1. Verify the sheet name matches exactly: `responses`
2. Check that the sheet exists and has data
3. In Apps Script editor, run the `getResponseSheet()` function manually to debug

### Issue: Data not appearing in sheet after form submission

**Solution**:
1. Check that the Apps Script is deployed as a web app
2. Verify the deployment URL is correct in `.env`
3. Check browser console for network errors
4. Check Apps Script editor for execution logs (View → Execution log)

### Issue: Data validation not working

**Solution**:
1. Ensure columns C-J are selected (not just C)
2. Verify validation rule is set to "Between 1 and 5"
3. Note: Existing data may not trigger validation; validation only applies to new entries

### Issue: Analytics sheet not updating

**Solution**:
1. Verify the trigger is set up correctly (Triggers icon → check "recalculateAnalytics")
2. Check that the trigger is set to "Every hour"
3. Manually run the function:
   - In Apps Script editor, select `recalculateAnalytics` from function dropdown
   - Click the Play/Run button
   - Check execution logs for errors

---

## Summary Checklist

- [ ] Created Google Sheet named "SKM Questionnaire Responses"
- [ ] Renamed default sheet to "responses"
- [ ] Added 16 column headers to responses sheet
- [ ] Formatted header row (bold, blue background, white text)
- [ ] Froze header row (View → Freeze → 1 row)
- [ ] Added data validation to columns C-J (1-5 range)
- [ ] Adjusted column widths for readability
- [ ] Created "analytics" sheet with appropriate headers
- [ ] Created "backup" sheet with documentation
- [ ] Linked Google Apps Script to the sheet (Extensions → Apps Script)
- [ ] Set up hourly trigger for `recalculateAnalytics`
- [ ] Deployed Apps Script as web app
- [ ] Added GOOGLE_APPS_SCRIPT_URL to .env
- [ ] Tested form submission and verified response appears in sheet
- [ ] Tested analytics calculation
- [ ] Set up sheet protection and sharing settings

---

## Next Steps

After completing this setup:

1. **Task 11**: Implement Google Apps Script form validation and row insertion
2. **Task 12**: Implement Google Sheets backend analytics queries
3. **Task 9**: Implement Google Sheets backend form submission (complete with this sheet)

The sheet is now ready to receive form submissions from the Next.js frontend through the Google Apps Script webhook.

