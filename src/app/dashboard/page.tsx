'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { UNSUR_NAMES, parseScore } from '@/src/lib/ikm-calculator'
import { AnalyticsData } from '@/src/lib/types/dashboard'
import { fetchAnalyticsCached } from '@/src/lib/analytics-cache'
import {
  LoginModal,
  PublicDashboard,
} from '@/src/features/dashboard/components'

function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999)
}

export default function DashboardPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  const [dashboardPeriod, setDashboardPeriod] = useState<
    'tw1' | 'tw2' | 'tw3' | 'tw4' | 'sem1' | 'sem2' | '1y' | 'all' | 'custom'
  >('all')
  const [dashboardStartDate, setDashboardStartDate] = useState<string>('')
  const [dashboardEndDate, setDashboardEndDate] = useState<string>('')

  useEffect(() => {
    const savedPeriod = localStorage.getItem('dashboardPeriod') as any
    const savedStartDate = localStorage.getItem('dashboardStartDate') || ''
    const savedEndDate = localStorage.getItem('dashboardEndDate') || ''

    if (savedPeriod) setDashboardPeriod(savedPeriod)
    if (savedStartDate) setDashboardStartDate(savedStartDate)
    if (savedEndDate) setDashboardEndDate(savedEndDate)
  }, [])

  useEffect(() => {
    localStorage.setItem('dashboardPeriod', dashboardPeriod)
  }, [dashboardPeriod])

  useEffect(() => {
    localStorage.setItem('dashboardStartDate', dashboardStartDate)
  }, [dashboardStartDate])

  useEffect(() => {
    localStorage.setItem('dashboardEndDate', dashboardEndDate)
  }, [dashboardEndDate])

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const data = await fetchAnalyticsCached()
        if (data) {
          setAnalytics(data)
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err)
      }
    }
    fetchPublicData()
  }, [])

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
          password,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Username atau password salah.')
      }

      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.user))
      setIsLoginModalOpen(false)

      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/staf')
      }
    } catch (err: any) {
      console.error('Dashboard login error:', err)
      setError(err.message || 'Gagal login. Periksa kembali username dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  const allResponses = useMemo(() => analytics?.responses || [], [analytics])

  const dashboardFilteredResponses = useMemo(() => {
    let start: Date | null = null
    let end: Date | null = null
    const currentYear = new Date().getFullYear()

    if (dashboardPeriod === 'tw1') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 2)
    } else if (dashboardPeriod === 'tw2') {
      start = new Date(currentYear, 3, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 5)
    } else if (dashboardPeriod === 'tw3') {
      start = new Date(currentYear, 6, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 8)
    } else if (dashboardPeriod === 'tw4') {
      start = new Date(currentYear, 9, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 11)
    } else if (dashboardPeriod === 'sem1') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 5)
    } else if (dashboardPeriod === 'sem2') {
      start = new Date(currentYear, 6, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 11)
    } else if (dashboardPeriod === '1y') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0)
      end = getLastDayOfMonth(currentYear, 11)
    } else if (dashboardPeriod === 'custom') {
      if (dashboardStartDate) {
        const parts = dashboardStartDate.split('-')
        if (parts.length === 3) {
          start = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0)
        }
      }
      if (dashboardEndDate) {
        const parts = dashboardEndDate.split('-')
        if (parts.length === 3) {
          end = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59, 999)
        }
      }
    }

    if (!start && !end) return allResponses

    return allResponses.filter((r) => {
      const dateVal = r.timestamp || (r as any).created_at || r.waktu
      const d = dateVal ? new Date(dateVal) : null
      if (!d || isNaN(d.getTime())) return true
      if (start && d < start) return false
      if (end && d > end) return false
      return true
    })
  }, [allResponses, dashboardPeriod, dashboardStartDate, dashboardEndDate])

  const derivedStats = useMemo(() => {
    const total = dashboardFilteredResponses.length
    const sums = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 }
    const genderCount: Record<string, number> = {}
    const eduCount: Record<string, number> = {}

    dashboardFilteredResponses.forEach((r: any) => {
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
  }, [dashboardFilteredResponses])

  return (
    <>
      <PublicDashboard
        derivedStats={derivedStats}
        onLoginClick={() => setIsLoginModalOpen(true)}
        dashboardPeriod={dashboardPeriod}
        setDashboardPeriod={setDashboardPeriod}
        dashboardStartDate={dashboardStartDate}
        setDashboardStartDate={setDashboardStartDate}
        dashboardEndDate={dashboardEndDate}
        setDashboardEndDate={setDashboardEndDate}
        filteredResponseCount={dashboardFilteredResponses.length}
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
