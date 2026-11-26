'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  IconChartBar,
  IconTrendingUp,
  IconRefresh,
  IconX,
} from '@/src/components/icons'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Cell,
  LabelList,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'
import { ResponseRow, AnalyticsData } from '@/src/lib/types/dashboard'
import { UNSUR_NAMES, parseScore } from '@/src/lib/ikm-calculator'
import { fetchAnalyticsCached } from '@/src/lib/analytics-cache'

const CustomElementTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 z-50">
        <p className="font-extrabold text-emerald-400 text-sm border-b border-slate-800 pb-1 font-display">
          {data.label || data.name}
        </p>
        <p className="text-slate-300">
          Skor Rata-rata (NRR): <strong className="text-white">{Number(data.score).toFixed(2)}</strong> / 4.00
        </p>
        <p className="text-slate-300">
          Nilai IKM Konversi: <strong className="text-white">{Number(data.ikm || (data.score * 25)).toFixed(1)}</strong>
        </p>
        <p className="text-slate-300">
          Mutu Pelayanan: <strong className="text-emerald-300">{data.mutu}</strong>
        </p>
      </div>
    )
  }
  return null
}

const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0, 23, 59, 59, 999)
}

export default function StatsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeChartView, setActiveChartView] = useState<'bar' | 'radar'>('bar')
  const [isMounted, setIsMounted] = useState(false)

  // In-page filters (placed above charts/tables like other admin pages)
  const [filterPeriod, setFilterPeriod] = useState<
    'all' | 'tw1' | 'tw2' | 'tw3' | 'tw4' | 'sem1' | 'sem2' | '1y' | 'custom'
  >('all')
  const [filterService, setFilterService] = useState('ALL')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    setIsMounted(true)
    fetchData()
  }, [])

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('adminToken') || ''
      const data = await fetchAnalyticsCached(token, forceRefresh)
      if (data) {
        setAnalytics(data)
      }
    } catch (err: any) {
      console.error('Fetch stats error:', err)
      setError(err.message || 'Gagal mengambil data statistik.')
    } finally {
      setLoading(false)
    }
  }

  // All responses from live analytics data
  const allResponses = useMemo(() => {
    return analytics?.responses || []
  }, [analytics])

  // Extract unique service list for filtering
  const uniqueServices = useMemo(() => {
    const set = new Set<string>()
    allResponses.forEach((r: any) => {
      if (r.jenis_layanan && r.jenis_layanan !== '-') {
        set.add(r.jenis_layanan)
      }
    })
    return Array.from(set)
  }, [allResponses])

  // Filtered responses based on period, service, & date range
  const filteredResponses = useMemo(() => {
    let start: Date | null = null
    let end: Date | null = null
    const currentYear = new Date().getFullYear()

    if (filterPeriod === 'tw1') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 2)
    } else if (filterPeriod === 'tw2') {
      start = new Date(currentYear, 3, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 5)
    } else if (filterPeriod === 'tw3') {
      start = new Date(currentYear, 6, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 8)
    } else if (filterPeriod === 'tw4') {
      start = new Date(currentYear, 9, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 11)
    } else if (filterPeriod === 'sem1') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 5)
    } else if (filterPeriod === 'sem2') {
      start = new Date(currentYear, 6, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 11)
    } else if (filterPeriod === '1y') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 11)
    } else if (filterPeriod === 'custom') {
      if (customStartDate) {
        const parts = customStartDate.split('-')
        if (parts.length === 3) {
          start = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0)
        }
      }
      if (customEndDate) {
        const parts = customEndDate.split('-')
        if (parts.length === 3) {
          end = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59, 999)
        }
      }
    }

    return allResponses.filter((r: any) => {
      // 1. Service filter
      if (filterService !== 'ALL' && r.jenis_layanan !== filterService) {
        return false
      }

      // 2. Date period filter
      const dateVal = r.timestamp || r.created_at || r.waktu
      const d = dateVal ? new Date(dateVal) : null
      if (!d || isNaN(d.getTime())) return true
      if (start && d < start) return false
      if (end && d > end) return false

      return true
    })
  }, [allResponses, filterPeriod, filterService, customStartDate, customEndDate])

  // Compute precise statistics for the filtered dataset
  const derivedStats = useMemo(() => {
    const total = filteredResponses.length
    const sums = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 }

    filteredResponses.forEach((r: any) => {
      sums.q1 += parseScore(r.u1 || r.q1)
      sums.q2 += parseScore(r.u2 || r.q2)
      sums.q3 += parseScore(r.u3 || r.q3)
      sums.q4 += parseScore(r.u4 || r.q4)
      sums.q5 += parseScore(r.u5 || r.q5)
      sums.q6 += parseScore(r.u6 || r.q6)
      sums.q7 += parseScore(r.u7 || r.q7)
      sums.q8 += parseScore(r.u8 || r.q8)
      sums.q9 += parseScore(r.u9 || r.q9)
    })

    const qKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'] as const
    let ikmSkala4 = 0
    const elements = UNSUR_NAMES.map((u, i) => {
      const qKey = qKeys[i]
      const avg = total > 0 ? sums[qKey] / total : 0
      ikmSkala4 += avg * (1 / 9)
      const ikm = avg * 25
      let mutu = 'D (Tidak Baik)'
      if (total > 0) {
        if (avg >= 3.53) mutu = 'A (Sangat Baik)'
        else if (avg >= 3.06) mutu = 'B (Baik)'
        else if (avg >= 2.60) mutu = 'C (Kurang Baik)'
        else mutu = 'D (Tidak Baik)'
      }

      return {
        ...u,
        id: u.key,
        name: u.label,
        score: avg,
        ikm,
        mutu,
      }
    })

    const ikmKonversi = ikmSkala4 * 25
    let mutuPelayanan = 'D'
    let kinerjaUnit = 'TIDAK BAIK'
    if (total > 0) {
      if (ikmKonversi >= 88.31) {
        mutuPelayanan = 'A'
        kinerjaUnit = 'SANGAT BAIK'
      } else if (ikmKonversi >= 76.61) {
        mutuPelayanan = 'B'
        kinerjaUnit = 'BAIK'
      } else if (ikmKonversi >= 65.0) {
        mutuPelayanan = 'C'
        kinerjaUnit = 'KURANG BAIK'
      } else {
        mutuPelayanan = 'D'
        kinerjaUnit = 'TIDAK BAIK'
      }
    }

    return {
      total,
      ikmSkala4: Number(ikmSkala4.toFixed(4)),
      ikmKonversi: Number(ikmKonversi.toFixed(2)),
      mutu: mutuPelayanan,
      kinerja: kinerjaUnit,
      elements,
    }
  }, [filteredResponses])

  const handleResetFilters = () => {
    setFilterPeriod('all')
    setFilterService('ALL')
    setCustomStartDate('')
    setCustomEndDate('')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-white/10 font-display">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Analisis Komprehensif SKM
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 font-display text-white">
            Statistik Kepuasan Masyarakat
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Hasil evaluasi 9 unsur pelayanan publik Kelurahan Lebakgede berpedoman pada PermenPAN-RB No. 14 Tahun 2017.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
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

      {/* FILTER CONTROL PANEL (Di dalam halaman, sama seperti page responden/users) */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <IconTrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 font-display">Filter Statistik Data</h2>
              <p className="text-[11px] text-gray-500">Sesuaikan rentang waktu periode dan jenis layanan yang ingin dianalisis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500">
              Menampilkan: <strong className="text-teal-700">{derivedStats.total}</strong> dari {allResponses.length} responden
            </span>
            {(filterPeriod !== 'all' || filterService !== 'ALL' || customStartDate || customEndDate) && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition border border-rose-200 cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${filterPeriod === 'custom' ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-4`}>
          {/* Filter 1: Periode / Triwulan */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider font-display">
              Periode Waktu
            </label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
            >
              <option value="all">Seluruh Data ({allResponses.length})</option>
              <option value="tw1">Triwulan I (Jan - Mar)</option>
              <option value="tw2">Triwulan II (Apr - Jun)</option>
              <option value="tw3">Triwulan III (Jul - Sep)</option>
              <option value="tw4">Triwulan IV (Okt - Des)</option>
              <option value="sem1">Semester I (Jan - Jun)</option>
              <option value="sem2">Semester II (Jul - Des)</option>
              <option value="1y">1 Tahun Penuh</option>
              <option value="custom">Rentang Tanggal Kustom</option>
            </select>
          </div>

          {/* Filter 2: Jenis Layanan */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider font-display">
              Jenis Layanan
            </label>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Jenis Layanan</option>
              {uniqueServices.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3 & 4: Tanggal Kustom (Aktif hanya bila memilih 'custom') */}
          {filterPeriod === 'custom' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider font-display">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider font-display">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Total Responden Terfilter</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-teal-700 font-display">{derivedStats.total}</h3>
            <span className="text-xs text-gray-400">/ {allResponses.length} Warga</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            {filterPeriod === 'all' ? 'Seluruh Data Responden' : 'Sesuai Filter Periode'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Nilai IKM Konversi</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-emerald-600 font-display">
              {derivedStats.ikmKonversi.toFixed(2)}
            </h3>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Mutu {derivedStats.mutu} ({derivedStats.kinerja})
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Nilai IKM Skala 4</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-indigo-700 font-display">
              {derivedStats.ikmSkala4.toFixed(2)}
            </h3>
            <span className="text-xs text-gray-400">/ 4.00</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            NRR Tertimbang
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Kinerja Unit Layanan</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-extrabold text-amber-600 font-display">{derivedStats.kinerja}</h3>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Tingkat Kepuasan Warga
          </span>
        </div>
      </div>

      {/* Interactive Chart Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 font-display flex items-center gap-2">
              <IconChartBar className="w-5 h-5 text-teal-600" />
              <span>Grafik Evaluasi 9 Unsur SKM</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Perbandingan nilai rata-rata persepsi masyarakat per unsur pelayanan
            </p>
          </div>

          {/* Chart Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveChartView('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-display cursor-pointer ${
                activeChartView === 'bar'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Diagram Batang
            </button>
            <button
              type="button"
              onClick={() => setActiveChartView('radar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-display cursor-pointer ${
                activeChartView === 'radar'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Radar Spider
            </button>
          </div>
        </div>

        {/* Chart Container */}
        {isMounted && (
          <div className="h-80 sm:h-96 w-full pt-2">
            {derivedStats.total > 0 ? (
              activeChartView === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={derivedStats.elements}
                    margin={{ top: 20, right: 20, left: -10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="short"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11, fill: '#475569' }}
                    />
                    <YAxis
                      domain={[0, 4]}
                      ticks={[1, 2, 3, 4]}
                      tick={{ fontSize: 11, fill: '#475569' }}
                    />
                    <RechartsTooltip content={<CustomElementTooltip />} />
                    <ReferenceLine
                      y={3.53}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{
                        value: 'Sangat Baik (3.53)',
                        fill: '#10b981',
                        fontSize: 10,
                        position: 'top',
                      }}
                    />
                    <ReferenceLine
                      y={3.06}
                      stroke="#0284c7"
                      strokeDasharray="3 3"
                      label={{
                        value: 'Baik (3.06)',
                        fill: '#0284c7',
                        fontSize: 10,
                        position: 'top',
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {derivedStats.elements.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={
                            entry.score >= 3.53
                              ? '#10b981'
                              : entry.score >= 3.06
                              ? '#0d9488'
                              : '#f59e0b'
                          }
                        />
                      ))}
                      <LabelList
                        dataKey="score"
                        position="top"
                        formatter={(val: any) => Number(val).toFixed(2)}
                        style={{ fontSize: 11, fontWeight: 'bold', fill: '#0f172a' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={derivedStats.elements}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="short"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    />
                    <PolarRadiusAxis domain={[0, 4]} angle={30} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Skor Unsur"
                      dataKey="score"
                      stroke="#0d9488"
                      fill="#14b8a6"
                      fillOpacity={0.4}
                    />
                    <RechartsTooltip content={<CustomElementTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 font-medium">
                Tidak ada data responden yang cocok dengan filter yang dipilih.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table 9 Unsur */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 font-display">
              Rincian Penilaian 9 Unsur Pelayanan
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Nilai Rata-rata Responden (NRR) dan IKM tiap unsur layanan
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-display text-[11px]">
              <tr>
                <th className="px-5 py-3.5 text-center font-bold">No</th>
                <th className="px-5 py-3.5 font-bold">Unsur Pelayanan</th>
                <th className="px-5 py-3.5 text-center font-bold">NRR (Skala 4)</th>
                <th className="px-5 py-3.5 text-center font-bold">IKM Unsur</th>
                <th className="px-5 py-3.5 text-center font-bold">Mutu Layanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {derivedStats.elements.map((elem, idx) => (
                <tr key={elem.key} className="hover:bg-teal-50/40 transition-colors">
                  <td className="px-5 py-3.5 text-center text-gray-500 font-medium">{idx + 1}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{elem.label}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-gray-900">
                    {elem.score.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-center font-extrabold text-emerald-600">
                    {elem.ikm.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      elem.mutu.startsWith('A') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      elem.mutu.startsWith('B') ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                      elem.mutu.startsWith('C') ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {elem.mutu}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
