import React from 'react'
import { IconSearch } from '@/src/components/icons'
import { ResponseRow } from '@/src/lib/types/dashboard'

interface TabRespondenProps {
  searchQuery: string
  setSearchQuery: (v: string) => void
  filterService: string
  setFilterService: (v: string) => void
  filterGender: string
  setFilterGender: (v: string) => void
  filterAgeGroup: string
  setFilterAgeGroup: (v: string) => void
  filterStartDate: string
  setFilterStartDate: (v: string) => void
  filterEndDate: string
  setFilterEndDate: (v: string) => void
  onResetFilters: () => void
  uniqueServices: string[]
  paginatedResponses: ResponseRow[]
  filteredResponses: ResponseRow[]
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  setSelectedRespondent: (r: ResponseRow) => void
}

export const TabResponden: React.FC<TabRespondenProps> = ({
  searchQuery,
  setSearchQuery,
  filterService,
  setFilterService,
  filterGender,
  setFilterGender,
  filterAgeGroup,
  setFilterAgeGroup,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  onResetFilters,
  uniqueServices,
  paginatedResponses,
  filteredResponses,
  currentPage,
  setCurrentPage,
  totalPages,
  setSelectedRespondent,
}) => {
  const isAnyFilterActive =
    Boolean(searchQuery) ||
    filterService !== 'ALL' ||
    filterGender !== 'ALL' ||
    filterAgeGroup !== 'ALL' ||
    Boolean(filterStartDate) ||
    Boolean(filterEndDate)

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        {/* Title and Filter Area */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 font-display">Tabel Data Responden</h3>
              <p className="text-xs text-gray-500">Daftar lengkap partisipasi survei masyarakat beserta rincian jawaban</p>
            </div>
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={onResetFilters}
                className="self-start sm:self-auto px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <span>✕</span>
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>

          {/* Row 1: Search Bar & Demographic Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="relative md:col-span-5">
              <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Cari ID, jenis layanan, saran, usia..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={filterService}
                onChange={(e) => {
                  setFilterService(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold bg-white cursor-pointer"
              >
                <option value="ALL">Semua Jenis Layanan</option>
                {uniqueServices.map((svc) => (
                  <option key={svc} value={svc}>{svc}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={filterGender}
                onChange={(e) => {
                  setFilterGender(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold bg-white cursor-pointer"
              >
                <option value="ALL">Semua Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Filter Rentang Usia */}
            <div className="md:col-span-2">
              <select
                value={filterAgeGroup}
                onChange={(e) => {
                  setFilterAgeGroup(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold bg-white cursor-pointer"
              >
                <option value="ALL">Semua Usia</option>
                <option value="under_20">&lt; 20 Tahun</option>
                <option value="20_30">20 – 30 Tahun</option>
                <option value="31_45">31 – 45 Tahun</option>
                <option value="46_60">46 – 60 Tahun</option>
                <option value="above_60">&gt; 60 Tahun</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date Range Filters */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-gray-700">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              <span>📅</span>
              <span>Rentang Tanggal:</span>
            </span>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-500 font-medium">Dari:</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => {
                  setFilterStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-500 font-medium">Sampai:</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              />
            </div>

            {(filterStartDate || filterEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setFilterStartDate('')
                  setFilterEndDate('')
                  setCurrentPage(1)
                }}
                className="text-[11px] font-bold text-teal-700 hover:underline ml-auto"
              >
                Hapus Tanggal
              </button>
            )}
          </div>
        </div>

        {/* Responden Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-gray-700 font-bold uppercase tracking-wider font-display border-b border-gray-200">
              <tr>
                <th className="py-3 px-3 text-center">No</th>
                <th className="py-3 px-3">ID Responden</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3">Gender</th>
                <th className="py-3 px-3">Usia</th>
                <th className="py-3 px-3">Pendidikan</th>
                <th className="py-3 px-3">Layanan</th>
                <th className="py-3 px-3 text-center">Rata2</th>
                <th className="py-3 px-3 text-center">Mutu</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedResponses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    Tidak ada responden yang sesuai dengan kriteria pencarian dan filter saat ini.
                  </td>
                </tr>
              ) : (
                paginatedResponses.map((r) => (
                  <tr key={r.id} className="hover:bg-teal-50/40 transition">
                    <td className="py-3 px-3 text-center font-bold text-gray-500">{r.no}</td>
                    <td className="py-3 px-3 font-semibold text-teal-900">{r.id}</td>
                    <td className="py-3 px-3 text-gray-600">{r.waktu}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          r.jenis_kelamin.toLowerCase().includes('laki')
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-pink-50 text-pink-700'
                        }`}
                      >
                        {r.jenis_kelamin}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700">{r.usia} th</td>
                    <td className="py-3 px-3 text-gray-700">{r.pendidikan}</td>
                    <td className="py-3 px-3 font-medium text-gray-900">{r.jenis_layanan}</td>
                    <td className="py-3 px-3 text-center font-bold text-teal-800">
                      {Number(r.skor_rata).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
                          r.nilai === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.nilai === 'B'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.nilai}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedRespondent(r)}
                        className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-gray-300 rounded-lg text-teal-700 font-bold text-[11px] transition shadow-2xs cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-xs text-gray-500 gap-3">
          <div>
            Menampilkan <strong>{paginatedResponses.length}</strong> dari <strong>{filteredResponses.length}</strong> responden
          </div>
          <div className="flex items-center gap-1.5">
            <button
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 font-bold disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
