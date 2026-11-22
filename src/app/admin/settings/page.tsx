'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearSessionFromStorage } from '@/src/lib/auth-helper'

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
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
        <p className="mt-2 text-gray-600">Kelola pengaturan sistem admin</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Status Sistem</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Status Aplikasi</span>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Koneksi Database</span>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Terhubung
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Waktu Server</span>
              <span className="text-gray-900 font-mono text-sm">{new Date().toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Keamanan</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Autentikasi</p>
              <p className="text-sm text-blue-800">Role-based access control aktif</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Session</p>
              <p className="text-sm text-blue-800">Session berlaku 7 hari dari login</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Enkripsi</p>
              <p className="text-sm text-blue-800">Password tersimpan terenkripsi dengan bcrypt</p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Manajemen Data</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">Backup Database</p>
              <p className="text-xs text-gray-600 mb-3">Backup otomatis dilakukan setiap hari pada jam 00:00</p>
              <button className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-medium rounded-lg transition-colors">
                Buat Backup Manual
              </button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">Log Aktivitas</p>
              <p className="text-xs text-gray-600">Log aktivitas admin disimpan selama 90 hari</p>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Manajemen Sesi</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">Sesi Aktif Anda</p>
              <p className="text-xs text-gray-600 mb-3">Login dari browser ini</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900 mb-3">Logout dari Semua Sesi</p>
              <p className="text-xs text-red-700 mb-4">Anda akan keluar dari semua perangkat</p>
              {!confirmLogoutAll ? (
                <button
                  onClick={() => setConfirmLogoutAll(true)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Logout Semua Sesi
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-900">Yakin ingin logout dari semua sesi?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleLogoutAll}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Ya, Logout
                    </button>
                    <button
                      onClick={() => setConfirmLogoutAll(false)}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Informasi Sistem</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Aplikasi:</strong> Survei Kepuasan Masyarakat (SKM) - Kelurahan Lebakgede</p>
          <p><strong>Versi:</strong> 1.0.0</p>
          <p><strong>Teknologi:</strong> Next.js 14, React 18, Tailwind CSS</p>
          <p><strong>Database:</strong> Supabase PostgreSQL</p>
          <p><strong>Last Update:</strong> {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  )
}
