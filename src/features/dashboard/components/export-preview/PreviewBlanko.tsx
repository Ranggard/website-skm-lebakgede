import React from 'react'

interface PreviewBlankoProps {
  unitName?: string
  unitAddress?: string
  responses?: any[]
  exportPreviewCalc?: {
    count: number
    ikmKonversi: number
    mutuPelayanan: string
    kinerjaUnit: string
    unsurAverages: any[]
  }
}

export const PreviewBlanko: React.FC<PreviewBlankoProps> = ({
  unitName = 'Kelurahan Lebakgede Kecamatan Coblong',
  unitAddress = 'Jl. Tubagus Ismail Bawah No. 5 Bandung',
  responses = [],
  exportPreviewCalc,
}) => {
  return (
    <div className="p-6 bg-white max-h-80 overflow-auto font-mono text-xs">
      <div className="text-center font-bold text-gray-800 space-y-1 mb-4">
        <p className="text-sm font-extrabold uppercase">PENGOLAHAN INDEKS KEPUASAN MASYARAKAT PER RESPONDEN DAN PER UNSUR PELAYANAN</p>
        <p className="text-xs text-gray-600">BLANKO SURVEY EVALUASI</p>
      </div>
      <div className="text-[11px] text-gray-700 mb-3 space-y-0.5">
        <p><span className="font-bold">UNIT PELAYANAN :</span> {unitName}</p>
        <p><span className="font-bold">ALAMAT :</span> {unitAddress}</p>
      </div>
      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead className="bg-slate-100 text-gray-700">
          <tr className="border-b border-gray-300">
            <th rowSpan={2} className="p-2 border border-gray-300 text-center w-12">NO</th>
            <th rowSpan={2} className="p-2 border border-gray-300">JENIS KELAMIN (L/P)</th>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">USIA</th>
            <th rowSpan={2} className="p-2 border border-gray-300 text-center">PENDIDIKAN</th>
            <th rowSpan={2} className="p-2 border border-gray-300">PEKERJAAN / LAYANAN</th>
            <th colSpan={9} className="p-2 border border-gray-300 text-center bg-teal-50 text-teal-900">NILAI PER UNSUR PELAYANAN</th>
          </tr>
          <tr className="border-b border-gray-300 text-center text-[11px] bg-slate-50">
            {['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9'].map((u) => (
              <th key={u} className="p-1.5 border border-gray-300 w-8">{u}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {responses.length > 0 ? (
            responses.map((r, idx) => {
              const jk = String(r.jenis_kelamin || r.gender || 'L').trim().toUpperCase().startsWith('P') ? 'P' : 'L'
              return (
                <tr key={r.id || idx} className="border-b border-gray-200 hover:bg-slate-50">
                  <td className="p-1.5 border border-gray-300 text-center bg-slate-50 font-bold">{idx + 1}</td>
                  <td className="p-1.5 border border-gray-300 text-center">{jk}</td>
                  <td className="p-1.5 border border-gray-300 text-center">{r.usia || '-'}</td>
                  <td className="p-1.5 border border-gray-300 text-center">{r.pendidikan || '-'}</td>
                  <td className="p-1.5 border border-gray-300">{r.jenis_layanan || 'Lainnya'}</td>
                  {['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'].map((k) => (
                    <td key={k} className="p-1.5 border border-gray-300 text-center">{r[k] ?? '-'}</td>
                  ))}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={14} className="p-4 text-center text-gray-400 italic border border-gray-300">
                Belum ada data responden pada periode ini.
              </td>
            </tr>
          )}
        </tbody>
        {exportPreviewCalc && (
          <tfoot className="bg-slate-100 font-bold border-t-2 border-gray-400">
            <tr>
              <td colSpan={5} className="p-2 border border-gray-300 text-right">Total Dari Nilai Persepsi Per Unit</td>
              {exportPreviewCalc.unsurAverages.map((u, idx) => (
                <td key={`b-tot-${u.code ?? idx}`} className="p-2 border border-gray-300 text-center">{u.totalNilai}</td>
              ))}
            </tr>
            <tr>
              <td colSpan={5} className="p-2 border border-gray-300 text-right">Total yang Terisi</td>
              {exportPreviewCalc.unsurAverages.map((u, idx) => (
                <td key={`b-cnt-${u.code ?? idx}`} className="p-2 border border-gray-300 text-center">{exportPreviewCalc.count}</td>
              ))}
            </tr>
            <tr>
              <td colSpan={5} className="p-2 border border-gray-300 text-right">NRR/Unsur</td>
              {exportPreviewCalc.unsurAverages.map((u, idx) => (
                <td key={`b-nrr-${u.code ?? idx}`} className="p-2 border border-gray-300 text-center">{Number(u.nrr ?? 0).toFixed(2)}</td>
              ))}
            </tr>
            <tr>
              <td colSpan={5} className="p-2 border border-gray-300 text-right">NRR Tertimbang/Unsur</td>
              {exportPreviewCalc.unsurAverages.map((u, idx) => (
                <td key={`b-tert-${u.code ?? idx}`} className="p-2 border border-gray-300 text-center">{Number(u.nrrTertimbang ?? 0).toFixed(2)}</td>
              ))}
            </tr>
            <tr className="bg-white">
              <td colSpan={5} className="p-2 border border-gray-300">IKM UNIT PELAYANAN</td>
              <td colSpan={9} className="p-2 border border-gray-300 text-center">{Number(exportPreviewCalc.ikmKonversi ?? 0).toFixed(2)}</td>
            </tr>
            <tr className="bg-teal-50">
              <td colSpan={5} className="p-2 border border-gray-300">MUTU PELAYANAN</td>
              <td colSpan={9} className="p-2 border border-gray-300 text-center">{exportPreviewCalc.mutuPelayanan}</td>
            </tr>
            <tr className="bg-teal-50">
              <td colSpan={5} className="p-2 border border-gray-300">KINERJA UNIT PELAYANAN</td>
              <td colSpan={9} className="p-2 border border-gray-300 text-center">{exportPreviewCalc.kinerjaUnit}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {exportPreviewCalc && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-gray-800">
          <div className="text-center space-y-1">
            <p>Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">LURAH LEBAKGEDE,</p>
            <div className="h-10" />
            <p className="font-bold underline">USMAN ADIREJA, S.Sos</p>
            <p>Penata Tk.I</p>
            <p>NIP. 19721209 199901 1 001</p>
          </div>

          <table className="border-collapse border border-gray-300 w-full self-start">
            <tbody>
              <tr>
                <td className="p-1 border border-gray-300 text-center w-6">1</td>
                <td className="p-1 border border-gray-300">Bobot Nilai Tertimbang</td>
                <td className="p-1 border border-gray-300 text-center">0,11</td>
              </tr>
              <tr>
                <td className="p-1 border border-gray-300 text-center">2</td>
                <td className="p-1 border border-gray-300">IKM</td>
                <td className="p-1 border border-gray-300 text-center">{(Number(exportPreviewCalc.ikmKonversi ?? 0) / 25).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="p-1 border border-gray-300 text-center">3</td>
                <td className="p-1 border border-gray-300">Konfersi IKM</td>
                <td className="p-1 border border-gray-300 text-center">{Number(exportPreviewCalc.ikmKonversi ?? 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="p-1 border border-gray-300 text-center">4</td>
                <td className="p-1 border border-gray-300">Nilai Pelayanan</td>
                <td className="p-1 border border-gray-300 text-center font-bold bg-slate-100">{exportPreviewCalc.kinerjaUnit}</td>
              </tr>
            </tbody>
          </table>

          <div className="self-start">
            <p className="font-bold text-center mb-1">NILAI MUTU PELAYANAN</p>
            <table className="border-collapse border border-gray-300 w-full">
              <tbody>
                <tr><td className="p-1 border border-gray-300 text-center">25,00</td><td className="p-1 border border-gray-300 text-center">64,99</td><td className="p-1 border border-gray-300 text-center font-bold">D</td><td className="p-1 border border-gray-300">TIDAK BAIK</td></tr>
                <tr><td className="p-1 border border-gray-300 text-center">65,00</td><td className="p-1 border border-gray-300 text-center">76,60</td><td className="p-1 border border-gray-300 text-center font-bold">C</td><td className="p-1 border border-gray-300">KURANG BAIK</td></tr>
                <tr><td className="p-1 border border-gray-300 text-center">76,61</td><td className="p-1 border border-gray-300 text-center">88,30</td><td className="p-1 border border-gray-300 text-center font-bold">B</td><td className="p-1 border border-gray-300">BAIK</td></tr>
                <tr><td className="p-1 border border-gray-300 text-center">88,31</td><td className="p-1 border border-gray-300 text-center">100,00</td><td className="p-1 border border-gray-300 text-center font-bold">A</td><td className="p-1 border border-gray-300">SANGAT BAIK</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
