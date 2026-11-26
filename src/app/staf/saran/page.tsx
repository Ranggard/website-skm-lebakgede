'use client'

import React from 'react'
import { useStaffDashboard } from '@/src/features/dashboard/context/StaffDashboardContext'
import { TabSaran } from '@/src/features/dashboard/components'

export default function StaffSaranPage() {
  const { allResponses, dashboardFilteredResponses, setSelectedRespondent } = useStaffDashboard()

  return (
    <TabSaran
      allResponses={allResponses}
      filteredResponses={dashboardFilteredResponses}
      setSelectedRespondent={setSelectedRespondent}
    />
  )
}
