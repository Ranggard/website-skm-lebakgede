import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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
    const { username, nama, email, password, role } = body || {}

    // Validation
    if (!username || !nama || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username, nama, password, dan role wajib diisi',
          },
        },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password minimal 6 karakter',
          },
        },
        { status: 400 }
      )
    }

    if (!['staf', 'lurah', 'admin'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Role tidak valid',
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

    // Check if username already exists
    const { data: existingUser, error: checkError } = await client
      .from('admin_users')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[Add User] Check error:', checkError)
      throw checkError
    }

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_USER',
            message: 'Username sudah terdaftar',
          },
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const { data: newUser, error: createError } = await client
      .from('admin_users')
      .insert([
        {
          username: username.toLowerCase().trim(),
          nama: nama.trim(),
          email: email ? email.trim() : null,
          password_hash: hashedPassword,
          role,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select('id, username, nama, email, role')
      .single()

    if (createError) {
      console.error('[Add User] Create error:', createError)
      throw createError
    }

    return NextResponse.json({
      success: true,
      message: `Pengguna ${nama} berhasil ditambahkan`,
      user: newUser,
    })
  } catch (error: any) {
    console.error('[Add User] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Gagal menambahkan pengguna',
        },
      },
      { status: 500 }
    )
  }
}
