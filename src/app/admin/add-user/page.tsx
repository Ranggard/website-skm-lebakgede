'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconPlusCircle,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconX,
  IconUsers,
  IconActivity,
} from '@/src/components/icons'

export default function AddUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [username, setUsername] = useState('')
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Role fixed to 'staf' only
  const role = 'staf'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!username.trim() || !nama.trim() || !password) {
      setError('Username, nama lengkap, dan password wajib diisi.')
      return
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }

    if (password.length < 6) {
      setError('Password minimal terdiri dari 6 karakter.')
      return
    }

    if (email && !email.includes('@')) {
      setError('Format email tidak valid.')
      return
    }

    setLoading(true)

    try {
      // Get caller info from storage
      const userStr = localStorage.getItem('adminUser')
      if (!userStr) {
        setError('Sesi autentikasi tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const user = JSON.parse(userStr)
      const token = localStorage.getItem('adminToken') || ''

      const response = await fetch('/api/admin/users/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          nama: nama.trim(),
          email: email.trim() || undefined,
          password: password,
          role: 'staf',
          callerRole: user.role,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Gagal menambahkan akun staf.')
      }

      setSuccess(`Akun staf "${nama}" (@${username.toLowerCase().trim()}) berhasil ditambahkan ke sistem!`)

      // Reset form
      setUsername('')
      setNama('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan akun staf.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setUsername('')
    setNama('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-white/10 font-display">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Manajemen Hak Akses & Personil
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 font-display text-white">
            Tambah Pengguna Baru
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Daftarkan akun staf baru untuk membantu operasional penginputan atau pemantauan survei SKM Kelurahan Lebakgede.
          </p>
        </div>

        <button
          onClick={() => router.push('/admin/users')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <IconUsers className="w-4 h-4" />
          <span>Lihat Semua Pengguna</span>
        </button>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800 font-medium">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold">!</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Alert Success */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-semibold">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center">
              <IconCheck className="w-3.5 h-3.5 text-emerald-800" />
            </span>
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8">
          <div className="border-b border-gray-100 pb-3 mb-6">
            <h2 className="text-sm font-extrabold text-gray-900 font-display flex items-center gap-2">
              <IconPlusCircle className="w-4 h-4 text-teal-600" />
              <span>Formulir Pendaftaran Akun Staf</span>
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Isi data kredensial staf kelurahan secara lengkap dan teliti
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-xs font-bold text-gray-700 mb-1.5">
                  Username Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: staf_pelayanan"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Otomatis disimpan dalam huruf kecil tanpa spasi</span>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label htmlFor="nama" className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nama Lengkap Staf <span className="text-rose-500">*</span>
                </label>
                <input
                  id="nama"
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap petugas"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Petugas (Opsional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="petugas@lebakgede.go.id"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>

              {/* Role - Fixed to Staf */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tingkat Akses / Role
                </label>
                <div className="flex items-center h-[42px] px-3.5 bg-teal-50/70 border border-teal-200 rounded-xl">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    <span>Staf Kelurahan</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Akun baru secara otomatis terdaftar sebagai staf</span>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-display">
                Pengaturan Kata Sandi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-gray-700 mb-1.5">
                    Konfirmasi Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-teal-700/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span>Mendaftarkan Pengguna...</span>
                  </>
                ) : (
                  <>
                    <IconPlusCircle className="w-4 h-4" />
                    <span>Tambahkan Akun Staf</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Bersihkan
              </button>
            </div>
          </form>
        </div>

        {/* Info & Policy Side Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3 text-teal-800">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <IconActivity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-display">Panduan Akun Staf</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Akun yang ditambahkan memiliki hak akses <strong>Staf Kelurahan</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Dapat melihat ringkasan IKM, grafik unsur pelayanan, demografi, dan mengunduh laporan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Username harus unik di seluruh sistem.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Kata sandi disimpan secara aman menggunakan enkripsi bcrypt.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 font-display">
              Informasi Keamanan
            </h4>
            <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
              Berikan kredensial akun kepada petugas yang berwenang di kantor Kelurahan Lebakgede. Staf yang terdaftar dapat langsung melakukan login di halaman utama dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
