import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { is_active } = body || {}

    if (is_active === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status is_active wajib diisi',
          },
        },
        { status: 400 }
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

    // Update user status
    const { data: updatedUser, error } = await client
      .from('admin_users')
      .update({ is_active })
      .eq('id', params.id)
      .select('id, username, nama, role, is_active')
      .single()

    if (error) {
      console.error('[Toggle User] Error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.nama} berhasil diperbarui`,
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('[Toggle User] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Gagal memperbarui user',
        },
      },
      { status: 500 }
    )
  }
}
