import React from 'react'
import { ResponseRow } from '@/src/lib/types/dashboard'

interface PreviewRekapProps {
  exportPreviewCalc: {
    unsurAverages: any[]
  }
  exportFilteredResponses: ResponseRow[]
}

export const PreviewRekap: React.FC<PreviewRekapProps> = ({
  exportPreviewCalc,
  exportFilteredResponses,
}) => {
  return (
    <div className="p-6 bg-white max-h-80 overflow-auto font-mono text-xs">
      <div className="mb-3 font-bold text-gray-800">
        <span className="text-sm font-extrabold uppercase">REKAPITULASI HASIL SURVEY KEPUASAN MASYARAKAT TERHADAP PELAYANAN PUBLIK</span>
        <p className="text-[11px] text-gray-500 font-normal">KELURAHAN LEBAKGEDE KECAMATAN COBLONG KOTA BANDUNG TAHUN {new Date().getFullYear()}</p>
      </div>
      <table className="w-full text-xs text-left border-collapse border border-gray-300">
        <thead className="bg-slate-100 text-gray-700 font-bold">
          <tr className="border-b border-gray-300">
            <th className="p-2 border border-gray-300 text-center w-10">NO</th>
            <th className="p-2 border border-gray-300">UNSUR PELAYANAN YANG DINILAI</th>
            <th className="p-2 border border-gray-300">OPSI JAWABAN</th>
            <th className="p-2 border border-gray-300 text-center w-16">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {exportPreviewCalc.unsurAverages.map((u, i) => {
            const countA = exportFilteredResponses.filter((r) => Number((r as any)[u.key]) === 1).length
            const countB = exportFilteredResponses.filter((r) => Number((r as any)[u.key]) === 2).length
            const countC = exportFilteredResponses.filter((r) => Number((r as any)[u.key]) === 3).length
            const countD = exportFilteredResponses.filter((r) => Number((r as any)[u.key]) === 4).length
            return (
              <React.Fragment key={u.code}>
                <tr className="bg-slate-50 font-bold border-t border-gray-300">
                  <td className="p-1.5 border border-gray-300 text-center">{i + 1}</td>
                  <td colSpan={3} className="p-1.5 border border-gray-300 text-teal-900">{u.name} ({u.code})</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-1 border border-gray-300"></td>
                  <td className="p-1 border border-gray-300 text-gray-400"></td>
                  <td className="p-1 border border-gray-300 text-gray-600">a. Tidak Sesuai / Buruk (1)</td>
                  <td className="p-1 border border-gray-300 text-center font-bold">{countA}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-1 border border-gray-300"></td>
                  <td className="p-1 border border-gray-300 text-gray-400"></td>
                  <td className="p-1 border border-gray-300 text-gray-600">b. Kurang Sesuai / Cukup (2)</td>
                  <td className="p-1 border border-gray-300 text-center font-bold">{countB}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-1 border border-gray-300"></td>
                  <td className="p-1 border border-gray-300 text-gray-400"></td>
                  <td className="p-1 border border-gray-300 text-gray-600">c. Sesuai / Baik (3)</td>
                  <td className="p-1 border border-gray-300 text-center font-bold text-teal-700">{countC}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-1 border border-gray-300"></td>
                  <td className="p-1 border border-gray-300 text-gray-400"></td>
                  <td className="p-1 border border-gray-300 text-gray-600">d. Sangat Sesuai / Sangat Baik (4)</td>
                  <td className="p-1 border border-gray-300 text-center font-bold text-emerald-700">{countD}</td>
                </tr>
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

