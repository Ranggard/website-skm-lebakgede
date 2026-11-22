'use client'

import React, { useState, useEffect } from 'react'

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

  const fetchLoginHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('adminToken') || ''
      const response = await fetch('/api/admin/logs/login', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Gagal mengambil riwayat login')
      }

      const data = await response.json()
      if (data.data) {
        setLogs(data.data)
      }
    } catch (err: any) {
      console.error('Fetch login history error:', err)
      setError(err.message || 'Gagal mengambil riwayat login')
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

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Login Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor aktivitas login pengguna admin</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Cari berdasarkan username..."
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="completed">Selesai</option>
        </select>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Login</p>
          <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Saat Ini Aktif</p>
          <p className="text-2xl font-bold text-green-600">{logs.filter((l) => l.status === 'active').length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Hasil Pencarian</p>
          <p className="text-2xl font-bold text-purple-600">{filteredLogs.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Username</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Login</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Logout</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Durasi</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const loginDate = new Date(log.loginTime)
                  const logoutDate = log.logoutTime ? new Date(log.logoutTime) : null
                  const duration = logoutDate
                    ? Math.floor((logoutDate.getTime() - loginDate.getTime()) / 1000 / 60)
                    : null

                  return (
                    <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{log.username}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {loginDate.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {logoutDate ? logoutDate.toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {duration !== null ? `${duration} menit` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {log.status === 'active' ? 'Aktif' : 'Selesai'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada riwayat login
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh button */}
      <div className="mt-6">
        <button
          onClick={fetchLoginHistory}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Muat Ulang
        </button>
      </div>
    </div>
  )
}
