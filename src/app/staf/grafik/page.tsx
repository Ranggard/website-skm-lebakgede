'use client'

import React, { useState, useEffect } from 'react'
import { useStaffDashboard } from '@/src/features/dashboard/context/StaffDashboardContext'
import { TabGrafik } from '@/src/features/dashboard/components'

export default function StaffGrafikPage() {
  const { derivedStats } = useStaffDashboard()
  const [activeChartView, setActiveChartView] = useState<'bar' | 'radar'>('bar')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <TabGrafik
      derivedStats={derivedStats}
      activeChartView={activeChartView}
      setActiveChartView={setActiveChartView}
      isMounted={isMounted}
    />
  )
}
