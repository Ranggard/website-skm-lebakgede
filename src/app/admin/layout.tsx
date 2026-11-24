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
    { path: '/admin', label: 'Dashboard', icon: IconHome },
    { path: '/admin/stats', label: 'Statistik', icon: IconChartBar },
    { path: '/admin/respondents', label: 'Riwayat Responden', icon: IconUsers },
    { path: '/admin/login-history', label: 'Riwayat Login', icon: IconActivity },
    { path: '/admin/add-user', label: 'Tambah Pengguna', icon: IconPlusCircle },
    { path: '/admin/users', label: 'Kelola Pengguna', icon: IconBookOpen },
    { path: '/admin/settings', label: 'Pengaturan', icon: IconLogout },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static lg:translate-x-0 w-64 h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white transition-transform duration-300 ease-in-out z-50 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-600">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-blue-200 mt-1">{user.nama}</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setIsSidebarOpen(false)
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-600 space-y-2">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
          >
            <IconUsers className="w-5 h-5" />
            <span className="font-medium">Profil</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-red-600 hover:text-white transition-colors text-left"
          >
            <IconLogout className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <IconX className="w-6 h-6 text-gray-700" />
            ) : (
              <IconMenu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
