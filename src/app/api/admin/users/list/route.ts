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

    // Fetch all users
    const { data: users, error } = await client
      .from('admin_users')
      .select('id, username, nama, email, role, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[List Users] Error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data: users || [],
    })
  } catch (error: any) {
    console.error('[List Users] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Gagal mengambil daftar pengguna',
        },
      },
      { status: 500 }
    )
  }
}
