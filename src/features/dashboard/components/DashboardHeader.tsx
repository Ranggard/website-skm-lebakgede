import React from 'react'
import Link from 'next/link'
import { IconMenu, IconPlusCircle, IconRefresh, IconLogout } from '@/src/components/icons'

interface DashboardHeaderProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (v: boolean) => void
  adminUser: { username: string; role: string; nama?: string } | null
  loading: boolean
  fetchData: () => void
  handleLogout: () => void
  dashboardPeriod: 'tw1' | 'tw2' | 'tw3' | 'tw4' | 'sem1' | 'sem2' | '1y' | 'all' | 'custom'
  setDashboardPeriod: (v: 'tw1' | 'tw2' | 'tw3' | 'tw4' | 'sem1' | 'sem2' | '1y' | 'all' | 'custom') => void
  dashboardStartDate: string
  setDashboardStartDate: (v: string) => void
  dashboardEndDate: string
  setDashboardEndDate: (v: string) => void
  filteredResponseCount: number
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  adminUser,
  loading,
  fetchData,
  handleLogout,
  dashboardPeriod,
  setDashboardPeriod,
  dashboardStartDate,
  setDashboardStartDate,
  dashboardEndDate,
  setDashboardEndDate,
  filteredResponseCount,
}) => {
  return (
    <header className="flex-shrink-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 flex flex-col gap-3 shadow-xs no-print">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger toggle button (garis 3) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-gray-600 hover:text-teal-700 hover:bg-teal-50 border border-gray-200 transition-all flex items-center justify-center cursor-pointer"
            title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar (Garis 3)'}
            aria-label="Toggle Navigation Sidebar"
          >
            {isSidebarOpen ? <IconMenu className="w-5 h-5 text-teal-700" /> : <IconMenu className="w-5 h-5 text-gray-700" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center logo-float">
              <img src="/lebakgede.png" alt="Logo Kelurahan Lebakgede" className="h-8 w-8 object-contain drop-shadow-sm" />
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
            onClick={fetchData}
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
      </div>

      {/* Dashboard Period Filter Row */}
      <div className="flex items-center gap-3 flex-wrap pb-2 border-t border-gray-200/50 pt-3">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Filter Periode:</label>
        
        <select
          value={dashboardPeriod}
          onChange={(e) => setDashboardPeriod(e.target.value as any)}
          className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
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
          <>
            <input
              type="date"
              value={dashboardStartDate}
              onChange={(e) => setDashboardStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              placeholder="Tanggal Mulai"
            />
            <span className="text-xs text-gray-500 font-semibold">sampai</span>
            <input
              type="date"
              value={dashboardEndDate}
              onChange={(e) => setDashboardEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              placeholder="Tanggal Akhir"
            />
          </>
        )}

        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{filteredResponseCount} Responden</span>
        </div>
      </div>
    </header>
  )
}

