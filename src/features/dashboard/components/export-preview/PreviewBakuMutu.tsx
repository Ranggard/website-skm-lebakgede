import React from 'react'

interface PreviewBakuMutuProps {
  triwulanLabel: string
  exportPreviewCalc: {
    count: number
    ikmKonversi: number
    mutuPelayanan: string
    kinerjaUnit: string
  }
  countL: number
  countP: number
  countSMA: number
  countS1: number
  countOtherEdu: number
}

export const PreviewBakuMutu: React.FC<PreviewBakuMutuProps> = ({
  triwulanLabel,
  exportPreviewCalc,
  countL,
  countP,
  countSMA,
  countS1,
  countOtherEdu,
}) => {
  return (
    <div className="p-6 bg-white max-h-80 overflow-y-auto font-mono text-xs">
      <div className="max-w-xl mx-auto border-2 border-emerald-800 p-6 rounded-xl bg-gradient-to-b from-white to-emerald-50/20 shadow-xs">
        <div className="text-center font-bold text-gray-900 border-b border-gray-300 pb-3 mb-4 space-y-1">
          <p className="text-sm tracking-wider font-extrabold">INDEKS KEPUASAN MASYARAKAT (IKM)</p>
          <p className="text-xs uppercase font-extrabold text-teal-800">KELURAHAN LEBAKGEDE</p>
          <p className="text-[11px] text-gray-600">KECAMATAN COBLONG KOTA BANDUNG</p>
          <p className="text-[11px] font-bold text-emerald-700 uppercase pt-1">{triwulanLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center mb-6">
          <div className="bg-emerald-700 text-white p-4 rounded-xl text-center shadow-xs">
            <span className="text-[10px] font-bold tracking-wider uppercase block opacity-90">NILAI IKM RESMI</span>
            <span className="text-3xl font-extrabold block my-1">{exportPreviewCalc.ikmKonversi.toFixed(2)}</span>
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block">
              Mutu {exportPreviewCalc.mutuPelayanan} ({exportPreviewCalc.kinerjaUnit})
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="font-bold text-gray-800">RESPONDEN : {exportPreviewCalc.count} Orang</div>
            <div className="text-gray-600">• Laki-laki: {countL} orang</div>
            <div className="text-gray-600">• Perempuan: {countP} orang</div>
            <div className="pt-1 font-bold text-gray-800">PENDIDIKAN :</div>
            <div className="text-gray-600">• SMA: {countSMA} | S1: {countS1} | Lainnya: {countOtherEdu}</div>
          </div>
        </div>

        <div className="text-right text-[11px] text-gray-600 border-t border-gray-200 pt-3">
          <p>Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="font-bold text-gray-900 mt-1">LURAH LEBAKGEDE</p>
          <p className="font-extrabold text-gray-900 mt-8 underline">USMAN ADIREJA, S.Sos</p>
          <p className="text-[10px]">NIP. 19721209 199901 1 001</p>
        </div>
      </div>
    </div>
  )
}

