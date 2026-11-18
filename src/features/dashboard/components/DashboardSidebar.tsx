import React from 'react'
import Link from 'next/link'
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

export type TabId = 'ringkasan' | 'grafik' | 'demografi' | 'responden' | 'saran' | 'export'

interface DashboardSidebarProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (v: boolean) => void
  activeTab: TabId
  setActiveTab: (t: TabId) => void
  totalResponses: number
  dashboardPeriod?: 'tw1' | 'tw2' | 'tw3' | 'tw4' | 'sem1' | 'sem2' | '1y' | 'all' | 'custom'
  setDashboardPeriod?: (v: 'tw1' | 'tw2' | 'tw3' | 'tw4' | 'sem1' | 'sem2' | '1y' | 'all' | 'custom') => void
  dashboardStartDate?: string
  setDashboardStartDate?: (v: string) => void
  dashboardEndDate?: string
  setDashboardEndDate?: (v: string) => void
  filteredResponseCount?: number
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  totalResponses,
  dashboardPeriod = 'all',
  setDashboardPeriod,
  dashboardStartDate = '',
  setDashboardStartDate,
  dashboardEndDate = '',
  setDashboardEndDate,
  filteredResponseCount = 0,
}) => {
  const navItems = [
    { id: 'ringkasan', label: 'Ringkasan IKM', icon: IconTrendingUp, desc: 'Indeks & Mutu Layanan' },
    { id: 'grafik', label: 'Grafik 9 Unsur', icon: IconChartBar, desc: 'Visualisasi Bar & Radar' },
    { id: 'demografi', label: 'Demografi Responden', icon: IconPieChart, desc: 'Gender, Usia, Pendidikan' },
    { id: 'responden', label: 'Data Responden', icon: IconUsers, desc: `Daftar ${totalResponses} Responden Terdata` },
    { id: 'saran', label: 'Kritik & Saran', icon: IconMessageSquare, desc: 'Aspirasi & Masukan Warga' },
    { id: 'export', label: 'Export & Unduh Dokumen', icon: IconDownload, desc: 'Rentang Waktu & Live Preview' },
  ] as const

  return (
    <>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out shadow-lg lg:shadow-none no-print ${
          isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
        }`}
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
                  setActiveTab(item.id as TabId)
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setIsSidebarOpen(false)
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/20 font-bold'
                    : 'text-gray-700 hover:bg-teal-50/70 hover:text-teal-900 font-medium'
                }`}
                title={item.label}
              >
                <div
                  className={`p-1.5 rounded-lg flex-shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-800'
                  }`}
                >
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

          {/* FILTER PERIODE SECTION */}
          {isSidebarOpen && setDashboardPeriod && (
            <div className="px-3 py-3 rounded-xl border border-gray-200 bg-white space-y-2.5">
              <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">Filter Periode</div>
              
              <select
                value={dashboardPeriod}
                onChange={(e) => setDashboardPeriod(e.target.value as any)}
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

              {dashboardPeriod === 'custom' && setDashboardStartDate && setDashboardEndDate && (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dashboardStartDate}
                    onChange={(e) => setDashboardStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    placeholder="Tanggal Mulai"
                  />
                  <div className="text-xs text-gray-500 text-center font-semibold">sampai</div>
                  <input
                    type="date"
                    value={dashboardEndDate}
                    onChange={(e) => setDashboardEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    placeholder="Tanggal Akhir"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{filteredResponseCount} Responden</span>
              </div>
            </div>
          )}

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
      </aside>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden no-print"
        ></div>
      )}
    </>
  )
}

