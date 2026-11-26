'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IconUsers,
  IconPlusCircle,
  IconRefresh,
  IconCheck,
  IconX,
} from '@/src/components/icons'
import { fetchAdminCached } from '@/src/lib/analytics-cache'

interface User {
  id: string
  username: string
  nama: string
  email?: string
  role: string
  is_active: boolean
  created_at?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'staf'>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('adminToken') || ''
      const data = await fetchAdminCached<User[]>('/api/admin/users/list', token, forceRefresh)
      if (data) {
        setUsers(data)
      }
    } catch (err: any) {
      console.error('Fetch users error:', err)
      setError(err.message || 'Gagal mengambil daftar pengguna.')
    } finally {
      setLoading(false)
    }
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (filterRole === 'all') return true
    return user.role === filterRole
  })

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken') || ''
      const response = await fetch(`/api/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Gagal mengubah status pengguna.')
      }

      // Refresh user list
      fetchUsers(true)
    } catch (err) {
      console.error('Toggle user error:', err)
      alert('Gagal mengubah status pengguna.')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-white/10 font-display">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Manajemen Akun Terdaftar
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 font-display text-white">
            Kelola Pengguna Sistem
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Atur status aktif/nonaktif akun staf dan administrator yang memiliki akses ke sistem SKM Kelurahan Lebakgede.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/add-user"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <IconPlusCircle className="w-4 h-4" />
            <span>Tambah Staf</span>
          </Link>
          <button
            onClick={() => fetchUsers(true)}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
            title="Segarkan Data"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800 font-medium">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold">!</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards & Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Total Pengguna</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 mt-2 font-display">{users.length}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700">
            Seluruh Akun
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Pengguna Aktif</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2 font-display">
            {users.filter((u) => u.is_active).length}
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
            Dapat Login
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Nonaktif</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2 font-display">
            {users.filter((u) => !u.is_active).length}
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700">
            Akses Diblokir
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200 flex flex-col justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-display">Filter Role</p>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
          >
            <option value="all">Semua Role ({users.length})</option>
            <option value="admin">Administrator ({users.filter((u) => u.role === 'admin').length})</option>
            <option value="staf">Staf Kelurahan ({users.filter((u) => u.role === 'staf').length})</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 font-display">Daftar Akun Pengguna</h2>
            <p className="text-xs text-gray-500">Menampilkan {filteredUsers.length} pengguna sesuai filter</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-display text-[11px]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Username</th>
                <th className="px-5 py-3.5 font-bold">Nama Lengkap</th>
                <th className="px-5 py-3.5 font-bold">Email</th>
                <th className="px-5 py-3.5 font-bold">Role</th>
                <th className="px-5 py-3.5 text-center font-bold">Status</th>
                <th className="px-5 py-3.5 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-gray-900">
                      @{user.username}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      {user.nama}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {user.email || '-'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-teal-100 text-teal-800 border border-teal-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-purple-600' : 'bg-teal-600'}`}></span>
                        <span className="capitalize">{user.role}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        user.is_active
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          user.is_active
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    Tidak ada data pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
