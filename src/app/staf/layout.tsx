'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  StaffDashboardProvider,
  useStaffDashboard,
  PeriodType,
} from '@/src/features/dashboard/context/StaffDashboardContext'
import {
  DashboardHeader,
  RespondentDetailModal,
} from '@/src/features/dashboard/components'
import {
  IconX,
  IconTrendingUp,
  IconChartBar,
  IconPieChart,
  IconUsers,
  IconMessageSquare,
  IconDownload,
  IconHome,
  IconPlusCircle,
} from '@/src/components/icons'

function StaffLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const {
    adminUser,
    loading,
    fetchData,
    handleLogout,
    allResponses,
    dashboardPeriod,
    setDashboardPeriod,
    dashboardStartDate,
    setDashboardStartDate,
    dashboardEndDate,
    setDashboardEndDate,
    dashboardFilteredResponses,
    selectedRespondent,
    setSelectedRespondent,
  } = useStaffDashboard()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [pendingPath, setPendingPath] = useState<string | null>(null)

  useEffect(() => {
    setPendingPath(null)
  }, [pathname])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [])

  const navItems = [
    { path: '/staf', label: 'Ringkasan IKM', icon: IconTrendingUp, desc: 'Indeks & Mutu Layanan' },
    { path: '/staf/grafik', label: 'Grafik 9 Unsur', icon: IconChartBar, desc: 'Visualisasi Bar & Radar' },
    { path: '/staf/demografi', label: 'Demografi Responden', icon: IconPieChart, desc: 'Gender, Usia, Pendidikan' },
    { path: '/staf/responden', label: 'Data Responden', icon: IconUsers, desc: `Daftar ${allResponses.length} Responden Terdata` },
    { path: '/staf/saran', label: 'Kritik & Saran', icon: IconMessageSquare, desc: 'Aspirasi & Masukan Warga' },
    { path: '/staf/export', label: 'Export & Unduh Dokumen', icon: IconDownload, desc: 'Rentang Waktu & Live Preview' },
  ]

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col font-sans text-gray-900">
      <DashboardHeader
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        adminUser={adminUser}
        loading={loading}
        fetchData={() => fetchData(true)}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out shadow-lg lg:shadow-none no-print ${
            isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
          }`}
        >
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

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              const isNavigating = pendingPath === item.path && !isActive
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => {
                    if (!isActive) setPendingPath(item.path)
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setIsSidebarOpen(false)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                    isActive || isNavigating
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/20 font-bold'
                      : 'text-gray-700 hover:bg-teal-50/70 hover:text-teal-900 font-medium'
                  }`}
                  title={item.label}
                >
                  <div
                    className={`p-1.5 rounded-lg flex-shrink-0 ${
                      isActive || isNavigating
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-800'
                    }`}
                  >
                    {isNavigating ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {isSidebarOpen && (
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate font-display">
                        <span>{item.label}</span>
                      </div>
                      <div className={`text-[10px] truncate ${isActive || isNavigating ? 'text-white/80' : 'text-gray-400'}`}>
                        {isNavigating ? 'Membuka halaman...' : item.desc}
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}

            <div className="pt-3 my-2 border-t border-gray-100"></div>

            {isSidebarOpen && (
              <div className="px-3 py-3 rounded-xl border border-gray-200 bg-white space-y-2.5">
                <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">Filter Periode</div>
                <select
                  value={dashboardPeriod}
                  onChange={(e) => setDashboardPeriod(e.target.value as PeriodType)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
                >
                  <option value="all">Seluruh Data</option>
                  <option value="tw1">Triwulan I (Jan-Mar)</option>
                  <option value="tw2">Triwulan II (Apr-Jun)</option>
                  <option value="tw3">Triwulan III (Jul-Sep)</option>
                  <option value="tw4">Triwulan IV (Okt-Des)</option>
                  <option value="sem1">Semester I (Jan-Jun)</option>
                  <option value="sem2">Semester II (Jul-Des)</option>
                  <option value="1y">1 Tahun Penuh</option>
                  <option value="custom">Rentang Kustom</option>
                </select>

                {dashboardPeriod === 'custom' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dashboardStartDate}
                      onChange={(e) => setDashboardStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                    <input
                      type="date"
                      value={dashboardEndDate}
                      onChange={(e) => setDashboardEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                )}

                <div className="text-[11px] font-semibold text-gray-500">
                  Menampilkan <strong className="text-teal-700">{dashboardFilteredResponses.length}</strong> responden
                </div>
              </div>
            )}
          </nav>

          <div className="p-3 border-t border-gray-100 space-y-1">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-600 hover:text-teal-800 hover:bg-teal-50 text-xs font-semibold transition"
              title="Profil Pengguna"
            >
              <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                <IconUsers className="w-4 h-4" />
              </div>
              {isSidebarOpen && <span>Edit Profil</span>}
            </Link>

            <Link
              href="/form"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-600 hover:text-teal-800 hover:bg-teal-50 text-xs font-semibold transition"
              title="Isi Survei Baru"
            >
              <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                <IconPlusCircle className="w-4 h-4" />
              </div>
              {isSidebarOpen && <span>Form Survei</span>}
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-600 hover:text-teal-800 hover:bg-teal-50 text-xs font-semibold transition"
              title="Kembali ke Beranda"
            >
              <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                <IconHome className="w-4 h-4" />
              </div>
              {isSidebarOpen && <span>Beranda Publik</span>}
            </Link>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>

      <RespondentDetailModal
        selectedRespondent={selectedRespondent}
        onClose={() => setSelectedRespondent(null)}
      />
    </div>
  )
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffDashboardProvider>
      <StaffLayoutShell>{children}</StaffLayoutShell>
    </StaffDashboardProvider>
  )
}
