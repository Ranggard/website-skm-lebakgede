import React from 'react'
import Link from 'next/link'

export const LandingHeader: React.FC = () => {
  return (
    <header className="w-full px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between border-b border-white/10 bg-teal-950/40 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center logo-float">
          <img
            src="/lebakgede.png"
            alt="Logo Kelurahan Lebakgede"
            className="h-9 w-9 object-contain drop-shadow-md"
          />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 font-display">
            Pemerintah Kota Bandung
          </div>
          <div className="text-sm sm:text-base font-bold text-white leading-tight font-display">
            Kecamatan Coblong • Kelurahan Lebakgede
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-teal-100 hover:text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all"
          title="Lihat Dashboard Publik & Petugas"
        >
          <svg className="w-3.5 h-3.5 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Dashboard SKM</span>
        </Link>
      </div>
    </header>
  )
}

