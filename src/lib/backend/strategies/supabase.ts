/**
 * Supabase Backend Implementation
 * 
 * Implements BackendStrategy interface for Supabase PostgreSQL storage
 * 
 * Handles:
 * - Form submission with validation and error handling
 * - Analytics data retrieval via PostgreSQL queries
 * - Data export via SQL queries
 * - Row-level security for admin protection
 * 
 * AC10: Supabase backend for form submission (Task 17)
 * AC3: Form submission endpoint validation and storage
 * 
 * Configuration:
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Public anon key for client access
 * - SUPABASE_SERVICE_KEY: Private service key for admin operations (server-side only)
 * 
 * Note: This implementation supports both anon and service keys:
 * - Form submission: Uses anon key with RLS enabled (public INSERT)
 * - Analytics: Uses service key with admin privileges (READ all data)
 * - Admin operations: Uses service key or JWT from next-auth
 */

import type { BackendStrategy } from '../../types/backend'
import type { QuestionnaireResponse, AnalyticsData } from '../../types/questionnaire'

/**
 * Supabase client initialization
 * Lazy-loaded to prevent errors when Supabase is not installed
 */
let SupabaseClient: any = null

/**
 * Timeout for database operations in milliseconds
 */
const DB_TIMEOUT_MS = 30000

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
 * Initialize Supabase client dynamically to avoid build-time errors
 */
function getSupabaseClient() {
  if (!SupabaseClient) {
    try {
      // Dynamically require to avoid import errors if @supabase/supabase-js not installed
      // eslint-disable-next-line global-require
      const { createClient } = require('@supabase/supabase-js')

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          'Supabase configuration missing. ' +
            'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
        )
      }

      SupabaseClient = createClient(supabaseUrl, supabaseKey)
    } catch (error) {
      throw new Error(
        `Failed to initialize Supabase client: ${error instanceof Error ? error.message : String(error)}. ` +
          'Ensure @supabase/supabase-js is installed and environment variables are set.'
      )
    }
  }
  return SupabaseClient
}

/**
 * Supabase Backend Implementation
 * Manages form submission and data retrieval via PostgreSQL
 */
export class SupabaseBackend implements BackendStrategy {
  private client: any
  private dbTimeoutMs: number

  /**
   * Initialize Supabase backend with configuration from environment variables
   */
  constructor() {
    this.client = getSupabaseClient()
    this.dbTimeoutMs = DB_TIMEOUT_MS
  }

  /**
   * Submit a questionnaire response to Supabase PostgreSQL
   * 
   * Maps frontend Q1-Q20 format to database q1_accessibility through q8_facilities format.
   * Each database field represents the average of multiple related questions:
   * - q1_accessibility: average of Q1, Q2, Q3
   * - q2_service_quality: average of Q4, Q5, Q6
   * - q3_professionalism: average of Q7, Q8
   * - q4_courtesy: average of Q9, Q10
   * - q5_reliability: average of Q11, Q12, Q13
   * - q6_security: average of Q14, Q15
   * - q7_response_time: average of Q16, Q17, Q18
   * - q8_facilities: average of Q19, Q20
   * 
   * Validates data against schema constraints and inserts into responses table.
   * Database constraints enforce that all q1-q8 are present and in valid range (1-5).
   * 
   * Requirements from BACKEND_CONTRACT.md:
   * - Must validate all mandatory questions (Q1-Q20) are present
   * - Must validate satisfaction ratings are in range 1-5
   * - Must guarantee atomic submission (all or nothing)
   * - Must preserve all response data without truncation
   * - Must generate unique response ID (UUID)
   * - Must timestamp submission in UTC
   * 
   * @param data Complete questionnaire response
   * @returns Promise resolving to response ID (UUID)
   * @throws Error if validation fails or backend is unavailable
   */
  async submitResponse(data: QuestionnaireResponse): Promise<string> {
    try {
      // Validate all mandatory questions are present and in valid range
      this.validateQuestionnaireData(data)

      // Map Q1-Q20 to database dimension fields (each dimension is average of related questions)
      const q1_accessibility = this.roundTo2Decimals(this.average([data.Q1!, data.Q2!, data.Q3!]))
      const q2_service_quality = this.roundTo2Decimals(this.average([data.Q4!, data.Q5!, data.Q6!]))
      const q3_professionalism = this.roundTo2Decimals(this.average([data.Q7!, data.Q8!]))
      const q4_courtesy = this.roundTo2Decimals(this.average([data.Q9!, data.Q10!]))
      const q5_reliability = this.roundTo2Decimals(this.average([data.Q11!, data.Q12!, data.Q13!]))
      const q6_security = this.roundTo2Decimals(this.average([data.Q14!, data.Q15!]))
      const q7_response_time = this.roundTo2Decimals(this.average([data.Q16!, data.Q17!, data.Q18!]))
      const q8_facilities = this.roundTo2Decimals(this.average([data.Q19!, data.Q20!]))

      // Prepare the INSERT payload
      const payload = {
        q1_accessibility,
        q2_service_quality,
        q3_professionalism,
        q4_courtesy,
        q5_reliability,
        q6_security,
        q7_response_time,
        q8_facilities,
        q9_suggestions: data.Q21 || null,
        demographic_age: data.demographic_age || null,
        demographic_gender: data.demographic_gender || null,
        demographic_education: data.demographic_education || null,
        demographic_service: data.demographic_service || null,
        user_agent: data.user_agent || null,
        ip_hash: data.ip_hash || null,
      }

      // Insert into responses table with RLS enabled
      // RLS policy allows public INSERT (no authentication required)
      const { data: result, error } = await this.client
        .from('responses')
        .insert([payload])
        .select('id')
        .single()

      if (error) {
        throw new Error(`Database insertion failed: ${error.message}`)
      }

      if (!result?.id) {
        throw new Error('Response ID not returned from database')
      }

      console.log('[SupabaseBackend] Response submitted successfully:', result.id)
      return result.id
    } catch (error) {
      console.error('[SupabaseBackend] Failed to submit response:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Submission failed: ${String(error)}`)
    }
  }

  /**
   * Retrieve aggregated analytics data from Supabase PostgreSQL
   * 
   * Queries the responses table to calculate:
   * - Total responses
   * - Average satisfaction (mean of all dimension averages)
   * - Satisfaction distribution (count of responses by rating 1-5)
   * - Per-dimension averages (accessibility, quality, etc.)
   * - Daily trends (responses per day)
   * - Completion rate
   * 
   * Implements 5-minute in-memory caching to reduce database queries.
   * For large datasets (>1000 responses), logs a note about DB-side RPC efficiency.
   * 
   * Requirements from BACKEND_CONTRACT.md:
   * - Must include 100% of submitted responses
   * - Must calculate accurate averages (arithmetic mean)
   * - Must support date range filtering
   * - Must provide per-dimension aggregation
   * - Must calculate completion rate accurately
   * - Results must be consistent within 5 second latency
   * 
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
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
        console.log('[SupabaseBackend] Analytics cache hit for key:', cacheKey)
        return cached.data
      }

      if (cached) {
        console.log('[SupabaseBackend] Analytics cache expired for key:', cacheKey)
      } else {
        console.log('[SupabaseBackend] Analytics cache miss for key:', cacheKey)
      }

      // Build the base query
      let query = this.client.from('responses').select(
        'created_at, q1_accessibility, q2_service_quality, q3_professionalism, q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities'
      )

      // Apply date filters if provided
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString())
      }

      // Execute query with timeout
      const { data: responses, error: queryError } = await this.withTimeout(
        query,
        this.dbTimeoutMs
      )

      if (queryError) {
        throw new Error(`Analytics query failed: ${queryError.message}`)
      }

      if (!responses || responses.length === 0) {
        // Return empty analytics if no responses
        const emptyAnalytics = this.createEmptyAnalytics()
        analyticsCache.set(cacheKey, {
          data: emptyAnalytics,
          timestamp: now,
        })
        return emptyAnalytics
      }

      // Log note for large datasets
      if (responses.length > 1000) {
        console.log(
          '[SupabaseBackend] Large dataset detected (' + responses.length + ' responses). ' +
          'Consider implementing DB-side RPC for better performance.'
        )
      }

      // Aggregate the data
      const analytics = this.aggregateAnalytics(responses)

      // Store in cache
      analyticsCache.set(cacheKey, {
        data: analytics,
        timestamp: now,
      })

      console.log('[SupabaseBackend] Analytics cached for key:', cacheKey)

      return analytics
    } catch (error) {
      console.error('[SupabaseBackend] Failed to retrieve analytics:', error)
      throw new Error(
        `Failed to retrieve analytics: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Export responses in specified format (CSV or Excel)
   * 
   * Queries all responses from Supabase (with optional date range filtering).
   * For CSV: Builds a CSV string with headers and one row per response, returns as Buffer.
   * For Excel: Uses xlsx package if available, otherwise returns CSV with note.
   * Handles empty data by returning empty CSV/XLSX with just headers.
   * 
   * Column structure: id, created_at, q1_accessibility, q2_service_quality, q3_professionalism,
   * q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities, q9_suggestions,
   * demographic_age, demographic_gender, demographic_education, demographic_service
   * 
   * @param format Export format ('csv' or 'excel')
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @returns Promise resolving to binary buffer of exported file
   * @throws Error if backend is unavailable
   */
  async exportResponses(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer> {
    try {
      // Use service key for export (admin operation)
      const serviceClient = this.client

      // Build query
      let query = serviceClient.from('responses').select(
        'id, created_at, q1_accessibility, q2_service_quality, q3_professionalism, ' +
        'q4_courtesy, q5_reliability, q6_security, q7_response_time, q8_facilities, ' +
        'q9_suggestions, demographic_age, demographic_gender, demographic_education, demographic_service'
      )

      // Apply date filters if provided
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString())
      }

      // Execute query
      const { data: responses, error: queryError } = await query.order('created_at', { ascending: false })

      if (queryError) {
        throw new Error(`Export query failed: ${queryError.message}`)
      }

      const data = responses || []

      // CSV headers
      const headers = [
        'ID', 'Timestamp', 'Accessibility', 'Service Quality', 'Professionalism',
        'Courtesy', 'Reliability', 'Security', 'Response Time', 'Facilities',
        'Suggestions', 'Age', 'Gender', 'Education', 'Service Type',
      ]

      if (format === 'csv') {
        return this.buildCSVBuffer(headers, data)
      }

      if (format === 'excel') {
        try {
          // Dynamic require to avoid build-time errors
          // eslint-disable-next-line global-require
          const xlsx = require('xlsx')

          // Create workbook
          const workbook = xlsx.utils.book_new()
          
          // Prepare data for worksheet
          const wsData = [headers, ...data.map((row: any) => [
            row.id,
            row.created_at,
            row.q1_accessibility,
            row.q2_service_quality,
            row.q3_professionalism,
            row.q4_courtesy,
            row.q5_reliability,
            row.q6_security,
            row.q7_response_time,
            row.q8_facilities,
            row.q9_suggestions || '',
            row.demographic_age || '',
            row.demographic_gender || '',
            row.demographic_education || '',
            row.demographic_service || '',
          ])]

          const worksheet = xlsx.utils.aoa_to_sheet(wsData)
          xlsx.utils.book_append_sheet(workbook, worksheet, 'SKM Responses')

          // Write to buffer
          const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
          return buf as Buffer
        } catch (xlsxError) {
          console.warn('[SupabaseBackend] xlsx package not available, falling back to CSV')
          
          // Fallback to CSV
          const csvContent = 'NOTE: .xlsx support requires xlsx package. Using CSV format instead.\n'
            + this.buildCSVContent(headers, data)
          return Buffer.from(csvContent, 'utf-8')
        }
      }

      throw new Error(`Unsupported export format: ${format}`)
    } catch (error) {
      console.error('[SupabaseBackend] Failed to export responses:', error)
      throw error
    }
  }

  /**
   * Helper: Build CSV content string
   */
  private buildCSVContent(headers: string[], data: any[]): string {
    const rows: string[] = [
      // Headers
      headers.map((h) => `"${h}"`).join(','),
    ]

    // Data rows
    for (const row of data) {
      const values = [
        row.id,
        row.created_at,
        row.q1_accessibility,
        row.q2_service_quality,
        row.q3_professionalism,
        row.q4_courtesy,
        row.q5_reliability,
        row.q6_security,
        row.q7_response_time,
        row.q8_facilities,
        row.q9_suggestions || '',
        row.demographic_age || '',
        row.demographic_gender || '',
        row.demographic_education || '',
        row.demographic_service || '',
      ]
      rows.push(
        values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
      )
    }

    return rows.join('\n')
  }

  /**
   * Helper: Build CSV buffer from headers and data
   */
  private buildCSVBuffer(headers: string[], data: any[]): Buffer {
    const csvContent = this.buildCSVContent(headers, data)
    return Buffer.from(csvContent, 'utf-8')
  }

  /**
   * Delete a specific response by ID
   * 
   * Note: This is an admin-only operation.
   * In production, this should be called from a protected endpoint with JWT validation.
   * 
   * @param responseId Response ID to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if response not found or backend error
   */
  async deleteResponse(responseId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('responses')
        .delete()
        .eq('id', responseId)

      if (error) {
        throw new Error(`Failed to delete response: ${error.message}`)
      }

      console.log('[SupabaseBackend] Response deleted successfully:', responseId)
    } catch (error) {
      console.error('[SupabaseBackend] Failed to delete response:', error)
      throw error
    }
  }

  /**
   * Get total count of responses in the backend
   * 
   * @returns Promise resolving to total response count
   * @throws Error if backend is unavailable
   */
  async getResponseCount(): Promise<number> {
    try {
      const { count, error } = await this.client
        .from('responses')
        .select('*', { count: 'exact', head: true })

      if (error) {
        throw new Error(`Failed to count responses: ${error.message}`)
      }

      return count || 0
    } catch (error) {
      console.error('[SupabaseBackend] Failed to get response count:', error)
      throw error
    }
  }

  /**
   * Health check to verify backend connectivity and availability
   * 
   * Attempts to query the responses table count.
   * 
   * @returns Promise resolving to status object
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error' }> {
    try {
      await this.getResponseCount()
      return { status: 'ok' }
    } catch (error) {
      console.error('[SupabaseBackend] Health check failed:', error)
      return { status: 'error' }
    }
  }

  /**
   * Private Methods
   */

  /**
   * Validates questionnaire response data against constraints
   * 
   * Requirements:
   * - All Q1-Q20 must be present (no optional)
   * - All ratings must be integers between 1 and 5
   * - Q21 (suggestions) is optional
   * - Demographics are optional
   * 
   * @param data Response data to validate
   * @throws Error if validation fails
   */
  private validateQuestionnaireData(data: QuestionnaireResponse): void {
    const errors: string[] = []

    // Check mandatory questions (Q1-Q20)
    for (let i = 1; i <= 20; i++) {
      const key = `Q${i}` as keyof QuestionnaireResponse
      const value = data[key]

      if (value === undefined || value === null) {
        errors.push(`Q${i} is required`)
        continue
      }

      if (!Number.isInteger(value)) {
        errors.push(`Q${i} must be an integer`)
        continue
      }

      if ((value as number) < 1 || (value as number) > 5) {
        errors.push(`Q${i} must be between 1 and 5 (got ${value})`)
      }
    }

    // Validate optional Q21
    if (data.Q21 !== undefined && data.Q21 !== null) {
      if (typeof data.Q21 !== 'string') {
        errors.push('Q21 must be a string')
      } else if (data.Q21.length > 500) {
        errors.push('Q21 must be 500 characters or less')
      }
    }

    // Validate demographics (optional)
    if (data.demographic_age && typeof data.demographic_age !== 'string') {
      errors.push('demographic_age must be a string')
    }
    if (data.demographic_gender && typeof data.demographic_gender !== 'string') {
      errors.push('demographic_gender must be a string')
    }
    if (data.demographic_education && typeof data.demographic_education !== 'string') {
      errors.push('demographic_education must be a string')
    }
    if (data.demographic_service && typeof data.demographic_service !== 'string') {
      errors.push('demographic_service must be a string')
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join('; ')}`)
    }
  }

  /**
   * Aggregates individual responses into analytics data
   * 
   * Note: Database already stores dimension averages in q1_accessibility through q8_facilities.
   * These represent averages of the original Q1-Q20 questions at submission time.
   * 
   * @param responses Array of response records from database
   * @returns Aggregated AnalyticsData with sorted dailyTrend and populated categories
   */
  private aggregateAnalytics(responses: any[]): AnalyticsData {
    const totalResponses = responses.length

    // Calculate average satisfaction across all dimension averages
    const allDimensionAverages: number[] = []
    const dimensionAverages = {
      accessibility: 0,
      serviceQuality: 0,
      professionalism: 0,
      courtesy: 0,
      reliability: 0,
      security: 0,
      responseTime: 0,
      facilities: 0,
    }

    // Collect satisfaction distribution
    const distribution = {
      verySatisfied: 0,
      satisfied: 0,
      neutral: 0,
      dissatisfied: 0,
      veryDissatisfied: 0,
    }

    // Daily trend tracking
    const dailyTrendMap = new Map<string, { count: number; avgSat: number[] }>()

    responses.forEach((response) => {
      // Get dimension values (already averages from submission time)
      const dimensions = [
        response.q1_accessibility,
        response.q2_service_quality,
        response.q3_professionalism,
        response.q4_courtesy,
        response.q5_reliability,
        response.q6_security,
        response.q7_response_time,
        response.q8_facilities,
      ]

      allDimensionAverages.push(...dimensions)

      // Calculate average satisfaction for this response
      const avgRating = this.average(dimensions)

      // Calculate satisfaction distribution (based on average of all dimensions)
      if (avgRating >= 4.5) distribution.verySatisfied += 1
      else if (avgRating >= 3.5) distribution.satisfied += 1
      else if (avgRating >= 2.5) distribution.neutral += 1
      else if (avgRating >= 1.5) distribution.dissatisfied += 1
      else distribution.veryDissatisfied += 1

      // Accumulate dimension averages
      dimensionAverages.accessibility += response.q1_accessibility
      dimensionAverages.serviceQuality += response.q2_service_quality
      dimensionAverages.professionalism += response.q3_professionalism
      dimensionAverages.courtesy += response.q4_courtesy
      dimensionAverages.reliability += response.q5_reliability
      dimensionAverages.security += response.q6_security
      dimensionAverages.responseTime += response.q7_response_time
      dimensionAverages.facilities += response.q8_facilities

      // Track daily trends
      const dateKey = new Date(response.created_at).toISOString().split('T')[0]
      const existing = dailyTrendMap.get(dateKey) || { count: 0, avgSat: [] }
      existing.count += 1
      existing.avgSat.push(avgRating)
      dailyTrendMap.set(dateKey, existing)
    })

    // Finalize dimension averages by dividing by response count
    dimensionAverages.accessibility = this.round(dimensionAverages.accessibility / totalResponses)
    dimensionAverages.serviceQuality = this.round(
      dimensionAverages.serviceQuality / totalResponses
    )
    dimensionAverages.professionalism = this.round(
      dimensionAverages.professionalism / totalResponses
    )
    dimensionAverages.courtesy = this.round(dimensionAverages.courtesy / totalResponses)
    dimensionAverages.reliability = this.round(dimensionAverages.reliability / totalResponses)
    dimensionAverages.security = this.round(dimensionAverages.security / totalResponses)
    dimensionAverages.responseTime = this.round(
      dimensionAverages.responseTime / totalResponses
    )
    dimensionAverages.facilities = this.round(dimensionAverages.facilities / totalResponses)

    // Build daily trend array and sort ascending by date
    const dailyTrend = Array.from(dailyTrendMap.entries())
      .map(([dateStr, data]) => ({
        date: new Date(dateStr),
        count: data.count,
        avgSatisfaction: this.round(
          data.avgSat.reduce((a, b) => a + b, 0) / data.avgSat.length
        ),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Calculate overall average satisfaction
    const avgSatisfaction = this.round(
      allDimensionAverages.reduce((a, b) => a + b, 0) / allDimensionAverages.length
    )

    // Calculate satisfaction rate (% satisfied + very satisfied)
    const satisfactionRate = this.round(
      ((distribution.satisfied + distribution.verySatisfied) / totalResponses) * 100
    )

    // Find most positive and most negative categories
    const dimensionEntries = Object.entries(dimensionAverages) as Array<[string, number]>
    const mostPositiveCategory = dimensionEntries.reduce((a, b) => a[1] > b[1] ? a : b)?.[0]
    const mostNegativeCategory = dimensionEntries.reduce((a, b) => a[1] < b[1] ? a : b)?.[0]

    return {
      totalResponses,
      avgSatisfaction,
      satisfactionRate,
      satisfactionDistribution: distribution,
      dimensionAverages: dimensionAverages as any,
      dimensionResponseCounts: {
        accessibility: totalResponses,
        quality: totalResponses,
        professionalism: totalResponses,
        courtesy: totalResponses,
        reliability: totalResponses,
        security: totalResponses,
        response_time: totalResponses,
        facilities: totalResponses,
      } as any,
      dailyTrend,
      completionRate: 100, // All responses are complete (enforced by DB)
      averageCompletionTime: 0, // Not tracked yet
      mostPositiveCategory: mostPositiveCategory as any,
      mostNegativeCategory: mostNegativeCategory as any,
    }
  }

  /**
   * Creates empty analytics when no responses exist
   */
  private createEmptyAnalytics(): AnalyticsData {
    return {
      totalResponses: 0,
      avgSatisfaction: 0,
      satisfactionRate: 0,
      satisfactionDistribution: {
        verySatisfied: 0,
        satisfied: 0,
        neutral: 0,
        dissatisfied: 0,
        veryDissatisfied: 0,
      },
      dimensionAverages: {
        accessibility: 0,
        serviceQuality: 0,
        professionalism: 0,
        courtesy: 0,
        reliability: 0,
        security: 0,
        responseTime: 0,
        facilities: 0,
      } as any,
      dimensionResponseCounts: {
        accessibility: 0,
        quality: 0,
        professionalism: 0,
        courtesy: 0,
        reliability: 0,
        security: 0,
        response_time: 0,
        facilities: 0,
      } as any,
      dailyTrend: [],
      completionRate: 0,
      averageCompletionTime: 0,
    }
  }

  /**
   * Calculates average of an array of numbers
   */
  private average(arr: number[]): number {
    if (arr.length === 0) return 0
    return arr.reduce((a, b) => a + b, 0) / arr.length
  }

  /**
   * Rounds a number to 2 decimal places
   */
  private round(num: number): number {
    return Math.round(num * 100) / 100
  }

  /**
   * Rounds a number to 2 decimal places (alias for database NUMERIC(3,2) format)
   */
  private roundTo2Decimals(num: number): number {
    return Math.round(num * 100) / 100
  }

  /**
   * Wraps a Supabase query with timeout protection
   * 
   * @param query Supabase query object
   * @param timeoutMs Timeout in milliseconds
   * @returns Promise with query result
   */
  private withTimeout(query: any, timeoutMs: number): Promise<any> {
    return Promise.race([
      query,
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(`Database query timeout after ${timeoutMs}ms`)
            ),
          timeoutMs
        )
      ),
    ])
  }
}
