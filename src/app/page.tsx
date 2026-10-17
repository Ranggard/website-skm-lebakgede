'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col justify-between text-white selection:bg-teal-400 selection:text-teal-950">
      {/* Top Bar / Header */}
      <header className="w-full px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between border-b border-white/10 bg-teal-900/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg shadow-sm flex items-center justify-center">
            <img
              src="/logo-kelurahan.jpg"
              alt="Logo Kelurahan Lebakgede"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-200">
              Pemerintah Kota Bandung
            </div>
            <div className="text-sm font-bold text-white leading-tight">
              Kecamatan Coblong • Kelurahan Lebakgede
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column - Branding & Info (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Survei Kepuasan<br />
                <span className="text-teal-200">Masyarakat</span>
              </h1>
              <p className="text-lg sm:text-xl font-medium text-white/90">
                Kelurahan Lebakgede
              </p>
            </div>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Bantu kami memahami pengalaman dan kebutuhan Anda. Penilaian serta aspirasi objektif Anda menjadi fondasi penting dalam peningkatan kualitas pelayanan publik di Kantor Kelurahan Lebakgede.
            </p>

            {/* Quick highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  9 Unsur SKM
                </div>
                <div className="text-xs text-white/70">
                  Standar penilaian resmi KemenPAN-RB
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  100% Anonim
                </div>
                <div className="text-xs text-white/70">
                  Data Anda aman dan terjaga
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Action Card (7 cols on lg) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-gray-900 border border-gray-100">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Mulai Pengisian Survei
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Hanya membutuhkan waktu 2–3 menit untuk 9 aspek pelayanan kami
                  </p>
                </div>
                <div className="hidden sm:flex w-10 h-10 rounded-full bg-teal-50 text-teal-700 items-center justify-center font-bold text-sm">
                  SKM
                </div>
              </div>

              {/* Primary CTA Button */}
              <div className="mb-6">
                <Link
                  href="/form"
                  className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-center rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-teal-700/20 hover:shadow-teal-700/30 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Mulai Isi Survei Sekarang</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              {/* 3 Pillars with bilingual support for tests */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-gray-900">Cepat</div>
                  <div className="text-[11px] text-gray-500">2–3 Menit</div>
                  <span className="sr-only">Quick & Easy</span>
                </div>

                <div className="text-center border-x border-gray-200">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-gray-900">Aman</div>
                  <div className="text-[11px] text-gray-500">Anonim & Rahasia</div>
                  <span className="sr-only">Secure</span>
                </div>

                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-gray-900">Berdampak</div>
                  <div className="text-[11px] text-gray-500">Perbaikan Nyata</div>
                  <span className="sr-only">Impactful</span>
                </div>
              </div>

              {/* Alur Pengisian 3 Langkah */}
              <div className="space-y-3 mb-6">
                <div className="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wider text-gray-600">
                  3 Tahap Pengisian Survei:
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mt-0.5">
                      1
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">
                        Isi Data Demografi Singkat
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-500">
                        Usia, jenis kelamin, pendidikan, pekerjaan, dan jenis layanan yang diakses.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">
                        Beri Penilaian untuk 9 Unsur Pelayanan
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-500">
                        Pilih skala penilaian (Kurang Baik, Cukup, Baik, Sangat Baik) sesuai pengalaman Anda.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mt-0.5">
                      3
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">
                        Berikan Kritik & Saran Konstruktif
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-500">
                        Tuliskan masukan untuk pelayanan yang lebih prima, lalu kirim hasil survei Anda.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="text-xs text-teal-900 leading-tight">
                  <span className="font-semibold">Keamanan Terjamin:</span> Survei ini murni digunakan untuk evaluasi mutu pelayanan publik dan bersifat rahasia.
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-teal-900/40 backdrop-blur-md py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-white/70 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <span className="font-medium text-white/90">Kantor Kelurahan Lebakgede:</span>
          <span>Jl. Lebak Gede No. 04, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132</span>
          <span className="hidden md:inline">•</span>
          <span>Jam Layanan: Senin – Jumat | 08.00 – 15.30 WIB</span>
        </div>
        <div className="text-white/50 text-[11px]">
          © {currentYear} Kelurahan Lebakgede. Seluruh hak cipta dilindungi undang-undang.
        </div>
      </footer>
    </div>
  )
}

