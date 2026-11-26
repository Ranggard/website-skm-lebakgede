'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearSessionFromStorage } from '@/src/lib/auth-helper'
import {
  IconLogout,
  IconActivity,
  IconCheck,
} from '@/src/components/icons'

export default function SettingsPage() {
  const router = useRouter()
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false)

  const handleLogoutAll = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
    } catch (e) {}
    clearSessionFromStorage()
    setConfirmLogoutAll(false)
    router.push('/dashboard')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-white/10 font-display">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Konfigurasi & Pengendalian Sistem
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 font-display text-white">
            Pengaturan Sistem Admin
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Informasi status sistem, protokol keamanan, basis data, dan manajemen sesi akun Kelurahan Lebakgede.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <h2 className="text-sm font-extrabold text-gray-900 font-display">Status Operasional</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-700">Status Aplikasi</span>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
                Online & Aktif
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-700">Koneksi Database</span>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
                Terhubung (Supabase)
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-700">Waktu Server</span>
              <span className="text-xs font-mono font-medium text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                {new Date().toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
            <h2 className="text-sm font-extrabold text-gray-900 font-display">Keamanan & Autentikasi</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 bg-teal-50/60 border border-teal-100 rounded-xl">
              <p className="text-xs font-bold text-teal-900">Role-Based Access Control (RBAC)</p>
              <p className="text-[11px] text-teal-700 mt-0.5">Akses terbagi berdasarkan peran Administrator dan Staf Kelurahan.</p>
            </div>
            <div className="p-3.5 bg-teal-50/60 border border-teal-100 rounded-xl">
              <p className="text-xs font-bold text-teal-900">Proteksi Kata Sandi</p>
              <p className="text-[11px] text-teal-700 mt-0.5">Password disimpan terenkripsi menggunakan algoritma bcrypt hash 10 rounds.</p>
            </div>
          </div>
        </div>

        {/* Application Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
            <h2 className="text-sm font-extrabold text-gray-900 font-display">Informasi Aplikasi</h2>
          </div>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Nama Sistem:</span>
              <span className="font-bold">Website SKM Kelurahan Lebakgede</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Kecamatan:</span>
              <span className="font-bold">Coblong, Kota Bandung</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Framework:</span>
              <span className="font-bold">Next.js 14 (App Router) & React 18</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Standar Evaluasi:</span>
              <span className="font-bold">PermenPAN-RB No. 14 Tahun 2017</span>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <h2 className="text-sm font-extrabold text-gray-900 font-display">Manajemen Sesi</h2>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Anda dapat mengakhiri sesi login saat ini atau keluar dari seluruh perangkat secara aman.
            </p>
          </div>

          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl">
            <p className="text-xs font-bold text-rose-900 mb-1">Keluar dari Sesi</p>
            <p className="text-[11px] text-rose-700 mb-3">Sesi autentikasi aktif akan ditutup dan Anda akan dialihkan ke halaman utama.</p>
            {!confirmLogoutAll ? (
              <button
                onClick={() => setConfirmLogoutAll(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <IconLogout className="w-3.5 h-3.5" />
                <span>Logout Sesi</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogoutAll}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Ya, Logout
                </button>
                <button
                  onClick={() => setConfirmLogoutAll(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
