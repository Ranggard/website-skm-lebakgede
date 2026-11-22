'use client'

import React, { useState, useEffect } from 'react'
import { IconChartBar, IconUsers, IconActivity, IconPlusCircle } from '@/src/components/icons'

interface AdminStats {
  totalResponses: number
  totalUsers: number
  totalLogins: number
  averageSatisfaction: number
}

interface StatCard {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('adminToken') || ''
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Gagal mengambil data statistik')
      }

      const data = await response.json()
      if (data.data) {
        setStats(data.data)
      }
    } catch (err: any) {
      console.error('Fetch stats error:', err)
      setError(err.message || 'Gagal mengambil data statistik')
    } finally {
      setLoading(false)
    }
  }

  const statCards: StatCard[] = [
    {
      title: 'Total Responden',
      value: stats?.totalResponses || 0,
      icon: IconUsers,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Total Pengguna',
      value: stats?.totalUsers || 0,
      icon: IconPlusCircle,
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      title: 'Total Login',
      value: stats?.totalLogins || 0,
      icon: IconActivity,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Rata-rata Kepuasan',
      value: stats?.averageSatisfaction ? `${(stats.averageSatisfaction * 25).toFixed(2)}` : '0',
      icon: IconChartBar,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
  ]

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="mt-2 text-gray-600">Selamat datang di panel administrasi Kelurahan Lebakgede</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className={`${card.color} border rounded-lg p-6 transition-transform hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </div>
                <Icon className="w-12 h-12 opacity-20" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Cepat</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Status Sistem</span>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              Aktif
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Database</span>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              Terkoneksi
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Last Update</span>
            <span className="text-gray-600">{new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/stats"
            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-blue-900 mb-2">Lihat Statistik Lengkap</h3>
            <p className="text-sm text-blue-700">Analisis data responden secara mendalam</p>
          </a>
          <a
            href="/admin/respondents"
            className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-green-900 mb-2">Riwayat Responden</h3>
            <p className="text-sm text-green-700">Kelola data responden survei</p>
          </a>
          <a
            href="/admin/login-history"
            className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-purple-900 mb-2">Riwayat Login</h3>
            <p className="text-sm text-purple-700">Monitor aktivitas login pengguna</p>
          </a>
          <a
            href="/admin/add-user"
            className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-orange-900 mb-2">Tambah Pengguna</h3>
            <p className="text-sm text-orange-700">Tambah akun staf baru ke sistem</p>
          </a>
        </div>
      </div>
    </div>
  )
}
