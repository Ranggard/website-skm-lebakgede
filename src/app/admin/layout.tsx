'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getUserFromStorage, getTokenFromStorage, clearSessionFromStorage } from '@/src/lib/auth-helper'
import {
  IconMenu,
  IconX,
  IconHome,
  IconChartBar,
  IconUsers,
  IconBookOpen,
  IconLogout,
  IconPlusCircle,
  IconActivity,
} from '@/src/components/icons'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ username: string; nama: string; role: string } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [pendingPath, setPendingPath] = useState<string | null>(null)

  useEffect(() => {
    setPendingPath(null)
  }, [pathname])

  useEffect(() => {
    const storageUser = getUserFromStorage()
    const storageToken = getTokenFromStorage()

    if (!storageUser || !storageToken) {
      router.push('/dashboard')
      return
    }

    // Check if user has admin or staff role
    if (!['admin', 'staf'].includes(storageUser.role)) {
      router.push('/dashboard')
      return
    }

    setUser(storageUser)
    setLoading(false)

    // Auto-close sidebar on small screens
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
    } catch (e) {}
    clearSessionFromStorage()
    router.push('/dashboard')
  }

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: IconHome, desc: 'Ringkasan & Aktivitas' },
    { path: '/admin/stats', label: 'Statistik', icon: IconChartBar, desc: 'Analisis IKM Lengkap' },
    { path: '/admin/respondents', label: 'Riwayat Responden', icon: IconUsers, desc: 'Data Survei Masuk' },
    { path: '/admin/login-history', label: 'Riwayat Login', icon: IconActivity, desc: 'Log Keamanan Pengguna' },
    { path: '/admin/add-user', label: 'Tambah Pengguna', icon: IconPlusCircle, desc: 'Registrasi Akun Baru' },
    { path: '/admin/users', label: 'Kelola Pengguna', icon: IconBookOpen, desc: 'Daftar Akun & Peran' },
    { path: '/admin/settings', label: 'Pengaturan', icon: IconLogout, desc: 'Konfigurasi Sistem' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-sm font-semibold text-gray-600">Memuat Admin Panel...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
        } fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out shadow-lg lg:shadow-none no-print`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="px-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 font-display">
                Menu Utama Admin
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

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            const isNavigating = pendingPath === item.path && !active
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => {
                  if (!active) setPendingPath(item.path)
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setIsSidebarOpen(false)
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                  active || isNavigating
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/20 font-bold'
                    : 'text-gray-700 hover:bg-teal-50/70 hover:text-teal-900 font-medium'
                }`}
                title={item.label}
              >
                <div
                  className={`p-1.5 rounded-lg flex-shrink-0 ${
                    active || isNavigating ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-800'
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
                    <div className={`text-[10px] truncate ${active || isNavigating ? 'text-white/80' : 'text-gray-400'}`}>
                      {isNavigating ? 'Membuka halaman...' : item.desc}
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-600 hover:text-teal-800 hover:bg-teal-50 text-xs font-semibold transition"
            title="Profil Pengguna"
          >
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
              <IconUsers className="w-4 h-4" />
            </div>
            {isSidebarOpen && <span>Profil ({user.nama || user.username})</span>}
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
            title="Keluar"
          >
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <IconLogout className="w-4 h-4" />
            </div>
            {isSidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs no-print">
          <div className="flex items-center gap-3">
            {/* Hamburger button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-teal-700 hover:bg-teal-50 border border-gray-200 transition-all flex items-center justify-center cursor-pointer"
              title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
              aria-label="Toggle Navigation Sidebar"
            >
              <IconMenu className="w-5 h-5 text-gray-700" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center">
                <img src="/lebakgede.png" alt="Logo Kelurahan Lebakgede" className="h-8 w-8 object-contain drop-shadow-sm" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight font-display flex items-center gap-1.5">
                  <span>Admin Panel SKM</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
                    <span>Admin: {user.username}</span>
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 leading-none">
                  Kelurahan Lebakgede • Coblong
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/staf"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition"
            >
              <IconChartBar className="w-3.5 h-3.5" />
              <span>Lihat Halaman Staf</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 flex items-center gap-1.5 cursor-pointer"
              title="Keluar dari Admin Panel"
            >
              <IconLogout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs lg:hidden z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
