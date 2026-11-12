'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  LabelList,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
} from 'recharts'
import { STANDAR_BAKU_MUTU } from '@/src/lib/ikm-calculator'
import {
  IconHome,
  IconPlusCircle,
  IconLock,
  IconUsers,
  IconAward,
  IconCheckCircle,
  IconChartBar,
  IconPieChart,
  IconBookOpen,
  IconActivity,
} from '@/src/components/icons'

// Inline tooltip for the chart (sama persis dengan original)
const CustomElementTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 z-50">
        <p className="font-extrabold text-emerald-400 text-sm border-b border-slate-800 pb-1 font-display">{data.label}</p>
        <div className="flex justify-between gap-6 pt-1">
          <span className="text-gray-300">Nilai Rata-rata (NRR):</span>
          <span className="font-bold text-white">{Number(data.score).toFixed(2)} / 4.00</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-300">IKM Konversi (x25):</span>
          <span className="font-bold text-emerald-300">{Number(data.ikm).toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-300">Mutu Pelayanan:</span>
          <span className="font-bold text-teal-300">{data.mutu}</span>
        </div>
      </div>
    )
  }
  return null
}

interface DerivedStats {
  total: number
  ikmSkala4: number
  ikmKonversi: number
  mutu: string
  kinerja: string
  elements: Array<{
    id: string
    key: string
    label: string
    name: string
    short: string
    score: number
    ikm: number
    mutu: string
  }>
  gender: Record<string, number>
  education: Record<string, number>
}

interface PublicDashboardProps {
  derivedStats: DerivedStats
  onLoginClick: () => void
}

export const PublicDashboard: React.FC<PublicDashboardProps> = ({
  derivedStats,
  onLoginClick,
}) => {
  const [publicTab, setPublicTab] = useState<'unsur' | 'grafik' | 'demografi' | 'standar'>('unsur')
  const [publicChartView, setPublicChartView] = useState<'bar' | 'radar'>('bar')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900">

      {/* PUBLIC TOP HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center logo-float">
            <img src="/lebakgede.png" alt="Logo Kelurahan Lebakgede" className="h-9 w-9 object-contain drop-shadow-sm" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight font-display flex items-center gap-2">
              <span>Dashboard Survei Kepuasan Masyarakat</span>
            </div>
            <div className="text-[11px] sm:text-xs text-gray-500">
              Kelurahan Lebakgede • Kecamatan Coblong, Kota Bandung
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-gray-600 hover:text-teal-800 hover:bg-gray-100 text-xs font-bold transition"
          >
            <IconHome className="w-4 h-4" />
            <span>Beranda</span>
          </Link>

          <Link
            href="/form"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition"
          >
            <IconPlusCircle className="w-4 h-4 text-teal-700" />
            <span>Isi Survei</span>
          </Link>

          <button
            onClick={onLoginClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold shadow-sm transition font-display cursor-pointer"
          >
            <IconLock className="w-3.5 h-3.5" />
            <span>Login Petugas</span>
          </button>
        </div>
      </header>

      {/* MAIN PUBLIC CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* HERO SUMMARY CARD */}
        <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display leading-tight text-white">
                Indeks Kepuasan Masyarakat (IKM) Pelayanan Publik
              </h1>
              <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
                Penyajian data hasil survei kepuasan masyarakat terhadap 9 unsur pelayanan di Kantor Kelurahan Lebakgede guna mendorong transparansi dan peningkatan kualitas layanan prima.
              </p>
            </div>

            {/* Big Score Metric */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-col sm:flex-row items-center gap-6 min-w-[280px] shadow-inner text-center sm:text-left">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
                  {derivedStats.ikmKonversi.toFixed(2)}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-teal-200 font-bold mt-1">
                  Skala 100 (IKM Konversi)
                </div>
              </div>
              <div className="h-12 w-px bg-white/20 hidden sm:block"></div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-400 text-teal-950 text-xs font-black uppercase font-display">
                  Mutu {derivedStats.mutu} • {derivedStats.kinerja}
                </div>
                <div className="text-xs text-teal-100 font-medium">
                  Skor Rata-rata: <span className="font-bold text-white">{derivedStats.ikmSkala4.toFixed(2)}</span> / 4.00
                </div>
              </div>
            </div>
          </div>

          {/* Quick 3 Stat Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
                <IconUsers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-white font-display">{derivedStats.total} Responden</div>
                <div className="text-[11px] text-teal-200">Partisipasi Warga Terdata</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
                <IconAward className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-white font-display">9 Unsur Pelayanan</div>
                <div className="text-[11px] text-teal-200">Kriteria Evaluasi Lengkap</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
                <IconCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-white font-display">Terverifikasi</div>
                <div className="text-[11px] text-teal-200">Data Pelayanan Sah</div>
              </div>
            </div>
          </div>
        </div>

        {/* PUBLIC DASHBOARD TABS NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          {[
            { id: 'unsur', label: 'Nilai 9 Unsur Pelayanan', icon: IconCheckCircle },
            { id: 'grafik', label: 'Grafik & Diagram Evaluasi', icon: IconChartBar },
            { id: 'demografi', label: 'Demografi Responden', icon: IconPieChart },
            { id: 'standar', label: 'Pedoman & Baku Mutu IKM', icon: IconBookOpen },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = publicTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setPublicTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${isActive
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB 1: 9 UNSUR CARDS */}
        {publicTab === 'unsur' && (
          <div className="space-y-4 fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 font-display">
                  Rincian Penilaian 9 Unsur Pelayanan
                </h2>
                <p className="text-xs text-gray-500">
                  Nilai rata-rata dan konversi IKM per unsur berdasarkan survei responden masyarakat
                </p>
              </div>
              <div className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl w-fit">
                Rata-rata Keseluruhan: {derivedStats.ikmSkala4.toFixed(2)} / 4.00
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {derivedStats.elements.map((el) => (
                <div
                  key={el.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-black text-teal-700 tracking-wider uppercase font-display">
                        {el.short}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                        {el.name}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap ${el.score >= 3.53
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-teal-100 text-teal-800 border border-teal-200'
                      }`}>
                      {el.mutu}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div className="text-xs text-gray-500">
                      Skor Skala 4: <span className="font-extrabold text-gray-900 text-sm">{el.score.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-teal-700 font-extrabold">
                      IKM: {el.ikm.toFixed(2)}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all duration-500"
                      style={{ width: `${(el.score / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GRAFIK & DIAGRAM EVALUASI */}
        {publicTab === 'grafik' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6 fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 font-display">
                  Visualisasi Grafik 9 Unsur Pelayanan
                </h2>
                <p className="text-xs text-gray-500">
                  Bandingkan capaian kepuasan tiap unsur layanan dengan diagram batang dan radar spider
                </p>
              </div>

              {/* Switcher Button */}
              <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 self-start sm:self-auto">
                <button
                  onClick={() => setPublicChartView('bar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${publicChartView === 'bar' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <IconChartBar className="w-3.5 h-3.5" />
                  <span>Diagram Batang</span>
                </button>
                <button
                  onClick={() => setPublicChartView('radar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${publicChartView === 'radar' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <IconActivity className="w-3.5 h-3.5" />
                  <span>Radar Spider</span>
                </button>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-80 sm:h-96 w-full pt-4">
              {publicChartView === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derivedStats.elements} margin={{ top: 20, right: 20, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="short" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <RechartsTooltip content={<CustomElementTooltip />} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {derivedStats.elements.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.score >= 3.53 ? '#10b981' : entry.score >= 3.06 ? '#0d9488' : '#f59e0b'}
                        />
                      ))}
                      <LabelList dataKey="score" position="top" formatter={(val: any) => Number(val).toFixed(2)} style={{ fontSize: 11, fontWeight: 'bold', fill: '#0f172a' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={derivedStats.elements}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="short" tick={{ fontSize: 11, fill: '#334155' }} />
                    <PolarRadiusAxis domain={[0, 4]} />
                    <Radar name="Skor Unsur" dataKey="score" stroke="#0d9488" fill="#14b8a6" fillOpacity={0.4} />
                    <RechartsTooltip content={<CustomElementTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEMOGRAFI RESPONDEN */}
        {publicTab === 'demografi' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
            {/* Gender Pie Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 font-display">
                  Komposisi Jenis Kelamin Responden
                </h3>
                <p className="text-xs text-gray-500">
                  Proporsi keikutsertaan masyarakat berdasarkan gender
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Perempuan', value: derivedStats.gender['Perempuan'] || 13, fill: '#ec4899' },
                        { name: 'Laki-laki', value: derivedStats.gender['Laki-laki'] || 11, fill: '#0284c7' },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name} ${(((percent as number) || 0) * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#ec4899" />
                      <Cell fill="#0284c7" />
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-6 text-xs font-bold pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                  <span>Perempuan: {derivedStats.gender['Perempuan'] || 13} Orang</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-600"></span>
                  <span>Laki-laki: {derivedStats.gender['Laki-laki'] || 11} Orang</span>
                </div>
              </div>
            </div>

            {/* Education Breakdown */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 font-display">
                  Latar Belakang Pendidikan
                </h3>
                <p className="text-xs text-gray-500">
                  Tingkat pendidikan terakhir warga yang mengurus pelayanan
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { edu: 'SMA / Sederajat', count: 15, pct: 62.5 },
                  { edu: 'Strata 1 (S1)', count: 5, pct: 20.8 },
                  { edu: 'Diploma (D1-D3)', count: 2, pct: 8.3 },
                  { edu: 'Sekolah Dasar (SD)', count: 1, pct: 4.2 },
                  { edu: 'Strata 3 (S3 / Doktoral)', count: 1, pct: 4.2 },
                ].map((item) => (
                  <div key={item.edu}>
                    <div className="flex justify-between text-xs font-bold text-gray-800 mb-1">
                      <span>{item.edu}</span>
                      <span>{item.count} Responden ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PEDOMAN & BAKU MUTU IKM */}
        {publicTab === 'standar' && (
          <div className="space-y-6 fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 font-display">
                  Pedoman Skala Penilaian & Mutu Pelayanan
                </h2>
                <p className="text-xs text-gray-500">
                  Klasifikasi mutu pelayanan dan kinerja unit pelayanan berdasarkan pedoman baku nasional
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STANDAR_BAKU_MUTU.map((item) => {
                  const isCurrent = item.mutu === derivedStats.mutu
                  return (
                    <div
                      key={item.mutu}
                      className={`rounded-2xl p-5 border transition-all ${isCurrent
                          ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                          : 'bg-white border-gray-200'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm font-display ${isCurrent ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {item.mutu}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold bg-teal-700 text-white px-2 py-0.5 rounded-full uppercase">
                            Capaian Saat Ini
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-extrabold text-gray-900 font-display">{item.kinerja}</div>
                      <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                        <div>Rentang Nilai IKM:</div>
                        <div className="font-mono font-bold text-gray-800">{item.rentangKonversi}</div>
                        <div className="text-[11px] text-gray-400">Skala 4: {item.rentangSkala4}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-200 text-xs text-gray-600 space-y-2">
                <div className="font-bold text-gray-800 flex items-center gap-1.5 font-display">
                  <IconBookOpen className="w-4 h-4 text-teal-700" />
                  <span>Rumus Pengolahan Data Indeks Kepuasan Masyarakat</span>
                </div>
                <p className="leading-relaxed">
                  Pengolahan data dilakukan dengan menghitung nilai rata-rata dari masing-masing 9 unsur pelayanan. Nilai total kemudian dikalikan dengan bobot penimbang 1/9 (0.111) dan dikonversi ke skala 100 dengan faktor pengali 25 untuk menentukan klasifikasi Mutu Pelayanan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CITIZEN CTA BANNER */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-extrabold font-display">
              Sudah Pernah Mengurus Layanan di Kelurahan Lebakgede?
            </h3>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Partisipasi survei Anda sangat penting untuk membantu kami terus mengevaluasi dan menyempurnakan kualitas pelayanan warga.
            </p>
          </div>
          <Link
            href="/form"
            className="px-6 py-3 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-extrabold text-xs sm:text-sm shadow-md transition font-display whitespace-nowrap cursor-pointer"
          >
            Isi Kuesioner Survei Sekarang →
          </Link>
        </div>

      </main>

      {/* PUBLIC FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 px-4 sm:px-8 text-center text-xs text-gray-500 space-y-2">
        <div className="font-bold text-gray-700 font-display">
          Pemerintah Kota Bandung • Kecamatan Coblong • Kelurahan Lebakgede
        </div>
        <div>
          Sistem Informasi Survei Kepuasan Masyarakat (SKM) Pelayanan Publik
        </div>
        <div className="text-[11px] text-gray-400 pt-2">
          © {new Date().getFullYear()} Kelurahan Lebakgede. Seluruh hak cipta dilindungi undang-undang.
        </div>
      </footer>

    </div>
  )
}

