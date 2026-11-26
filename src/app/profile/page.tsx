'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserFromStorage, getTokenFromStorage, clearSessionFromStorage } from '@/src/lib/auth-helper'
import {
  IconLogout,
  IconEye,
  IconEyeOff,
  IconUsers,
  IconActivity,
  IconCheck,
  IconX,
} from '@/src/components/icons'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string; nama: string; role: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const storageUser = getUserFromStorage()
    const storageToken = getTokenFromStorage()

    if (!storageUser || !storageToken) {
      router.push('/dashboard')
      return
    }

    setUser(storageUser)
    setToken(storageToken)
    setNama(storageUser.nama || '')
    setLoading(false)
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!nama.trim()) {
      setError('Nama tidak boleh kosong')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok')
      return
    }

    if (newPassword && newPassword.length < 6) {
      setError('Password baru minimal 6 karakter')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: user?.username,
          nama: nama.trim(),
          email: email.trim() || undefined,
          currentPassword: password || undefined,
          newPassword: newPassword || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Gagal memperbarui profil')
      }

      setSuccess('Profil dan informasi akun berhasil diperbarui!')
      setPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Update user in storage if nama changed
      if (data.user) {
        const updatedUser = { ...user, ...data.user }
        setUser(updatedUser)
        localStorage.setItem('adminUser', JSON.stringify(updatedUser))
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui profil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
    } catch (e) {}
    clearSessionFromStorage()
    router.push('/dashboard')
  }

  const getDashboardBackUrl = () => {
    if (user?.role === 'admin') return '/admin'
    return '/staf'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-sm font-semibold text-gray-600">Memuat profil pengguna...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6 fade-in">
        {/* Top Navigation & Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(getDashboardBackUrl())}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer shadow-xs"
          >
            ← Kembali ke {user.role === 'admin' ? 'Admin Panel' : 'Dashboard Staf'}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500">Kelurahan Lebakgede</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-extrabold text-emerald-300 font-display shadow-inner">
              {(user.nama || user.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 text-[11px] font-semibold backdrop-blur-sm border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Role: {user.role.toUpperCase()}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1.5 font-display text-white">
                {user.nama || user.username}
              </h1>
              <p className="text-emerald-100/80 text-xs mt-0.5">
                Akun Terdaftar: <span className="font-mono text-emerald-200">@{user.username}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-400/30 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <IconLogout className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800 font-medium animate-shake">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold">!</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
              <IconX className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <div className="flex items-center gap-2">
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

        {/* Main Profile Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Section 1: Informasi Dasar */}
            <div>
              <div className="border-b border-gray-100 pb-3 mb-5">
                <h2 className="text-sm font-extrabold text-gray-900 font-display flex items-center gap-2">
                  <IconUsers className="w-4 h-4 text-teal-600" />
                  <span>Informasi Data Diri</span>
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Perbarui nama lengkap dan email resmi yang terhubung dengan akun Anda
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username (Read Only) */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.username}
                    className="w-full px-3.5 py-2.5 bg-gray-100/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Username bersifat permanen dan tidak dapat diubah</span>
                </div>

                {/* Role (Read Only) */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    Tingkat Akses / Role
                  </label>
                  <div className="flex items-center h-[42px] px-3.5 bg-gray-100/80 border border-gray-200 rounded-xl">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="nama" className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="nama"
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1.5">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@lebakgede.go.id"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Ganti Password */}
            <div className="pt-2">
              <div className="border-b border-gray-100 pb-3 mb-5">
                <h2 className="text-sm font-extrabold text-gray-900 font-display flex items-center gap-2">
                  <IconActivity className="w-4 h-4 text-emerald-600" />
                  <span>Keamanan Akun & Kata Sandi</span>
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Kosongkan bagian ini jika Anda tidak berniat mengganti password
                </p>
              </div>

              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                {/* Current Password */}
                <div>
                  <label htmlFor="current-password" className="block text-xs font-bold text-gray-700 mb-1.5">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password saat ini untuk verifikasi"
                      className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title={showCurrentPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showCurrentPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* New Password */}
                  <div>
                    <label htmlFor="new-password" className="block text-xs font-bold text-gray-700 mb-1.5">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showNewPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showNewPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-xs font-bold text-gray-700 mb-1.5">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showConfirmPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-teal-700/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan Profil</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push(getDashboardBackUrl())}
                className="w-full sm:w-auto py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Kembali
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
