import React from 'react'
import { IconX } from '@/src/components/icons'
import { ResponseRow } from '@/src/lib/types/dashboard'

interface RespondentDetailModalProps {
  selectedRespondent: ResponseRow | null
  onClose: () => void
}

export const RespondentDetailModal: React.FC<RespondentDetailModalProps> = ({
  selectedRespondent,
  onClose,
}) => {
  if (!selectedRespondent) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h4 className="text-base font-extrabold text-gray-900 font-display">
              Detail Responden: {selectedRespondent.id}
            </h4>
            <p className="text-xs text-gray-500">Waktu: {selectedRespondent.waktu}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <span className="text-gray-400">Jenis Kelamin:</span>
            <p className="font-bold text-gray-800">{selectedRespondent.jenis_kelamin}</p>
          </div>
          <div>
            <span className="text-gray-400">Usia:</span>
            <p className="font-bold text-gray-800">{selectedRespondent.usia}</p>
          </div>
          <div>
            <span className="text-gray-400">Pendidikan:</span>
            <p className="font-bold text-gray-800">{selectedRespondent.pendidikan}</p>
          </div>
          <div>
            <span className="text-gray-400">Layanan:</span>
            <p className="font-bold text-gray-800">{selectedRespondent.jenis_layanan}</p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-700 font-display">Skor 9 Unsur Pelayanan:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { label: 'U1. Persyaratan', val: selectedRespondent.q1 },
              { label: 'U2. Prosedur', val: selectedRespondent.q2 },
              { label: 'U3. Waktu', val: selectedRespondent.q3 },
              { label: 'U4. Biaya / Tarif', val: selectedRespondent.q4 },
              { label: 'U5. Produk Layanan', val: selectedRespondent.q5 },
              { label: 'U6. Kompetensi Petugas', val: selectedRespondent.q6 },
              { label: 'U7. Perilaku Petugas', val: selectedRespondent.q7 },
              { label: 'U8. Sarana Prasarana', val: selectedRespondent.q8 },
              { label: 'U9. Penanganan Pengaduan', val: selectedRespondent.q9 },
            ].map((item, i) => (
              <div key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-gray-600 font-medium">{item.label}</span>
                <span className="font-bold text-teal-800">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedRespondent.saran && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-amber-900">Saran / Masukan:</span>
            <p className="text-amber-800 italic">&ldquo;{selectedRespondent.saran}&rdquo;</p>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

