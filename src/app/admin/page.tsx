'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IconChartBar,
  IconUsers,
  IconActivity,
  IconPlusCircle,
  IconTrendingUp,
  IconBookOpen,
  IconRefresh,
} from '@/src/components/icons'
import { fetchAdminCached } from '@/src/lib/analytics-cache'

interface AdminStats {
  totalResponses: number
  totalUsers: number
  totalLogins: number
  averageSatisfaction: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async (forceRefresh = false) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken') || ''
      const data = await fetchAdminCached<AdminStats>('/api/admin/stats', token, forceRefresh)
      if (data) {
        setStats(data)
      }
    } catch (err: any) {
      console.error('Fetch stats error:', err)
    } finally {
      setLoading(false)
    }
  }

  const convertedSatisfaction = stats?.averageSatisfaction ? (stats.averageSatisfaction * 25).toFixed(2) : '0'

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 fade-in">
      {/* Hero Banner with Staf theme */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-white/10 font-display">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Panel Administrasi & Pengendalian Sistem SKM
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 font-display">
            Dashboard Administrator
          </h1>
          <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
            Kelola responden survei, kontrol akun petugas dan lurah, serta pantau integritas aktivitas sistem Kelurahan Lebakgede.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <IconRefresh className="w-4 h-4" />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Responden */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Total Responden</p>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <IconUsers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-teal-700 font-display">{stats?.totalResponses || 0}</h3>
            <span className="text-xs text-gray-400">Responden Masuk</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Survei Terverifikasi
          </span>
        </div>

        {/* Card 2: Total Pengguna */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Total Pengguna</p>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <IconPlusCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-emerald-600 font-display">{stats?.totalUsers || 0}</h3>
            <span className="text-xs text-gray-400">Akun Terdaftar</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Admin, Staf & Lurah
          </span>
        </div>

        {/* Card 3: Total Login */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Total Aktivitas Login</p>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <IconActivity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-indigo-700 font-display">{stats?.totalLogins || 0}</h3>
            <span className="text-xs text-gray-400">Sesi Tercatat</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Log Sistem Aman
          </span>
        </div>

        {/* Card 4: Rata-rata Kepuasan */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Rata-rata Kepuasan</p>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <IconChartBar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-amber-600 font-display">{convertedSatisfaction}</h3>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
            Skala Konversi IKM
          </span>
        </div>
      </div>

      {/* Quick Stats & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-display">Status Operasional Sistem</h2>
              <p className="text-xs text-gray-500">Kondisi infrastruktur dan sinkronisasi basis data</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Semua Layanan Berjalan Normal
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-gray-100/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Status Aplikasi Web</span>
                  <span className="text-[11px] text-gray-500">Server Next.js App Router</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                Online & Aktif
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-gray-100/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Koneksi Database Supabase</span>
                  <span className="text-[11px] text-gray-500">PostgreSQL Connection Pool</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                Terkoneksi
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-gray-100/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Waktu Sinkronisasi Terakhir</span>
                  <span className="text-[11px] text-gray-500">Local System Timestamp</span>
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-200">
                {new Date().toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Card Petugas */}
        <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 text-[11px] font-semibold mb-3">
              <IconTrendingUp className="w-3.5 h-3.5" />
              <span>Akses Cepat Petugas</span>
            </div>
            <h3 className="text-lg font-bold font-display">Tinjau Rekapitulasi SKM</h3>
            <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
              Anda juga dapat mengakses tampilan visual grafik 9 unsur dan laporan publik yang sama dengan yang dilihat oleh staf kelurahan.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/15">
            <Link
              href="/staf"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-teal-900 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-md transition"
            >
              <IconChartBar className="w-4 h-4 text-teal-700" />
              <span>Buka Tampilan Staf</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 font-display">Akses Cepat Menu Admin</h2>
          <p className="text-xs text-gray-500">Navigasi langsung ke modul manajemen data dan hak akses</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/stats"
            className="group p-5 bg-white border border-gray-200 hover:border-teal-300 rounded-2xl hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <IconChartBar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">
              Statistik Lengkap
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Analisis 9 unsur pelayanan, nilai konversi, dan mutu layanan.
            </p>
          </Link>

          <Link
            href="/admin/respondents"
            className="group p-5 bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <IconUsers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
              Riwayat Responden
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Daftar survei warga masyarakat yang telah masuk ke database.
            </p>
          </Link>

          <Link
            href="/admin/login-history"
            className="group p-5 bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <IconActivity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
              Riwayat Login
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Pantau log waktu dan aktivitas masuk seluruh pengguna sistem.
            </p>
          </Link>

          <Link
            href="/admin/add-user"
            className="group p-5 bg-white border border-gray-200 hover:border-amber-300 rounded-2xl hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <IconPlusCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
              Tambah Pengguna
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Registrasi akun staf atau lurah baru dengan kredensial aman.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
