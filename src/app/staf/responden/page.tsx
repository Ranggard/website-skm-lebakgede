'use client'

import React, { useState, useMemo } from 'react'
import { useStaffDashboard } from '@/src/features/dashboard/context/StaffDashboardContext'
import { TabResponden } from '@/src/features/dashboard/components'

export default function StaffRespondenPage() {
  const { allResponses, dashboardFilteredResponses, setSelectedRespondent } = useStaffDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterService, setFilterService] = useState('ALL')
  const [filterGender, setFilterGender] = useState('ALL')
  const [filterAgeGroup, setFilterAgeGroup] = useState('ALL')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterService('ALL')
    setFilterGender('ALL')
    setFilterAgeGroup('ALL')
    setFilterStartDate('')
    setFilterEndDate('')
    setCurrentPage(1)
  }

  const uniqueServices = useMemo(() => {
    const services = new Set<string>()
    allResponses.forEach((r) => {
      if (r.jenis_layanan && r.jenis_layanan !== '-') {
        services.add(r.jenis_layanan)
      }
    })
    return Array.from(services)
  }, [allResponses])

  const filteredResponses = useMemo(() => {
    return dashboardFilteredResponses.filter((item) => {
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

      let matchesAge = true
      const numAge = parseInt(item.usia, 10)
      if (!isNaN(numAge)) {
        if (filterAgeGroup === 'under_20') matchesAge = numAge < 20
        else if (filterAgeGroup === '20_30') matchesAge = numAge >= 20 && numAge <= 30
        else if (filterAgeGroup === '31_45') matchesAge = numAge >= 31 && numAge <= 45
        else if (filterAgeGroup === '46_60') matchesAge = numAge >= 46 && numAge <= 60
        else if (filterAgeGroup === 'above_60') matchesAge = numAge > 60
      }

      let matchesDate = true
      if (filterStartDate || filterEndDate) {
        const itemDateStr = item.timestamp || item.waktu
        const itemDate = new Date(itemDateStr)
        if (!isNaN(itemDate.getTime())) {
          if (filterStartDate) {
            const startParts = filterStartDate.split('-')
            const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]), 0, 0, 0, 0)
            if (itemDate < start) matchesDate = false
          }
          if (filterEndDate) {
            const endParts = filterEndDate.split('-')
            const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]), 23, 59, 59, 999)
            if (itemDate > end) matchesDate = false
          }
        }
      }

      return matchesSearch && matchesService && matchesGender && matchesAge && matchesDate
    })
  }, [dashboardFilteredResponses, searchQuery, filterService, filterGender, filterAgeGroup, filterStartDate, filterEndDate])

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage) || 1
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredResponses.slice(start, start + itemsPerPage)
  }, [filteredResponses, currentPage])

  return (
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
      onResetFilters={handleResetFilters}
      uniqueServices={uniqueServices}
      paginatedResponses={paginatedResponses}
      filteredResponses={filteredResponses}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      totalPages={totalPages}
      setSelectedRespondent={setSelectedRespondent}
    />
  )
}
