import React from 'react'
import { IconDownload } from '@/src/components/icons'
import { TabId } from '../DashboardSidebar'

interface TabRingkasanProps {
  derivedStats: any
  isAuthenticated: boolean
  setIsLoginModalOpen: (v: boolean) => void
  setActiveTab: (t: TabId) => void
}

export const TabRingkasan: React.FC<TabRingkasanProps> = ({
  derivedStats,
  isAuthenticated,
  setIsLoginModalOpen,
  setActiveTab,
}) => {
  return (
    <div className="space-y-6 fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-white/10 font-display">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Hasil Resmi Survei Kepuasan Masyarakat (SKM)
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 font-display">
            Ringkasan Capaian Mutu Pelayanan
          </h2>
          <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
            Rekapitulasi responden pelayanan masyarakat di Kantor Kelurahan Lebakgede Kecamatan Coblong Kota Bandung.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                setIsLoginModalOpen(true)
              } else {
                setActiveTab('export')
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <IconDownload className="w-4 h-4" />
            <span>{isAuthenticated ? 'Unduh Laporan' : 'Unduh Laporan (Petugas)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Nilai IKM Konversi</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-emerald-600 font-display">{derivedStats.ikmKonversi.toFixed(2)}</h3>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Mutu {derivedStats.mutu} ({derivedStats.kinerja})
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Nilai IKM Skala 4</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-teal-700 font-display">{derivedStats.ikmSkala4.toFixed(2)}</h3>
            <span className="text-xs text-gray-400">/ 4.00</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            NRR Tertimbang 9 Unsur
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Total Responden</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-slate-800 font-display">{derivedStats.total}</h3>
            <span className="text-xs text-gray-400">Warga Terdata</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            100% Mengisi Lengkap
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Status Data</p>
          <div className="text-xl font-extrabold text-slate-800 mt-2 font-display">Terverifikasi</div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Data Aktif Pelayanan
          </span>
        </div>
      </div>

      {/* Official Baku Mutu Reference Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 font-display">Keterangan Baku Mutu Pelayanan</h4>
            <p className="text-xs text-gray-500">Rentang nilai konversi dan predikat mutu pelayanan</p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            Standar Mutu Pelayanan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/60">
            <span className="text-xs font-bold text-rose-800">Mutu D (Tidak Baik)</span>
            <div className="text-xs text-rose-700 mt-1">Nilai: 25.00 – 64.99 (Skala 1.00 – 2.59)</div>
          </div>
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60">
            <span className="text-xs font-bold text-amber-800">Mutu C (Kurang Baik)</span>
            <div className="text-xs text-amber-700 mt-1">Nilai: 65.00 – 76.60 (Skala 2.60 – 3.06)</div>
          </div>
          <div className="p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 shadow-xs relative">
            <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] font-bold rounded">
              Capaian Lebakgede
            </span>
            <span className="text-xs font-bold text-emerald-900 font-display">Mutu B (Baik) ★</span>
            <div className="text-xs text-emerald-800 mt-1 font-semibold">Nilai: 76.61 – 88.30 (Skor: 87.20)</div>
          </div>
          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60">
            <span className="text-xs font-bold text-blue-800">Mutu A (Sangat Baik)</span>
            <div className="text-xs text-blue-700 mt-1">Nilai: 88.31 – 100.00 (Skala 3.53 – 4.00)</div>
          </div>
        </div>
      </div>

      {/* Mini Highlights 9 Unsur */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h4 className="text-sm font-extrabold text-gray-900 font-display">Rincian Nilai Rata-rata 9 Unsur Pelayanan</h4>
          <button
            onClick={() => setActiveTab('grafik')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
          >
            Lihat Grafik Lengkap →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {derivedStats.elements.map((u: any) => (
            <div key={u.key} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 font-display">{u.short}</div>
                <div className="text-[11px] text-gray-500">{u.mutu}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-teal-700 font-display">{u.score.toFixed(2)}</div>
                <div className="text-[10px] text-gray-400">IKM: {u.ikm.toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

