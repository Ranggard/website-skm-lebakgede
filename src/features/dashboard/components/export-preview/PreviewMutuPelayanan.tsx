import React from 'react'

interface PreviewMutuPelayananProps {
  mutuPelayanan: string
}

export const PreviewMutuPelayanan: React.FC<PreviewMutuPelayananProps> = ({ mutuPelayanan }) => {
  return (
    <div className="p-6 bg-white max-h-80 overflow-y-auto font-mono text-xs">
      <div className="mb-3 font-bold text-gray-800">
        <span className="text-sm font-extrabold uppercase">TABEL NILAI MUTU PELAYANAN</span>
        <p className="text-[11px] text-gray-500 font-normal">Sesuai Peraturan Menteri PAN-RB Republik Indonesia No. 14 Tahun 2017</p>
      </div>
      <table className="w-full text-xs text-left border-collapse border border-gray-300">
        <thead className="bg-[#107c41] text-white font-bold">
          <tr>
            <th className="p-2 border border-gray-300 text-center w-12">NILAI</th>
            <th className="p-2 border border-gray-300">NILAI INTERVAL (N)</th>
            <th className="p-2 border border-gray-300">NILAI KONVERSI (NK)</th>
            <th className="p-2 border border-gray-300 text-center">MUTU (x)</th>
            <th className="p-2 border border-gray-300">KINERJA UNIT</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200 hover:bg-slate-50">
            <td className="p-2 border border-gray-300 text-center font-bold">1</td>
            <td className="p-2 border border-gray-300">1.00 - 2.5996</td>
            <td className="p-2 border border-gray-300">25.00 - 64.99</td>
            <td className="p-2 border border-gray-300 text-center font-bold text-rose-600">D</td>
            <td className="p-2 border border-gray-300 font-semibold text-rose-600">Tidak Baik</td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-slate-50">
            <td className="p-2 border border-gray-300 text-center font-bold">2</td>
            <td className="p-2 border border-gray-300">2.60 - 3.064</td>
            <td className="p-2 border border-gray-300">65.00 - 76.60</td>
            <td className="p-2 border border-gray-300 text-center font-bold text-amber-600">C</td>
            <td className="p-2 border border-gray-300 font-semibold text-amber-600">Kurang Baik</td>
          </tr>
          <tr className={`border-b border-gray-200 ${mutuPelayanan === 'B' ? 'bg-emerald-50 font-bold' : 'hover:bg-slate-50'}`}>
            <td className="p-2 border border-gray-300 text-center font-bold">3</td>
            <td className="p-2 border border-gray-300">3.0644 - 3.532</td>
            <td className="p-2 border border-gray-300">76.61 - 88.30</td>
            <td className="p-2 border border-gray-300 text-center font-bold text-teal-700">B</td>
            <td className="p-2 border border-gray-300 font-semibold text-teal-700">Baik {mutuPelayanan === 'B' && '← Posisi Saat Ini'}</td>
          </tr>
          <tr className={`border-b border-gray-200 ${mutuPelayanan === 'A' ? 'bg-emerald-50 font-bold' : 'hover:bg-slate-50'}`}>
            <td className="p-2 border border-gray-300 text-center font-bold">4</td>
            <td className="p-2 border border-gray-300">3.5324 - 4.00</td>
            <td className="p-2 border border-gray-300">88.31 - 100.00</td>
            <td className="p-2 border border-gray-300 text-center font-bold text-emerald-700">A</td>
            <td className="p-2 border border-gray-300 font-semibold text-emerald-700">Sangat Baik {mutuPelayanan === 'A' && '← Posisi Saat Ini'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

