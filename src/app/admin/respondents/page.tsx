'use client'

import React, { useState, useEffect } from 'react'

interface RespondentRecord {
  id: string
  no: number
  waktu: string
  jenis_kelamin: string
  usia: string
  pendidikan: string
  jenis_layanan: string
  skor_rata: number
  nilai: string
  saran?: string
}

export default function RespondentsPage() {
  const [respondents, setRespondents] = useState<RespondentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    fetchRespondents()
  }, [])

  const fetchRespondents = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('adminToken') || ''
      const response = await fetch('/api/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Gagal mengambil data responden')
      }

      const data = await response.json()
      if (data.data?.responses) {
        setRespondents(data.data.responses.map((r: any, idx: number) => ({
          ...r,
          no: idx + 1,
        })))
      }
    } catch (err: any) {
      console.error('Fetch respondents error:', err)
      setError(err.message || 'Gagal mengambil data responden')
    } finally {
      setLoading(false)
    }
  }

  // Filter respondents based on search query
  const filteredRespondents = respondents.filter((r) => {
    const q = searchQuery.toLowerCase().trim()
    return !q ||
      r.id.toLowerCase().includes(q) ||
      r.jenis_layanan.toLowerCase().includes(q) ||
      r.jenis_kelamin.toLowerCase().includes(q)
  })

  // Pagination
  const totalPages = Math.ceil(filteredRespondents.length / itemsPerPage) || 1
  const paginatedRespondents = filteredRespondents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data responden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Responden</h1>
        <p className="mt-2 text-gray-600">Kelola data semua responden survei</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari berdasarkan ID, layanan, atau jenis kelamin..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Responden</p>
          <p className="text-2xl font-bold text-blue-600">{respondents.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Hasil Pencarian</p>
          <p className="text-2xl font-bold text-green-600">{filteredRespondents.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Halaman</p>
          <p className="text-2xl font-bold text-purple-600">{currentPage} / {totalPages}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Per Halaman</p>
          <p className="text-2xl font-bold text-orange-600">{itemsPerPage}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ID Responden</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Waktu</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Jenis Kelamin</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Layanan</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Skor</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Mutu</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRespondents.length > 0 ? (
                paginatedRespondents.map((r) => (
                  <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{r.no}</td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">{r.id}</td>
                    <td className="px-4 py-3 text-gray-700">{new Date(r.waktu).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{r.jenis_kelamin}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{r.jenis_layanan}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">
                      {r.skor_rata.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        r.nilai === 'A (Sangat Baik)' ? 'bg-green-100 text-green-800' :
                        r.nilai === 'B (Baik)' ? 'bg-blue-100 text-blue-800' :
                        r.nilai === 'C (Kurang Baik)' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {r.nilai}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data responden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredRespondents.length)} dari {filteredRespondents.length} data
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sebelumnya
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
