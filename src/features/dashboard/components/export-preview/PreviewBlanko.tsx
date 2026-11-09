import React from 'react'

interface PreviewBlankoProps {
  unitName?: string
  unitAddress?: string
}

export const PreviewBlanko: React.FC<PreviewBlankoProps> = ({
  unitName = 'Kelurahan Lebakgede Kecamatan Coblong',
  unitAddress = 'Jl. Tubagus Ismail Bawah No. 5 Bandung',
}) => {
  return (
    <div className="p-6 bg-white max-h-80 overflow-auto font-mono text-xs">
      <div className="text-center font-bold text-gray-800 space-y-1 mb-4">
        <p className="text-sm font-extrabold uppercase">PENGOLAHAN INDEKS KEPUASAN MASYARAKAT PER RESPONDEN DAN PER UNSUR PELAYANAN</p>
        <p className="text-xs text-gray-600">BLANKO SURVEY EVALUASI</p>
      </div>
      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead className="bg-slate-100 text-gray-700">
          <tr className="border-b border-gray-300">
            <th rowSpan={2} className="p-2 border border-gray-300 text-center w-12">NO</th>
            <th rowSpan={2} className="p-2 border border-gray-300">JENIS KELAMIN</th>
            <th rowSpan={2} className="p-2 border border-gray-300">USIA</th>
            <th rowSpan={2} className="p-2 border border-gray-300">PENDIDIKAN</th>
            <th rowSpan={2} className="p-2 border border-gray-300">PEKERJAAN</th>
            <th colSpan={9} className="p-2 border border-gray-300 text-center bg-teal-50 text-teal-900">NILAI PER UNSUR PELAYANAN</th>
          </tr>
          <tr className="border-b border-gray-300 text-center text-[11px] bg-slate-50">
            {['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9'].map((u) => (
              <th key={u} className="p-1.5 border border-gray-300 w-8">{u}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <tr key={num} className="border-b border-gray-200 text-gray-400">
              <td className="p-2 border border-gray-300 text-center bg-slate-50 font-bold">{num}</td>
              <td className="p-2 border border-gray-300 italic">...</td>
              <td className="p-2 border border-gray-300 italic">...</td>
              <td className="p-2 border border-gray-300 italic">...</td>
              <td className="p-2 border border-gray-300 italic">...</td>
              {[...Array(9)].map((_, idx) => (
                <td key={idx} className="p-2 border border-gray-300 text-center italic">-</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-gray-400 italic mt-3">* Format template blanko kosong resmi sesuai standar PermenPAN-RB untuk arsip fisik / cetak.</p>
    </div>
  )
}

