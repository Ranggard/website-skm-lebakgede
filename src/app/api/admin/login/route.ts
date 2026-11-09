import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body || {}

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username dan password wajib diisi',
          },
        },
        { status: 400 }
      )
    }

    const cleanUser = String(username).trim().toLowerCase()
    const cleanPass = String(password).trim()
    const adminToken = process.env.ADMIN_TOKEN || 'admin-token-skm-questionnaire-default-12345678'

    let matchedUser: { username: string; role: string; nama: string } | null = null

    // 1. Verifikasi kredensial ke tabel `admin_users` di Supabase jika database aktif
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      try {
        // eslint-disable-next-line global-require
        const { createClient } = require('@supabase/supabase-js')
        const client = createClient(supabaseUrl, supabaseKey)

        const { data: dbUser, error } = await client
          .from('admin_users')
          .select('id, username, nama, password_hash, role, is_active')
          .ilike('username', cleanUser)
          .eq('is_active', true)
          .maybeSingle()

        if (!error && dbUser) {
          const passMatches =
            dbUser.password_hash === cleanPass ||
            dbUser.password_hash ===
              crypto.createHash('sha256').update(cleanPass).digest('hex')

          if (passMatches) {
            matchedUser = {
              username: dbUser.username,
              role: dbUser.role || 'staf',
              nama: dbUser.nama || 'Petugas Kelurahan',
            }
          }
        }
      } catch (dbErr) {
        console.warn('[Login] Supabase admin_users query warning, falling back to local defaults:', dbErr)
      }
    }

    // 2. Fallback darurat HANYA jika Supabase tidak terhubung
    if (!matchedUser && (!supabaseUrl || !supabaseKey)) {
      const defaultAccounts: Record<string, { pass: string[]; role: string; nama: string }> = {
        admin: {
          pass: ['Admin123'],
          role: 'admin',
          nama: 'Administrator Kelurahan',
        },
        staf: {
          pass: ['Staf12345'],
          role: 'staf',
          nama: 'Staf Pelayanan Lebakgede',
        },
        lurah: {
          pass: ['Lurah123'],
          role: 'lurah',
          nama: 'Lurah Lebakgede',
        },
      }

      const acc = defaultAccounts[cleanUser]
      if (acc && acc.pass.includes(cleanPass)) {
        matchedUser = {
          username: cleanUser,
          role: acc.role,
          nama: acc.nama,
        }
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Username atau password salah. Silakan periksa kembali kredensial Anda.',
          },
        },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      token: adminToken,
      user: matchedUser,
    })

    // Set cookie for browser sessions
    response.cookies.set('admin_token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan sistem saat proses login',
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' })
  response.cookies.delete('admin_token')
  return response
}
