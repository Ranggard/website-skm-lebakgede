'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  calculateIKM,
  letterToScore,
} from '@/src/lib/ikm-calculator'
import { ResponseRow, AnalyticsData } from '@/src/lib/types/dashboard'
import {
  DashboardHeader,
  DashboardSidebar,
  TabId,
  LoginModal,
  RespondentDetailModal,
  PublicDashboard,
  TabRingkasan,
  TabGrafik,
  TabDemografi,
  TabResponden,
  TabSaran,
  TabExport,
} from '@/src/features/dashboard/components'

const UNSUR_NAMES = [
  { key: 'u1', label: '1. Persyaratan Pelayanan', short: 'Persyaratan' },
  { key: 'u2', label: '2. Prosedur Pelayanan', short: 'Prosedur' },
  { key: 'u3', label: '3. Waktu Pelayanan', short: 'Waktu' },
  { key: 'u4', label: '4. Biaya / Tarif', short: 'Biaya / Tarif' },
  { key: 'u5', label: '5. Produk Spesifikasi Layanan', short: 'Produk Layanan' },
  { key: 'u6', label: '6. Kompetensi Petugas', short: 'Kompetensi' },
  { key: 'u7', label: '7. Perilaku / Keramahan Petugas', short: 'Perilaku Petugas' },
  { key: 'u8', label: '8. Kualitas Sarana & Prasarana', short: 'Sarana & Prasarana' },
  { key: 'u9', label: '9. Penanganan Pengaduan', short: 'Pengaduan' },
]

const TEXT_TO_SCORE: Record<string, number> = {
  'tidak sesuai': 1, 'tidak mudah': 1, 'sangat lambat': 1, 'sangat mahal': 1,
  'tidak kompeten': 1, 'sangat tidak kompeten': 1, 'tidak sopan': 1, 'sangat buruk': 1, 'tidak ada': 1,
  'a': 1, '1': 1,
  'kurang sesuai': 2, 'kurang mudah': 2, 'lambat': 2, 'kurang cepat': 2, 'cukup mahal': 2,
  'kurang kompeten': 2, 'kurang sopan': 2, 'buruk': 2, 'cukup': 2, 'ada tapi tidak berfungsi': 2, 'ada tetapi tidak berfungsi': 2,
  'b': 2, '2': 2,
  'sesuai': 3, 'mudah': 3, 'cepat': 3, 'murah': 3,
  'kompeten': 3, 'sopan': 3, 'sopan dan ramah': 3, 'baik': 3, 'berfungsi kurang maksimal': 3,
  'c': 3, '3': 3,
  'sangat sesuai': 4, 'sangat mudah': 4, 'sangat cepat': 4, 'gratis': 4,
  'sangat kompeten': 4, 'sangat sopan': 4, 'sangat sopan dan ramah': 4, 'sangat baik': 4, 'dikelola dengan baik': 4,
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

export default function DashboardPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [adminUser, setAdminUser] = useState<{ username: string; role: string; nama?: string } | null>(null)
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  // Sidebar visibility state: collapsible via garis 3 (hamburger menu)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Sub-menu Tabs (controlled via Sidebar)
  const [activeTab, setActiveTab] = useState<TabId>('ringkasan')

  // Chart View Control & Hydration Guard
  const [activeChartView, setActiveChartView] = useState<'bar' | 'radar'>('bar')
  const [isMounted, setIsMounted] = useState(false)

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterService, setFilterService] = useState('ALL')
  const [filterGender, setFilterGender] = useState('ALL')
  const [filterAgeGroup, setFilterAgeGroup] = useState('ALL')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal Detail Responden
  const [selectedRespondent, setSelectedRespondent] = useState<ResponseRow | null>(null)

  // EXPORT SUB-MENU STATE & PREVIEW CONTROLS
  const [exportPreset, setExportPreset] = useState<'tw1' | 'tw2' | 'tw3' | 'tw4' | '1m' | '6m' | '1y' | 'all' | 'custom'>('all')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')
  const [excelPreviewSheet, setExcelPreviewSheet] = useState<'blanko' | 'triwulan' | 'baku_mutu' | 'mutu' | 'rekap'>('triwulan')
  const [exportStartDate, setExportStartDate] = useState<string>('')
  const [exportEndDate, setExportEndDate] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Auto collapse on small screens
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [])

  // Fetch live data on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken') || ''
    const savedUser = localStorage.getItem('adminUser')
    if (savedUser) {
      try {
        setAdminUser(JSON.parse(savedUser))
      } catch (e) { }
    }
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
    }
    fetchData(savedToken)
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
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        setIsAuthenticated(false)
        setToken('')
        setAdminUser(null)
        return
      }

      if (!response.ok) {
        throw new Error('Gagal mengambil data analitik dari server.')
      }

      const resData = await response.json()
      if (resData.data) {
        setAnalytics(resData.data)
      }
      if (authToken) {
        setIsAuthenticated(true)
        localStorage.setItem('adminToken', authToken)
      }
    } catch (err: any) {
      console.warn('Dashboard fetch error:', err)
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
      setIsAuthenticated(true)
      setIsLoginModalOpen(false)
      setError(null)

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
    } catch (e) { }
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsAuthenticated(false)
    setToken('')
    setUsername('')
    setPassword('')
    setAdminUser(null)
    if (activeTab === 'responden' || activeTab === 'saran' || activeTab === 'export') {
      setActiveTab('ringkasan')
    }
  }

  // All responses from state
  const allResponses = useMemo(() => {
    return analytics?.responses || []
  }, [analytics])

  // Reset all filters in Responden Tab
  const handleResetRespondentFilters = () => {
    setSearchQuery('')
    setFilterService('ALL')
    setFilterGender('ALL')
    setFilterAgeGroup('ALL')
    setFilterStartDate('')
    setFilterEndDate('')
    setCurrentPage(1)
  }

  // Filtered responses for Respondent Tab
  const filteredResponses = useMemo(() => {
    return allResponses.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.jenis_layanan.toLowerCase().includes(q) ||
        item.saran.toLowerCase().includes(q) ||
        item.usia.toLowerCase().includes(q)

      const matchesService =
        filterService === 'ALL' || item.jenis_layanan.toLowerCase() === filterService.toLowerCase()

      const matchesGender =
        filterGender === 'ALL' || item.jenis_kelamin.toLowerCase() === filterGender.toLowerCase()

      // Filter Rentang Usia
      let matchesAge = true
      const numAge = parseInt(item.usia, 10)
      if (!isNaN(numAge)) {
        if (filterAgeGroup === 'under_20') matchesAge = numAge < 20
        else if (filterAgeGroup === '20_30') matchesAge = numAge >= 20 && numAge <= 30
        else if (filterAgeGroup === '31_45') matchesAge = numAge >= 31 && numAge <= 45
        else if (filterAgeGroup === '46_60') matchesAge = numAge >= 46 && numAge <= 60
        else if (filterAgeGroup === 'above_60') matchesAge = numAge > 60
      }

      // Filter Rentang Tanggal
      let matchesDate = true
      if (filterStartDate || filterEndDate) {
        const itemDateStr = item.timestamp || item.waktu
        const itemDate = new Date(itemDateStr)
        if (!isNaN(itemDate.getTime())) {
          if (filterStartDate) {
            const start = new Date(filterStartDate)
            start.setHours(0, 0, 0, 0)
            if (itemDate < start) matchesDate = false
          }
          if (filterEndDate) {
            const end = new Date(filterEndDate)
            end.setHours(23, 59, 59, 999)
            if (itemDate > end) matchesDate = false
          }
        }
      }

      return matchesSearch && matchesService && matchesGender && matchesAge && matchesDate
    })
  }, [allResponses, searchQuery, filterService, filterGender, filterAgeGroup, filterStartDate, filterEndDate])

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage) || 1
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredResponses.slice(start, start + itemsPerPage)
  }, [filteredResponses, currentPage])

  // Unique services
  const uniqueServices = useMemo(() => {
    const services = new Set<string>()
    allResponses.forEach((r) => {
      if (r.jenis_layanan && r.jenis_layanan !== '-') {
        services.add(r.jenis_layanan)
      }
    })
    return Array.from(services)
  }, [allResponses])

  // Derived statistics for overview
  const derivedStats = useMemo(() => {
    const total = allResponses.length
    const sums = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 }
    const genderCount: Record<string, number> = {}
    const eduCount: Record<string, number> = {}

    allResponses.forEach((r: any) => {
      sums.q1 += parseScore(r.u1 || r.q1)
      sums.q2 += parseScore(r.u2 || r.q2)
      sums.q3 += parseScore(r.u3 || r.q3)
      sums.q4 += parseScore(r.u4 || r.q4)
      sums.q5 += parseScore(r.u5 || r.q5)
      sums.q6 += parseScore(r.u6 || r.q6)
      sums.q7 += parseScore(r.u7 || r.q7)
      sums.q8 += parseScore(r.u8 || r.q8)
      sums.q9 += parseScore(r.u9 || r.q9)

      if (r.jenis_kelamin && r.jenis_kelamin !== '-') {
        genderCount[r.jenis_kelamin] = (genderCount[r.jenis_kelamin] || 0) + 1
      }
      if (r.pendidikan && r.pendidikan !== '-') {
        eduCount[r.pendidikan] = (eduCount[r.pendidikan] || 0) + 1
      }
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
      gender: genderCount,
      education: eduCount,
    }
  }, [allResponses])

  // EXPORT FILTERED RESPONSES & LIVE PREVIEW
  const exportFilteredResponses = useMemo(() => {
    let start: Date | null = null
    let end: Date | null = null

    const currentYear = new Date().getFullYear()

    if (exportPreset === 'tw1') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0) // 1 Jan
      end = new Date(currentYear, 2, 31, 23, 59, 59, 999) // 31 Mar
    } else if (exportPreset === 'tw2') {
      start = new Date(currentYear, 3, 1, 0, 0, 0, 0) // 1 Apr
      end = new Date(currentYear, 5, 30, 23, 59, 59, 999) // 30 Jun
    } else if (exportPreset === 'tw3') {
      start = new Date(currentYear, 6, 1, 0, 0, 0, 0) // 1 Jul
      end = new Date(currentYear, 8, 30, 23, 59, 59, 999) // 30 Sep
    } else if (exportPreset === 'tw4') {
      start = new Date(currentYear, 9, 1, 0, 0, 0, 0) // 1 Okt
      end = new Date(currentYear, 11, 31, 23, 59, 59, 999) // 31 Des
    } else if (exportPreset === '1m') {
      const now = new Date()
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else if (exportPreset === '6m') {
      const now = new Date()
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else if (exportPreset === '1y') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0)
      end = new Date(currentYear, 11, 31, 23, 59, 59, 999)
    } else if (exportPreset === 'all') {
      start = null
      end = null
    } else if (exportPreset === 'custom') {
      if (exportStartDate) start = new Date(exportStartDate)
      if (exportEndDate) {
        end = new Date(exportEndDate)
        end.setHours(23, 59, 59, 999)
      }
    }

    const responses = analytics?.responses || []
    if (!start && !end) return responses

    return responses.filter((r) => {
      const dateVal = r.timestamp || (r as any).created_at || r.waktu
      const d = dateVal ? new Date(dateVal) : null
      if (!d || isNaN(d.getTime())) return true
      if (start && d < start) return false
      if (end && d > end) return false
      return true
    })
  }, [analytics, exportPreset, exportStartDate, exportEndDate])

  // Calculation for Export Preview
  const exportPreviewCalc = useMemo(() => {
    const records = exportFilteredResponses.map((r) => ({
      id: r.id,
      u1: parseScore(r.q1),
      u2: parseScore(r.q2),
      u3: parseScore(r.q3),
      u4: parseScore(r.q4),
      u5: parseScore(r.q5),
      u6: parseScore(r.q6),
      u7: parseScore(r.q7),
      u8: parseScore(r.q8),
      u9: parseScore(r.q9),
      saran: r.saran,
    }))
    const calc = calculateIKM(records)
    return {
      count: calc.totalResponden,
      ikmSkala4: calc.ikmSkala4,
      ikmKonversi: calc.ikmKonversi,
      mutuPelayanan: calc.mutuPelayanan,
      kinerjaUnit: calc.kinerjaUnit,
      unsurAverages: calc.unsurStats,
    }
  }, [exportFilteredResponses])

  // Handler for Exporting Excel with specific filtered range
  const handleExportExcelWithFilter = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      params.set('format', 'excel')
      if (exportPreset !== 'all') {
        if (exportStartDate) params.set('start_date', new Date(exportStartDate).toISOString())
        if (exportEndDate) {
          const end = new Date(exportEndDate)
          end.setHours(23, 59, 59, 999)
          params.set('end_date', end.toISOString())
        }
      }

      const authToken = token || localStorage.getItem('adminToken') || 'admin-token-skm-questionnaire-default-12345678'
      params.set('token', authToken)
      const response = await fetch(`/api/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Gagal mengunduh file Excel dari server.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Laporan_IKM_Lebakgede_${exportPreset}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export Excel failed:', err)
      alert('Gagal mengekspor data ke Excel. Silakan coba lagi.')
    } finally {
      setIsExporting(false)
    }
  }

  // Handler for Exporting CSV with specific filtered range
  const handleExportCSVWithFilter = () => {
    if (exportFilteredResponses.length === 0) {
      alert('Tidak ada data dalam rentang waktu yang dipilih.')
      return
    }

    const headers = [
      'No', 'Nomor Responden', 'ID Responden', 'Waktu', 'Jenis Kelamin', 'Usia',
      'Pendidikan', 'Jenis Layanan', 'U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9',
      'Rata-rata', 'Mutu', 'Saran'
    ]

    const csvRows = [
      headers.join(','),
      ...exportFilteredResponses.map((r, idx) => [
        idx + 1,
        r.no,
        `"${r.id}"`,
        `"${r.waktu}"`,
        `"${r.jenis_kelamin}"`,
        `"${r.usia}"`,
        `"${r.pendidikan}"`,
        `"${r.jenis_layanan}"`,
        r.u1, r.u2, r.u3, r.u4, r.u5, r.u6, r.u7, r.u8, r.u9,
        r.skor_rata,
        `"${r.nilai}"`,
        `"${(r.saran || '').replace(/"/g, '""')}"`
      ].join(','))
    ]

    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Data_SKM_Lebakgede_${exportPreset}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handler for Exporting Official Letter as Microsoft Word (.doc)
  const handleExportWord = () => {
    if (exportFilteredResponses.length === 0) {
      alert('Tidak ada data dalam rentang waktu yang dipilih.')
      return
    }

    const periodeText =
      exportPreset === 'tw1'
        ? 'Triwulan I (1 Januari s/d 31 Maret)'
        : exportPreset === 'tw2'
          ? 'Triwulan II (1 April s/d 30 Juni)'
          : exportPreset === 'tw3'
            ? 'Triwulan III (1 Juli s/d 30 September)'
            : exportPreset === 'tw4'
              ? 'Triwulan IV (1 Oktober s/d 31 Desember)'
              : exportPreset === '1m'
                ? '1 Bulan Berjalan'
                : exportPreset === '6m'
                  ? '6 Bulan (Semester)'
                  : exportPreset === '1y'
                    ? '1 Tahun Penuh'
                    : exportPreset === 'all'
                      ? 'Seluruh Data Responden'
                      : `${exportStartDate} s/d ${exportEndDate}`

    const tableRows = exportPreviewCalc.unsurAverages
      .map(
        (u, idx) => `
        <tr>
          <td style="border: 1px solid #555; padding: 6px; text-align: center; font-size: 10pt;">${idx + 1}</td>
          <td style="border: 1px solid #555; padding: 6px; font-size: 10pt;">${u.label}</td>
          <td style="border: 1px solid #555; padding: 6px; text-align: center; font-size: 10pt; font-weight: bold;">${u.nrr.toFixed(2)}</td>
          <td style="border: 1px solid #555; padding: 6px; text-align: center; font-size: 10pt; font-weight: bold; color: #047857;">${u.ikm.toFixed(2)}</td>
          <td style="border: 1px solid #555; padding: 6px; text-align: center; font-size: 10pt; font-weight: bold;">${u.mutu}</td>
        </tr>`
      )
      .join('')

    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Surat Laporan SKM Kelurahan Lebak Gede</title>
        <style>
          @page { size: 21cm 29.7cm; margin: 2cm 2cm 2cm 2cm; }
          body { font-family: 'Bookman Old Style', 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; color: #000; }
          .kop-table { width: 100%; border-collapse: collapse; border: none; margin-bottom: 2px; }
          .kop-table td { border: none; padding: 0; }
          .kop-text { text-align: center; }
          .kop-h1 { font-size: 13pt; font-weight: bold; margin: 0; }
          .kop-h2 { font-size: 14pt; font-weight: bold; margin: 0; }
          .kop-h3 { font-size: 16pt; font-weight: bold; margin: 0; letter-spacing: 0.5px; }
          .kop-p { font-size: 8.5pt; margin: 2px 0 0 0; }
          .line-thick { border-bottom: 3.5px solid #000; margin-top: 4px; }
          .line-thin { border-bottom: 1px solid #000; margin-top: 2px; margin-bottom: 16px; }
          .date-right { text-align: right; margin-bottom: 14px; font-size: 11pt; }
          .meta-table { width: 100%; border-collapse: collapse; border: none; margin-bottom: 16px; font-size: 11pt; }
          .meta-table td { border: none; padding: 2px 0; }
          .yth-block { margin-bottom: 18px; font-size: 11pt; line-height: 1.4; }
          .paragraf { text-align: justify; text-justify: inter-word; text-indent: 75px; margin-bottom: 12px; font-size: 11pt; line-height: 1.45; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10.5pt; }
          .data-table th { background-color: #dbe2ea; border: 1px solid #555; padding: 6px; text-align: center; font-weight: bold; }
          .data-table td { border: 1px solid #555; }
          .tte-container { width: 100%; margin-top: 20px; border-collapse: collapse; border: none; }
          .tte-container td { border: none; }
          .tte-box { border: 1.5px solid #000; width: 330px; border-collapse: collapse; background-color: #fff; }
          .tte-box td { padding: 6px; border: none; font-family: Arial, sans-serif; }
          .bsre-footer { border-top: 1px solid #aaa; margin-top: 30px; padding-top: 8px; font-family: Arial, sans-serif; font-size: 8pt; font-style: italic; color: #333; text-align: center; }
        </style>
      </head>
      <body>
        <!-- Kop Surat Resmi Kelurahan Lebak Gede -->
        <table class="kop-table">
          <tr>
            <td style="width: 80px; vertical-align: middle;">
              <img src="http://localhost:3000/logo-kelurahan.jpg" width="70" height="85" alt="Logo Kota Bandung" />
            </td>
            <td class="kop-text" style="vertical-align: middle;">
              <div class="kop-h1">PEMERINTAH KOTA BANDUNG</div>
              <div class="kop-h2">KECAMATAN COBLONG</div>
              <div class="kop-h3">KELURAHAN LEBAK GEDE</div>
              <div class="kop-p">Jl. Tubagus Ismail Bawah No.5, Lebakgede, Coblong, Kota Bandung, Jawa Barat 40132 Telp. 0222512563, Fax 0222512563</div>
              <div class="kop-p">e – mail : kelurahanlebakgede2016@gmail.com</div>
            </td>
          </tr>
        </table>
        <div class="line-thick"></div>
        <div class="line-thin"></div>

        <!-- Tanggal Surat -->
        <div class="date-right">
          Bandung, 07 Oktober 2026
        </div>

        <!-- Nomor & Identitas Surat -->
        <table class="meta-table">
          <tr>
            <td style="width: 80px;">Nomor</td>
            <td style="width: 15px;">:</td>
            <td>B/TU/148-LG/X/2026</td>
          </tr>
          <tr>
            <td>Sifat</td>
            <td>:</td>
            <td>Biasa</td>
          </tr>
          <tr>
            <td>Lampiran</td>
            <td>:</td>
            <td>1 (satu) Berkas</td>
          </tr>
          <tr>
            <td style="vertical-align: top;">Hal</td>
            <td style="vertical-align: top;">:</td>
            <td style="font-weight: bold;">Laporan Pengukuran Indeks Kepuasan Masyarakat (IKM)</td>
          </tr>
        </table>

        <!-- Tujuan Surat Yth. -->
        <div class="yth-block">
          <div>Yth. 1. Camat Coblong Kota Bandung</div>
          <div style="padding-left: 30px;">2. Badan Kesatuan Bangsa dan Politik Kota Bandung</div>
          <div style="margin-top: 6px;">di</div>
          <div style="font-weight: bold;">Bandung</div>
        </div>

        <!-- Paragraf Pembuka -->
        <p class="paragraf">
          Menindaklanjuti agenda evaluasi dan pengukuran Indeks Kepuasan Masyarakat (IKM) terhadap mutu pelayanan publik di lingkungan Kelurahan Lebak Gede Kecamatan Coblong Kota Bandung pada periode <strong>${periodeText}</strong>, bersama ini disampaikan laporan hasil evaluasi kepuasan masyarakat atas pelayanan administrasi kependudukan dan perizinan sebagai berikut :
        </p>

        <!-- Tabel 9 Unsur -->
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40px;">NO</th>
              <th style="text-align: left;">UNSUR PELAYANAN</th>
              <th style="width: 90px;">NILAI NRR</th>
              <th style="width: 110px;">NILAI KONVERSI</th>
              <th style="width: 70px;">MUTU</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            <tr style="background-color: #f0f4f8; font-weight: bold;">
              <td colspan="2" style="border: 1px solid #555; padding: 6px; text-align: center;">
                NILAI IKM KONVERSI (MUTU PELAYANAN: ${exportPreviewCalc.mutuPelayanan} - ${exportPreviewCalc.kinerjaUnit})
              </td>
              <td style="border: 1px solid #555; padding: 6px; text-align: center;">${exportPreviewCalc.ikmSkala4.toFixed(4)}</td>
              <td style="border: 1px solid #555; padding: 6px; text-align: center; color: #065f46;">${exportPreviewCalc.ikmKonversi.toFixed(2)}</td>
              <td style="border: 1px solid #555; padding: 6px; text-align: center; color: #065f46;">${exportPreviewCalc.mutuPelayanan}</td>
            </tr>
          </tbody>
        </table>

        <!-- Paragraf Kelanjutan -->
        <p class="paragraf">
          Maka Kelurahan Lebak Gede Kecamatan Coblong Kota Bandung, menyampaikan hasil pengukuran tersebut dengan capaian IKM sebesar <strong>${exportPreviewCalc.ikmKonversi.toFixed(2)} (Kategori Mutu ${exportPreviewCalc.mutuPelayanan} - ${exportPreviewCalc.kinerjaUnit})</strong> berdasarkan partisipasi ${exportPreviewCalc.count} orang responden terdata sebagai wujud akuntabilitas kinerja pelayanan.
        </p>

        <!-- Paragraf Penutup -->
        <p class="paragraf">
          Demikian surat ini kami sampaikan atas perhatiannya diucapkan terima kasih.
        </p>
      </body>
      </html>
    `

    const blob = new Blob(['\uFEFF' + wordContent], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Surat_Laporan_IKM_Lebakgede_${exportPreset}_${new Date().toISOString().slice(0, 10)}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // TAMPILKAN DASHBOARD UMUM (JIKA BUKAN PETUGAS / BELUM LOGIN)
  if (!isAuthenticated) {
    return (
      <>
        <PublicDashboard
          derivedStats={derivedStats}
          onLoginClick={() => setIsLoginModalOpen(true)}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => {
            setIsLoginModalOpen(false)
            setError(null)
          }}
          handleLogin={handleLogin}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loading={loading}
          error={error}
        />
      </>
    )
  }

  // DASHBOARD PETUGAS (TEROTENTIKASI)
  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-gray-900 overflow-hidden">
      <DashboardHeader
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        adminUser={adminUser}
        loading={loading}
        fetchData={() => fetchData(token)}
        handleLogout={handleLogout}
      />
      <div className="flex-1 flex overflow-hidden relative">
        <DashboardSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalResponses={allResponses.length}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'ringkasan' && (
            <TabRingkasan
              derivedStats={derivedStats}
              isAuthenticated={isAuthenticated}
              setIsLoginModalOpen={setIsLoginModalOpen}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'grafik' && (
            <TabGrafik
              derivedStats={derivedStats}
              activeChartView={activeChartView}
              setActiveChartView={setActiveChartView}
              isMounted={isMounted}
            />
          )}
          {activeTab === 'demografi' && (
            <TabDemografi derivedStats={derivedStats} />
          )}
          {activeTab === 'responden' && (
            <TabResponden
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterService={filterService}
              setFilterService={setFilterService}
              filterGender={filterGender}
              setFilterGender={setFilterGender}
              filterAgeGroup={filterAgeGroup}
              setFilterAgeGroup={setFilterAgeGroup}
              filterStartDate={filterStartDate}
              setFilterStartDate={setFilterStartDate}
              filterEndDate={filterEndDate}
              setFilterEndDate={setFilterEndDate}
              onResetFilters={handleResetRespondentFilters}
              uniqueServices={uniqueServices}
              paginatedResponses={paginatedResponses}
              filteredResponses={filteredResponses}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              setSelectedRespondent={setSelectedRespondent}
            />
          )}
          {activeTab === 'saran' && (
            <TabSaran
              allResponses={allResponses}
              setSelectedRespondent={setSelectedRespondent}
            />
          )}
          {activeTab === 'export' && (
            <TabExport
              exportPreset={exportPreset}
              setExportPreset={setExportPreset}
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
              excelPreviewSheet={excelPreviewSheet}
              setExcelPreviewSheet={setExcelPreviewSheet}
              exportStartDate={exportStartDate}
              setExportStartDate={setExportStartDate}
              exportEndDate={exportEndDate}
              setExportEndDate={setExportEndDate}
              exportFilteredResponses={exportFilteredResponses}
              exportPreviewCalc={exportPreviewCalc}
              handleExportExcelWithFilter={handleExportExcelWithFilter}
              handleExportCSVWithFilter={handleExportCSVWithFilter}
              handleExportWord={handleExportWord}
              isExporting={isExporting}
            />
          )}
        </main>
      </div>

      {/* Modal Detail Responden */}
      <RespondentDetailModal
        selectedRespondent={selectedRespondent}
        onClose={() => setSelectedRespondent(null)}
      />

      {/* Modal Login Petugas */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false)
          setError(null)
        }}
        handleLogin={handleLogin}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loading={loading}
        error={error}
      />
    </div>
  )
}
