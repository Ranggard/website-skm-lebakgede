'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
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
  PieChart,
  Pie,
} from 'recharts'

interface ResponseRow {
  no: number
  id: string
  waktu: string
  jenis_kelamin: string
  usia: string
  pendidikan: string
  jenis_layanan: string
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
  q8: string
  q9: string
  saran: string
  nilai: string
  skor_rata: number
}

interface AnalyticsData {
  totalResponses: number
  avgSatisfaction: number
  ikmSkala4?: number
  ikmKonversi?: number
  mutuPelayanan?: string
  satisfactionRate: number
  satisfactionDistribution: {
    verySatisfied: number
    satisfied: number
    neutral: number
    dissatisfied: number
    veryDissatisfied: number
  }
  dimensionAverages: {
    accessibility: number
    serviceQuality: number
    professionalism: number
    courtesy: number
    reliability: number
    security: number
    responseTime: number
    facilities: number
  }
  elements?: Record<string, { name: string; score: number }>
  demographics?: {
    gender?: Record<string, number>
    age?: Record<string, number>
    education?: Record<string, number>
    serviceType?: Record<string, number>
  }
  responses?: ResponseRow[]
  lastUpdated?: string
}

const DEFAULT_ADMIN_TOKEN = 'admin-token-skm-questionnaire-default-12345678'

const UNSUR_NAMES = [
  { key: 'u1', label: '1. Persyaratan Pelayanan', short: 'Persyaratan' },
  { key: 'u2', label: '2. Prosedur Pelayanan', short: 'Prosedur' },
  { key: 'u3', label: '3. Waktu Pelayanan', short: 'Waktu' },
  { key: 'u4', label: '4. Biaya / Tarif', short: 'Biaya' },
  { key: 'u5', label: '5. Produk Pelayanan', short: 'Produk' },
  { key: 'u6', label: '6. Kompetensi Petugas', short: 'Kompetensi' },
  { key: 'u7', label: '7. Perilaku / Keramahan Petugas', short: 'Perilaku' },
  { key: 'u8', label: '8. Sarana & Prasarana', short: 'Sarana' },
  { key: 'u9', label: '9. Penanganan Pengaduan', short: 'Pengaduan' },
]

const TEXT_TO_SCORE: Record<string, number> = {
  // Skor 1
  'tidak sesuai': 1, 'tidak mudah': 1, 'sangat lambat': 1, 'sangat mahal': 1,
  'sangat tidak kompeten': 1, 'tidak sopan': 1, 'sangat buruk': 1, 'tidak ada': 1,
  'a': 1, '1': 1,
  // Skor 2
  'kurang sesuai': 2, 'kurang mudah': 2, 'lambat': 2, 'cukup mahal': 2,
  'kurang kompeten': 2, 'kurang sopan': 2, 'buruk': 2, 'ada tapi tidak berfungsi': 2,
  'b': 2, '2': 2,
  // Skor 3
  'sesuai': 3, 'mudah': 3, 'cepat': 3, 'murah': 3,
  'kompeten': 3, 'sopan': 3, 'baik': 3, 'berfungsi kurang maksimal': 3,
  'c': 3, '3': 3,
  // Skor 4
  'sangat sesuai': 4, 'sangat mudah': 4, 'sangat cepat': 4, 'gratis': 4,
  'sangat kompeten': 4, 'sangat sopan': 4, 'sangat baik': 4, 'dikelola dengan baik': 4,
  'd': 4, '4': 4,
}

function parseScore(val: any): number {
  if (typeof val === 'number' && !isNaN(val)) return val
  if (!val) return 3
  const str = String(val).trim().toLowerCase()
  if (TEXT_TO_SCORE[str] !== undefined) return TEXT_TO_SCORE[str]
  const parsed = parseFloat(str)
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) return parsed
  return 3
}

// Custom Tooltip for 9 Unsur Chart
const CustomElementTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 z-50">
        <p className="font-extrabold text-emerald-400 text-sm border-b border-slate-800 pb-1">{data.label}</p>
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

// Custom Tooltip for Generic Demographics
const CustomGenericTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const p = payload[0]
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700 text-xs z-50">
        <p className="font-bold text-emerald-400">{label || p.name}</p>
        <p className="text-gray-200 mt-0.5">
          Jumlah: <span className="font-bold text-white">{p.value} Orang</span>
        </p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [adminUser, setAdminUser] = useState<{ username: string; role: string; nama?: string } | null>(null)
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  // Sub-menu Tab Control (Ringkasan, Grafik, Responden, Saran, Semua)
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'grafik' | 'responden' | 'saran' | 'all'>('ringkasan')

  // Chart Controls & SSR Hydration Guard
  const [activeChartView, setActiveChartView] = useState<'bar' | 'radar' | 'progress'>('bar')
  const [isMounted, setIsMounted] = useState(false)

  // Filters & Table Controls
  const [searchQuery, setSearchQuery] = useState('')
  const [filterService, setFilterService] = useState('ALL')
  const [filterGender, setFilterGender] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal Detail Responden
  const [selectedRespondent, setSelectedRespondent] = useState<ResponseRow | null>(null)

  // Export State
  const [isExporting, setIsExporting] = useState(false)
  const printAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchData = async (authToken: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics?token=${encodeURIComponent(authToken)}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.status === 401) {
        throw new Error('Sesi admin telah berakhir atau tidak valid. Silakan login kembali.')
      }

      if (!response.ok) {
        throw new Error('Gagal mengambil data analitik dari server.')
      }

      const resData = await response.json()
      setAnalytics(resData.data)
      setIsAuthenticated(true)
      localStorage.setItem('adminToken', authToken)
    } catch (err: any) {
      console.error('Dashboard fetch error:', err)
      setError(err.message || 'Terjadi kesalahan sistem saat memuat data.')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Masukkan username dan password terlebih dahulu.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Username atau password salah.')
      }

      setToken(data.token)
      setAdminUser(data.user)
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.user))

      await fetchData(data.token)
    } catch (err: any) {
      console.error('Dashboard login error:', err)
      setError(err.message || 'Gagal login. Periksa kembali username dan password Anda.')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsAuthenticated(false)
    setToken('')
    setUsername('')
    setPassword('')
    setAdminUser(null)
    setAnalytics(null)
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken')
    const savedUser = localStorage.getItem('adminUser')
    if (savedUser) {
      try {
        setAdminUser(JSON.parse(savedUser))
      } catch (e) { }
    }
    if (savedToken) {
      setToken(savedToken)
      fetchData(savedToken)
    }
  }, [])

  // List of all responses from analytics or fallback
  const allResponses = useMemo(() => {
    return analytics?.responses || []
  }, [analytics])

  // Filtered responses based on search query, service, gender
  const filteredResponses = useMemo(() => {
    return allResponses.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jenis_layanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.saran.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.usia.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesService =
        filterService === 'ALL' || item.jenis_layanan.toLowerCase() === filterService.toLowerCase()

      const matchesGender =
        filterGender === 'ALL' || item.jenis_kelamin.toLowerCase() === filterGender.toLowerCase()

      return matchesSearch && matchesService && matchesGender
    })
  }, [allResponses, searchQuery, filterService, filterGender])

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage) || 1
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredResponses.slice(start, start + itemsPerPage)
  }, [filteredResponses, currentPage])

  // Unique service types for filter dropdown
  const uniqueServices = useMemo(() => {
    const services = new Set<string>()
    allResponses.forEach((r) => {
      if (r.jenis_layanan && r.jenis_layanan !== '-') {
        services.add(r.jenis_layanan)
      }
    })
    return Array.from(services)
  }, [allResponses])

  // Derived live statistics directly from all responses in Google Sheet
  const derivedStats = useMemo(() => {
    if (!allResponses || allResponses.length === 0) {
      return {
        total: analytics?.totalResponses || 0,
        nrr: analytics?.avgSatisfaction || 0,
        ikmKonversi: analytics?.ikmKonversi || 0,
        mutu: analytics?.mutuPelayanan || 'Belum Ada Data',
        elements: UNSUR_NAMES.map((u) => ({
          ...u,
          score: 0,
          ikm: 0,
          mutu: '-',
        })),
        gender: analytics?.demographics?.gender || {},
        education: analytics?.demographics?.education || {},
        satisfaction: {
          verySatisfied: analytics?.satisfactionDistribution?.verySatisfied || 0,
          satisfied: analytics?.satisfactionDistribution?.satisfied || 0,
          neutral: analytics?.satisfactionDistribution?.neutral || 0,
          dissatisfied: analytics?.satisfactionDistribution?.dissatisfied || 0,
        },
      }
    }

    const total = allResponses.length

    // Calculate sum for each question
    const sums = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 }
    const genderCount: Record<string, number> = {}
    const eduCount: Record<string, number> = {}
    let verySatisfied = 0
    let satisfied = 0
    let neutral = 0
    let dissatisfied = 0

    allResponses.forEach((r) => {
      // 9 Unsur
      const s1 = parseScore(r.q1)
      const s2 = parseScore(r.q2)
      const s3 = parseScore(r.q3)
      const s4 = parseScore(r.q4)
      const s5 = parseScore(r.q5)
      const s6 = parseScore(r.q6)
      const s7 = parseScore(r.q7)
      const s8 = parseScore(r.q8)
      const s9 = parseScore(r.q9)

      sums.q1 += s1
      sums.q2 += s2
      sums.q3 += s3
      sums.q4 += s4
      sums.q5 += s5
      sums.q6 += s6
      sums.q7 += s7
      sums.q8 += s8
      sums.q9 += s9

      const rowAvg = (s1 + s2 + s3 + s4 + s5 + s6 + s7 + s8 + s9) / 9
      if (rowAvg >= 3.53) verySatisfied++
      else if (rowAvg >= 3.06) satisfied++
      else if (rowAvg >= 2.60) neutral++
      else dissatisfied++

      // Demographics
      if (r.jenis_kelamin && r.jenis_kelamin !== '-') {
        genderCount[r.jenis_kelamin] = (genderCount[r.jenis_kelamin] || 0) + 1
      }
      if (r.pendidikan && r.pendidikan !== '-') {
        eduCount[r.pendidikan] = (eduCount[r.pendidikan] || 0) + 1
      }
    })

    const qKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'] as const
    const elements = UNSUR_NAMES.map((u, i) => {
      const qKey = qKeys[i]
      const avg = sums[qKey] / total
      const ikm = avg * 25
      const mutu =
        ikm >= 88.31
          ? 'A (Sangat Baik)'
          : ikm >= 76.61
            ? 'B (Baik)'
            : ikm >= 65.00
              ? 'C (Kurang Baik)'
              : 'D (Tidak Baik)'
      return {
        ...u,
        score: Number(avg.toFixed(2)),
        ikm: Number(ikm.toFixed(2)),
        mutu,
      }
    })

    const nrrSum = elements.reduce((acc, el) => acc + el.score, 0)
    const nrr = Number((nrrSum / 9).toFixed(2))
    const ikmKonversi = Number((nrr * 25).toFixed(2))
    const mutu =
      ikmKonversi >= 88.31
        ? 'A (Sangat Baik)'
        : ikmKonversi >= 76.61
          ? 'B (Baik)'
          : ikmKonversi >= 65.00
            ? 'C (Kurang Baik)'
            : 'D (Tidak Baik)'

    return {
      total,
      nrr,
      ikmKonversi,
      mutu,
      elements,
      gender: Object.keys(genderCount).length > 0 ? genderCount : (analytics?.demographics?.gender || {}),
      education: Object.keys(eduCount).length > 0 ? eduCount : (analytics?.demographics?.education || {}),
      satisfaction: {
        verySatisfied,
        satisfied,
        neutral,
        dissatisfied,
      },
    }
  }, [allResponses, analytics])

  // Elements
  const elementScores = derivedStats.elements

  // Best & Lowest Performing Elements
  const bestElement = useMemo(() => {
    if (elementScores.length === 0) return null
    return [...elementScores].sort((a, b) => b.score - a.score)[0]
  }, [elementScores])

  const lowestElement = useMemo(() => {
    if (elementScores.length === 0) return null
    return [...elementScores].sort((a, b) => a.score - b.score)[0]
  }, [elementScores])

  // Gender Chart Data (Pie)
  const genderChartData = useMemo(() => {
    return Object.entries(derivedStats.gender).map(([name, count]) => ({
      name,
      value: count,
      color: name.toLowerCase().includes('laki') ? '#0284c7' : '#ec4899',
    }))
  }, [derivedStats.gender])

  // Satisfaction Chart Data (Pie)
  const satisfactionChartData = useMemo(() => {
    const s = derivedStats.satisfaction
    return [
      { name: 'Sangat Puas / Baik', value: s.verySatisfied, color: '#10b981' },
      { name: 'Puas / Cukup Baik', value: s.satisfied, color: '#0d9488' },
      { name: 'Netral / Kurang', value: s.neutral, color: '#f59e0b' },
      { name: 'Tidak Puas', value: s.dissatisfied, color: '#ef4444' },
    ].filter((item) => item.value > 0)
  }, [derivedStats.satisfaction])

  // Education Chart Data (Bar)
  const educationChartData = useMemo(() => {
    return Object.entries(derivedStats.education).map(([name, count]) => ({
      name,
      count,
    }))
  }, [derivedStats.education])

  // Service Demand Frequency Data (Bar)
  const serviceChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    allResponses.forEach((r) => {
      if (r.jenis_layanan && r.jenis_layanan !== '-') {
        counts[r.jenis_layanan] = (counts[r.jenis_layanan] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [allResponses])

  // Export to Excel (.xlsx)
  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const XLSX = await import('xlsx')
      const exportData = allResponses.map((r) => ({
        'ID Responden': r.id,
        'Waktu Pengisian': r.waktu,
        'Jenis Kelamin': r.jenis_kelamin,
        Usia: r.usia,
        'Pendidikan Terakhir': r.pendidikan,
        'Jenis Layanan': r.jenis_layanan,
        '1. Persyaratan Pelayanan': r.q1,
        '2. Prosedur Pelayanan': r.q2,
        '3. Waktu Pelayanan': r.q3,
        '4. Biaya / Tarif': r.q4,
        '5. Produk Layanan': r.q5,
        '6. Kompetensi Petugas': r.q6,
        '7. Perilaku Petugas': r.q7,
        '8. Sarana & Prasarana': r.q8,
        '9. Penanganan Pengaduan': r.q9,
        'Saran & Masukan': r.saran,
        'Nilai Rata-rata': r.nilai,
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data SKM Lebakgede')

      // Auto width
      const maxCol = Object.keys(exportData[0] || {}).length
      worksheet['!cols'] = Array(maxCol).fill({ wch: 22 })

      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      XLSX.writeFile(workbook, `Laporan_SKM_Kelurahan_Lebakgede_${todayStr}.xlsx`)
    } catch (err) {
      console.error('Export Excel failed:', err)
      alert('Gagal mengekspor data ke Excel.')
    } finally {
      setIsExporting(false)
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (allResponses.length === 0) {
      alert('Belum ada data responden untuk diekspor.')
      return
    }

    const headers = [
      'ID Responden',
      'Waktu Pengisian',
      'Jenis Kelamin',
      'Usia',
      'Pendidikan Terakhir',
      'Jenis Layanan',
      '1. Persyaratan Pelayanan',
      '2. Prosedur Pelayanan',
      '3. Waktu Pelayanan',
      '4. Biaya / Tarif',
      '5. Produk Layanan',
      '6. Kompetensi Petugas',
      '7. Perilaku Petugas',
      '8. Sarana & Prasarana',
      '9. Penanganan Pengaduan',
      'Saran & Masukan',
      'Nilai Rata-rata',
    ]

    const csvRows = [
      headers.join(','),
      ...allResponses.map((r) =>
        [
          `"${r.id}"`,
          `"${r.waktu}"`,
          `"${r.jenis_kelamin}"`,
          `"${r.usia}"`,
          `"${r.pendidikan}"`,
          `"${r.jenis_layanan}"`,
          `"${r.q1}"`,
          `"${r.q2}"`,
          `"${r.q3}"`,
          `"${r.q4}"`,
          `"${r.q5}"`,
          `"${r.q6}"`,
          `"${r.q7}"`,
          `"${r.q8}"`,
          `"${r.q9}"`,
          `"${(r.saran || '').replace(/"/g, '""')}"`,
          `"${r.nilai}"`,
        ].join(',')
      ),
    ]

    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Data_SKM_Lebakgede_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Export to Word (.doc)
  const handleExportWord = () => {
    const todayFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const rowsHtml = allResponses
      .map(
        (r, i) => `
        <tr>
          <td style="border:1px solid #ccc; padding:6px; text-align:center;">${i + 1}</td>
          <td style="border:1px solid #ccc; padding:6px; font-weight:bold;">${r.id}</td>
          <td style="border:1px solid #ccc; padding:6px;">${r.waktu}</td>
          <td style="border:1px solid #ccc; padding:6px;">${r.jenis_kelamin}</td>
          <td style="border:1px solid #ccc; padding:6px;">${r.usia}</td>
          <td style="border:1px solid #ccc; padding:6px;">${r.pendidikan}</td>
          <td style="border:1px solid #ccc; padding:6px;">${r.jenis_layanan}</td>
          <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${r.nilai}</td>
          <td style="border:1px solid #ccc; padding:6px;">${r.saran || '-'}</td>
        </tr>`
      )
      .join('')

    const elementsSummaryHtml = elementScores
      .map(
        (u) => `
        <tr>
          <td style="border:1px solid #ccc; padding:6px;">${u.label}</td>
          <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${u.score.toFixed(2)}</td>
          <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${u.ikm.toFixed(2)}</td>
          <td style="border:1px solid #ccc; padding:6px; text-align:center;">${u.mutu}</td>
        </tr>`
      )
      .join('')

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Laporan Hasil Survei Kepuasan Masyarakat (SKM)</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000; margin: 40px; }
          .header-kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
          .header-kop h3 { margin: 0; font-size: 14pt; text-transform: uppercase; font-weight: bold; }
          .header-kop h2 { margin: 0; font-size: 16pt; text-transform: uppercase; font-weight: bold; }
          .header-kop p { margin: 2px 0 0; font-size: 10pt; font-style: italic; }
          .title { text-align: center; font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 20px; }
          .subtitle { text-align: center; font-size: 11pt; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; font-size: 10pt; }
          th { background-color: #f2f2f2; border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; }
          td { border: 1px solid #333; padding: 6px; }
          .summary-card { border: 1px solid #333; padding: 12px; margin-bottom: 20px; background-color: #fafafa; }
          .ttd-box { width: 40%; float: right; text-align: center; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="header-kop">
          <h3>Pemerintah Kota Bandung</h3>
          <h2>Kecamatan Coblong &bull; Kelurahan Lebakgede</h2>
          <p>Jl. Lebak Gede No. 04, Coblong, Kota Bandung, Jawa Barat 40132</p>
        </div>

        <div class="title">LAPORAN HASIL SURVEI KEPUASAN MASYARAKAT (SKM)</div>
        <div class="subtitle">Berdasarkan Permenpan RB No. 14 Tahun 2017 &bull; Periode: ${todayFormatted}</div>

        <div class="summary-card">
          <strong>RINGKASAN CAPAIAN MUTU PELAYANAN:</strong>
          <ul>
            <li>Total Responden: <strong>${derivedStats.total} Orang</strong></li>
            <li>Nilai Rata-rata SKM: <strong>${derivedStats.nrr.toFixed(2)} / 4.00</strong></li>
            <li>Indeks Kepuasan Masyarakat (IKM Konversi): <strong>${derivedStats.ikmKonversi.toFixed(2)} (Skala 100)</strong></li>
            <li>Mutu Pelayanan: <strong>${derivedStats.mutu}</strong></li>
            <li>Unsur Pelayanan Terbaik: <strong>${bestElement?.label || '-'} (${bestElement?.score.toFixed(2) || '0.00'})</strong></li>
          </ul>
        </div>

        <h4>A. Rekapitulasi Nilai 9 Unsur Pelayanan (Permenpan RB)</h4>
        <table>
          <thead>
            <tr>
              <th>Unsur Pelayanan Publik</th>
              <th>Nilai Rata-rata (NRR)</th>
              <th>IKM Konversi (x25)</th>
              <th>Mutu Pelayanan</th>
            </tr>
          </thead>
          <tbody>
            ${elementsSummaryHtml}
          </tbody>
        </table>

        <h4>B. Daftar Data Responden Lengkap</h4>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>ID Responden</th>
              <th>Waktu</th>
              <th>L/P</th>
              <th>Usia</th>
              <th>Pendidikan</th>
              <th>Jenis Layanan</th>
              <th>Nilai</th>
              <th>Saran / Masukan</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="clear: both; margin-top: 40px;">
          <div class="ttd-box">
            <p>Bandung, ${todayFormatted}<br>Kepala Kelurahan Lebakgede</p>
            <br><br><br><br>
            <p><strong>( .................................................... )</strong><br>NIP. .........................................</p>
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Laporan_SKM_Lebakgede_${new Date().toISOString().slice(0, 10)}.doc`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Print / PDF Report
  const handlePrint = () => {
    window.print()
  }

  // ==========================================================================
  // RENDER: LOGIN FORM (If not authenticated)
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 transition-all">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img
                src="/logo-kelurahan.jpg"
                alt="Logo Kota Bandung"
                className="h-20 w-auto object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800">Portal Dashboard Statistik</h1>
            <p className="text-sm font-semibold text-emerald-700">Survei Kepuasan Masyarakat (SKM)</p>
            <p className="text-xs text-gray-500 mt-1">Kelurahan Lebakgede &bull; Kecamatan Coblong</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>👤</span>
                <span>Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-gray-800 text-sm transition-all"
                placeholder="Masukkan username..."
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🔒</span>
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-gray-800 text-sm transition-all pr-12"
                  placeholder="Masukkan password..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm p-1"
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/form"
                className="text-xs text-gray-500 hover:text-emerald-700 transition font-medium inline-flex items-center gap-1"
              >
                ← Kembali ke Form Survei
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // RENDER: DASHBOARD UTAMA
  // ==========================================================================
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 antialiased pb-16">
      {/* Printable Report Header (Only visible when printing) */}
      <div className="hidden print:block p-8 border-b-2 border-black mb-6">
        <div className="flex items-center justify-center gap-4 text-center">
          <img src="/logo-kelurahan.jpg" alt="Logo" className="h-16 w-auto object-contain" />
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider">Pemerintah Kota Bandung</h2>
            <h1 className="text-xl font-extrabold uppercase">Kecamatan Coblong &bull; Kelurahan Lebakgede</h1>
            <p className="text-xs italic text-gray-600">Jl. Lebak Gede No. 04, Coblong, Kota Bandung 40132</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <h3 className="text-md font-bold underline">LAPORAN HASIL ANALISIS SURVEI KEPUASAN MASYARAKAT (SKM)</h3>
          <p className="text-xs text-gray-500">Standar Permenpan RB No. 14 Tahun 2017 &bull; Dicetak: {new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="flex-shrink-0 bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <img
                src="/logo-kelurahan.jpg"
                alt="Logo Kota Bandung"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-gray-900 leading-tight truncate">
                <span className="sm:hidden">Statistika SKM</span>
                <span className="hidden sm:inline">Dashboard Statistika SKM</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-tight truncate">
                <span>Kelurahan Lebakgede</span>
                <span className="hidden md:inline">, Kecamatan Coblong, Kota Bandung</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {adminUser && (
              <span className="hidden lg:inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200">
                <span>👤</span>
                <span>{adminUser.username}</span>
              </span>
            )}

            <button
              onClick={() => fetchData(token)}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl transition flex items-center gap-1.5 border border-gray-300"
              title="Segarkan Data"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              <span className="hidden sm:inline">{loading ? 'Memuat...' : 'Segarkan Data'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl transition border border-red-200"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Sub-Menu Tab Bar (Integrated under header) */}
        <div className="border-t border-gray-100 bg-slate-50/90 px-3 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'ringkasan', label: 'Ringkasan IKM', icon: '📊', count: null },
              { id: 'grafik', label: 'Grafik Analisis', icon: '📈', count: '9 Unsur' },
              { id: 'responden', label: 'Data Responden', icon: '📋', count: filteredResponses.length },
              { id: 'saran', label: 'Saran Warga', icon: '💬', count: allResponses.filter((r) => r.saran && r.saran !== '-' && r.saran.trim().length > 1).length },
              { id: 'all', label: 'Semua', icon: '📑', count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-600/20'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      activeTab === tab.id
                        ? 'bg-white/25 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* TAB 1: RINGKASAN IKM */}
        {(activeTab === 'ringkasan' || activeTab === 'all') && (
          <div className="space-y-6 fade-in">
            {/* Banner Quick Actions & Export Bar */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
          <div>
            <span className="bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Indikator Kinerja Pelayanan Publik
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-2 leading-tight">
              Statistika Survei Kepuasan Masyarakat
            </h2>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
              Rekapitulasi data berbasis responden di Kelurahan Lebakgede sesuai Pedoman Penyusunan SKM
            </p>
          </div>

          {/* Export Buttons Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow flex items-center gap-2 border border-emerald-400/40"
            >
              📊 Ekspor Excel (.xlsx)
            </button>
            <button
              onClick={handleExportWord}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow flex items-center gap-2 border border-blue-400/40"
            >
              📄 Laporan Word (.doc)
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow flex items-center gap-2 border border-teal-400/40"
            >
              📑 Unduh CSV
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow flex items-center gap-2 border border-white/20"
            >
              🖨️ Cetak / PDF
            </button>
          </div>
        </div>

        {/* SECTION 1: KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: IKM Konversi */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nilai IKM (Skala 100)</p>
                <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">
                  {derivedStats.ikmKonversi.toFixed(2)}
                </h3>
              </div>
              <span className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
                ⭐
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-600">Mutu Pelayanan:</span>
              <span className="font-extrabold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                {derivedStats.mutu}
              </span>
            </div>
          </div>

          {/* Card 2: NRR Rata-Rata */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nilai Rata-rata (NRR)</p>
                <h3 className="text-3xl font-extrabold text-teal-700 mt-2">
                  {derivedStats.nrr.toFixed(2)}{' '}
                  <span className="text-sm font-semibold text-gray-400">/ 4.00</span>
                </h3>
              </div>
              <span className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
                📈
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-600">Standar:</span>
              <span className="text-gray-500 font-medium">Permenpan RB 14/2017</span>
            </div>
          </div>

          {/* Card 3: Total Responden */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Responden</p>
                <h3 className="text-3xl font-extrabold text-blue-600 mt-2">
                  {derivedStats.total} <span className="text-sm font-semibold text-gray-400">Orang</span>
                </h3>
              </div>
              <span className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
                👥
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-600">Penyelesaian:</span>
              <span className="font-bold text-emerald-600">100% Terverifikasi</span>
            </div>
          </div>

          {/* Card 4: Unsur Kinerja Terbaik */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kinerja Tertinggi</p>
                <h4 className="text-md font-extrabold text-indigo-700 mt-2 truncate max-w-[170px]" title={bestElement?.label}>
                  {bestElement?.short || '-'}
                </h4>
              </div>
              <span className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
                🏆
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-600">Skor Rata-rata:</span>
              <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {bestElement?.score.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </section>

        {/* Quick Action Navigation on Ringkasan */}
        {activeTab === 'ringkasan' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                💡
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Eksplorasi Detail Dashboard</h4>
                <p className="text-xs text-gray-500">Pilih sub-menu untuk melihat visualisasi grafik 9 unsur pelayanan atau telusuri data kuesioner warga.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('grafik')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition"
              >
                📈 Buka Grafik 9 Unsur →
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('responden')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition"
              >
                📋 Buka Tabel Data →
              </button>
            </div>
          </div>
        )}
      </div>
    )}

    {/* TAB 2: GRAFIK ANALISIS & DEMOGRAFI */}
    {(activeTab === 'grafik' || activeTab === 'all') && (
      <div className="space-y-6 fade-in">
        {/* SECTION 2: STATISTIKA & GRAFIK 9 UNSUR PELAYANAN (PERMENPAN RB) */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/80 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Analisis Komprehensif
                </span>
                <span className="text-xs text-gray-500 font-medium">Skala 1.00 &ndash; 4.00</span>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mt-1 flex items-center gap-2">
                📊 Kinerja 9 Unsur Pelayanan Publik (U1 &ndash; U9)
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                Visualisasi Nilai Rata-rata (NRR) per unsur pelayanan untuk identifikasi kelebihan dan aspek perbaikan mutu.
              </p>
            </div>

            {/* View Switcher Tabs */}
            <div className="bg-gray-100 p-1 rounded-2xl flex items-center gap-1 border border-gray-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveChartView('bar')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${activeChartView === 'bar'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <span>📊</span>
                <span>Grafik Batang</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('radar')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${activeChartView === 'radar'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <span>🕸️</span>
                <span>Radar Kinerja</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('progress')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${activeChartView === 'progress'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <span>📋</span>
                <span>Rincian Indikator</span>
              </button>
            </div>
          </div>

          {/* Chart Content Area */}
          {isMounted && (
            <div>
              {activeChartView === 'bar' && (
                <div className="space-y-3">
                  <div className="h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={elementScores}
                        margin={{ top: 20, right: 20, left: -10, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="short"
                          tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis
                          domain={[0, 4]}
                          ticks={[0, 1, 2, 3, 4]}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <RechartsTooltip content={<CustomElementTooltip />} />
                        <ReferenceLine
                          y={3.06}
                          stroke="#059669"
                          strokeDasharray="4 4"
                          label={{
                            value: 'Batas Baik (3.06)',
                            position: 'top',
                            fill: '#059669',
                            fontSize: 10,
                            fontWeight: 'bold',
                          }}
                        />
                        <ReferenceLine
                          y={3.53}
                          stroke="#10b981"
                          strokeDasharray="4 4"
                          label={{
                            value: 'Sangat Baik (3.53)',
                            position: 'top',
                            fill: '#047857',
                            fontSize: 10,
                            fontWeight: 'bold',
                          }}
                        />
                        <Bar
                          dataKey="score"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={48}
                        >
                          {elementScores.map((entry, index) => {
                            let fillColor = '#0d9488'
                            if (entry.score >= 3.53) fillColor = '#10b981'
                            else if (entry.score >= 3.06) fillColor = '#0d9488'
                            else if (entry.score >= 2.60) fillColor = '#f59e0b'
                            else fillColor = '#ef4444'
                            return <Cell key={`cell-${index}`} fill={fillColor} />
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-500 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Sangat Baik (&ge; 3.53)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-teal-600 inline-block"></span> Baik (3.06 - 3.52)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> Cukup (2.60 - 3.05)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span> Kurang (&lt; 2.60)
                    </span>
                  </div>
                </div>
              )}

              {activeChartView === 'radar' && (
                <div className="space-y-3">
                  <div className="h-[380px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius="75%" data={elementScores}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                          dataKey="short"
                          tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 4]}
                          ticks={[1, 2, 3, 4]}
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                        />
                        <Radar
                          name="Nilai Rata-rata (NRR)"
                          dataKey="score"
                          stroke="#059669"
                          fill="#10b981"
                          fillOpacity={0.5}
                        />
                        <RechartsTooltip content={<CustomElementTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-xs text-gray-500">
                    Bagan Radar menunjukkan keseimbangan capaian mutu antar 9 unsur pelayanan publik.
                  </p>
                </div>
              )}

              {activeChartView === 'progress' && (
                <div className="space-y-4">
                  {elementScores.map((elem) => {
                    const percent = (elem.score / 4) * 100
                    const isBest = bestElement?.key === elem.key
                    const isLowest = lowestElement?.key === elem.key

                    return (
                      <div key={elem.key} className="p-3.5 rounded-2xl hover:bg-slate-50 transition border border-gray-100">
                        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                          <span className="text-gray-800 flex items-center gap-2">
                            <span className="font-bold text-gray-900">{elem.label}</span>
                            {isBest && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                                🏆 Tertinggi
                              </span>
                            )}
                            {isLowest && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">
                                ⚠️ Perlu Peningkatan
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-normal">IKM: {elem.ikm.toFixed(2)}</span>
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                              {elem.score.toFixed(2)} / 4.00
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${elem.score >= 3.53
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : elem.score >= 3.06
                                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600'
                                  : elem.score >= 2.60
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                    : 'bg-gradient-to-r from-rose-500 to-red-600'
                              }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* SECTION 3: GRAFIK DEMOGRAFI & DISTRIBUSI KEPUASAN (3 KOLOM VISUAL RECHARTS) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Donut Chart Proporsi Jenis Kelamin */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-extrabold text-gray-900 flex items-center gap-2">
                  👤 Proporsi Jenis Kelamin
                </h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                  Donut Chart
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Perbandingan responden laki-laki dan perempuan.</p>
            </div>

            {isMounted && genderChartData.length > 0 ? (
              <div>
                <div className="h-56 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {genderChartData.map((entry, idx) => (
                          <Cell key={`gender-cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomGenericTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-gray-800">{derivedStats.total}</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Responden</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  {genderChartData.map((g) => {
                    const pct = Math.round((g.value / (derivedStats.total || 1)) * 100)
                    return (
                      <div key={g.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }}></span>
                        <div className="flex-1">
                          <p className="text-gray-700 font-semibold truncate">{g.name}</p>
                          <p className="text-[11px] text-gray-400 font-bold">{g.value} ({pct}%)</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-10">Belum ada data jenis kelamin.</p>
            )}
          </div>

          {/* Card 2: Bar Chart Tingkat Pendidikan */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-extrabold text-gray-900 flex items-center gap-2">
                  🎓 Tingkat Pendidikan
                </h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                  Bar Chart
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Sebaran jenjang pendidikan terakhir warga.</p>
            </div>

            {isMounted && educationChartData.length > 0 ? (
              <div className="space-y-2">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={educationChartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <RechartsTooltip content={<CustomGenericTooltip />} />
                      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 text-[11px]">
                  {educationChartData.map((e) => (
                    <span key={e.name} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100 font-semibold">
                      {e.name}: <strong>{e.count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-10">Belum ada data pendidikan.</p>
            )}
          </div>

          {/* Card 3: Donut Chart Tingkat Kepuasan Global */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-extrabold text-gray-900 flex items-center gap-2">
                  😊 Distribusi Kepuasan Warga
                </h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                  Donut Chart
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Persentase warga menurut tingkat kepuasan.</p>
            </div>

            {isMounted && satisfactionChartData.length > 0 ? (
              <div>
                <div className="h-56 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={satisfactionChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {satisfactionChartData.map((entry, idx) => (
                          <Cell key={`sat-cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomGenericTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-emerald-600">{derivedStats.mutu.split(' ')[0]}</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Mutu Utama</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  {satisfactionChartData.map((s) => {
                    const pct = Math.round((s.value / (derivedStats.total || 1)) * 100)
                    return (
                      <div key={s.name} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></span>
                        <div className="flex-1 truncate">
                          <p className="text-gray-700 font-semibold truncate text-[11px]">{s.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{s.value} ({pct}%)</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-10">Belum ada data kepuasan.</p>
            )}
          </div>
        </section>

        {/* SECTION 4 (NEW): GRAFIK FREKUENSI KEBUTUHAN LAYANAN PUBLIK */}
        {serviceChartData.length > 0 && isMounted && (
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/80">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-2 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  🏛️ Frekuensi Akses Layanan Publik Kelurahan
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distribusi jenis layanan yang paling sering diakses dan dinilai oleh masyarakat.
                </p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-xl border border-emerald-200">
                {serviceChartData.length} Jenis Layanan Terdata
              </span>
            </div>

            {/* Clean, Responsive Recharts BarChart with Clear Grid Lines */}
            <div
              className="w-full"
              style={{ height: `${Math.max(160, serviceChartData.length * 60 + 50)}px` }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 65, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.8} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => (dataMax <= 2 ? dataMax + 1 : 'auto')]}
                    axisLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
                    tickLine={{ stroke: '#94a3b8' }}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    axisLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
                    tickLine={{ stroke: '#94a3b8' }}
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  />
                  <RechartsTooltip content={<CustomGenericTooltip />} />
                  <Bar
                    dataKey="count"
                    fill="#0d9488"
                    radius={[0, 8, 8, 0]}
                    maxBarSize={30}
                  >
                    {serviceChartData.map((_, idx) => (
                      <Cell
                        key={`service-cell-${idx}`}
                        fill={idx === 0 ? '#059669' : idx === 1 ? '#0d9488' : idx === 2 ? '#0284c7' : '#6366f1'}
                      />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="right"
                      formatter={(val: any) => `${val} Warga`}
                      style={{ fontSize: 11, fontWeight: 700, fill: '#059669' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Summary Chips */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 text-xs">
              {serviceChartData.map((s) => {
                const pct = Math.round((s.count / (derivedStats.total || 1)) * 100)
                return (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200/80 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold">{s.name}:</span>
                    <strong className="text-emerald-900">{s.count} ({pct}%)</strong>
                  </span>
                )
              })}
            </div>
          </section>
        )}
      </div>
    )}

    {/* TAB 3: DATA RESPONDEN */}
    {(activeTab === 'responden' || activeTab === 'all') && (
      <div className="space-y-6 fade-in">
        {/* SECTION 5: TABEL DATA RESPONDEN LENGKAP */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                📋 Database Responden ({filteredResponses.length} Data)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Daftar kuesioner yang telah masuk ke Google Spreadsheet. Klik baris untuk melihat detail penilaian.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Cari ID, layanan, saran..."
                className="px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition flex-1 md:w-60"
              />

              <select
                value={filterService}
                onChange={(e) => {
                  setFilterService(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition text-gray-700"
              >
                <option value="ALL">Semua Layanan</option>
                {uniqueServices.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>

              <select
                value={filterGender}
                onChange={(e) => {
                  setFilterGender(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition text-gray-700"
              >
                <option value="ALL">Semua Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-600 text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 text-center">No</th>
                  <th className="py-3 px-4">ID Responden</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-3 text-center">Gender</th>
                  <th className="py-3 px-3 text-center">Usia</th>
                  <th className="py-3 px-4">Pendidikan</th>
                  <th className="py-3 px-4">Jenis Layanan</th>
                  <th className="py-3 px-3 text-center">Nilai Rata</th>
                  <th className="py-3 px-4">Saran &amp; Masukan</th>
                  <th className="py-3 px-3 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium text-gray-700">
                {paginatedResponses.length > 0 ? (
                  paginatedResponses.map((r, i) => (
                    <tr
                      key={r.id || i}
                      onClick={() => setSelectedRespondent(r)}
                      className="hover:bg-emerald-50/60 cursor-pointer transition"
                    >
                      <td className="py-3 px-3 text-center text-gray-400 font-mono font-bold">
                        {(currentPage - 1) * itemsPerPage + i + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {r.id}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{r.waktu}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.jenis_kelamin === 'Laki-laki'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-pink-100 text-pink-800'
                            }`}
                        >
                          {r.jenis_kelamin}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">{r.usia}</td>
                      <td className="py-3 px-4">{r.pendidikan}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{r.jenis_layanan}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[11px]">
                          {r.nilai}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-gray-600" title={r.saran}>
                        {r.saran || '-'}
                      </td>
                      <td className="py-3 px-3 text-center print:hidden">
                        <button
                          type="button"
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-emerald-200 transition"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-400 italic">
                      Tidak ada data responden yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-2 print:hidden">
              <span className="text-xs text-gray-500">
                Menampilkan halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    )}

    {/* TAB 4: SARAN & MASUKAN WARGA */}
    {(activeTab === 'saran' || activeTab === 'all') && (
      <div className="space-y-6 fade-in">
        {/* SECTION 5: KUMPULAN SARAN & MASUKAN WARGA */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/80">
          <h3 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            💬 Aspirasi, Kritik &amp; Saran Masyarakat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allResponses.filter((r) => r.saran && r.saran !== '-' && r.saran.trim().length > 1).length > 0 ? (
              allResponses
                .filter((r) => r.saran && r.saran !== '-' && r.saran.trim().length > 1)
                .slice(0, 6)
                .map((r, i) => (
                  <div
                    key={r.id || i}
                    className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-100 flex flex-col justify-between"
                  >
                    <p className="text-xs text-gray-700 italic leading-relaxed font-medium">
                      &ldquo;{r.saran}&rdquo;
                    </p>
                    <div className="mt-3 pt-3 border-t border-emerald-200/50 flex justify-between items-center text-[10px] text-gray-500 font-semibold">
                      <span className="font-mono text-emerald-800 font-bold">{r.id}</span>
                      <span>{r.waktu}</span>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-xs text-gray-400 italic col-span-3">Belum ada saran atau masukan tertulis.</p>
            )}
          </div>
        </section>
      </div>
    )}
      </main>

      {/* MODAL: DETAIL RESPONDEN LENGKAP */}
      {selectedRespondent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg font-mono">
                  {selectedRespondent.id}
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">
                  Detail Kuesioner Responden
                </h3>
                <p className="text-xs text-gray-500">{selectedRespondent.waktu}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRespondent(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl mb-6 text-xs border border-gray-100">
              <div>
                <p className="text-gray-400 font-bold">Jenis Kelamin</p>
                <p className="font-bold text-gray-800 mt-0.5">{selectedRespondent.jenis_kelamin}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold">Usia</p>
                <p className="font-bold text-gray-800 mt-0.5">{selectedRespondent.usia}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold">Pendidikan</p>
                <p className="font-bold text-gray-800 mt-0.5">{selectedRespondent.pendidikan}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold">Nilai Akhir</p>
                <p className="font-extrabold text-emerald-700 mt-0.5">{selectedRespondent.nilai}</p>
              </div>
            </div>

            {/* Answers to 9 Elements */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Jawaban 9 Unsur Pelayanan Publik
            </h4>
            <div className="space-y-2.5 text-xs mb-6">
              {[
                { label: 'U1 - Persyaratan Pelayanan', val: selectedRespondent.q1 },
                { label: 'U2 - Kemudahan Prosedur', val: selectedRespondent.q2 },
                { label: 'U3 - Kecepatan Waktu Pelayanan', val: selectedRespondent.q3 },
                { label: 'U4 - Kewajaran Biaya / Tarif', val: selectedRespondent.q4 },
                { label: 'U5 - Kesesuaian Produk Pelayanan', val: selectedRespondent.q5 },
                { label: 'U6 - Kompetensi Petugas', val: selectedRespondent.q6 },
                { label: 'U7 - Perilaku / Keramahan Petugas', val: selectedRespondent.q7 },
                { label: 'U8 - Kualitas Sarana & Prasarana', val: selectedRespondent.q8 },
                { label: 'U9 - Penanganan Pengaduan', val: selectedRespondent.q9 },
              ].map((q, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50/50 transition border border-gray-200/60"
                >
                  <span className="font-medium text-gray-700">{q.label}</span>
                  <span className="font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    {q.val || '-'}
                  </span>
                </div>
              ))}
            </div>

            {/* Saran */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 mb-6">
              <p className="text-xs font-bold text-emerald-900 mb-1">Saran &amp; Masukan Responden:</p>
              <p className="text-xs text-gray-700 italic">
                &ldquo;{selectedRespondent.saran || 'Tidak ada saran yang diberikan.'}&rdquo;
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRespondent(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
