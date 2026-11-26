'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useStaffDashboard } from '@/src/features/dashboard/context/StaffDashboardContext'
import { TabRingkasan } from '@/src/features/dashboard/components'

export default function StaffRingkasanPage() {
  const router = useRouter()
  const { derivedStats, dashboardPeriod, isAuthenticated } = useStaffDashboard()

  return (
    <TabRingkasan
      derivedStats={derivedStats}
      dashboardPeriod={dashboardPeriod}
      isAuthenticated={isAuthenticated}
      setIsLoginModalOpen={() => {}}
      setActiveTab={(tab) => {
        const routeMap: Record<string, string> = {
          ringkasan: '/staf',
          grafik: '/staf/grafik',
          demografi: '/staf/demografi',
          responden: '/staf/responden',
          saran: '/staf/saran',
          export: '/staf/export',
        }
        router.push(routeMap[tab] || '/staf')
      }}
    />
  )
}
