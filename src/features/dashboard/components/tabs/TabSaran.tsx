import React, { useState, useMemo } from 'react'
import { ResponseRow } from '@/src/lib/types/dashboard'
import { IconSearch } from '@/src/components/icons'

interface TabSaranProps {
  allResponses: ResponseRow[]
  setSelectedRespondent?: (r: ResponseRow) => void
}

export const TabSaran: React.FC<TabSaranProps> = ({ allResponses, setSelectedRespondent }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSentiment, setFilterSentiment] = useState<'ALL' | 'PUAS' | 'EVALUASI'>('ALL')
  const [filterService, setFilterService] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Ambil data yang memiliki saran riil
  const rawFeedback = useMemo(() => {
    return allResponses.filter(
      (r) => r.saran && r.saran.trim().length > 1 && r.saran.trim() !== '-'
    )
  }, [allResponses])

  // Ambil list layanan unik dari saran
  const uniqueServices = useMemo(() => {
    const set = new Set<string>()
    rawFeedback.forEach((r) => {
      if (r.jenis_layanan) set.add(r.jenis_layanan)
    })
    return Array.from(set)
  }, [rawFeedback])

  // Filter hasil pencarian dan kategori
  const filteredFeedback = useMemo(() => {
    return rawFeedback.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.saran.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.jenis_layanan.toLowerCase().includes(q) ||
        item.usia.toLowerCase().includes(q)

      const matchesService =
        filterService === 'ALL' || item.jenis_layanan.toLowerCase() === filterService.toLowerCase()

      // Sentimen/Evaluasi berdasarkan skor (A & B = Puas/Apresiasi, C & D = Perlu Perhatian/Evaluasi)
      let matchesSentiment = true
      if (filterSentiment === 'PUAS') {
        matchesSentiment = item.nilai === 'A' || item.nilai === 'B'
      } else if (filterSentiment === 'EVALUASI') {
        matchesSentiment = item.nilai === 'C' || item.nilai === 'D'
      }

      return matchesSearch && matchesService && matchesSentiment
    })
  }, [rawFeedback, searchQuery, filterSentiment, filterService])

  // Hitung metrik ringkasan
  const countTotal = rawFeedback.length
  const countApresiasi = rawFeedback.filter((r) => r.nilai === 'A' || r.nilai === 'B').length
  const countEvaluasi = rawFeedback.filter((r) => r.nilai === 'C' || r.nilai === 'D').length

  // Pagination
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage) || 1
  const paginatedFeedback = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredFeedback.slice(start, start + itemsPerPage)
  }, [filteredFeedback, currentPage, itemsPerPage])

  const handleReset = () => {
    setSearchQuery('')
    setFilterSentiment('ALL')
    setFilterService('ALL')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header Banner & Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider">Total Aspirasi Masuk</p>
            <h3 className="text-2xl font-black font-display mt-1">{countTotal}</h3>
            <p className="text-[11px] text-teal-200 mt-0.5">Masukan & kritik dari warga</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
            💬
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Apresiasi & Puas (A/B)</p>
            <h3 className="text-2xl font-black text-gray-900 font-display mt-1">{countApresiasi}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Ulasan bernilai sangat baik</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-black">
            👍
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-amber-700 text-xs font-bold uppercase tracking-wider">Perlu Evaluasi (C/D)</p>
            <h3 className="text-2xl font-black text-gray-900 font-display mt-1">{countEvaluasi}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Prioritas evaluasi pelayanan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 text-2xl font-black">
            ⚡
          </div>
        </div>
      </div>

      {/* Main Feedback Board Container */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
        {/* Controls: Search, Filter Tabs & Dropdowns */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Cari kata kunci saran, ID, atau layanan..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          {/* Filter Pills & Service Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sentiment Filter Pills */}
            <div className="inline-flex rounded-xl p-1 bg-gray-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setFilterSentiment('ALL')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterSentiment === 'ALL'
                    ? 'bg-white text-teal-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semua ({countTotal})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterSentiment('PUAS')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterSentiment === 'PUAS'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
              >
                Apresiasi ({countApresiasi})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterSentiment('EVALUASI')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterSentiment === 'EVALUASI'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-amber-700'
                }`}
              >
                Evaluasi ({countEvaluasi})
              </button>
            </div>

            {/* Service Dropdown */}
            <select
              value={filterService}
              onChange={(e) => {
                setFilterService(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold bg-white cursor-pointer"
            >
              <option value="ALL">Semua Layanan</option>
              {uniqueServices.map((svc) => (
                <option key={svc} value={svc}>{svc}</option>
              ))}
            </select>

            {(searchQuery || filterSentiment !== 'ALL' || filterService !== 'ALL') && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Feedback Cards Grid */}
        {filteredFeedback.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
              🔍
            </div>
            <h4 className="text-sm font-bold text-gray-700">Tidak ada saran yang cocok</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah filter sentimen & layanan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedFeedback.map((r) => {
              const isPuas = r.nilai === 'A' || r.nilai === 'B'
              return (
                <div
                  key={r.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all hover:shadow-md ${
                    isPuas
                      ? 'bg-white border-gray-200/90 hover:border-teal-300'
                      : 'bg-amber-50/30 border-amber-200/70 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Tag Layanan & Badge Nilai */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 truncate max-w-[170px]">
                        {r.jenis_layanan}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-black text-[11px] flex items-center gap-1 ${
                          isPuas
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span>{isPuas ? '★' : '⚠'}</span>
                        <span>Mutu {r.nilai}</span>
                      </span>
                    </div>

                    {/* Saran Quote Content */}
                    <div className="relative pl-3.5 border-l-2 border-teal-500/50">
                      <p className="text-xs text-gray-800 font-medium leading-relaxed italic line-clamp-4">
                        &ldquo;{r.saran}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Metadata Responden */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-800 font-display flex items-center gap-1">
                        <span>{r.id}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({r.usia} th, {r.jenis_kelamin})</span>
                      </div>
                      <div className="text-[10px] text-gray-400">{r.waktu}</div>
                    </div>

                    {setSelectedRespondent && (
                      <button
                        onClick={() => setSelectedRespondent(r)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-teal-50 hover:text-teal-800 text-[10px] font-bold text-gray-600 transition cursor-pointer"
                      >
                        Detail →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {filteredFeedback.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500 gap-3">
            <div>
              Menampilkan <strong>{paginatedFeedback.length}</strong> dari <strong>{filteredFeedback.length}</strong> masukan warga
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 font-bold disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
              >
                ← Sebelumnya
              </button>
              <span className="px-2 font-bold text-gray-800">
                Halaman {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 font-bold disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
