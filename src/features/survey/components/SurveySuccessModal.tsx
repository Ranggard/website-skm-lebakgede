import React from 'react'

interface SurveySuccessModalProps {
  isOpen: boolean
  redirectCountdown: number
  onReset: () => void
  onGoToDashboard: () => void
  respondentCode?: string | null
}

export const SurveySuccessModal: React.FC<SurveySuccessModalProps> = ({
  isOpen,
  redirectCountdown,
  onReset,
  onGoToDashboard,
  respondentCode,
}) => {
  if (!isOpen) return null

  return (
    <div
      id="success-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
    >
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center transform scale-100 transition-transform duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-script text-4xl text-teal-800 mb-1 font-normal tracking-wide">
          Hatur Nuhun!
        </h3>
        <h4 className="text-base font-bold text-emerald-700 mb-3 font-display">
          Terima Kasih Banyak Atas Partisipasi Anda
        </h4>
        <p className="text-gray-600 mb-5 leading-relaxed text-sm">
          Data kuesioner Anda telah berhasil masuk ke database{' '}
          <strong>Kelurahan Lebakgede</strong> secara aman. Partisipasi Anda sangat berharga bagi kami
          untuk terus meningkatkan kualitas pelayanan publik masyarakat Kecamatan Coblong.
        </p>
        {/* Nomor Bukti Survei */}
        {respondentCode && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-4 text-center">
            <p className="text-xs text-emerald-700 font-semibold mb-1">📋 Nomor Bukti Survei Anda</p>
            <p className="text-base font-black text-emerald-900 font-mono tracking-widest">{respondentCode}</p>
            <p className="text-[10px] text-emerald-600 mt-1">Simpan nomor ini sebagai bukti partisipasi Anda</p>
          </div>
        )}

        <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-3 mb-5 flex items-center justify-center gap-2 text-xs font-semibold text-teal-800">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span>
            Mengalihkan ke Dashboard dalam{' '}
            <span className="font-extrabold text-teal-900 font-mono text-sm">{redirectCountdown}</span> detik...
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            id="btn-modal-close"
            onClick={onReset}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
          >
            Isi Survei Baru
          </button>
          <button
            type="button"
            onClick={onGoToDashboard}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            Ke Dashboard Sekarang →
          </button>
        </div>
      </div>
    </div>
  )
}

