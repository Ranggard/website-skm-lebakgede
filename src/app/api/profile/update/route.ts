import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, nama, email, currentPassword, newPassword } = body || {}

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username tidak valid',
          },
        },
        { status: 400 }
      )
    }

    if (!nama || !nama.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nama tidak boleh kosong',
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

    // Get current user
    const { data: dbUser, error: fetchError } = await client
      .from('admin_users')
      .select('id, username, nama, password_hash, role, email, is_active')
      .eq('username', username.toLowerCase())
      .eq('is_active', true)
      .maybeSingle()

    if (fetchError || !dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User tidak ditemukan',
          },
        },
        { status: 404 }
      )
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PASSWORD_REQUIRED',
              message: 'Password saat ini diperlukan untuk mengubah password',
            },
          },
          { status: 400 }
        )
      }

      let currentPasswordMatches = false
      try {
        if (dbUser.password_hash.startsWith('$2')) {
          currentPasswordMatches = await bcrypt.compare(currentPassword, dbUser.password_hash)
        } else {
          currentPasswordMatches = dbUser.password_hash === currentPassword
        }
      } catch (bcryptErr) {
        currentPasswordMatches = dbUser.password_hash === currentPassword
      }

      if (!currentPasswordMatches) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PASSWORD',
              message: 'Password saat ini tidak benar',
            },
          },
          { status: 401 }
        )
      }
    }

    // Build update object
    const updateData: Record<string, string> = {
      nama: nama.trim(),
    }

    if (email && email.trim()) {
      updateData.email = email.trim()
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.password_hash = hashedPassword
    }

    // Update user
    const { data: updatedUser, error: updateError } = await client
      .from('admin_users')
      .update(updateData)
      .eq('id', dbUser.id)
      .select('id, username, nama, email, role')
      .single()

    if (updateError) {
      console.error('[Profile Update] Error:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: 'Gagal memperbarui profil',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: {
        username: updatedUser.username,
        nama: updatedUser.nama,
        email: updatedUser.email || '',
        role: updatedUser.role,
      },
    })
  } catch (error: any) {
    console.error('[Profile Update] Fatal error:', error)
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
