'use client'

import React from 'react'
import { useStaffDashboard } from '@/src/features/dashboard/context/StaffDashboardContext'
import { TabDemografi } from '@/src/features/dashboard/components'

export default function StaffDemografiPage() {
  const { derivedStats } = useStaffDashboard()

  return <TabDemografi derivedStats={derivedStats} />
}
