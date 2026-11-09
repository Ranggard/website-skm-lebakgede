'use client'

import React, { useState, useEffect } from 'react'
import { HomeSummary, INITIAL_HOME_SUMMARY } from '@/src/features/landing/types'
import {
  LandingHeader,
  HeroSection,
  PillarsSection,
  FlowStepsSection,
  LandingFooter,
} from '@/src/features/landing/components'

export default function Home() {
  const currentYear = new Date().getFullYear()
  const [summary, setSummary] = useState<HomeSummary>(INITIAL_HOME_SUMMARY)
  const [, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          const total = json.data.totalResponses || 0
          setSummary({
            mutuPelayanan: total > 0 ? (json.data.mutuPelayanan || '-') : '-',
            kinerjaUnit: total > 0 ? (json.data.kinerjaUnitPelayanan || '-') : 'Belum Ada Data',
            ikmKonversi: total > 0 ? Number(json.data.ikmKonversi || 0) : null,
            ikmSkala4: total > 0 ? Number(json.data.ikmSkala4 || 0) : null,
            totalResponden: total,
            elements: json.data.elements || {},
            demographics: json.data.demographics || {},
          })
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat ringkasan analitik beranda:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen flex flex-col justify-between text-white selection:bg-emerald-400 selection:text-emerald-950 font-sans">
      <LandingHeader />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <HeroSection summary={summary} />
        <PillarsSection />
        <FlowStepsSection />
      </main>
      <LandingFooter currentYear={currentYear} />
    </div>
  )
}
