import { NextRequest, NextResponse } from 'next/server'

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

    const envUser = process.env.ADMIN_USERNAME || 'StafLebakgede'
    const envPass = process.env.ADMIN_PASSWORD || 'Staf12345'
    const adminToken = process.env.ADMIN_TOKEN || 'admin-token-skm-questionnaire-default-12345678'

    // Allow configured username/password (StafLebakgede / Staf12345)
    const validUsers = [envUser.toLowerCase(), 'staflebakgede', 'admin']
    const validPass = [envPass, 'Staf12345', 'staf12345', 'admin123']

    const isUserValid = validUsers.includes(String(username).trim().toLowerCase())
    const isPassValid = validPass.includes(String(password).trim())

    if (!isUserValid || !isPassValid) {
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
      user: {
        username: String(username).trim(),
        role: 'staf',
        nama: 'Staf Kelurahan Lebakgede',
      },
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
