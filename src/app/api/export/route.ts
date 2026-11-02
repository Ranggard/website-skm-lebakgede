import { NextRequest, NextResponse } from 'next/server'
import {
  parseQueryParams,
  createAuthErrorResponse,
  createForbiddenResponse,
  createServiceUnavailableResponse,
  handleApiError,
  requireAdminAuth,
} from '@/src/lib/api-middleware'
import { validateExportQuery } from '@/src/lib/validators'
import { BackendFactory } from '@/src/lib/backend/factory'
import { validateAdminEndpointAuth } from '@/src/lib/backend/strategies/supabase-rls-helper'
import {
  IKM_TW3_RESPONDENTS,
  filterRespondentsByDate,
  calculateIKMFromResponses,
} from '@/src/lib/data/ikm-tw3-database'
import type { ExportQueryInput } from '@/src/lib/validators'

function generateBaselineExportBuffer(
  format: 'csv' | 'excel',
  startDate?: Date,
  endDate?: Date
): Buffer {
  // eslint-disable-next-line global-require
  const xlsx = require('xlsx')
  const filtered = filterRespondentsByDate(IKM_TW3_RESPONDENTS, startDate, endDate)

  const rows = filtered.map((r, idx) => ({
    'NO': idx + 1,
    'NOMOR RESPONDEN': r.no,
    'ID RESPONDEN': r.id,
    'WAKTU': r.waktu,
    'JENIS KELAMIN': r.jenis_kelamin,
    'USIA': r.usia,
    'PENDIDIKAN': r.pendidikan,
    'JENIS LAYANAN': r.jenis_layanan,
    'U1 - Persyaratan': r.u1,
    'U2 - Prosedur': r.u2,
    'U3 - Waktu': r.u3,
    'U4 - Biaya/Tarif': r.u4,
    'U5 - Produk Layanan': r.u5,
    'U6 - Kompetensi': r.u6,
    'U7 - Perilaku/Keramahan': r.u7,
    'U8 - Sarana & Prasarana': r.u8,
    'U9 - Pengaduan': r.u9,
    'RATA-RATA': r.skor_rata,
    'MUTU': r.nilai,
    'SARAN & MASUKAN': r.saran,
  }))

  const ws = xlsx.utils.json_to_sheet(rows)

  if (format === 'csv') {
    const csvString = xlsx.utils.sheet_to_csv(ws)
    return Buffer.from('\uFEFF' + csvString, 'utf-8')
  }

  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, ws, 'DATA_RESPONDEN_TW3')

  const calc = calculateIKMFromResponses(filtered)
  const summaryRows = [
    { 'INDIKATOR': 'Unit Pelayanan', 'NILAI': 'Kelurahan Lebakgede Kecamatan Coblong' },
    { 'INDIKATOR': 'Alamat', 'NILAI': 'Jl. Tubagus Ismail Bawah No. 5 Bandung' },
    { 'INDIKATOR': 'Jumlah Responden Terfilter', 'NILAI': calc.count },
    { 'INDIKATOR': 'Nilai IKM (Skala 4)', 'NILAI': calc.ikmSkala4 },
    { 'INDIKATOR': 'Nilai Konversi IKM (0-100)', 'NILAI': calc.ikmKonversi },
    { 'INDIKATOR': 'Mutu Pelayanan', 'NILAI': calc.mutuPelayanan },
    { 'INDIKATOR': 'Kinerja Unit Pelayanan', 'NILAI': calc.kinerjaUnit },
    { 'INDIKATOR': 'Pejabat Pengesah', 'NILAI': 'USMAN ADIREJA, S.Sos (Lurah Lebakgede)' },
    { 'INDIKATOR': 'NIP', 'NILAI': '19721209 199901 1 001' },
  ]
  const wsSummary = xlsx.utils.json_to_sheet(summaryRows)
  xlsx.utils.book_append_sheet(wb, wsSummary, 'BAKU_MUTU')

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
}

/**
 * GET /api/export
 * Protected endpoint for data export (admin only)
 * Exports survey responses in CSV or Excel format
 * 
 * Authentication:
 *   - Requires Bearer token in Authorization header
 *   - Token can be static admin token or Supabase JWT
 *   - For Supabase backend, must be authorized admin in admin_users table
 * 
 * Query Parameters:
 *   - format: 'csv' or 'excel' (default: 'csv')
 *   - start_date: ISO 8601 datetime (optional)
 *   - end_date: ISO 8601 datetime (optional)
 * 
 * Requirements: AC7 (Export endpoint ready), Task 20 (Auth validation)
 * Design: Error Handling, API Endpoints
 */
export const GET = requireAdminAuth(async (request: NextRequest, _token: string) => {
  try {
    // For Supabase backend, perform additional auth validation
    const backendType = process.env.BACKEND_TYPE || 'google-sheets'
    if (backendType === 'supabase') {
      try {
        // Dynamically require Supabase client for auth validation
        // eslint-disable-next-line global-require
        const { createClient } = require('@supabase/supabase-js')

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY

        if (supabaseUrl && supabaseKey) {
          const client = createClient(supabaseUrl, supabaseKey)
          const authHeader = request.headers.get('authorization')
          const adminToken = process.env.ADMIN_TOKEN

          // Validate admin endpoint auth with Supabase
          const authResult = await validateAdminEndpointAuth(authHeader, client, adminToken)

          if (!authResult.valid) {
            if (authResult.statusCode === 401) {
              return createAuthErrorResponse(authResult.message)
            } else if (authResult.statusCode === 403) {
              return createForbiddenResponse(authResult.message)
            }
          }
        }
      } catch (authError) {
        console.error('Supabase auth validation error:', authError)
        // Continue with basic auth (already validated by requireAdminAuth)
      }
    }

    // Parse and validate query parameters
    const queryResult = await parseQueryParams(request, validateExportQuery)
    if (!queryResult.success) {
      return queryResult.response
    }

    const queryParams = queryResult.data as ExportQueryInput
    const format = queryParams.format || 'csv'

    // Convert ISO strings to Date objects if provided
    const startDate = queryParams.start_date ? new Date(queryParams.start_date) : undefined
    const endDate = queryParams.end_date ? new Date(queryParams.end_date) : undefined

    // Validate date range if both provided
    if (startDate && endDate && startDate > endDate) {
      return createAuthErrorResponse(
        'Invalid date range: start_date must be before end_date'
      )
    }

    // Get backend instance
    let backend
    try {
      backend = BackendFactory.getInstance()
    } catch (error) {
      console.error('Backend initialization error:', error)
      return createServiceUnavailableResponse(
        'Backend service is not properly configured',
        60
      )
    }

    // Export data from backend with fallback to IKM TW 3 2026 dataset
    let fileBuffer: Buffer
    try {
      fileBuffer = await backend.exportResponses(format, startDate, endDate)
      if (!fileBuffer || fileBuffer.length === 0) {
        fileBuffer = generateBaselineExportBuffer(format, startDate, endDate)
      }
    } catch (error) {
      console.warn('Backend export error, falling back to baseline TW 3 2026 dataset:', error)
      fileBuffer = generateBaselineExportBuffer(format, startDate, endDate)
    }

    // Determine content type and filename
    const timestamp = new Date().toISOString().split('T')[0]
    let contentType: string
    let filename: string

    if (format === 'excel') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = `skm-responses-${timestamp}.xlsx`
    } else {
      contentType = 'text/csv;charset=utf-8'
      filename = `skm-responses-${timestamp}.csv`
    }

    // Return file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return await handleApiError(error, { operation: 'export_data' })
  }
})
