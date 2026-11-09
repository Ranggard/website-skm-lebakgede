import React from 'react'
import Link from 'next/link'
import { HomeSummary } from '../types'

interface HeroSectionProps {
  summary: HomeSummary
}

export const HeroSection: React.FC<HeroSectionProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-8">
      {/* Left Column - Hero Titles & Statistics Highlights */}
      <div className="lg:col-span-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-300/30 text-teal-200 text-xs font-semibold backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Laporan Mutu Pelayanan Publik
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight font-display">
            Survei Kepuasan<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-emerald-200 to-amber-200">
              Masyarakat (SKM)
            </span>
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-teal-100 font-display flex items-center gap-2 flex-wrap">
            <span>Kelurahan Lebakgede</span>
            <span className="text-white/40">•</span>
            <span className="font-script text-2xl sm:text-3xl text-amber-200 tracking-wide font-normal">
              Melayani dengan Sepenuh Hati
            </span>
          </p>
        </div>

        <p className="text-white/85 text-sm sm:text-base leading-relaxed">
          Bantu kami menjaga transparansi dan meningkatkan standar pelayanan publik di Kantor Kelurahan Lebakgede. Suara dan aspirasi Anda menjadi dasar perbaikan nyata fasilitas dan tata kelola aparatur.
        </p>

        {/* Prominent Action Button for Hero */}
        <div className="pt-2">
          <Link
            href="/form"
            className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-teal-950 font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-teal-950/40 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-200 transform hover:-translate-y-0.5 border border-emerald-300/40"
          >
            <div className="flex flex-col text-left">
              <span className="text-teal-950 text-base sm:text-lg font-bold">Lakukan Survei Sekarang</span>
              <span className="text-teal-900/80 text-[11px] font-medium">Mulai Isi Survei Sekarang • 2–3 Menit Selesai</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-950/10 flex items-center justify-center text-teal-950 group-hover:translate-x-1 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick Guarantees */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 shadow-sm">
            <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider mb-1 font-display">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              9 Unsur SKM
            </div>
            <div className="text-xs text-white/80">
              Penilaian Mutu Pelayanan
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 shadow-sm">
            <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider mb-1 font-display">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              100% Anonim
            </div>
            <div className="text-xs text-white/80">
              Data identitas aman & terjaga kerahasiaannya
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Ringkasan Statistik IKM (Hasil Analisis TW 3 2026) */}
      <div className="lg:col-span-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 text-gray-900 border border-white/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 rounded-bl-full pointer-events-none"></div>

          {/* Header Box Statistik */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60 font-display">
                Ringkasan Statistik IKM
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2 font-display">
                Kinerja Pelayanan Publik
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Kelurahan Lebakgede • Kecamatan Coblong
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-gray-400">Mutu Pelayanan</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 mt-0.5">
                {summary.totalResponden > 0 ? `Kategori ${summary.mutuPelayanan} (${summary.kinerjaUnit})` : 'Belum Ada Responden'}
              </span>
            </div>
          </div>

          {/* Main KPI Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-100/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Nilai IKM</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-900 mt-1 font-display tracking-tight">
                {summary.ikmKonversi !== null ? summary.ikmKonversi.toFixed(2) : '-'}
              </div>
              <span className="text-[11px] text-teal-700 font-medium">Skala Konversi (0-100)</span>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Skala 4.0</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-900 mt-1 font-display tracking-tight">
                {summary.ikmSkala4 !== null ? summary.ikmSkala4.toFixed(2) : '-'}
              </div>
              <span className="text-[11px] text-blue-700 font-medium">NRR Tertimbang</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Responden</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-900 mt-1 font-display tracking-tight">
                {summary.totalResponden}
              </div>
              <span className="text-[11px] text-amber-700 font-medium">Warga Mengisi</span>
            </div>
          </div>

          {/* Highlights 9 Unsur */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 uppercase tracking-wider font-display">
              <span>Aspek Pelayanan Unggulan</span>
              <span className="text-emerald-600 font-semibold lowercase text-[11px]">skala 1 - 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900">Biaya / Tarif</div>
                  <div className="text-[11px] text-gray-500">Gratis & Sesuai Aturan</div>
                </div>
                <span className="text-sm font-extrabold text-emerald-600 font-display bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {summary.elements?.u4?.score ? `${summary.elements.u4.score.toFixed(2)} / 4.00` : '-'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900">Pengaduan Layanan</div>
                  <div className="text-[11px] text-gray-500">Dikelola Cepat & Tepat</div>
                </div>
                <span className="text-sm font-extrabold text-emerald-600 font-display bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {summary.elements?.u9?.score ? `${summary.elements.u9.score.toFixed(2)} / 4.00` : '-'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900">Persyaratan Layanan</div>
                  <div className="text-[11px] text-gray-500">Jelas & Transparan</div>
                </div>
                <span className="text-sm font-extrabold text-teal-700 font-display bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                  {summary.elements?.u1?.score ? `${summary.elements.u1.score.toFixed(2)} / 4.00` : '-'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900">Keramahan Petugas</div>
                  <div className="text-[11px] text-gray-500">Sopan & Komunikatif</div>
                </div>
                <span className="text-sm font-extrabold text-teal-700 font-display bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                  {summary.elements?.u7?.score ? `${summary.elements.u7.score.toFixed(2)} / 4.00` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Demographic Summary Bar */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-gray-600">
                Laki-laki: <strong className="text-gray-900">{summary.demographics?.gender?.['Laki-laki'] || summary.demographics?.gender?.['L'] || 0}</strong>
              </span>
              <span className="text-gray-300">|</span>
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              <span className="text-gray-600">
                Perempuan: <strong className="text-gray-900">{summary.demographics?.gender?.['Perempuan'] || summary.demographics?.gender?.['P'] || 0}</strong>
              </span>
            </div>
            <div className="text-[11px] text-gray-500 font-medium">
              Pengesahan: <strong>Lurah Lebakgede</strong>
            </div>
          </div>

          {/* Action Button to Dashboard */}
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 text-center sm:text-left">
              Lihat rincian 9 unsur, grafik evaluasi & demografi lengkap
            </div>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition-all font-display group whitespace-nowrap cursor-pointer"
            >
              <svg className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Buka Dashboard SKM</span>
              <span className="text-emerald-300 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

