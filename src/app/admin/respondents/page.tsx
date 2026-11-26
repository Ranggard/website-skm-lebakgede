'use client'

import React, { useState, useEffect } from 'react'
import {
  IconUsers,
  IconRefresh,
  IconChartBar,
  IconX,
} from '@/src/components/icons'
import { fetchAnalyticsCached } from '@/src/lib/analytics-cache'

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

  const fetchRespondents = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('adminToken') || ''
      const data = await fetchAnalyticsCached(token, forceRefresh)
      if (data?.responses) {
        setRespondents(
          data.responses.map((r: any, idx: number) => ({
            ...r,
            no: idx + 1,
          }))
        )
      }
    } catch (err: any) {
      console.error('Fetch respondents error:', err)
      setError(err.message || 'Gagal mengambil data responden.')
    } finally {
      setLoading(false)
    }
  }

  // Filter respondents based on search query
  const filteredRespondents = respondents.filter((r) => {
    const q = searchQuery.toLowerCase().trim()
    return (
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.jenis_layanan.toLowerCase().includes(q) ||
      r.jenis_kelamin.toLowerCase().includes(q)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredRespondents.length / itemsPerPage) || 1
  const paginatedRespondents = filteredRespondents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-white/10 font-display">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Database Survei Pelayanan Masyarakat
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 font-display text-white">
            Riwayat Responden SKM
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Seluruh data responden warga yang telah terekam dalam survei kepuasan masyarakat Kelurahan Lebakgede.
          </p>
        </div>

        <button
          onClick={() => fetchRespondents(true)}
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

      {/* KPI Cards & Search */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Total Responden</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 mt-2 font-display">{respondents.length}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700">
            Data Masuk
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Hasil Pencarian</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2 font-display">
            {filteredRespondents.length}
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
            Responden Cocok
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Halaman Saat Ini</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2 font-display">
            {currentPage} <span className="text-xs font-normal text-gray-400">/ {totalPages}</span>
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
            10 Responden / Hal
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200 flex flex-col justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Cari Responden</p>
          <input
            type="text"
            placeholder="Cari ID, layanan, dll..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-display text-[11px]">
              <tr>
                <th className="px-4 py-3.5 text-center font-bold">No</th>
                <th className="px-4 py-3.5 font-bold">ID Responden</th>
                <th className="px-4 py-3.5 font-bold">Waktu Pengisian</th>
                <th className="px-4 py-3.5 font-bold">Gender</th>
                <th className="px-4 py-3.5 font-bold">Layanan</th>
                <th className="px-4 py-3.5 text-center font-bold">Skor Rata</th>
                <th className="px-4 py-3.5 text-center font-bold">Mutu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRespondents.length > 0 ? (
                paginatedRespondents.map((r) => (
                  <tr key={r.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-center text-gray-500 font-medium">{r.no}</td>
                    <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-teal-800">{r.id}</td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {new Date(r.waktu).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 capitalize">{r.jenis_kelamin}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">{r.jenis_layanan}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-teal-700">
                      {typeof r.skor_rata === 'number' ? r.skor_rata.toFixed(2) : r.skor_rata}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        r.nilai === 'A' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        r.nilai === 'B' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                        r.nilai === 'C' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        Mutu {r.nilai}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Tidak ada responden yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-xs font-bold text-gray-700 rounded-xl transition cursor-pointer"
            >
              ← Sebelumnya
            </button>
            <span className="text-xs text-gray-600 font-medium">
              Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-xs font-bold text-gray-700 rounded-xl transition cursor-pointer"
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
