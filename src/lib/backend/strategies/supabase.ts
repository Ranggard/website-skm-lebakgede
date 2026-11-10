/**
 * Supabase Backend Implementation for 9 Unsur IKM MenPAN-RB
 * 
 * Handles:
 * - Form submission directly to PostgreSQL `survey_responses` table
 * - Aggregated IKM calculations via `calculateIKM`
 * - Exporting responses into official dual-sheet Excel (DATA_RESPONDEN + BAKU_MUTU)
 * 
 * Configuration:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

import type { BackendStrategy } from '../../types/backend'
import type { QuestionnaireResponse, AnalyticsData } from '../../types/questionnaire'
import {
  calculateIKM,
  letterToScore,
  generateIKMExcelWorkbook,
  IKMRespondentRecord,
  IKM_UNSUR_METADATA,
} from '../../ikm-calculator'

let SupabaseClient: any = null

const ANALYTICS_CACHE_TTL_MS = 60 * 1000 // 1 minute cache
interface CacheEntry<T> {
  data: T
  timestamp: number
}
const analyticsCache = new Map<string, CacheEntry<AnalyticsData>>()

/**
 * Format ID Responden bulanan: RESPYYYYMMDDXXXXX (contoh: RESP2026111000001)
 * Nomor urut (5 digit) otomatis dihitung dan di-reset setiap pergantian bulan.
 */
export function formatRespondentCode(dateInput: Date | string, monthlyIndex: number): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const validDate = isNaN(d.getTime()) ? new Date() : d

  const yyyy = validDate.getFullYear()
  const mm = String(validDate.getMonth() + 1).padStart(2, '0')
  const dd = String(validDate.getDate()).padStart(2, '0')
  const seq = String(monthlyIndex).padStart(5, '0')

  return `RESP${yyyy}${mm}${dd}${seq}`
}

function getSupabaseClient() {
  if (!SupabaseClient) {
    try {
      // eslint-disable-next-line global-require
      const { createClient } = require('@supabase/supabase-js')

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey =
        process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          'Supabase configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
        )
      }

      SupabaseClient = createClient(supabaseUrl, supabaseKey)
    } catch (error) {
      throw new Error(
        `Failed to initialize Supabase client: ${error instanceof Error ? error.message : String(error)}.`
      )
    }
  }
  return SupabaseClient
}

export class SupabaseBackend implements BackendStrategy {
  private client: any

  constructor() {
    this.client = getSupabaseClient()
  }

  /**
   * Submit questionnaire response (9 unsur IKM) to Supabase table
   */
  async submitResponse(data: any): Promise<string> {
    try {
      const u1 = letterToScore(data.Q1 ?? data.u1)
      const u2 = letterToScore(data.Q2 ?? data.u2)
      const u3 = letterToScore(data.Q3 ?? data.u3)
      const u4 = letterToScore(data.Q4 ?? data.u4)
      const u5 = letterToScore(data.Q5 ?? data.u5)
      const u6 = letterToScore(data.Q6 ?? data.u6)
      const u7 = letterToScore(data.Q7 ?? data.u7)
      const u8 = letterToScore(data.Q8 ?? data.u8)
      const u9 = letterToScore(data.Q9 ?? data.u9)

      const payload = {
        gender: data.gender || data.demographic_gender || null,
        age: data.age || data.demographic_age || null,
        education: data.education || data.demographic_education || null,
        service_type: data.service_type || data.demographic_service || null,
        u1,
        u2,
        u3,
        u4,
        u5,
        u6,
        u7,
        u8,
        u9,
        saran: data.saran || data.Q21 || null,
        user_agent: data.user_agent || null,
        ip_hash: data.ip_hash || null,
      }

      const { data: result, error } = await this.client
        .from('survey_responses')
        .insert([payload])
        .select('id, created_at')
        .single()

      if (error) {
        throw new Error(`Database insertion failed: ${error.message}`)
      }

      if (!result?.id) {
        throw new Error('Response ID not returned from Supabase')
      }

      // Hitung urutan responden dalam bulan berjalan untuk menghasilkan format RESPYYYYMMDDXXXXX
      const createdAt = result.created_at ? new Date(result.created_at) : new Date()
      const startOfMonth = new Date(Date.UTC(createdAt.getFullYear(), createdAt.getMonth(), 1, 0, 0, 0))
      const nextMonth = new Date(Date.UTC(createdAt.getFullYear(), createdAt.getMonth() + 1, 1, 0, 0, 0))

      const { count: monthlyCount } = await this.client
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())
        .lt('created_at', nextMonth.toISOString())

      const respondentCode = formatRespondentCode(createdAt, monthlyCount || 1)

      // Invalidate cache
      analyticsCache.clear()

      return respondentCode
    } catch (error) {
      console.error('[SupabaseBackend] Failed to submit response:', error)
      throw error
    }
  }

  /**
   * Get aggregated analytics calculated with official MenPAN-RB IKM TW 3 standard
   */
  async getAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    try {
      const cacheKey = startDate || endDate
        ? `${startDate?.toISOString()}_${endDate?.toISOString()}`
        : 'default'

      const cached = analyticsCache.get(cacheKey)
      const now = Date.now()
      if (cached && now - cached.timestamp < ANALYTICS_CACHE_TTL_MS) {
        return cached.data
      }

      let query = this.client
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString())
      }

      const { data: responses, error } = await query

      if (error) {
        throw new Error(`Failed to fetch responses from Supabase: ${error.message}`)
      }

      // Hitung urutan per bulan (chronological order) untuk menghasilkan ID format RESPYYYYMMDDXXXXX
      // Reset otomatis ke 00001 setiap kali masuk bulan baru
      const monthlySequenceMap = new Map<string, number>()
      const idMap = new Map<string, string>()

      // Urutkan dari data terlama ke terbaru untuk penomoran urut yang konsisten
      const chronological = [...(responses || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      chronological.forEach((r) => {
        const d = r.created_at ? new Date(r.created_at) : new Date()
        const monthKey = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
        const currentCount = (monthlySequenceMap.get(monthKey) || 0) + 1
        monthlySequenceMap.set(monthKey, currentCount)

        const code = r.id_responden || formatRespondentCode(d, currentCount)
        idMap.set(r.id, code)
      })

      const records: IKMRespondentRecord[] = (responses || []).map((r: any, idx: number) => ({
        no: idx + 1,
        id: idMap.get(r.id) || r.id,
        created_at: r.created_at,
        waktu: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-',
        timestamp: r.created_at,
        jenis_kelamin: r.gender,
        usia: r.age,
        pendidikan: r.education,
        jenis_layanan: r.service_type,
        u1: r.u1,
        u2: r.u2,
        u3: r.u3,
        u4: r.u4,
        u5: r.u5,
        u6: r.u6,
        u7: r.u7,
        u8: r.u8,
        u9: r.u9,
        saran: r.saran,
      }))

      const calc = calculateIKM(records)

      const genderMap: Record<string, number> = {}
      const educationMap: Record<string, number> = {}
      const serviceMap: Record<string, number> = {}

      records.forEach((r) => {
        if (r.jenis_kelamin) {
          genderMap[r.jenis_kelamin] = (genderMap[r.jenis_kelamin] || 0) + 1
        }
        if (r.pendidikan) {
          educationMap[r.pendidikan] = (educationMap[r.pendidikan] || 0) + 1
        }
        if (r.jenis_layanan) {
          serviceMap[r.jenis_layanan] = (serviceMap[r.jenis_layanan] || 0) + 1
        }
      })

      const elementsObj: Record<string, { name: string; score: number }> = {}
      calc.unsurStats.forEach((u) => {
        elementsObj[u.key] = {
          name: u.short,
          score: u.nrr,
        }
      })

      const formattedResponses = records.map((r, idx) => {
        const u1 = letterToScore(r.u1)
        const u2 = letterToScore(r.u2)
        const u3 = letterToScore(r.u3)
        const u4 = letterToScore(r.u4)
        const u5 = letterToScore(r.u5)
        const u6 = letterToScore(r.u6)
        const u7 = letterToScore(r.u7)
        const u8 = letterToScore(r.u8)
        const u9 = letterToScore(r.u9)
        const avg = Number(((u1 + u2 + u3 + u4 + u5 + u6 + u7 + u8 + u9) / 9).toFixed(2))

        let nilai: 'A' | 'B' | 'C' | 'D' = 'B'
        if (avg >= 3.53) nilai = 'A'
        else if (avg >= 3.07) nilai = 'B'
        else if (avg >= 2.6) nilai = 'C'
        else nilai = 'D'

        return {
          no: idx + 1,
          id: r.id,
          waktu: r.waktu || r.created_at || '-',
          timestamp: r.created_at,
          jenis_kelamin: r.jenis_kelamin || '-',
          usia: r.usia || '-',
          pendidikan: r.pendidikan || '-',
          jenis_layanan: r.jenis_layanan || '-',
          q1: u1 >= 4 ? 'Sangat Sesuai' : u1 === 3 ? 'Sesuai' : u1 === 2 ? 'Kurang Sesuai' : 'Tidak Sesuai',
          q2: u2 >= 4 ? 'Sangat Mudah' : u2 === 3 ? 'Mudah' : u2 === 2 ? 'Kurang Mudah' : 'Tidak Mudah',
          q3: u3 >= 4 ? 'Sangat Cepat' : u3 === 3 ? 'Cepat' : u3 === 2 ? 'Kurang Cepat' : 'Tidak Cepat',
          q4: u4 >= 4 ? 'Gratis' : u4 === 3 ? 'Murah' : u4 === 2 ? 'Cukup Mahal' : 'Sangat Mahal',
          q5: u5 >= 4 ? 'Sangat Sesuai' : u5 === 3 ? 'Sesuai' : u5 === 2 ? 'Kurang Sesuai' : 'Tidak Sesuai',
          q6: u6 >= 4 ? 'Sangat Kompeten' : u6 === 3 ? 'Kompeten' : u6 === 2 ? 'Kurang Kompeten' : 'Tidak Kompeten',
          q7: u7 >= 4 ? 'Sangat Sopan' : u7 === 3 ? 'Sopan' : u7 === 2 ? 'Kurang Sopan' : 'Tidak Sopan',
          q8: u8 >= 4 ? 'Sangat Baik' : u8 === 3 ? 'Baik' : u8 === 2 ? 'Buruk' : 'Sangat Buruk',
          q9: u9 >= 4 ? 'Dikelola dengan Baik' : u9 === 3 ? 'Berfungsi Kurang Maksimal' : 'Tidak Ada',
          saran: r.saran || '',
          skor_rata: avg,
          nilai,
        }
      })

      const analyticsData: AnalyticsData = {
        totalResponses: calc.totalResponden,
        avgSatisfaction: calc.ikmSkala4,
        ikmSkala4: calc.ikmSkala4,
        ikmKonversi: calc.ikmKonversi,
        mutuPelayanan: calc.mutuPelayanan,
        kinerjaUnitPelayanan: calc.kinerjaUnit,
        satisfactionRate: 100,
        satisfactionDistribution: {
          verySatisfied: formattedResponses.filter((f) => f.nilai === 'A').length,
          satisfied: formattedResponses.filter((f) => f.nilai === 'B').length,
          neutral: formattedResponses.filter((f) => f.nilai === 'C').length,
          dissatisfied: formattedResponses.filter((f) => f.nilai === 'D').length,
          veryDissatisfied: 0,
        },
        dimensionAverages: {
          accessibility: calc.unsurStats[0]?.nrr || 0,
          serviceQuality: calc.unsurStats[1]?.nrr || 0,
          professionalism: calc.unsurStats[5]?.nrr || 0,
          courtesy: calc.unsurStats[6]?.nrr || 0,
          reliability: calc.unsurStats[4]?.nrr || 0,
          security: calc.unsurStats[3]?.nrr || 0,
          responseTime: calc.unsurStats[2]?.nrr || 0,
          facilities: calc.unsurStats[7]?.nrr || 0,
        },
        elements: elementsObj,
        demographics: {
          gender: genderMap,
          education: educationMap,
          serviceType: serviceMap,
        },
        responses: formattedResponses as any,
        lastUpdated: new Date().toISOString(),
      }

      analyticsCache.set(cacheKey, { data: analyticsData, timestamp: now })
      return analyticsData
    } catch (error) {
      console.error('[SupabaseBackend] Failed to get analytics:', error)
      throw error
    }
  }

  /**
   * Export responses to official Excel or CSV format (Dual-sheet IKM TW 3 structure)
   */
  async exportResponses(
    format: 'csv' | 'excel',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer> {
    try {
      let query = this.client
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: true })

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString())
      }

      const { data: responses, error } = await query
      if (error) {
        throw new Error(`Export query failed: ${error.message}`)
      }

      // Hitung urutan per bulan (chronological) untuk format ID yang konsisten
      const monthlySequenceMap = new Map<string, number>()
      const idMap = new Map<string, string>()

      const chronological = [...(responses || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      chronological.forEach((r) => {
        const d = r.created_at ? new Date(r.created_at) : new Date()
        const monthKey = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
        const currentCount = (monthlySequenceMap.get(monthKey) || 0) + 1
        monthlySequenceMap.set(monthKey, currentCount)

        const code = r.id_responden || formatRespondentCode(d, currentCount)
        idMap.set(r.id, code)
      })

      const records: IKMRespondentRecord[] = (responses || []).map((r: any, idx: number) => ({
        no: idx + 1,
        id: idMap.get(r.id) || r.id,
        created_at: r.created_at,
        waktu: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-',
        timestamp: r.created_at,
        jenis_kelamin: r.gender,
        usia: r.age,
        pendidikan: r.education,
        jenis_layanan: r.service_type,
        u1: r.u1,
        u2: r.u2,
        u3: r.u3,
        u4: r.u4,
        u5: r.u5,
        u6: r.u6,
        u7: r.u7,
        u8: r.u8,
        u9: r.u9,
        saran: r.saran,
      }))

      if (format === 'excel') {
        return generateIKMExcelWorkbook(records, {
          unitPelayanan: 'Kelurahan Lebakgede Kecamatan Coblong',
          alamat: 'Jl. Tubagus Ismail Bawah No. 5 Bandung',
          periode: 'Data Survei Kepuasan Masyarakat Terverifikasi Supabase',
        })
      }

      // CSV format fallback
      // eslint-disable-next-line global-require
      const xlsx = require('xlsx')
      const buffer = generateIKMExcelWorkbook(records)
      const wb = xlsx.read(buffer, { type: 'buffer' })
      const ws = wb.Sheets['DATA_RESPONDEN'] || wb.Sheets[wb.SheetNames[0]]
      const csv = xlsx.utils.sheet_to_csv(ws)
      return Buffer.from('\uFEFF' + csv, 'utf-8')
    } catch (error) {
      console.error('[SupabaseBackend] Failed to export responses:', error)
      throw error
    }
  }

  async deleteResponse(responseId: string): Promise<void> {
    const { error } = await this.client
      .from('survey_responses')
      .delete()
      .eq('id', responseId)

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
    analyticsCache.clear()
  }

  async getResponseCount(): Promise<number> {
    const { count, error } = await this.client
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Count failed: ${error.message}`)
    }
    return count || 0
  }

  async healthCheck(): Promise<{ status: 'ok' | 'error' }> {
    try {
      const { error } = await this.client.from('survey_responses').select('id').limit(1)
      if (error) {
        return { status: 'error' }
      }
      return { status: 'ok' }
    } catch {
      return { status: 'error' }
    }
  }
}
