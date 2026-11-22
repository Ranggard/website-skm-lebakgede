'use client'

import React, { useState, useEffect } from 'react'

interface StatItem {
  key: string
  label: string
  score: number
  ikm: number
  mutu: string
}

interface StatsData {
  total: number
  ikmSkala4: number
  ikmKonversi: number
  mutu: string
  kinerja: string
  elements: StatItem[]
  gender?: Record<string, number>
  education?: Record<string, number>
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
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
      const response = await fetch('/api/admin/stats?detailed=true', {
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

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data statistik...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistik Kepuasan Masyarakat</h1>
        <p className="mt-2 text-gray-600">Analisis lengkap data survei</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {stats && (
        <>
          {/* Overall Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">Total Responden</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">IKM Skala 4</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.ikmSkala4.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">IKM Konversi</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.ikmKonversi.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">Mutu Pelayanan</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.mutu}</p>
            </div>
          </div>

          {/* Kinerja Unit */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kinerja Unit Pelayanan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg">
                <p className="text-sm text-gray-600">Penilaian</p>
                <p className="text-2xl font-bold text-indigo-600 mt-2">{stats.kinerja}</p>
                <p className="text-xs text-gray-500 mt-2">Berdasarkan skor IKM Konversi</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-lg">
                <p className="text-sm text-gray-600">Interpretasi</p>
                <p className="text-sm text-teal-700 mt-2">
                  {stats.kinerja === 'SANGAT BAIK' &&
                    'Pelayanan sangat memuaskan dan perlu dipertahankan'}
                  {stats.kinerja === 'BAIK' &&
                    'Pelayanan memuaskan dan perlu ditingkatkan'}
                  {stats.kinerja === 'KURANG BAIK' &&
                    'Pelayanan perlu ditingkatkan secara signifikan'}
                  {stats.kinerja === 'TIDAK BAIK' &&
                    'Pelayanan memerlukan perbaikan mendesak'}
                </p>
              </div>
            </div>
          </div>

          {/* Unsur Pelayanan */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Penilaian Unsur Pelayanan</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Unsur Pelayanan</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">NRR</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">IKM</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Mutu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.elements.map((elem, idx) => (
                    <tr key={elem.key} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-700">{elem.label}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">
                        {elem.score.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-green-600">
                        {elem.ikm.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {elem.mutu}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {stats.gender && Object.keys(stats.gender).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Demografi - Jenis Kelamin</h3>
                <div className="space-y-3">
                  {Object.entries(stats.gender).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{key}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(value / stats.total) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-900 font-semibold w-12 text-right">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.education && Object.keys(stats.education).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Demografi - Pendidikan</h3>
                <div className="space-y-3">
                  {Object.entries(stats.education).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize text-sm">{key}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(value / stats.total) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-900 font-semibold w-12 text-right">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
