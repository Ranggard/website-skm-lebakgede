import React from 'react'

interface LandingFooterProps {
  currentYear: number
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ currentYear }) => {
  return (
    <footer className="w-full border-t border-white/10 bg-teal-950/50 backdrop-blur-md py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-white/70 space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        <span className="font-semibold text-white/90">Kantor Kelurahan Lebakgede:</span>
        <span>Jl. Tubagus Ismail Bawah No. 5, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132</span>
        <span className="hidden md:inline">•</span>
        <span>Jam Layanan: Senin – Jumat | 08.00 – 15.30 WIB</span>
      </div>
      <div className="text-white/50 text-[11px]">
        © {currentYear} Kelurahan Lebakgede Kota Bandung. Seluruh hak cipta dilindungi undang-undang.
      </div>
    </footer>
  )
}

