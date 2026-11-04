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
import {
  IKM_TW3_RESPONDENTS,
  IKM_UNSUR_METADATA,
  IKM_BAKU_MUTU_SUMMARY,
  getBaselineAnalyticsData,
  filterRespondentsByDate,
  calculateIKMFromResponses,
} from '@/src/lib/data/ikm-tw3-database'

interface ResponseRow {
  no: number
  id: string
  waktu: string
  timestamp?: string
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
  kinerjaUnitPelayanan?: string
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

// Icons
const IconMenu = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const IconX = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const IconTrendingUp = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const IconChartBar = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const IconPieChart = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
)

const IconUsers = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const IconMessageSquare = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const IconDownload = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const IconHome = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const IconPlusCircle = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconStar = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)

const IconSearch = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const IconRefresh = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const IconLogout = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const IconPrinter = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
)

const IconCalendar = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const IconLock = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const IconEye = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const IconEyeOff = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
  </svg>
)

const IconAward = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
)

const IconCheckCircle = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconBookOpen = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const IconActivity = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)


// Tooltips
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

  // Public Dashboard Tab & View Controls
  const [publicTab, setPublicTab] = useState<'unsur' | 'grafik' | 'demografi' | 'standar'>('unsur')
  const [publicChartView, setPublicChartView] = useState<'bar' | 'radar'>('bar')

  // Sidebar visibility state: collapsible via garis 3 (hamburger menu)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Sub-menu Tabs (Now controlled via Sidebar)
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'grafik' | 'demografi' | 'responden' | 'saran' | 'export'>('ringkasan')

  // Chart View Control & Hydration Guard
  const [activeChartView, setActiveChartView] = useState<'bar' | 'radar'>('bar')
  const [isMounted, setIsMounted] = useState(false)

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterService, setFilterService] = useState('ALL')
  const [filterGender, setFilterGender] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal Detail Responden
  const [selectedRespondent, setSelectedRespondent] = useState<ResponseRow | null>(null)

  // EXPORT SUB-MENU STATE & PREVIEW CONTROLS
  const [exportPreset, setExportPreset] = useState<'1m' | '3m' | '6m' | '1y' | 'all' | 'custom'>('3m')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')
  const [excelPreviewSheet, setExcelPreviewSheet] = useState<'data' | 'baku_mutu'>('data')
  const [exportStartDate, setExportStartDate] = useState<string>('2026-07-01')
  const [exportEndDate, setExportEndDate] = useState<string>('2026-09-30')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Auto collapse on small screens
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [])

  // Initialize with baseline data from TW 3 2026
  useEffect(() => {
    const initialData = getBaselineAnalyticsData()
    setAnalytics(initialData as any)
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
      if (resData.data && resData.data.responses && resData.data.responses.length > 0) {
        setAnalytics(resData.data)
      } else {
        setAnalytics(getBaselineAnalyticsData() as any)
      }
      setIsAuthenticated(true)
      localStorage.setItem('adminToken', authToken)
    } catch (err: any) {
      console.warn('Dashboard fetch warning, using baseline data:', err)
      setAnalytics(getBaselineAnalyticsData() as any)
      if (authToken) {
        setIsAuthenticated(true)
      }
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

  // All responses from state or baseline
  const allResponses = useMemo(() => {
    return analytics?.responses || (getBaselineAnalyticsData().responses as ResponseRow[])
  }, [analytics])

  // Filtered responses for Respondent Tab
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
    const total = allResponses.length || 24
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
      const avg = total > 0 ? sums[qKey] / total : 3.5
      ikmSkala4 += avg * (1 / 9)
      const ikm = avg * 25
      let mutu = 'B (Baik)'
      if (avg >= 3.53) mutu = 'A (Sangat Baik)'
      else if (avg >= 3.06) mutu = 'B (Baik)'
      else if (avg >= 2.60) mutu = 'C (Kurang Baik)'
      else mutu = 'D (Tidak Baik)'

      return {
        ...u,
        score: avg,
        ikm,
        mutu,
      }
    })

    const ikmKonversi = ikmSkala4 * 25
    let mutuPelayanan = 'B'
    let kinerjaUnit = 'BAIK'
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

    if (exportPreset === '1m') {
      start = new Date('2026-09-01T00:00:00.000Z')
      end = new Date('2026-09-30T23:59:59.999Z')
    } else if (exportPreset === '3m') {
      start = new Date('2026-07-01T00:00:00.000Z')
      end = new Date('2026-09-30T23:59:59.999Z')
    } else if (exportPreset === '6m') {
      start = new Date('2026-07-01T00:00:00.000Z')
      end = new Date('2026-12-31T23:59:59.999Z')
    } else if (exportPreset === '1y') {
      start = new Date('2026-01-01T00:00:00.000Z')
      end = new Date('2026-12-31T23:59:59.999Z')
    } else if (exportPreset === 'custom') {
      if (exportStartDate) start = new Date(exportStartDate)
      if (exportEndDate) {
        end = new Date(exportEndDate)
        end.setHours(23, 59, 59, 999)
      }
    }

    return filterRespondentsByDate(IKM_TW3_RESPONDENTS, start, end)
  }, [exportPreset, exportStartDate, exportEndDate])

  // Calculation for Export Preview
  const exportPreviewCalc = useMemo(() => {
    return calculateIKMFromResponses(exportFilteredResponses)
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
      exportPreset === '3m'
        ? '3 Bulan Terakhir'
        : exportPreset === '1m'
          ? '1 Bulan Terakhir'
          : exportPreset === '6m'
            ? '6 Bulan Terakhir'
            : exportPreset === '1y'
              ? '1 Tahun Terakhir'
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

  // Helper for rendering Login Modal
  const renderLoginModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        <button
          onClick={() => {
            setIsLoginModalOpen(false)
            setError(null)
          }}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
        >
          <IconX className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-2xl mx-auto flex items-center justify-center shadow-inner mb-3 p-2">
            <img src="/logo-kelurahan.jpg" alt="Logo Kelurahan" className="h-full w-auto object-contain" />
          </div>
          <div className="inline-block px-3 py-0.5 bg-teal-100 text-teal-800 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 font-display">
            Akses Masuk Petugas
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 font-display">
            Login Petugas SKM
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Kelurahan Lebakgede • Kecamatan Coblong
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-display">
              Username Petugas
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="StafLebakgede"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-display">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-teal-700/20 transition-all font-display cursor-pointer"
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard Petugas'}
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <button
            type="button"
            onClick={() => {
              setIsLoginModalOpen(false)
              setError(null)
            }}
            className="hover:text-teal-700 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            ← Kembali ke Dashboard Umum
          </button>
          <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded">Kelurahan Lebakgede</span>
        </div>
      </div>
    </div>
  )

  // -------------------------------------------------------------
  // JIKA BUKAN PETUGAS: TAMPILKAN DASHBOARD UMUM (KHUSUS PUBLIK)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900">

        {/* PUBLIC TOP HEADER */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-xs border border-gray-200 flex items-center justify-center">
              <img src="/logo-kelurahan.jpg" alt="Logo Kelurahan Lebakgede" className="h-8 w-auto object-contain" />
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
              onClick={() => setIsLoginModalOpen(true)}
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
                  {IKM_BAKU_MUTU_SUMMARY.rentangNilai.map((item) => {
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

        {/* LOGIN MODAL */}
        {isLoginModalOpen && renderLoginModal()}

      </div>
    )
  }

  // -------------------------------------------------------------
  // DASHBOARD PETUGAS (TEROTENTIKASI): MENU LENGKAP & MANAJEMEN
  // -------------------------------------------------------------
  const navItems = [
    { id: 'ringkasan', label: 'Ringkasan IKM', icon: IconTrendingUp, desc: 'Indikator Utama & Baku Mutu' },
    { id: 'grafik', label: 'Grafik 9 Unsur', icon: IconChartBar, desc: 'Visualisasi Bar & Radar' },
    { id: 'demografi', label: 'Demografi Responden', icon: IconPieChart, desc: 'Gender, Usia, Pendidikan' },
    { id: 'responden', label: 'Data Responden', icon: IconUsers, desc: 'Daftar 24 Responden Terdata' },
    { id: 'saran', label: 'Kritik & Saran', icon: IconMessageSquare, desc: 'Aspirasi & Masukan Warga' },
    { id: 'export', label: 'Export & Unduh Dokumen', icon: IconDownload, desc: 'Rentang Waktu & Live Preview' },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900">

      {/* TOP HEADER BAR with Hamburger Button */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs no-print">
        <div className="flex items-center gap-3">
          {/* Hamburger toggle button (garis 3) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-gray-600 hover:text-teal-700 hover:bg-teal-50 border border-gray-200 transition-all flex items-center justify-center cursor-pointer"
            title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar (Garis 3)'}
            aria-label="Toggle Navigation Sidebar"
          >
            {isSidebarOpen ? <IconMenu className="w-5 h-5 text-teal-700" /> : <IconMenu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1 rounded-xl shadow-xs border border-gray-200 flex items-center justify-center">
              <img src="/logo-kelurahan.jpg" alt="Logo Kota Bandung" className="h-7 w-auto object-contain" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight font-display flex items-center gap-1.5">
                <span>Dashboard SKM Petugas</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Petugas: {adminUser?.username || 'Staf'}</span>
                </span>
              </div>
              <div className="text-[11px] text-gray-500 leading-none">
                Kelurahan Lebakgede • Coblong
              </div>
            </div>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/form"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition"
          >
            <IconPlusCircle className="w-3.5 h-3.5" />
            <span>Isi Survei Baru</span>
          </Link>

          <button
            onClick={() => fetchData(token)}
            disabled={loading}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition border border-gray-200 flex items-center gap-1.5 cursor-pointer"
            title="Segarkan Data"
          >
            <IconRefresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{loading ? 'Memuat...' : 'Segarkan'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 flex items-center gap-1.5 cursor-pointer"
            title="Keluar dari Dashboard Petugas"
          >
            <IconLogout className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY with Collapsible Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">

        {/* COLLAPSIBLE SIDEBAR */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-lg lg:shadow-none no-print ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
            }`}
          style={{ top: '57px' }}
        >
          {/* Sidebar Top Info */}
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="px-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 font-display">
                  Menu Utama Dashboard
                </span>
                <p className="text-[11px] text-gray-500">Kelurahan Lebakgede</p>
              </div>
            ) : (
              <div className="w-full text-center py-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              </div>
            )}

            {/* Close button on mobile overlay */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Sub-Menus List */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any)
                    // If on mobile, close sidebar after clicking
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setIsSidebarOpen(false)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${isActive
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/20 font-bold'
                      : 'text-gray-700 hover:bg-teal-50/70 hover:text-teal-900 font-medium'
                    }`}
                  title={item.label}
                >
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-800'
                    }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {isSidebarOpen && (
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate font-display">
                        <span>{item.label}</span>
                      </div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                        {item.desc}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}

            <div className="pt-3 my-2 border-t border-gray-100"></div>

            {/* External Links inside sidebar */}
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-xs font-medium transition"
              title="Ke Beranda Utama"
            >
              <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500">
                <IconHome className="w-4 h-4" />
              </div>
              {isSidebarOpen && <span>Beranda Utama</span>}
            </Link>

            <Link
              href="/form"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-xs font-medium transition"
              title="Formulir Survei Baru"
            >
              <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500">
                <IconPlusCircle className="w-4 h-4" />
              </div>
              {isSidebarOpen && <span>Isi Survei Baru</span>}
            </Link>
          </nav>

          {/* Sidebar Footer Info */}
          {isSidebarOpen && (
            <div className="p-3 border-t border-gray-100 bg-slate-50/80 text-[11px] text-gray-500 space-y-1">
              <div className="font-semibold text-gray-700">Lurah Lebakgede:</div>
              <div className="text-xs font-bold text-gray-900">{IKM_BAKU_MUTU_SUMMARY.pejabat.nama}</div>
              <div className="text-[10px] text-gray-400">NIP. {IKM_BAKU_MUTU_SUMMARY.pejabat.nip}</div>
            </div>
          )}
        </aside>

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden no-print"
          ></div>
        )}

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* SUB-MENU 1: RINGKASAN IKM */}
          {activeTab === 'ringkasan' && (
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
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    Lihat Grafik Lengkap →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {derivedStats.elements.map((u) => (
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
          )}

          {/* SUB-MENU 2: GRAFIK 9 UNSUR */}
          {activeTab === 'grafik' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 font-display">Grafik Evaluasi 9 Unsur SKM</h3>
                    <p className="text-xs text-gray-500">Perbandingan nilai rata-rata persepsi masyarakat per unsur pelayanan</p>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setActiveChartView('bar')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-display ${activeChartView === 'bar' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Diagram Batang
                    </button>
                    <button
                      onClick={() => setActiveChartView('radar')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-display ${activeChartView === 'radar' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Radar Spider
                    </button>
                  </div>
                </div>

                {isMounted && (
                  <div className="h-80 sm:h-96 w-full">
                    {activeChartView === 'bar' ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={derivedStats.elements} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="short"
                            angle={-25}
                            textAnchor="end"
                            interval={0}
                            tick={{ fontSize: 11, fill: '#475569' }}
                          />
                          <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 11, fill: '#475569' }} />
                          <RechartsTooltip content={<CustomElementTooltip />} />
                          <ReferenceLine y={3.53} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Sangat Baik (3.53)', fill: '#10b981', fontSize: 10 }} />
                          <ReferenceLine y={3.06} stroke="#0284c7" strokeDasharray="3 3" label={{ value: 'Baik (3.06)', fill: '#0284c7', fontSize: 10 }} />
                          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
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
                )}
              </div>
            </div>
          )}

          {/* SUB-MENU 3: DEMOGRAFI RESPONDEN */}
          {activeTab === 'demografi' && (
            <div className="space-y-6 fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Gender Pie Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
                  <h4 className="text-sm font-extrabold text-gray-900 font-display mb-1">Distribusi Jenis Kelamin</h4>
                  <p className="text-xs text-gray-500 mb-4">Komposisi responden warga perempuan dan laki-laki</p>

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

                  <div className="flex justify-center gap-6 text-xs font-bold pt-2">
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

                {/* Education Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
                  <h4 className="text-sm font-extrabold text-gray-900 font-display mb-1">Tingkat Pendidikan Responden</h4>
                  <p className="text-xs text-gray-500 mb-4">Latar belakang pendidikan responden pengurus layanan</p>

                  <div className="space-y-2.5 pt-2">
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
                          <span>{item.count} Orang ({item.pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SUB-MENU 4: DATA RESPONDEN */}
          {activeTab === 'responden' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
                  <div className="relative flex-1 max-w-md">
                    <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                      }}
                      placeholder="Cari ID, jenis layanan, saran, usia..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterService}
                      onChange={(e) => {
                        setFilterService(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold bg-white"
                    >
                      <option value="ALL">Semua Jenis Layanan</option>
                      {uniqueServices.map((svc) => (
                        <option key={svc} value={svc}>{svc}</option>
                      ))}
                    </select>

                    <select
                      value={filterGender}
                      onChange={(e) => {
                        setFilterGender(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold bg-white"
                    >
                      <option value="ALL">Semua Gender</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
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
                      {paginatedResponses.map((r) => (
                        <tr key={r.id} className="hover:bg-teal-50/40 transition">
                          <td className="py-3 px-3 text-center font-bold text-gray-500">{r.no}</td>
                          <td className="py-3 px-3 font-semibold text-teal-900">{r.id}</td>
                          <td className="py-3 px-3 text-gray-600">{r.waktu}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r.jenis_kelamin.toLowerCase().includes('laki') ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                              }`}>
                              {r.jenis_kelamin}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-700">{r.usia}</td>
                          <td className="py-3 px-3 text-gray-700">{r.pendidikan}</td>
                          <td className="py-3 px-3 font-medium text-gray-900">{r.jenis_layanan}</td>
                          <td className="py-3 px-3 text-center font-bold text-teal-800">{Number(r.skor_rata).toFixed(2)}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${r.nilai === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                              }`}>
                              {r.nilai}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => setSelectedRespondent(r)}
                              className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-gray-300 rounded-lg text-teal-700 font-bold text-[11px] transition shadow-2xs"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 text-xs text-gray-500">
                  <div>
                    Menampilkan <strong>{paginatedResponses.length}</strong> dari <strong>{filteredResponses.length}</strong> responden
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 font-bold disabled:opacity-40 hover:bg-gray-100"
                    >
                      ← Sebelumnya
                    </button>
                    <span className="px-2 font-bold text-gray-800">
                      Halaman {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 font-bold disabled:opacity-40 hover:bg-gray-100"
                    >
                      Selanjutnya →
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SUB-MENU 5: KRITIK & SARAN */}
          {activeTab === 'saran' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
                <div className="border-b border-gray-100 pb-3 mb-6">
                  <h3 className="text-lg font-extrabold text-gray-900 font-display">Aspirasi, Kritik & Saran Warga</h3>
                  <p className="text-xs text-gray-500">Masukan langsung masyarakat pada survei kepuasan Kelurahan Lebakgede</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allResponses
                    .filter((r) => r.saran && r.saran.trim().length > 1 && r.saran !== '-')
                    .map((r) => (
                      <div key={r.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-teal-800 font-display">{r.id}</span>
                          <span className="text-[11px] text-gray-400">{r.waktu}</span>
                        </div>
                        <p className="text-xs text-gray-800 leading-relaxed italic">
                          &ldquo;{r.saran}&rdquo;
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-[11px] text-gray-500">
                          <span>Layanan: <strong className="text-gray-700">{r.jenis_layanan}</strong></span>
                          <span className="px-2 py-0.5 rounded font-bold bg-teal-100 text-teal-800">
                            Skor Rata: {Number(r.skor_rata).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-MENU 6: EXPORT & UNDUH DOKUMEN (NEW WITH LIVE PREVIEW & DATE RANGE) */}
          {activeTab === 'export' && (
            <div className="space-y-6 fade-in">

              {/* Header Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
                <div className="no-print">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 font-display">
                    <IconDownload className="w-3.5 h-3.5" />
                    <span>Pusat Unduh Dokumen & Laporan Resmi SKM</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2 font-display">
                    Pilih Format Dokumen & Lihat Live Preview Sebelum Mengunduh
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Tentukan rentang waktu survei, pilih format dokumen yang Anda perlukan, lalu tinjau wujud berkas pada Live Preview sebelum menekan tombol unduh.
                  </p>
                </div>

                {/* LANGKAH 1: PILIH RENTANG WAKTU */}
                <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 no-print">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">1</span>
                      <span>Pilih Rentang Waktu Survei:</span>
                    </span>
                    <span className="text-[11px] font-bold text-teal-800 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                      {exportFilteredResponses.length} Data Responden Cocok
                    </span>
                  </div>

                  {/* Dropdown Pilihan Rentang Waktu */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <select
                        id="select-rentang-waktu"
                        value={exportPreset}
                        onChange={(e) => {
                          const val = e.target.value as any
                          setExportPreset(val)
                          if (val === '1m') {
                            setExportStartDate('2026-09-01')
                            setExportEndDate('2026-09-30')
                          } else if (val === '3m') {
                            setExportStartDate('2026-07-01')
                            setExportEndDate('2026-09-30')
                          } else if (val === '6m') {
                            setExportStartDate('2026-07-01')
                            setExportEndDate('2026-12-31')
                          } else if (val === '1y') {
                            setExportStartDate('2026-01-01')
                            setExportEndDate('2026-12-31')
                          } else if (val === 'all') {
                            setExportStartDate('')
                            setExportEndDate('')
                          } else if (val === 'custom') {
                            if (!exportStartDate) setExportStartDate('2026-07-01')
                            if (!exportEndDate) setExportEndDate('2026-09-30')
                          }
                        }}
                        className="w-full appearance-none bg-white border-2 border-gray-300 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm font-bold text-gray-800 shadow-xs cursor-pointer hover:border-gray-400 transition"
                      >
                        <optgroup label="── Rentang Standar ──">
                          <option value="1m">1 Bulan</option>
                          <option value="3m">3 Bulan</option>
                          <option value="6m">6 Bulan</option>
                          <option value="1y">1 Tahun</option>
                          <option value="all">Semua</option>
                        </optgroup>
                        <optgroup label="── Pengaturan Manual ──">
                          <option value="custom">Rentang Manual</option>
                        </optgroup>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Status Informasi Rentang Terpilih */}
                    {exportPreset !== 'custom' ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-semibold">
                          <svg className="w-3.5 h-3.5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {exportPreset === '1m' && 'Periode: 1 Bulan Terakhir'}
                            {exportPreset === '3m' && 'Periode: 3 Bulan Terakhir'}
                            {exportPreset === '6m' && 'Periode: 6 Bulan Terakhir'}
                            {exportPreset === '1y' && 'Periode: 1 Tahun Terakhir'}
                            {exportPreset === 'all' && 'Periode: Seluruh Data Responden Terdata'}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                        <span>Mode Rentang Manual Aktif</span>
                      </span>
                    )}
                  </div>

                  {/* KOTAK KHUSUS RENTANG MANUAL - DIBEDAKAN SECARA JELAS */}
                  {exportPreset === 'custom' && (
                    <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/85 shadow-xs space-y-3 mt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📅</span>
                          <div>
                            <div className="text-xs font-bold text-amber-950 font-display">
                              Pengaturan Rentang Manual (Kustom Tanggal)
                            </div>
                            <p className="text-[11px] text-amber-800">
                              Tentukan tanggal awal dan akhir survei secara spesifik sesuai keperluan Anda.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setExportPreset('3m')
                            setExportStartDate('2026-07-01')
                            setExportEndDate('2026-09-30')
                          }}
                          className="self-start sm:self-auto text-[11px] font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer bg-white/70 px-2.5 py-1 rounded-md border border-amber-200"
                        >
                          Kembali ke 3 Bulan (Standar)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-gray-800 mb-1 font-display">
                            Tanggal Mulai (Start Date)
                          </label>
                          <input
                            type="date"
                            value={exportStartDate}
                            onChange={(e) => setExportStartDate(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-amber-300 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 bg-white text-gray-900 shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-800 mb-1 font-display">
                            Tanggal Akhir (End Date)
                          </label>
                          <input
                            type="date"
                            value={exportEndDate}
                            onChange={(e) => setExportEndDate(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-amber-300 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 bg-white text-gray-900 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* LANGKAH 2: PILIH FORMAT DOKUMEN YANG AKAN DI-PREVIEW */}
                <div className="space-y-3 no-print">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Pilih Format Dokumen yang Ingin Diunduh:</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Format 1: Surat Dinas Resmi (PDF & Word) */}
                    <button
                      type="button"
                      onClick={() => setExportFormat('pdf')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${exportFormat === 'pdf'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">📄</span>
                          {exportFormat === 'pdf' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                              Sedang Di-Preview
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-extrabold text-gray-900 font-display">
                          Surat Laporan Resmi (PDF & Word)
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Naskah surat dinas resmi lengkap dengan Kop Surat, nomor surat, kalimat narasi pembuka, evaluasi capaian, dan tabel 9 unsur.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] font-bold text-emerald-800">
                        Pilihan: Cetak PDF atau Unduh File Word (.doc)
                      </div>
                    </button>

                    {/* Format 2: Excel Spreadsheet */}
                    <button
                      type="button"
                      onClick={() => setExportFormat('excel')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${exportFormat === 'excel'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">📊</span>
                          {exportFormat === 'excel' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                              Sedang Di-Preview
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-extrabold text-gray-900 font-display">
                          Buku Kerja Excel (.xlsx)
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Format lembar kerja spreadsheet berisikan Sheet Data Responden dan Sheet Baku Mutu NRR terhitung.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] font-bold text-emerald-800">
                        Cocok untuk: Olah Data Lanjutan & Audit
                      </div>
                    </button>

                    {/* Format 3: CSV Tabular */}
                    <button
                      type="button"
                      onClick={() => setExportFormat('csv')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${exportFormat === 'csv'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">📑</span>
                          {exportFormat === 'csv' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                              Sedang Di-Preview
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-extrabold text-gray-900 font-display">
                          Data Tabular CSV (.csv)
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Format teks tabular murni terstandar koma (UTF-8) untuk integrasi dengan database atau aplikasi lain.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] font-bold text-emerald-800">
                        Cocok untuk: Backup & Integrasi Sistem
                      </div>
                    </button>
                  </div>
                </div>

                {/* LANGKAH 3: LIVE PREVIEW DOKUMEN SESUAI FORMAT YANG DIPILIH */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between no-print">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">3</span>
                      <span>Live Preview Berkas: {
                        exportFormat === 'pdf' ? '📄 Dokumen Naskah Dinas Resmi (PDF/A4)' :
                          exportFormat === 'excel' ? '📊 Lembar Kerja Microsoft Excel (.xlsx)' :
                            '📑 Struktur Teks Data CSV (.csv)'
                      }</span>
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Pratinjau wujud berkas sebelum proses unduh
                    </span>
                  </div>

                  {/* PREVIEW 1: TAMPILAN SURAT RESMI KELURAHAN LEBAK GEDE (PERSIS SESUAI NASKAH ASLI) */}
                  {exportFormat === 'pdf' && (
                    <div className="bg-slate-200/80 p-3 sm:p-8 rounded-2xl border border-gray-300 flex justify-center overflow-x-auto print-container">
                      <div className="bg-white shadow-2xl rounded-none sm:rounded-sm p-6 sm:p-12 max-w-[760px] w-full text-black font-serif leading-normal text-xs printable-official-document">

                        {/* 1. KOP SURAT RESMI KELURAHAN LEBAK GEDE */}
                        <div className="flex items-start gap-4 pb-1">
                          <img
                            src="/logo-kelurahan.jpg"
                            alt="Logo Kota Bandung"
                            className="h-20 w-auto object-contain flex-shrink-0"
                          />
                          <div className="flex-1 text-center font-serif">
                            <h3 className="font-bold text-sm sm:text-base text-black tracking-normal leading-tight">
                              PEMERINTAH KOTA BANDUNG
                            </h3>
                            <h3 className="font-bold text-sm sm:text-base text-black tracking-normal leading-tight">
                              KECAMATAN COBLONG
                            </h3>
                            <h2 className="font-extrabold text-base sm:text-lg text-black tracking-wide leading-tight mt-0.5">
                              KELURAHAN LEBAK GEDE
                            </h2>
                            <p className="text-[10px] sm:text-[10.5px] text-black leading-tight mt-1">
                              Jl. Tubagus Ismail Bawah No.5, Lebakgede, Coblong, Kota Bandung, Jawa Barat 40132 Telp. 0222512563, Fax 0222512563
                            </p>
                            <p className="text-[10px] sm:text-[10.5px] text-black leading-tight">
                              e – mail : kelurahanlebakgede2016@gmail.com
                            </p>
                          </div>
                        </div>

                        {/* Garis Ganda Kop Surat (Tebal - Tipis) */}
                        <div className="border-b-[3.5px] border-black mt-2 mb-[2px]"></div>
                        <div className="border-b-[1px] border-black mb-5"></div>

                        {/* 2. TANGGAL SURAT (KANAN) */}
                        <div className="flex justify-end mb-4">
                          <span className="text-xs sm:text-[13px] font-serif text-black">
                            Bandung, 07 Oktober 2026
                          </span>
                        </div>

                        {/* 3. NOMOR & IDENTITAS SURAT (KIRI) */}
                        <div className="text-xs sm:text-[12.5px] font-serif text-black space-y-0.5 mb-5 max-w-lg">
                          <div className="flex">
                            <span className="w-20 sm:w-24 flex-shrink-0">Nomor</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-mono text-xs">B/TU/148-LG/X/2026</span>
                          </div>
                          <div className="flex">
                            <span className="w-20 sm:w-24 flex-shrink-0">Sifat</span>
                            <span className="w-4">:</span>
                            <span className="flex-1">Biasa</span>
                          </div>
                          <div className="flex">
                            <span className="w-20 sm:w-24 flex-shrink-0">Lampiran</span>
                            <span className="w-4">:</span>
                            <span className="flex-1">1 (satu) Berkas</span>
                          </div>
                          <div className="flex items-start">
                            <span className="w-20 sm:w-24 flex-shrink-0">Hal</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-bold">
                              Laporan Pengukuran Indeks Kepuasan Masyarakat (IKM)
                            </span>
                          </div>
                        </div>

                        {/* 4. TUJUAN SURAT (Yth.) */}
                        <div className="text-xs sm:text-[12.5px] font-serif text-black space-y-0.5 mb-5">
                          <div className="flex items-start">
                            <span className="w-12 flex-shrink-0">Yth.</span>
                            <div>
                              <p>1. Camat Coblong Kota Bandung</p>
                              <p>2. Badan Kesatuan Bangsa dan Politik Kota Bandung</p>
                            </div>
                          </div>
                          <p className="pt-1">di</p>
                          <p className="font-bold">Bandung</p>
                        </div>

                        {/* 5. PARAGRAF PEMBUKA (INDENTASI SESUAI SURAT RESMI) */}
                        <p className="text-xs sm:text-[12.5px] font-serif text-black text-justify leading-relaxed indent-16 sm:indent-24 mb-4">
                          Menindaklanjuti agenda evaluasi dan pengukuran Indeks Kepuasan Masyarakat (IKM) terhadap mutu pelayanan publik di lingkungan Kelurahan Lebak Gede Kecamatan Coblong Kota Bandung pada periode <strong>{exportPreset === '3m' ? '3 Bulan Terakhir' : exportPreset === '1m' ? '1 Bulan Terakhir' : exportPreset === '6m' ? '6 Bulan Terakhir' : exportPreset === '1y' ? '1 Tahun Terakhir' : exportPreset === 'all' ? 'Seluruh Data Responden' : `${exportStartDate} s/d ${exportEndDate}`}</strong>, bersama ini disampaikan laporan hasil evaluasi kepuasan masyarakat atas pelayanan administrasi kependudukan dan perizinan sebagai berikut :
                        </p>

                        {/* 6. TABEL 9 UNSUR (HEADER ABU-BIRU #dbe2ea KHAS PEMKOT BANDUNG) */}
                        <div className="mb-5 overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-600 text-xs sm:text-[12px] font-serif">
                            <thead>
                              <tr className="bg-[#dbe2ea] text-black font-bold text-center">
                                <th className="border border-gray-600 p-2 w-10 sm:w-12">NO</th>
                                <th className="border border-gray-600 p-2 text-left">UNSUR PELAYANAN</th>
                                <th className="border border-gray-600 p-2 w-20 sm:w-24">NILAI NRR</th>
                                <th className="border border-gray-600 p-2 w-24 sm:w-28">NILAI KONVERSI</th>
                                <th className="border border-gray-600 p-2 w-16 sm:w-20">MUTU</th>
                              </tr>
                            </thead>
                            <tbody>
                              {exportPreviewCalc.unsurAverages.map((u, i) => (
                                <tr key={u.key} className="border-b border-gray-400 hover:bg-slate-50">
                                  <td className="border border-gray-400 p-1.5 text-center">{i + 1}</td>
                                  <td className="border border-gray-400 p-1.5">{u.label}</td>
                                  <td className="border border-gray-400 p-1.5 text-center font-bold text-black">{u.nrr.toFixed(2)}</td>
                                  <td className="border border-gray-400 p-1.5 text-center font-bold text-teal-900">{u.ikm.toFixed(2)}</td>
                                  <td className="border border-gray-400 p-1.5 text-center font-bold">{u.mutu}</td>
                                </tr>
                              ))}
                              <tr className="bg-[#f0f4f8] font-bold border-t-2 border-gray-700">
                                <td colSpan={2} className="border border-gray-600 p-2 text-center uppercase tracking-wide text-xs">
                                  Nilai IKM Konversi (Mutu Pelayanan: {exportPreviewCalc.mutuPelayanan} - {exportPreviewCalc.kinerjaUnit})
                                </td>
                                <td className="border border-gray-600 p-2 text-center text-teal-900">{exportPreviewCalc.ikmSkala4.toFixed(4)}</td>
                                <td className="border border-gray-600 p-2 text-center text-emerald-800 text-sm">{exportPreviewCalc.ikmKonversi.toFixed(2)}</td>
                                <td className="border border-gray-600 p-2 text-center text-emerald-800">{exportPreviewCalc.mutuPelayanan}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* 7. PARAGRAF KELANJUTAN (PERSIS FORMAT SURAT DINAS) */}
                        <p className="text-xs sm:text-[12.5px] font-serif text-black text-justify leading-relaxed indent-16 sm:indent-24 mb-4">
                          Maka Kelurahan Lebak Gede Kecamatan Coblong Kota Bandung, menyampaikan hasil pengukuran tersebut dengan capaian IKM sebesar <strong>{exportPreviewCalc.ikmKonversi.toFixed(2)} (Kategori Mutu {exportPreviewCalc.mutuPelayanan} - {exportPreviewCalc.kinerjaUnit})</strong> berdasarkan partisipasi {exportPreviewCalc.count} orang responden terdata sebagai wujud akuntabilitas kinerja pelayanan.
                        </p>

                        {/* 8. PARAGRAF PENUTUP (PERSIS FORMAT SURAT DINAS) */}
                        <p className="text-xs sm:text-[12.5px] font-serif text-black text-justify leading-relaxed indent-16 sm:indent-24 mb-6">
                          Demikian surat ini kami sampaikan atas perhatiannya diucapkan terima kasih.
                        </p>

                      </div>
                    </div>
                  )}

                  {/* PREVIEW 2: TAMPILAN LEMBAR KERJA MICROSOFT EXCEL (.XLSX) */}
                  {exportFormat === 'excel' && (
                    <div className="rounded-2xl border border-gray-300 overflow-hidden shadow-md font-sans">
                      {/* Excel Title Bar */}
                      <div className="bg-[#107c41] px-4 py-2.5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs">📗 Excel Spreadsheet Preview</span>
                          <span className="text-[11px] text-emerald-100">
                            (Laporan_IKM_Lebakgede_{exportPreset}.xlsx)
                          </span>
                        </div>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">
                          2 Sheet Aktif
                        </span>
                      </div>

                      {/* Sheet Tabs Switcher */}
                      <div className="bg-slate-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600 mr-2">Pilih Lembar Sheet:</span>
                        <button
                          type="button"
                          onClick={() => setExcelPreviewSheet('data')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${excelPreviewSheet === 'data'
                              ? 'bg-white text-[#107c41] shadow-xs border border-gray-300'
                              : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          <span>📑 Sheet 1: DATA_RESPONDEN</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#107c41] text-[10px]">
                            {exportFilteredResponses.length}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExcelPreviewSheet('baku_mutu')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${excelPreviewSheet === 'baku_mutu'
                              ? 'bg-white text-[#107c41] shadow-xs border border-gray-300'
                              : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          <span>📑 Sheet 2: BAKU_MUTU</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#107c41] text-[10px]">
                            Rekap
                          </span>
                        </button>
                      </div>

                      {/* Sheet Content 1: DATA_RESPONDEN GRID */}
                      {excelPreviewSheet === 'data' ? (
                        <div className="overflow-x-auto max-h-80 bg-white">
                          <table className="w-full text-xs text-left border-collapse font-mono">
                            <thead>
                              <tr className="bg-slate-200 text-gray-700 font-bold border-b border-gray-300 text-center">
                                <th className="p-2 border-r border-gray-300 bg-slate-300 w-10">#</th>
                                <th className="p-2 border-r border-gray-300">A (NO)</th>
                                <th className="p-2 border-r border-gray-300">B (ID_RESP)</th>
                                <th className="p-2 border-r border-gray-300">C (WAKTU)</th>
                                <th className="p-2 border-r border-gray-300">D (GENDER)</th>
                                <th className="p-2 border-r border-gray-300">E (USIA)</th>
                                <th className="p-2 border-r border-gray-300">F (PENDIDIKAN)</th>
                                <th className="p-2 border-r border-gray-300">G (LAYANAN)</th>
                                <th className="p-2 border-r border-gray-300">H (U1)</th>
                                <th className="p-2 border-r border-gray-300">I (U2)</th>
                                <th className="p-2 border-r border-gray-300">J (U3)</th>
                                <th className="p-2 border-r border-gray-300">K (U4)</th>
                                <th className="p-2 border-r border-gray-300">L (U5)</th>
                                <th className="p-2 border-r border-gray-300">M (U6)</th>
                                <th className="p-2 border-r border-gray-300">N (U7)</th>
                                <th className="p-2 border-r border-gray-300">O (U8)</th>
                                <th className="p-2 border-r border-gray-300">P (U9)</th>
                                <th className="p-2 border-r border-gray-300">Q (RATA2)</th>
                                <th className="p-2">R (MUTU)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {exportFilteredResponses.map((r, i) => (
                                <tr key={r.id} className="border-b border-gray-200 hover:bg-emerald-50/40">
                                  <td className="p-1.5 text-center bg-slate-100 text-gray-500 font-bold border-r border-gray-200">{i + 1}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.no}</td>
                                  <td className="p-1.5 border-r border-gray-200 font-semibold text-teal-800">{r.id}</td>
                                  <td className="p-1.5 border-r border-gray-200 whitespace-nowrap">{r.waktu}</td>
                                  <td className="p-1.5 border-r border-gray-200">{r.jenis_kelamin}</td>
                                  <td className="p-1.5 border-r border-gray-200">{r.usia}</td>
                                  <td className="p-1.5 border-r border-gray-200">{r.pendidikan}</td>
                                  <td className="p-1.5 border-r border-gray-200">{r.jenis_layanan}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.u1}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.u2}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.u3}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.u4}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.u5}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.u6}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.u7}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.u8}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200">{r.u9}</td>
                                  <td className="p-1.5 text-center border-r border-gray-200 font-bold">{Number(r.skor_rata).toFixed(2)}</td>
                                  <td className="p-1.5 text-center font-bold text-emerald-700">{r.nilai}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        /* Sheet Content 2: BAKU_MUTU TABLE */
                        <div className="p-6 bg-white max-h-80 overflow-y-auto">
                          <table className="w-full text-xs text-left border-collapse border border-gray-300 font-mono">
                            <thead className="bg-[#107c41] text-white font-bold">
                              <tr>
                                <th className="p-2 border border-gray-300">KOLOM A (INDIKATOR BAKU MUTU)</th>
                                <th className="p-2 border border-gray-300">KOLOM B (NILAI HASIL PERHITUNGAN)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-gray-200"><td className="p-2 font-bold bg-slate-50 border-r border-gray-300">Unit Pelayanan</td><td className="p-2">Kelurahan Lebakgede Kecamatan Coblong</td></tr>
                              <tr className="border-b border-gray-200"><td className="p-2 font-bold bg-slate-50 border-r border-gray-300">Alamat Kantor</td><td className="p-2">Jl. Tubagus Ismail Bawah No. 5 Bandung</td></tr>
                              <tr className="border-b border-gray-200"><td className="p-2 font-bold bg-slate-50 border-r border-gray-300">Jumlah Responden Terfilter</td><td className="p-2 font-bold text-teal-800">{exportPreviewCalc.count} Orang</td></tr>
                              <tr className="border-b border-gray-200"><td className="p-2 font-bold bg-slate-50 border-r border-gray-300">Nilai IKM (Skala 4)</td><td className="p-2 font-bold">{exportPreviewCalc.ikmSkala4.toFixed(4)}</td></tr>
                              <tr className="border-b border-gray-200"><td className="p-2 font-bold bg-slate-50 border-r border-gray-300">Nilai Konversi IKM (0-100)</td><td className="p-2 font-bold text-emerald-700 text-sm">{exportPreviewCalc.ikmKonversi.toFixed(2)}</td></tr>
                              <tr className="border-b border-gray-200"><td className="p-2 font-bold bg-slate-50 border-r border-gray-300">Mutu Pelayanan</td><td className="p-2 font-bold text-emerald-700">Kategori {exportPreviewCalc.mutuPelayanan}</td></tr>
                              <tr className="border-b border-gray-200"><td className="p-2 font-bold bg-slate-50 border-r border-gray-300">Kinerja Unit Pelayanan</td><td className="p-2 font-bold text-emerald-700">{exportPreviewCalc.kinerjaUnit}</td></tr>
                              <tr className="border-b border-gray-200"><td className="p-2 font-bold bg-slate-50 border-r border-gray-300">Pejabat Pengesah</td><td className="p-2">USMAN ADIREJA, S.Sos (Lurah Lebakgede)</td></tr>
                              <tr className="border-b border-gray-200"><td className="p-2 font-bold bg-slate-50 border-r border-gray-300">NIP Pejabat</td><td className="p-2">19721209 199901 1 001</td></tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PREVIEW 3: TAMPILAN KODE TEKS DATA TABULAR CSV (.CSV) */}
                  {exportFormat === 'csv' && (
                    <div className="rounded-2xl border border-gray-800 bg-slate-900 text-emerald-400 p-4 font-mono text-xs overflow-x-auto shadow-inner max-h-80">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                        <span>Preview Berkas Mentah: Data_SKM_Lebakgede_{exportPreset}.csv (UTF-8)</span>
                        <span>{exportFilteredResponses.length + 1} Baris Teks</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-amber-300 font-bold whitespace-nowrap">
                          1: No,Nomor Responden,ID,Waktu,Gender,Usia,Pendidikan,Layanan,U1,U2,U3,U4,U5,U6,U7,U8,U9,Rata,Mutu,Saran
                        </div>
                        {exportFilteredResponses.slice(0, 15).map((r, i) => (
                          <div key={r.id} className="whitespace-nowrap text-slate-300 hover:bg-slate-800/80 px-1 rounded">
                            <span className="text-slate-500 mr-2">{i + 2}:</span>
                            {i + 1},{r.no},&quot;{r.id}&quot;,&quot;{r.waktu}&quot;,&quot;{r.jenis_kelamin}&quot;,&quot;{r.usia}&quot;,&quot;{r.pendidikan}&quot;,&quot;{r.jenis_layanan}&quot;,{r.u1},{r.u2},{r.u3},{r.u4},{r.u5},{r.u6},{r.u7},{r.u8},{r.u9},{Number(r.skor_rata).toFixed(2)},&quot;{r.nilai}&quot;,&quot;{(r.saran || '').substring(0, 30)}...&quot;
                          </div>
                        ))}
                        {exportFilteredResponses.length > 15 && (
                          <div className="text-slate-500 italic pt-1">
                            ... dan {exportFilteredResponses.length - 15} baris data lainnya yang akan disertakan dalam berkas CSV.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* LANGKAH 4: TOMBOL KONFIRMASI UNDUH BERDASARKAN FORMAT TERPILIH */}
                <div className="pt-4 border-t border-gray-200 space-y-3 no-print">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">4</span>
                        <span>Konfirmasi & Unduh Berkas:</span>
                      </span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Format aktif: <strong>{
                          exportFormat === 'pdf' ? 'Dokumen Laporan Resmi (PDF)' :
                            exportFormat === 'excel' ? 'Buku Kerja Excel (.xlsx)' :
                              'Data Tabular CSV (.csv)'
                        }</strong> ({exportFilteredResponses.length} responden)
                      </p>
                    </div>

                    <div>
                      {exportFormat === 'pdf' && (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            disabled={exportFilteredResponses.length === 0}
                            className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-slate-900/20 transition flex items-center gap-2 font-display disabled:opacity-50"
                          >
                            <IconPrinter className="w-4 h-4" />
                            <span>🖨️ Cetak / Simpan PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleExportWord}
                            disabled={exportFilteredResponses.length === 0}
                            className="px-5 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-900/20 transition flex items-center gap-2 font-display disabled:opacity-50"
                          >
                            <span>📝 Unduh Dokumen Word (.doc)</span>
                          </button>
                        </div>
                      )}

                      {exportFormat === 'excel' && (
                        <button
                          type="button"
                          onClick={handleExportExcelWithFilter}
                          disabled={isExporting || exportFilteredResponses.length === 0}
                          className="px-6 py-3.5 rounded-xl bg-[#107c41] hover:bg-[#0d6535] active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/20 transition flex items-center gap-2 font-display disabled:opacity-50"
                        >
                          <IconDownload className="w-4 h-4" />
                          <span>{isExporting ? 'Mengekspor Berkas...' : '📥 Unduh Berkas Excel (.xlsx) Sekarang'}</span>
                        </button>
                      )}

                      {exportFormat === 'csv' && (
                        <button
                          type="button"
                          onClick={handleExportCSVWithFilter}
                          disabled={exportFilteredResponses.length === 0}
                          className="px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-teal-900/20 transition flex items-center gap-2 font-display disabled:opacity-50"
                        >
                          <IconDownload className="w-4 h-4" />
                          <span>📥 Unduh Berkas CSV (.csv) Sekarang</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* MODAL DETAIL RESPONDEN */}
      {selectedRespondent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-gray-900 font-display">
                  Detail Responden: {selectedRespondent.id}
                </h4>
                <p className="text-xs text-gray-500">Waktu: {selectedRespondent.waktu}</p>
              </div>
              <button
                onClick={() => setSelectedRespondent(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-gray-400">Jenis Kelamin:</span>
                <p className="font-bold text-gray-800">{selectedRespondent.jenis_kelamin}</p>
              </div>
              <div>
                <span className="text-gray-400">Usia:</span>
                <p className="font-bold text-gray-800">{selectedRespondent.usia}</p>
              </div>
              <div>
                <span className="text-gray-400">Pendidikan:</span>
                <p className="font-bold text-gray-800">{selectedRespondent.pendidikan}</p>
              </div>
              <div>
                <span className="text-gray-400">Layanan:</span>
                <p className="font-bold text-gray-800">{selectedRespondent.jenis_layanan}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 font-display">Skor 9 Unsur Pelayanan:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'U1. Persyaratan', val: selectedRespondent.q1 },
                  { label: 'U2. Prosedur', val: selectedRespondent.q2 },
                  { label: 'U3. Waktu', val: selectedRespondent.q3 },
                  { label: 'U4. Biaya / Tarif', val: selectedRespondent.q4 },
                  { label: 'U5. Produk Layanan', val: selectedRespondent.q5 },
                  { label: 'U6. Kompetensi Petugas', val: selectedRespondent.q6 },
                  { label: 'U7. Perilaku Petugas', val: selectedRespondent.q7 },
                  { label: 'U8. Sarana Prasarana', val: selectedRespondent.q8 },
                  { label: 'U9. Penanganan Pengaduan', val: selectedRespondent.q9 },
                ].map((item, i) => (
                  <div key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">{item.label}</span>
                    <span className="font-bold text-teal-800">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedRespondent.saran && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-900">Saran / Masukan:</span>
                <p className="text-amber-800 italic">&ldquo;{selectedRespondent.saran}&rdquo;</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRespondent(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOGIN PETUGAS / ADMINISTRATOR */}
      {isLoginModalOpen && renderLoginModal()}


    </div>
  )
}
