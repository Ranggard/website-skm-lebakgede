import React from 'react'
import { ResponseRow } from '@/src/lib/types/dashboard'

interface PreviewTriwulanProps {
  triwulanLabel: string
  exportFilteredResponses: ResponseRow[]
  exportPreviewCalc: {
    unsurAverages: any[]
    ikmKonversi: number
    mutuPelayanan: string
    kinerjaUnit: string
  }
}

export const PreviewTriwulan: React.FC<PreviewTriwulanProps> = ({
  triwulanLabel,
  exportFilteredResponses,
  exportPreviewCalc,
}) => {
  return (
    <div className="overflow-x-auto max-h-80 bg-white p-4">
      <div className="text-center font-bold text-gray-800 space-y-1 mb-4 font-mono">
        <p className="text-sm font-extrabold uppercase">PENGOLAHAN INDEKS KEPUASAN MASYARAKAT PER RESPONDEN DAN PER UNSUR PELAYANAN</p>
        <p className="text-xs text-teal-800 font-bold">{triwulanLabel} KELURAHAN LEBAKGEDE</p>
      </div>

      <table className="w-full text-xs text-left border-collapse font-mono border border-gray-300">
        <thead>
          <tr className="bg-slate-200 text-gray-700 font-bold border-b border-gray-300 text-center">
            <th rowSpan={2} className="p-2 border border-gray-300 bg-slate-300 w-12">NO</th>
            <th rowSpan={2} className="p-2 border border-gray-300 whitespace-nowrap">TGL SURVEY</th>
            <th rowSpan={2} className="p-2 border border-gray-300 whitespace-nowrap">GENDER</th>
            <th rowSpan={2} className="p-2 border border-gray-300 whitespace-nowrap">USIA</th>
            <th rowSpan={2} className="p-2 border border-gray-300 whitespace-nowrap">PENDIDIKAN</th>
            <th rowSpan={2} className="p-2 border border-gray-300 whitespace-nowrap">LAYANAN</th>
            <th colSpan={9} className="p-2 border border-gray-300 bg-emerald-50 text-emerald-900">NILAI PER UNSUR PELAYANAN</th>
            <th rowSpan={2} className="p-2 border border-gray-300 bg-teal-50 text-teal-900 w-14">RATA</th>
            <th rowSpan={2} className="p-2 border border-gray-300 bg-teal-50 text-teal-900 w-12">MUTU</th>
          </tr>
          <tr className="bg-slate-100 text-gray-700 font-bold border-b border-gray-300 text-center text-[11px]">
            {['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9'].map((u) => (
              <th key={u} className="p-1 border border-gray-300 w-9">{u}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exportFilteredResponses.map((r, i) => (
            <tr key={r.id} className="border-b border-gray-200 hover:bg-emerald-50/40">
              <td className="p-1.5 text-center bg-slate-100 text-gray-600 font-bold border border-gray-300">{i + 1}</td>
              <td className="p-1.5 border border-gray-300 whitespace-nowrap">{r.waktu}</td>
              <td className="p-1.5 border border-gray-300 text-center">{r.jenis_kelamin?.startsWith('L') ? 'Laki-laki' : 'Perempuan'}</td>
              <td className="p-1.5 border border-gray-300 text-center">{r.usia}</td>
              <td className="p-1.5 border border-gray-300 text-center">{r.pendidikan}</td>
              <td className="p-1.5 border border-gray-300 whitespace-nowrap">{r.jenis_layanan}</td>
              <td className="p-1.5 text-center border border-gray-300">{r.u1}</td>
              <td className="p-1.5 text-center border border-gray-300">{r.u2}</td>
              <td className="p-1.5 text-center border border-gray-300">{r.u3}</td>
              <td className="p-1.5 text-center border border-gray-300">{r.u4}</td>
              <td className="p-1.5 text-center border border-gray-300">{r.u5}</td>
              <td className="p-1.5 text-center border border-gray-300">{r.u6}</td>
              <td className="p-1.5 text-center border border-gray-300">{r.u7}</td>
              <td className="p-1.5 text-center border border-gray-300">{r.u8}</td>
              <td className="p-1.5 text-center border border-gray-300">{r.u9}</td>
              <td className="p-1.5 text-center border border-gray-300 font-bold bg-teal-50/30">{Number(r.skor_rata).toFixed(2)}</td>
              <td className="p-1.5 text-center font-bold text-emerald-700 border border-gray-300">{r.nilai}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-100 font-bold border-t-2 border-gray-400">
          <tr className="border-b border-gray-300">
            <td colSpan={6} className="p-2 border border-gray-300 text-right uppercase">Total Dari Nilai Persepsi Per Unit:</td>
            {exportPreviewCalc.unsurAverages.map((u) => (
              <td key={u.code} className="p-2 border border-gray-300 text-center text-teal-800">{u.totalNilai}</td>
            ))}
            <td colSpan={2} className="p-2 border border-gray-300 bg-slate-200"></td>
          </tr>
          <tr className="border-b border-gray-300">
            <td colSpan={6} className="p-2 border border-gray-300 text-right uppercase">NRR Per Unsur:</td>
            {exportPreviewCalc.unsurAverages.map((u) => (
              <td key={u.code} className="p-2 border border-gray-300 text-center font-bold">{u.nrr.toFixed(3)}</td>
            ))}
            <td colSpan={2} className="p-2 border border-gray-300 bg-slate-200"></td>
          </tr>
          <tr className="border-b border-gray-300">
            <td colSpan={6} className="p-2 border border-gray-300 text-right uppercase">NRR Tertimbang Per Unsur (x 0.111):</td>
            {exportPreviewCalc.unsurAverages.map((u) => (
              <td key={u.code} className="p-2 border border-gray-300 text-center text-emerald-800">{u.nrrTertimbang.toFixed(3)}</td>
            ))}
            <td colSpan={2} className="p-2 border border-gray-300 bg-slate-200"></td>
          </tr>
          <tr className="bg-emerald-50 text-emerald-950 text-sm">
            <td colSpan={6} className="p-2.5 border border-gray-300 text-right font-extrabold uppercase">IKM UNIT PELAYANAN (KONVERSI):</td>
            <td colSpan={9} className="p-2.5 border border-gray-300 text-center font-extrabold text-base text-emerald-700">
              {exportPreviewCalc.ikmKonversi.toFixed(2)}
            </td>
            <td colSpan={2} className="p-2.5 border border-gray-300 text-center font-extrabold text-emerald-800">
              {exportPreviewCalc.mutuPelayanan} ({exportPreviewCalc.kinerjaUnit})
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

