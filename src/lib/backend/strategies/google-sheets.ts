/**
 * Google Sheets Backend Implementation
 * 
 * Implements BackendStrategy interface for Google Sheets storage
 * 
 * Handles:
 * - Form submission via Google Apps Script webhook
 * - Analytics data retrieval via Apps Script API
 * - Data export via Apps Script
 * 
 * AC9: Google Sheets backend for form submission (Task 9)
 * AC3: Form submission endpoint validation and storage
 * 
 * Configuration:
 * - GOOGLE_APPS_SCRIPT_URL: Deployed Apps Script web app URL
 * - GOOGLE_SHEET_ID: Target Google Sheet ID
 * - ADMIN_TOKEN: Admin token for protected endpoints
 */

import type { BackendStrategy } from '../../types/backend'
import type { QuestionnaireResponse, AnalyticsData } from '../../types/questionnaire'

/**
 * Maximum number of retry attempts for failed submissions
 */
const MAX_RETRY_ATTEMPTS = 3

/**
 * Delay between retry attempts in milliseconds (exponential backoff)
 */
const RETRY_DELAY_MS = 1000

/**
 * Timeout for webhook calls in milliseconds
 */
const WEBHOOK_TIMEOUT_MS = 30000

/**
 * Analytics cache TTL in milliseconds (5 minutes)
 */
const ANALYTICS_CACHE_TTL_MS = 5 * 60 * 1000

/**
 * Cache entry for analytics data with timestamp
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
}

/**
 * In-memory analytics cache (module-level)
 */
const analyticsCache = new Map<string, CacheEntry<AnalyticsData>>()

/**
 * Google Sheets Backend Implementation
 * Manages form submission and data retrieval via Google Apps Script
 */
export class GoogleSheetsBackend implements BackendStrategy {
  private appsScriptUrl: string
  private sheetId: string
  private adminToken: string

  /**
   * Initialize Google Sheets backend with configuration from environment variables
   */
  constructor() {
    this.appsScriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_URL ||
      'https://script.google.com/macros/d/your-script-id/usercontent'
    this.sheetId = process.env.GOOGLE_SHEET_ID || 'your-sheet-id'
    this.adminToken = process.env.ADMIN_TOKEN || ''

    // Validate configuration
    if (!this.appsScriptUrl || this.appsScriptUrl.includes('your-script-id')) {
      throw new Error(
        'GOOGLE_APPS_SCRIPT_URL environment variable is not properly configured. ' +
          'Please set it to your deployed Google Apps Script URL.'
      )
    }

    if (!this.sheetId || this.sheetId === 'your-sheet-id') {
      throw new Error(
        'GOOGLE_SHEET_ID environment variable is not properly configured. ' +
          'Please set it to your Google Sheet ID.'
      )
    }

    if (!this.adminToken) {
      console.warn(
        '[GoogleSheetsBackend] ADMIN_TOKEN not configured. Admin endpoints will be protected by token validation.'
      )
    }
  }

  /**
   * Submit a questionnaire response to Google Sheet via Apps Script webhook
   * 
   * Sends the response data to the deployed Google Apps Script,
   * which validates, enriches, and appends the data to the sheet.
   * 
   * Includes retry logic with exponential backoff for resilience.
   * 
   * @param data Complete questionnaire response
   * @returns Promise resolving to response ID
   * @throws Error if submission fails after all retries
   */
  async submitResponse(data: QuestionnaireResponse): Promise<string> {
    // Normalize the data to match Apps Script expectations
    const payload = this.normalizeResponseData(data)

    // Attempt submission with retry logic
    let lastError: Error | null = null
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await this.submitToAppsScript(payload, attempt)
        analyticsCache.clear()
        return response.id
      } catch (error) {
        lastError = error as Error
        console.warn(
          `[GoogleSheetsBackend] Submission attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed:`,
          lastError.message
        )

        // Don't retry on validation errors
        if (
          error instanceof Error &&
          (error.message.includes('Validation failed') ||
            error.message.includes('Invalid JSON'))
        ) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        if (attempt < MAX_RETRY_ATTEMPTS) {
          const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1)
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed to submit response after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`
    )
  }

  /**
   * Retrieve aggregated analytics data from Google Sheet
   * 
   * Queries the Apps Script endpoint to get analytics data
   * which includes total responses, satisfaction distribution, and dimension averages.
   * Implements 5-minute in-memory caching to reduce API calls.
   * 
   * @param startDate Optional start date filter (not yet supported)
   * @param endDate Optional end date filter (not yet supported)
   * @returns Promise resolving to aggregated analytics
   * @throws Error if backend is unavailable
   */
  async getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    try {
      // Generate cache key (use date range if provided)
      const cacheKey = startDate || endDate 
        ? `${startDate?.toISOString()}_${endDate?.toISOString()}`
        : 'default'

      // Check cache
      const cached = analyticsCache.get(cacheKey)
      const now = Date.now()
      
      if (cached && (now - cached.timestamp) < ANALYTICS_CACHE_TTL_MS) {
        console.log('[GoogleSheetsBackend] Analytics cache hit for key:', cacheKey)
        return cached.data
      }

      if (cached) {
        console.log('[GoogleSheetsBackend] Analytics cache expired for key:', cacheKey)
      } else {
        console.log('[GoogleSheetsBackend] Analytics cache miss for key:', cacheKey)
      }

      const url = new URL(this.appsScriptUrl)
      url.searchParams.set('action', 'analytics')
      url.searchParams.set('token', this.adminToken)

      // Add optional date filters
      if (startDate) {
        url.searchParams.set('startDate', startDate.toISOString())
      }
      if (endDate) {
        url.searchParams.set('endDate', endDate.toISOString())
      }

      const response = await this.fetchWithTimeout(url.toString(), {
        method: 'GET',
      })

      if (!response.success || !response.data) {
        throw new Error(`Analytics query failed: ${response.error?.message || 'Unknown error'}`)
      }

      // Map response to AnalyticsData interface
      const analytics = this.mapAnalyticsResponse(response.data)

      // Store in cache
      analyticsCache.set(cacheKey, {
        data: analytics,
        timestamp: now,
      })

      console.log('[GoogleSheetsBackend] Analytics cached for key:', cacheKey)

      return analytics
    } catch (error) {
      console.error('[GoogleSheetsBackend] Failed to retrieve analytics:', error)
      throw new Error(
        `Failed to retrieve analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Export responses in specified format (CSV or Excel)
   * 
   * Calls Apps Script endpoint with action=export to retrieve data.
   * For CSV: Converts the returned csvContent string to Buffer with proper escaping.
   * For Excel: Uses xlsx package to create XLSX file from CSV data.
   * 
   * Sorting: Results sorted by timestamp in descending order (newest first).
   * 
   * @param format Export format ('csv' or 'excel')
   * @param startDate Optional start date filter (ISO string format)
   * @param endDate Optional end date filter (ISO string format)
   * @returns Promise resolving to binary buffer of exported file
   * @throws 400 Error if date range is invalid (startDate > endDate)
   * @throws 503 Error if backend is unavailable
   * @throws Error if export fails for other reasons
   */
  async exportResponses(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer> {
    try {
      // Validate date parameters
      if (startDate && endDate && startDate > endDate) {
        const error = new Error('Invalid date range: startDate cannot be after endDate')
        ;(error as any).statusCode = 400
        throw error
      }

      // Validate date format
      if (startDate && isNaN(startDate.getTime())) {
        const error = new Error('Invalid startDate format')
        ;(error as any).statusCode = 400
        throw error
      }

      if (endDate && isNaN(endDate.getTime())) {
        const error = new Error('Invalid endDate format')
        ;(error as any).statusCode = 400
        throw error
      }

      const url = new URL(this.appsScriptUrl)
      url.searchParams.set('action', 'export')
      url.searchParams.set('format', 'csv') // Always request CSV from Apps Script
      url.searchParams.set('token', this.adminToken)

      if (startDate) {
        url.searchParams.set('startDate', startDate.toISOString())
      }
      if (endDate) {
        url.searchParams.set('endDate', endDate.toISOString())
      }

      const response = await this.fetchWithTimeout(url.toString(), {
        method: 'GET',
      })

      if (!response.success) {
        // Handle 503 unavailable error
        if (response.error?.statusCode === 503) {
          const error = new Error(
            `Backend unavailable: ${response.error?.message || 'Google Sheets service temporarily unavailable'}`
          )
          ;(error as any).statusCode = 503
          throw error
        }

        throw new Error(`Export failed: ${response.error?.message || 'Unknown error'}`)
      }

      // Extract CSV content
      const csvContent = response.data?.csvContent
      if (!csvContent) {
        throw new Error('No CSV content returned from Apps Script')
      }

      if (format === 'csv') {
        // Return CSV buffer with UTF-8 encoding and BOM for Excel compatibility
        const bom = Buffer.from('\uFEFF', 'utf-8')
        const csvBuffer = Buffer.from(csvContent, 'utf-8')
        return Buffer.concat([bom, csvBuffer])
      }

      if (format === 'excel') {
        return this.convertCsvToExcel(csvContent)
      }

      throw new Error(`Unsupported export format: ${format}`)
    } catch (error) {
      // Re-throw with status code if present
      if (error instanceof Error && (error as any).statusCode) {
        throw error
      }

      // Determine if this is a 503 error (backend unavailable)
      if (error instanceof Error && error.message.includes('timeout')) {
        const timeoutError = new Error('Backend service unavailable (timeout)')
        ;(timeoutError as any).statusCode = 503
        throw timeoutError
      }

      console.error('[GoogleSheetsBackend] Failed to export responses:', error)
      throw error
    }
  }

  /**
   * Converts CSV content to Excel (XLSX) format using xlsx package
   * 
   * Parses CSV string into rows, creates workbook with proper formatting.
   * Falls back to CSV buffer if xlsx package is not available.
   * 
   * @param csvContent CSV content string
   * @returns Excel file as Buffer
   * @throws Error if conversion fails
   */
  private convertCsvToExcel(csvContent: string): Buffer {
    try {
      // Dynamic require to handle optional dependency
      // eslint-disable-next-line global-require
      const xlsx = require('xlsx')

      // Parse CSV content into rows
      const rows = this.parseCsvContent(csvContent)

      if (rows.length === 0) {
        throw new Error('CSV content is empty')
      }

      // Create workbook and worksheet
      const workbook = xlsx.utils.book_new()
      const worksheet = xlsx.utils.aoa_to_sheet(rows)

      // Auto-fit column widths (approximate)
      const colWidths = this.calculateColumnWidths(rows)
      worksheet['!cols'] = colWidths

      xlsx.utils.book_append_sheet(workbook, worksheet, 'SKM Responses')

      // Write to buffer
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
      return buffer as Buffer
    } catch (xlsxError) {
      // If xlsx is not available or conversion fails, throw error
      console.error('[GoogleSheetsBackend] Failed to convert CSV to Excel:', xlsxError)
      throw new Error(
        `Failed to generate Excel file: ${xlsxError instanceof Error ? xlsxError.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Parses CSV content string into 2D array (array of rows)
   * Handles quoted fields and escaped commas properly
   * Sorts by timestamp (first column) in descending order
   * 
   * @param csvContent Raw CSV content
   * @returns 2D array of parsed CSV data
   */
  private parseCsvContent(csvContent: string): string[][] {
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentField = ''
    let insideQuotes = false

    for (let i = 0; i < csvContent.length; i++) {
      const char = csvContent[i]
      const nextChar = csvContent[i + 1]

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"'
          i++
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes
        }
      } else if (char === ',' && !insideQuotes) {
        // Field separator
        currentRow.push(currentField)
        currentField = ''
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        // Row separator
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField)
          rows.push(currentRow)
          currentRow = []
          currentField = ''
        }
        // Skip CRLF
        if (char === '\r' && nextChar === '\n') {
          i++
        }
      } else {
        currentField += char
      }
    }

    // Add last field and row
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField)
      rows.push(currentRow)
    }

    // Sort by timestamp descending (assuming first column is timestamp)
    if (rows.length > 1) {
      const header = rows[0]
      const dataRows = rows.slice(1)

      dataRows.sort((a, b) => {
        const timestampA = new Date(a[0]).getTime()
        const timestampB = new Date(b[0]).getTime()
        return timestampB - timestampA // Descending order
      })

      return [header, ...dataRows]
    }

    return rows
  }

  /**
   * Calculates optimal column widths for Excel worksheet
   * 
   * @param rows 2D array of data
   * @returns Array of column width objects for xlsx
   */
  private calculateColumnWidths(rows: string[][]): Array<{ wch: number }> {
    if (rows.length === 0) {
      return []
    }

    const colWidths: Array<{ wch: number }> = []
    const maxCols = Math.max(...rows.map((r) => r.length))

    for (let col = 0; col < maxCols; col++) {
      let maxWidth = 10 // Minimum width
      for (let row = 0; row < rows.length; row++) {
        const cellValue = rows[row][col] || ''
        const cellWidth = cellValue.length + 2 // Add padding
        maxWidth = Math.max(maxWidth, Math.min(cellWidth, 50)) // Cap at 50
      }
      colWidths.push({ wch: maxWidth })
    }

    return colWidths
  }

  /**
   * Delete a specific response by ID
   * 
   * Note: Deletion via Google Sheets API is complex.
   * This placeholder will be implemented in a future task if needed.
   * 
   * @param responseId Response ID to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error indicating feature not yet implemented
   */
  async deleteResponse(_responseId: string): Promise<void> {
    throw new Error(
      `Response deletion not yet implemented for Google Sheets backend. ` +
        `Use manual deletion via Google Sheets interface for now.`
    )
  }

  /**
   * Get total count of responses in the backend
   * 
   * @returns Promise resolving to total response count
   * @throws Error if backend is unavailable
   */
  async getResponseCount(): Promise<number> {
    try {
      const analytics = await this.getAnalytics()
      return analytics.totalResponses
    } catch (error) {
      console.error('[GoogleSheetsBackend] Failed to get response count:', error)
      throw error
    }
  }

  /**
   * Health check to verify backend connectivity and availability
   * 
   * Attempts to connect to the Google Apps Script webhook.
   * 
   * @returns Promise resolving to status object
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error' }> {
    try {
      const url = new URL(this.appsScriptUrl)
      url.searchParams.set('action', 'health')

      const response = await this.fetchWithTimeout(url.toString(), {
        method: 'GET',
      })

      if (response.success && response.data?.status === 'ok') {
        return { status: 'ok' }
      }

      return { status: 'error' }
    } catch (error) {
      console.error('[GoogleSheetsBackend] Health check failed:', error)
      return { status: 'error' }
    }
  }

  /**
   * Private Methods
   */

  /**
   * Normalizes incoming response data to match Google Apps Script format
   * 
   * Converts from the frontend's Q1-Q20 format to a flattened structure
   * that the Apps Script expects.
   * 
   * @param data Raw questionnaire response
   * @returns Normalized payload for Apps Script
   */
  private normalizeResponseData(data: any): Record<string, any> {
    const toScore = (val: any) => {
      if (typeof val === 'number') return val
      if (val === 'A') return 1
      if (val === 'B') return 2
      if (val === 'C') return 3
      if (val === 'D') return 4
      return parseInt(val, 10) || 1
    }

    // Support both new format (u1-u9) and legacy format (Q1-Q9)
    return {
      // New Indonesian format (primary)
      u1_persyaratan: toScore(data.u1_persyaratan ?? data.Q1),
      u2_prosedur: toScore(data.u2_prosedur ?? data.Q2),
      u3_waktu: toScore(data.u3_waktu ?? data.Q3),
      u4_biaya: toScore(data.u4_biaya ?? data.Q4),
      u5_produk: toScore(data.u5_produk ?? data.Q5),
      u6_kompetensi: toScore(data.u6_kompetensi ?? data.Q6),
      u7_keramahan: toScore(data.u7_keramahan ?? data.Q7),
      u8_sarana: toScore(data.u8_sarana ?? data.Q8),
      u9_pengaduan: toScore(data.u9_pengaduan ?? data.Q9),
      
      // Demographics (both formats)
      jenis_kelamin: data.jenis_kelamin || data.gender || '',
      usia: data.usia || data.age || '',
      pendidikan: data.pendidikan || data.education || '',
      jenis_layanan: data.jenis_layanan || data.service_type || '',
      
      // Suggestions
      saran: data.saran || data.Q21 || '',
      
      // Legacy demographic fields for backward compatibility
      demographic_gender: data.jenis_kelamin || data.gender || data.demographic_gender || '',
      demographic_age: data.usia || data.age || data.demographic_age || '',
      demographic_education: data.pendidikan || data.education || data.demographic_education || '',
      demographic_service: data.jenis_layanan || data.service_type || data.demographic_service || '',
      
      // Legacy fields for backward compatibility
      gender: data.jenis_kelamin || data.gender || '',
      age: data.usia || data.age || '',
      education: data.pendidikan || data.education || '',
      service_type: data.jenis_layanan || data.service_type || '',
      
      // Legacy Q1-Q9 fields for backward compatibility
      Q1: data.u1_persyaratan ?? data.Q1,
      Q2: data.u2_prosedur ?? data.Q2,
      Q3: data.u3_waktu ?? data.Q3,
      Q4: data.u4_biaya ?? data.Q4,
      Q5: data.u5_produk ?? data.Q5,
      Q6: data.u6_kompetensi ?? data.Q6,
      Q7: data.u7_keramahan ?? data.Q7,
      Q8: data.u8_sarana ?? data.Q8,
      Q9: data.u9_pengaduan ?? data.Q9,
    }
  }

  /**
   * Submits response data to Google Apps Script webhook
   * 
   * @param payload Normalized response data
   * @param attemptNumber Current retry attempt number (for logging)
   * @returns Promise resolving to response with ID
   * @throws Error if submission fails
   */
  private async submitToAppsScript(
    payload: Record<string, any>,
    attemptNumber: number
  ): Promise<{ id: string }> {
    try {
      const response = await this.fetchWithTimeout(this.appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.success) {
        const errorMessage =
          response.error?.message ||
          response.error?.type ||
          'Unknown error from Apps Script'
        throw new Error(`Apps Script error: ${errorMessage}`)
      }

      if (!response.data?.id) {
        throw new Error('Response ID missing from Apps Script response')
      }

      console.log(
        `[GoogleSheetsBackend] Submission successful (attempt ${attemptNumber}):`,
        response.data.id
      )

      return response.data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Submission failed: ${error}`)
    }
  }

  /**
   * Maps Google Apps Script analytics response to AnalyticsData interface
   * 
   * Calculates satisfaction rate from distribution and fills in optional analytics fields.
   * 
   * @param data Raw analytics data from Apps Script
   * @returns Mapped AnalyticsData
   */
  private mapAnalyticsResponse(data: any): AnalyticsData {
    // Extract distribution with defaults
    const distribution = {
      verySatisfied: data.satisfactionDistribution?.verySatisfied || 0,
      satisfied: data.satisfactionDistribution?.satisfied || 0,
      neutral: data.satisfactionDistribution?.neutral || 0,
      dissatisfied: data.satisfactionDistribution?.dissatisfied || 0,
      veryDissatisfied: data.satisfactionDistribution?.veryDissatisfied || 0,
    }

    // Calculate satisfaction rate: (verySatisfied + satisfied) / total * 100
    const totalResponses = data.totalResponses || 0
    const satisfiedCount = distribution.verySatisfied + distribution.satisfied
    const satisfactionRate = totalResponses > 0 ? (satisfiedCount / totalResponses) * 100 : 0

    // Extract dimension averages
    const dimensionAverages = {
      accessibility: data.dimensionAverages?.accessibility || 0,
      serviceQuality: data.dimensionAverages?.serviceQuality || 0,
      professionalism: data.dimensionAverages?.professionalism || 0,
      courtesy: data.dimensionAverages?.courtesy || 0,
      reliability: data.dimensionAverages?.reliability || 0,
      security: data.dimensionAverages?.security || 0,
      responseTime: data.dimensionAverages?.responseTime || 0,
      facilities: data.dimensionAverages?.facilities || 0,
    }

    // Extract or initialize dimension response counts
    const dimensionResponseCounts = {
      accessibility: data.dimensionResponseCounts?.accessibility || 0,
      serviceQuality: data.dimensionResponseCounts?.serviceQuality || 0,
      professionalism: data.dimensionResponseCounts?.professionalism || 0,
      courtesy: data.dimensionResponseCounts?.courtesy || 0,
      reliability: data.dimensionResponseCounts?.reliability || 0,
      security: data.dimensionResponseCounts?.security || 0,
      responseTime: data.dimensionResponseCounts?.responseTime || 0,
      facilities: data.dimensionResponseCounts?.facilities || 0,
    }

    // Extract daily trend if provided
    const dailyTrend = (data.dailyTrend || []).map((trend: any) => ({
      date: new Date(trend.date),
      count: trend.count || 0,
      avgSatisfaction: trend.avgSatisfaction || 0,
    }))

    return {
      totalResponses,
      avgSatisfaction: data.avgSatisfaction || 0,
      ikmKonversi: data.ikmKonversi || (data.avgSatisfaction ? Number((data.avgSatisfaction * 25).toFixed(2)) : 0),
      ikmSkala4: data.ikmSkala4 || data.avgSatisfaction || 0,
      mutuPelayanan: data.mutuPelayanan || (data.avgSatisfaction >= 3.26 ? 'A (Sangat Baik)' : 'B (Baik)'),
      satisfactionRate,
      satisfactionDistribution: distribution,
      dimensionAverages: dimensionAverages as any,
      dimensionResponseCounts: dimensionResponseCounts as any,
      elements: data.elements,
      demographics: data.demographics,
      responses: data.responses || [],
      dailyTrend,
      completionRate: data.completionRate || 100, // Assume 100% if not provided
      averageCompletionTime: data.averageCompletionTime || 0,
      mostPositiveCategory: data.mostPositiveCategory,
      mostNegativeCategory: data.mostNegativeCategory,
    }
  }

  /**
   * Fetches from a URL with timeout protection
   * 
   * @param url URL to fetch
   * @param options Fetch options
   * @returns Promise resolving to parsed JSON response
   * @throws Error if timeout or network error occurs
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${WEBHOOK_TIMEOUT_MS}ms`)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
