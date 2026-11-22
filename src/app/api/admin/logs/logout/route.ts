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

    // Fetch logout logs
    const { data: logs, error } = await client
      .from('logout_logs')
      .select('*')
      .order('logout_time', { ascending: false })
      .limit(100)

    if (error && error.code !== 'PGRST116') {
      console.warn('[Logout Logs] Error:', error)
    }

    // Return logs or empty array
    return NextResponse.json({
      success: true,
      data: logs || [],
    })
  } catch (error: any) {
    console.error('[Logout Logs] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Gagal mengambil riwayat logout',
        },
      },
      { status: 500 }
    )
  }
}
