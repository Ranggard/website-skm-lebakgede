# Environment Configuration Guide

This guide explains how to configure the SKM Questionnaire Website for different deployment scenarios (development, staging, production) with support for multiple backends (Google Sheets and Supabase).

## Overview

The application uses environment variables to:
- Select which backend to use (Google Sheets or Supabase)
- Configure backend-specific credentials
- Set application behavior and features
- Enable/disable debugging and logging

## Quick Start

1. Copy `.env.example` to `.env`
2. Fill in your backend credentials
3. Select your backend type
4. Test connectivity

---

## Backend Selection

### Choose One Backend

You **must** select exactly one backend at deployment time via the `BACKEND_TYPE` variable:

```env
# Option 1: Google Sheets
BACKEND_TYPE=google-sheets

# Option 2: Supabase
# BACKEND_TYPE=supabase
```

Switching backends requires:
1. Changing the `BACKEND_TYPE` value
2. Rebuilding the Next.js application (`npm run build`)
3. Redeploying

**Note**: Runtime switching is not supported. The backend is selected at build time.

---

## Configuration by Backend

### Option A: Google Sheets Backend

#### Required Variables

```env
BACKEND_TYPE=google-sheets
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/{YOUR_DEPLOYMENT_ID}/usercallback
GOOGLE_SHEET_ID={YOUR_SHEET_ID}
ADMIN_TOKEN=your-very-secret-admin-token-min-32-chars
```

#### How to Get These Values

**GOOGLE_APPS_SCRIPT_URL**:
1. Go to [Google Apps Script](https://script.google.com)
2. Create or open your "SKM Questionnaire Backend" project
3. Copy the code from `/google-apps-script/Code.gs`
4. Click "Deploy" → "New Deployment" → Type: "Web app"
5. Set "Execute as" to your account and "Who has access" to "Anyone"
6. Click Deploy and copy the provided URL

**GOOGLE_SHEET_ID**:
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new sheet named "SKM Responses"
3. From the URL bar, copy the sheet ID:
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID_HERE}/edit
   ```

**ADMIN_TOKEN**:
- Generate a strong random token (at least 32 characters)
- Example: `8f9d3c4e5a6b7f8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b`
- Keep this secret and secure

#### Setup Reference
- Full guide: `/docs/GOOGLE_APPS_SCRIPT_SETUP.md`

#### Example .env
```env
# Backend Selection
BACKEND_TYPE=google-sheets

# Google Sheets Configuration
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/ABC123DEF456GHI789/usercallback
GOOGLE_SHEET_ID=1abc2def3ghi4jkl5mno6pqr7stu8vwx9yz0abc1def
ADMIN_TOKEN=8f9d3c4e5a6b7f8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Option B: Supabase Backend

#### Required Variables

```env
BACKEND_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
```

#### How to Get These Values

**SUPABASE_URL** and **SUPABASE_ANON_KEY**:
1. Go to [Supabase](https://supabase.com)
2. Create a new project (or use existing)
3. Go to Settings → API
4. Copy the "Project URL" (this is `SUPABASE_URL`)
5. Copy the "anon public" key (this is `SUPABASE_ANON_KEY`)

**SUPABASE_SERVICE_KEY**:
1. In Supabase, go to Settings → API
2. Copy the "service_role secret" key
3. Keep this secret - only use server-side

#### Database Schema

The Supabase backend expects a `survey_responses` table with:

```sql
create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  q1_accessibility integer not null check (q1_accessibility between 1 and 5),
  q2_service_quality integer not null check (q2_service_quality between 1 and 5),
  q3_professionalism integer not null check (q3_professionalism between 1 and 5),
  q4_courtesy integer not null check (q4_courtesy between 1 and 5),
  q5_reliability integer not null check (q5_reliability between 1 and 5),
  q6_security integer not null check (q6_security between 1 and 5),
  q7_response_time integer not null check (q7_response_time between 1 and 5),
  q8_facilities integer not null check (q8_facilities between 1 and 5),
  q9_suggestions text,
  demographic_age text,
  demographic_service text,
  user_agent text,
  ip_hash text,
  overall_score numeric(3, 2)
);

create index idx_survey_responses_created_at on survey_responses(created_at);
```

#### Row-Level Security (RLS) Policies

For public form submission:
```sql
-- Allow public insert (unauthenticated)
create policy "Allow public insert on survey_responses" on survey_responses
  for insert with check (true);

-- Allow admin select with role check
create policy "Allow admin select on survey_responses" on survey_responses
  for select using (auth.role() = 'authenticated' and exists (
    select 1 from admin_users where user_id = auth.uid()
  ));
```

#### Setup Reference
- Full guide: `/docs/SUPABASE_SETUP.md` (see Task 15)

#### Example .env
```env
# Backend Selection
BACKEND_TYPE=supabase

# Supabase Configuration
SUPABASE_URL=https://myproject123.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Shared Configuration

### Application Variables (Both Backends)

```env
# What URL is the app running on?
# Used for redirect URLs, CORS, API callbacks
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production example: https://skm-survey.example.com

# Enable debug logging in console and backend
NEXT_PUBLIC_DEBUG=false
# Set to 'true' for development, 'false' for production

# Analytics cache TTL in seconds (for reducing backend queries)
NEXT_PUBLIC_ANALYTICS_CACHE_TTL=300
# Default: 300 seconds (5 minutes)
```

---

## Environment-Specific Configuration

### Development (.env.local)

```env
# Backend Selection
BACKEND_TYPE=google-sheets

# Google Sheets (or Supabase) Configuration
# [See specific backend section above]

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG=true

# Analytics Cache
NEXT_PUBLIC_ANALYTICS_CACHE_TTL=60
# Shorter cache for faster testing

# Development Server
PORT=3000
```

### Staging (.env.staging)

```env
# Backend Selection
BACKEND_TYPE=google-sheets
# Or BACKEND_TYPE=supabase

# Backend Configuration
# [Use staging Google Sheet ID or Supabase staging project]

# Application Settings
NEXT_PUBLIC_APP_URL=https://staging-skm-survey.example.com
NEXT_PUBLIC_DEBUG=false

# Analytics Cache
NEXT_PUBLIC_ANALYTICS_CACHE_TTL=300
```

### Production (.env.production)

```env
# Backend Selection
BACKEND_TYPE=google-sheets
# Or BACKEND_TYPE=supabase

# Backend Configuration
# [Use production credentials only - KEEP SECURE]

# Application Settings
NEXT_PUBLIC_APP_URL=https://skm-survey.example.com
NEXT_PUBLIC_DEBUG=false

# Analytics Cache
NEXT_PUBLIC_ANALYTICS_CACHE_TTL=300

# Security
NODE_ENV=production
```

---

## How to Set Environment Variables

### Local Development

Create a `.env.local` file in your project root:

```bash
# Copy the example
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### Vercel Deployment

1. Go to your Vercel project settings
2. Go to Environment Variables
3. Add variables for your deployment:

```
BACKEND_TYPE=google-sheets
GOOGLE_APPS_SCRIPT_URL=https://...
GOOGLE_SHEET_ID=...
ADMIN_TOKEN=...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Netlify Deployment

1. Go to your Netlify site settings
2. Go to Build & Deploy → Environment
3. Click "Edit variables"
4. Add the same variables as Vercel

### Docker / Self-Hosted

Set environment variables before running:

```bash
# Via command line
export BACKEND_TYPE=google-sheets
export GOOGLE_APPS_SCRIPT_URL=https://...

# Or in docker-compose.yml
environment:
  - BACKEND_TYPE=google-sheets
  - GOOGLE_APPS_SCRIPT_URL=https://...

# Or in .env file (Docker will read it)
```

---

## Validation

The application validates configuration on startup:

```
✓ BACKEND_TYPE is set and valid
✓ Required backend variables are configured
✓ Can reach backend endpoint (health check)
```

If validation fails, the application will not start and will display which variables are missing.

### Manual Validation

```bash
# Check that variables are loaded
npm run check-env

# Test backend connectivity
npm run test-backend-health
```

---

## Security Best Practices

### Protecting Secrets

1. **Never commit `.env` files** to version control
   ```bash
   # Ensure .env is in .gitignore
   echo ".env*" >> .gitignore
   ```

2. **Use `.env.example` for documentation**
   ```env
   # .env.example (safe to commit)
   BACKEND_TYPE=google-sheets
   GOOGLE_APPS_SCRIPT_URL=your_url_here
   GOOGLE_SHEET_ID=your_sheet_id_here
   ADMIN_TOKEN=your_admin_token_here
   ```

3. **Keep secrets out of code**
   - Never hardcode credentials
   - Always use environment variables
   - Especially for production

4. **Use strong admin tokens**
   - Minimum 32 characters
   - Mix of uppercase, lowercase, numbers, special chars
   - Example generator: `openssl rand -hex 32`

5. **Rotate admin tokens regularly**
   - Change quarterly or after staff changes
   - Update in environment and Google Apps Script
   - No need to redeploy Next.js

6. **Separate credentials by environment**
   - Different admin token for each environment
   - Different Google Sheets/Supabase projects
   - Different deployment URLs

---

## Troubleshooting Configuration

### Error: "BACKEND_TYPE environment variable is not set"

**Solution**: Add `BACKEND_TYPE` to your `.env` file:
```env
BACKEND_TYPE=google-sheets
```

### Error: "Invalid BACKEND_TYPE"

**Solution**: Ensure value is exactly one of:
- `google-sheets`
- `supabase`

Not: `google_sheets`, `GoogleSheets`, `gsheets`, etc.

### Error: "GOOGLE_APPS_SCRIPT_URL is not set"

**Solution**: When using Google Sheets backend, add:
```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercallback
```

### Error: "Cannot reach backend"

**Solution**:
1. Verify the URL is correct
2. Check that Google Apps Script is deployed with "Anyone" access
3. Test with a curl command
4. Check firewall/network connectivity

### Warning: "Multiple backends are configured"

**Solution**: You have credentials for multiple backends. While this works, it's safer to remove unused credentials:
```env
# Remove Supabase variables if using Google Sheets
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_KEY=...
```

---

## Configuration Checklist

### Before Development
- [ ] Select backend type
- [ ] Create `.env.local` from `.env.example`
- [ ] Fill in backend credentials
- [ ] Run `npm run dev` and verify no startup errors
- [ ] Test form submission endpoint
- [ ] Test analytics endpoint

### Before Staging Deployment
- [ ] Create staging backend (separate sheet or Supabase project)
- [ ] Set up staging environment variables
- [ ] Deploy and verify connectivity
- [ ] Test end-to-end flow
- [ ] Verify admin token works

### Before Production Deployment
- [ ] Create production backend with separate credentials
- [ ] Generate new strong admin token
- [ ] Set up production environment variables
- [ ] Enable monitoring and logging
- [ ] Backup any existing data
- [ ] Test failover/recovery procedures
- [ ] Document all credentials in secure location

---

## Reference

### Complete Variable Reference

| Variable | Backend | Required | Example |
|----------|---------|----------|---------|
| `BACKEND_TYPE` | Both | Yes | `google-sheets` |
| `GOOGLE_APPS_SCRIPT_URL` | Google Sheets | Yes | `https://script.google.com/...` |
| `GOOGLE_SHEET_ID` | Google Sheets | Yes | `1abc2def3ghi...` |
| `ADMIN_TOKEN` | Google Sheets | Yes | `8f9d3c4e5a6b...` |
| `SUPABASE_URL` | Supabase | Yes | `https://project.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase | Yes | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_KEY` | Supabase | Yes | `eyJhbGciOi...` |
| `NEXT_PUBLIC_APP_URL` | Both | No | `http://localhost:3000` |
| `NEXT_PUBLIC_DEBUG` | Both | No | `true` |
| `NEXT_PUBLIC_ANALYTICS_CACHE_TTL` | Both | No | `300` |
| `NODE_ENV` | Both | No | `production` |
| `PORT` | Both | No | `3000` |

---

## Next Steps

1. **Create your `.env` file** from `.env.example`
2. **Choose a backend** (Google Sheets or Supabase)
3. **Gather credentials** using the guides above
4. **Validate configuration** by running `npm run dev`
5. **Test backend connectivity** with health check endpoint
6. **Deploy to staging** to verify full integration

---

## Additional Resources

- [Google Apps Script Setup](/docs/GOOGLE_APPS_SCRIPT_SETUP.md)
- [Supabase Setup](/docs/SUPABASE_SETUP.md) (Task 15)
- [Backend Contract](/docs/BACKEND_CONTRACT.md)
- [Deployment Guide](/docs/DEPLOYMENT.md) (Task 41-42)

