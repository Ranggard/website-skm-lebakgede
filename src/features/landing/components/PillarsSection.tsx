import React from 'react'

export const PillarsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all">
        <div className="w-10 h-10 mb-3 rounded-xl bg-teal-400/20 text-teal-200 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="font-bold text-base text-white font-display">Cepat & Ringkas</div>
        <div className="text-xs text-white/75 mt-1">
          Pengisian dirancang efektif hanya 2–3 menit untuk 9 indikator pelayanan.
        </div>
        <span className="sr-only">Quick & Easy</span>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all">
        <div className="w-10 h-10 mb-3 rounded-xl bg-emerald-400/20 text-emerald-200 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="font-bold text-base text-white font-display">Aman & Terpercaya</div>
        <div className="text-xs text-white/75 mt-1">
          Data Anda bersifat anonim, tersimpan rapi, dan dilindungi regulasi kerahasiaan.
        </div>
        <span className="sr-only">Secure</span>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all">
        <div className="w-10 h-10 mb-3 rounded-xl bg-amber-400/20 text-amber-200 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="font-bold text-base text-white font-display">Berdampak Nyata</div>
        <div className="text-xs text-white/75 mt-1">
          Aspirasi Anda langsung dievaluasi pimpinan kelurahan untuk peningkatan mutu layanan.
        </div>
        <span className="sr-only">Impactful</span>
      </div>
    </div>
  )
}

