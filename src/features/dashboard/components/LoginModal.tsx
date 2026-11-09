import React from 'react'
import { IconLock, IconEye, IconEyeOff } from '@/src/components/icons'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  handleLogin: (e: React.FormEvent) => void
  username: string
  setUsername: (v: string) => void
  password: string
  setPassword: (v: string) => void
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  loading: boolean
  error: string | null
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  handleLogin,
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  error,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-emerald-100 text-teal-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <IconLock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 font-display">
            Akses Petugas SKM
          </h3>
          <p className="text-xs text-gray-500">
            Masuk untuk mengakses rincian data responden dan ekspor berkas.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Username Petugas
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-hidden"
              placeholder="Masukkan username Anda"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-hidden pr-10"
                placeholder="Masukkan kata sandi"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition disabled:opacity-50"
            >
              {loading ? 'Memeriksa...' : 'Masuk Petugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

