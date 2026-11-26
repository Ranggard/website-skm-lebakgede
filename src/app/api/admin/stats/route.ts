import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || ''

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token tidak ditemukan',
          },
        },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: 'Database tidak terkonfigurasi',
          },
        },
        { status: 500 }
      )
    }

    // eslint-disable-next-line global-require
    const { createClient } = require('@supabase/supabase-js')
    const client = createClient(supabaseUrl, supabaseKey)

    // Fetch analytics data
    const { data: analyticsData, error: analyticsError } = await client
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (analyticsError && analyticsError.code !== 'PGRST116' && analyticsError.code !== 'PGRST205') {
      console.warn('[Admin Stats] Analytics fetch warning:', analyticsError)
    }

    // Fetch users count
    const { count: usersCount, error: usersError } = await client
      .from('admin_users')
      .select('id', { count: 'exact' })
      .eq('is_active', true)

    if (usersError) {
      console.warn('[Admin Stats] Users count warning:', usersError)
    }

    // Calculate stats
    const responses = analyticsData || []
    const totalResponses = responses.length
    const totalUsers = usersCount || 0

    let totalScore = 0
    let validResponses = 0

    responses.forEach((r: any) => {
      const scores = [r.u1, r.u2, r.u3, r.u4, r.u5, r.u6, r.u7, r.u8, r.u9]
        .map((v: any) => {
          const num = parseFloat(v)
          return !isNaN(num) && num >= 1 && num <= 4 ? num : 2.5
        })
      const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      totalScore += avg
      validResponses++
    })

    const averageSatisfaction = validResponses > 0 ? totalScore / validResponses / 4 : 0

    // Calculate stats for detailed view if requested
    const detailed = request.nextUrl.searchParams.get('detailed') === 'true'

    if (detailed) {
      let ikmSkala4 = 0
      const qKeys = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'] as const
      const unsurLabels = [
        '1. Persyaratan Pelayanan',
        '2. Prosedur Pelayanan',
        '3. Waktu Pelayanan',
        '4. Biaya / Tarif',
        '5. Produk Spesifikasi Layanan',
        '6. Kompetensi Petugas',
        '7. Perilaku / Keramahan Petugas',
        '8. Kualitas Sarana & Prasarana',
        '9. Penanganan Pengaduan',
      ]

      const elements = qKeys.map((key, idx) => {
        let sum = 0
        let count = 0
        responses.forEach((r: any) => {
          const val = parseFloat(r[key])
          if (!isNaN(val) && val >= 1 && val <= 4) {
            sum += val
            count++
          }
        })
        const avg = count > 0 ? sum / count : 2.5
        ikmSkala4 += avg / 9
        const ikm = avg * 25

        let mutu = 'D (Tidak Baik)'
        if (avg >= 3.53) mutu = 'A (Sangat Baik)'
        else if (avg >= 3.06) mutu = 'B (Baik)'
        else if (avg >= 2.60) mutu = 'C (Kurang Baik)'

        return {
          key,
          label: unsurLabels[idx],
          score: avg,
          ikm,
          mutu,
        }
      })

      const ikmKonversi = ikmSkala4 * 25
      let mutu = 'D'
      let kinerja = 'TIDAK BAIK'

      if (ikmKonversi >= 88.31) {
        mutu = 'A'
        kinerja = 'SANGAT BAIK'
      } else if (ikmKonversi >= 76.61) {
        mutu = 'B'
        kinerja = 'BAIK'
      } else if (ikmKonversi >= 65.0) {
        mutu = 'C'
        kinerja = 'KURANG BAIK'
      }

      return NextResponse.json({
        success: true,
        data: {
          total: totalResponses,
          ikmSkala4: Number(ikmSkala4.toFixed(4)),
          ikmKonversi: Number(ikmKonversi.toFixed(2)),
          mutu,
          kinerja,
          elements,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalResponses,
        totalUsers,
        totalLogins: 0, // Would come from login history table if implemented
        averageSatisfaction,
      },
    })
  } catch (error: any) {
    console.error('[Admin Stats] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan sistem',
        },
      },
      { status: 500 }
    )
  }
}
