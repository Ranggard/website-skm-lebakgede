import React from 'react'

export const FlowStepsSection: React.FC = () => {
  return (
    <div className="bg-teal-950/40 backdrop-blur-md rounded-2xl p-6 border border-white/10">
      <div className="text-xs font-bold uppercase tracking-wider text-teal-300 font-display mb-4">
        3 Langkah Mudah Partisipasi Survei:
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-teal-950 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
            1
          </div>
          <div>
            <div className="text-sm font-bold text-white font-display">Isi Profil Singkat</div>
            <div className="text-xs text-white/70 mt-0.5">
              Usia, gender, pendidikan, dan jenis layanan yang diurus.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-teal-950 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
            2
          </div>
          <div>
            <div className="text-sm font-bold text-white font-display">Beri Penilaian 9 Aspek</div>
            <div className="text-xs text-white/70 mt-0.5">
              Pilih tingkat kepuasan dari Kurang hingga Sangat Baik.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-teal-950 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
            3
          </div>
          <div>
            <div className="text-sm font-bold text-white font-display">Kirim Kritik & Saran</div>
            <div className="text-xs text-white/70 mt-0.5">
              Sampaikan masukan konstruktif untuk Kelurahan Lebakgede.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

