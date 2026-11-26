'use client'

import React, { useState, useEffect } from 'react'
import {
  IconActivity,
  IconRefresh,
  IconX,
} from '@/src/components/icons'
import { fetchAdminCached } from '@/src/lib/analytics-cache'

interface LoginLog {
  id: string
  username: string
  loginTime: string
  logoutTime?: string
  ipAddress?: string
  status: 'active' | 'completed'
}

export default function LoginHistoryPage() {
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterUser, setFilterUser] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    fetchLoginHistory()
  }, [])

  const fetchLoginHistory = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('adminToken') || ''
      const data = await fetchAdminCached<LoginLog[]>('/api/admin/logs/login', token, forceRefresh)
      if (data) {
        setLogs(data)
      }
    } catch (err: any) {
      console.error('Fetch login history error:', err)
      setError(err.message || 'Gagal mengambil riwayat login.')
    } finally {
      setLoading(false)
    }
  }

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const userMatch = !filterUser || log.username.toLowerCase().includes(filterUser.toLowerCase())
    const statusMatch = filterStatus === 'all' || log.status === filterStatus
    return userMatch && statusMatch
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-white/10 font-display">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Audit & Keamanan Sistem
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 font-display text-white">
            Riwayat Aktivitas Login
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Catatan jejak waktu login, durasi sesi, dan pemantauan akun pengguna yang aktif di sistem.
          </p>
        </div>

        <button
          onClick={() => fetchLoginHistory(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <IconRefresh className="w-4 h-4" />
          <span>Segarkan Data</span>
        </button>
      </div>

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

      {/* KPI Cards & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Total Riwayat Login</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 mt-2 font-display">{logs.length}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700">
            Sesi Tercatat
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Sesi Aktif</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2 font-display">
            {logs.filter((l) => l.status === 'active').length}
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
            Online Sekarang
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200 flex flex-col justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Cari Username</p>
          <input
            type="text"
            placeholder="Cari nama pengguna..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200 flex flex-col justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Status Sesi</p>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
          >
            <option value="all">Semua Status Sesi</option>
            <option value="active">Sesi Sedang Aktif</option>
            <option value="completed">Sesi Selesai (Logout)</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-display text-[11px]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Pengguna</th>
                <th className="px-5 py-3.5 font-bold">Waktu Masuk (Login)</th>
                <th className="px-5 py-3.5 font-bold">Waktu Keluar (Logout)</th>
                <th className="px-5 py-3.5 font-bold">Durasi Sesi</th>
                <th className="px-5 py-3.5 text-center font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const loginDate = new Date(log.loginTime)
                  const logoutDate = log.logoutTime ? new Date(log.logoutTime) : null
                  const duration = logoutDate
                    ? Math.floor((logoutDate.getTime() - loginDate.getTime()) / 1000 / 60)
                    : null

                  return (
                    <tr key={log.id} className="hover:bg-teal-50/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-semibold text-gray-900">
                        @{log.username}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {loginDate.toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {logoutDate ? logoutDate.toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-700">
                        {duration !== null ? `${duration} menit` : 'Sedang berjalan'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          log.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {log.status === 'active' ? 'Aktif' : 'Selesai'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                    Tidak ada catatan riwayat login yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
