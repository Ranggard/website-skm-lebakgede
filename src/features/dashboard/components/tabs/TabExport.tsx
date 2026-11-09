import React from 'react'
import {
  IconDownload,
  IconPrinter,
} from '@/src/components/icons'
import { ResponseRow } from '@/src/lib/types/dashboard'
import {
  PreviewBlanko,
  PreviewTriwulan,
  PreviewBakuMutu,
  PreviewMutuPelayanan,
  PreviewRekap,
} from '../export-preview'

interface TabExportProps {
  exportPreset: 'tw1' | 'tw2' | 'tw3' | 'tw4' | '1m' | '6m' | '1y' | 'all' | 'custom'
  setExportPreset: (p: 'tw1' | 'tw2' | 'tw3' | 'tw4' | '1m' | '6m' | '1y' | 'all' | 'custom') => void
  exportFormat: 'pdf' | 'excel' | 'csv'
  setExportFormat: (f: 'pdf' | 'excel' | 'csv') => void
  excelPreviewSheet: 'blanko' | 'triwulan' | 'baku_mutu' | 'mutu' | 'rekap'
  setExcelPreviewSheet: (s: 'blanko' | 'triwulan' | 'baku_mutu' | 'mutu' | 'rekap') => void
  exportStartDate: string
  setExportStartDate: (d: string) => void
  exportEndDate: string
  setExportEndDate: (d: string) => void
  exportFilteredResponses: ResponseRow[]
  exportPreviewCalc: {
    count: number
    ikmSkala4: number
    ikmKonversi: number
    mutuPelayanan: string
    kinerjaUnit: string
    unsurAverages: any[]
  }
  handleExportExcelWithFilter: () => void
  handleExportCSVWithFilter: () => void
  handleExportWord: () => void
  isExporting: boolean
}

export const TabExport: React.FC<TabExportProps> = ({
  exportPreset,
  setExportPreset,
  exportFormat,
  setExportFormat,
  excelPreviewSheet,
  setExcelPreviewSheet,
  exportStartDate,
  setExportStartDate,
  exportEndDate,
  setExportEndDate,
  exportFilteredResponses,
  exportPreviewCalc,
  handleExportExcelWithFilter,
  handleExportCSVWithFilter,
  handleExportWord,
  isExporting,
}) => {
  const triwulanLabel = exportPreset === 'tw1' ? 'TRIWULAN 1' :
    exportPreset === 'tw2' ? 'TRIWULAN 2' :
    exportPreset === 'tw4' ? 'TRIWULAN 4' : 'TRIWULAN 3'

  const bakuMutuLabel = exportPreset === 'tw1' ? 'BAKU MUTU TW 1' :
    exportPreset === 'tw2' ? 'BAKU MUTU TW 2' :
    exportPreset === 'tw4' ? 'BAKU MUTU TW 4' : 'BAKU MUTU TW 3'

  const countL = exportFilteredResponses.filter((r) => r.jenis_kelamin?.toLowerCase().startsWith('l')).length
  const countP = exportFilteredResponses.filter((r) => r.jenis_kelamin?.toLowerCase().startsWith('p')).length
  const countSD = exportFilteredResponses.filter((r) => (r.pendidikan || '').toUpperCase() === 'SD').length
  const countSMP = exportFilteredResponses.filter((r) => (r.pendidikan || '').toUpperCase() === 'SMP').length
  const countSMA = exportFilteredResponses.filter((r) => (r.pendidikan || '').toUpperCase() === 'SMA').length
  const countD3 = exportFilteredResponses.filter((r) => ['D1', 'D2', 'D3', 'D1-D3'].includes((r.pendidikan || '').toUpperCase())).length
  const countS1 = exportFilteredResponses.filter((r) => (r.pendidikan || '').toUpperCase() === 'S1').length
  const countS2 = exportFilteredResponses.filter((r) => (r.pendidikan || '').toUpperCase() === 'S2').length
  const countS3 = exportFilteredResponses.filter((r) => (r.pendidikan || '').toUpperCase() === 'S3').length
  const countOtherEdu = countSD + countSMP + countD3 + countS2 + countS3

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
        <div className="no-print">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 font-display">
            <IconDownload className="w-3.5 h-3.5" />
            <span>Pusat Unduh Dokumen & Laporan Resmi SKM</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2 font-display">
            Pilih Format Dokumen & Lihat Live Preview Sebelum Mengunduh
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Tentukan rentang waktu survei, pilih format dokumen yang Anda perlukan, lalu tinjau wujud berkas pada Live Preview sebelum menekan tombol unduh.
          </p>
        </div>

        {/* LANGKAH 1: PILIH RENTANG WAKTU */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 no-print">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Pilih Rentang Waktu Survei:</span>
            </span>
            <span className="text-[11px] font-bold text-teal-800 bg-white px-2.5 py-1 rounded-md border border-gray-200">
              {exportFilteredResponses.length} Data Responden Cocok
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <select
                id="select-rentang-waktu"
                value={exportPreset}
                onChange={(e) => {
                  const val = e.target.value as any
                  setExportPreset(val)
                  const year = new Date().getFullYear()
                  if (val === 'tw1') {
                    setExportStartDate(`${year}-01-01`)
                    setExportEndDate(`${year}-03-31`)
                  } else if (val === 'tw2') {
                    setExportStartDate(`${year}-04-01`)
                    setExportEndDate(`${year}-06-30`)
                  } else if (val === 'tw3') {
                    setExportStartDate(`${year}-07-01`)
                    setExportEndDate(`${year}-09-30`)
                  } else if (val === 'tw4') {
                    setExportStartDate(`${year}-10-01`)
                    setExportEndDate(`${year}-12-31`)
                  } else if (val === '1m') {
                    const now = new Date()
                    const m = String(now.getMonth() + 1).padStart(2, '0')
                    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
                    setExportStartDate(`${year}-${m}-01`)
                    setExportEndDate(`${year}-${m}-${lastDay}`)
                  } else if (val === '6m') {
                    const now = new Date()
                    const startM = String(Math.max(1, now.getMonth() - 5)).padStart(2, '0')
                    const endM = String(now.getMonth() + 1).padStart(2, '0')
                    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
                    setExportStartDate(`${year}-${startM}-01`)
                    setExportEndDate(`${year}-${endM}-${lastDay}`)
                  } else if (val === '1y') {
                    setExportStartDate(`${year}-01-01`)
                    setExportEndDate(`${year}-12-31`)
                  } else if (val === 'all') {
                    setExportStartDate('')
                    setExportEndDate('')
                  } else if (val === 'custom') {
                    if (!exportStartDate) setExportStartDate(`${year}-01-01`)
                    if (!exportEndDate) setExportEndDate(`${year}-12-31`)
                  }
                }}
                className="w-full appearance-none bg-white border-2 border-gray-300 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm font-bold text-gray-800 shadow-xs cursor-pointer hover:border-gray-400 transition"
              >
                <optgroup label="── Filter Triwulan Resmi ──">
                  <option value="tw1">Triwulan 1 (1 Jan - 31 Mar)</option>
                  <option value="tw2">Triwulan 2 (1 Apr - 30 Jun)</option>
                  <option value="tw3">Triwulan 3 (1 Jul - 30 Sep)</option>
                  <option value="tw4">Triwulan 4 (1 Okt - 31 Des)</option>
                </optgroup>
                <optgroup label="── Rentang Standar Lainnya ──">
                  <option value="all">Seluruh Data (Semua Waktu)</option>
                  <option value="1m">1 Bulan Berjalan</option>
                  <option value="6m">Semester (6 Bulan)</option>
                  <option value="1y">1 Tahun Penuh</option>
                </optgroup>
                <optgroup label="── Pengaturan Manual ──">
                  <option value="custom">Rentang Manual (Kustom Tanggal)</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {exportPreset !== 'custom' ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-semibold">
                  <svg className="w-3.5 h-3.5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {exportPreset === 'tw1' && 'Periode: Triwulan I (1 Januari s/d 31 Maret)'}
                    {exportPreset === 'tw2' && 'Periode: Triwulan II (1 April s/d 30 Juni)'}
                    {exportPreset === 'tw3' && 'Periode: Triwulan III (1 Juli s/d 30 September)'}
                    {exportPreset === 'tw4' && 'Periode: Triwulan IV (1 Oktober s/d 31 Desember)'}
                    {exportPreset === '1m' && 'Periode: 1 Bulan Berjalan'}
                    {exportPreset === '6m' && 'Periode: 6 Bulan (Semester)'}
                    {exportPreset === '1y' && 'Periode: 1 Tahun Penuh'}
                    {exportPreset === 'all' && 'Periode: Seluruh Data Responden Terdata'}
                  </span>
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                <span>Mode Rentang Manual Aktif</span>
              </span>
            )}
          </div>

          {exportPreset === 'custom' && (
            <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/85 shadow-xs space-y-3 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <div>
                    <div className="text-xs font-bold text-amber-950 font-display">
                      Pengaturan Rentang Manual (Kustom Tanggal)
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Tentukan tanggal awal dan akhir survei secara spesifik sesuai keperluan Anda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExportPreset('tw3')
                    setExportStartDate('2026-07-01')
                    setExportEndDate('2026-09-30')
                  }}
                  className="self-start sm:self-auto text-[11px] font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer bg-white/70 px-2.5 py-1 rounded-md border border-amber-200"
                >
                  Reset ke Triwulan 3
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1 font-display">
                    Tanggal Mulai (Start Date)
                  </label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-amber-300 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 bg-white text-gray-900 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1 font-display">
                    Tanggal Akhir (End Date)
                  </label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-amber-300 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 bg-white text-gray-900 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LANGKAH 2: PILIH FORMAT DOKUMEN */}
        <div className="space-y-3 no-print">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">2</span>
            <span>Pilih Format Dokumen yang Ingin Diunduh:</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setExportFormat('pdf')}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                exportFormat === 'pdf'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📄</span>
                  {exportFormat === 'pdf' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      Sedang Di-Preview
                    </span>
                  )}
                </div>
                <div className="text-sm font-extrabold text-gray-900 font-display">
                  Surat Laporan Resmi (PDF & Word)
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Naskah surat dinas resmi lengkap dengan Kop Surat, nomor surat, kalimat narasi pembuka, evaluasi capaian, dan tabel 9 unsur.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] font-bold text-emerald-800">
                Pilihan: Cetak PDF atau Unduh File Word (.doc)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat('excel')}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                exportFormat === 'excel'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📊</span>
                  {exportFormat === 'excel' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      Sedang Di-Preview
                    </span>
                  )}
                </div>
                <div className="text-sm font-extrabold text-gray-900 font-display">
                  Buku Kerja Excel (.xlsx)
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Format lembar kerja spreadsheet berisikan 5 sheet standar resmi: Blanko, Triwulan, Baku Mutu, Mutu Pelayanan, dan Rekap.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] font-bold text-emerald-800">
                Cocok untuk: Olah Data Lanjutan & Audit
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat('csv')}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                exportFormat === 'csv'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📑</span>
                  {exportFormat === 'csv' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      Sedang Di-Preview
                    </span>
                  )}
                </div>
                <div className="text-sm font-extrabold text-gray-900 font-display">
                  Data Tabular CSV (.csv)
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Format teks tabular murni terstandar koma (UTF-8) untuk integrasi dengan database atau aplikasi lain.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] font-bold text-emerald-800">
                Cocok untuk: Backup & Integrasi Sistem
              </div>
            </button>
          </div>
        </div>

        {/* LANGKAH 3: LIVE PREVIEW DOKUMEN */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between no-print">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Live Preview Berkas: {
                exportFormat === 'pdf' ? '📄 Dokumen Naskah Dinas Resmi (PDF/A4)' :
                  exportFormat === 'excel' ? '📊 Lembar Kerja Microsoft Excel (.xlsx)' :
                    '📑 Struktur Teks Data CSV (.csv)'
              }</span>
            </span>
            <span className="text-[11px] text-gray-500">
              Pratinjau wujud berkas sebelum proses unduh
            </span>
          </div>

          {/* PREVIEW 1: PDF SURAT DINAS */}
          {exportFormat === 'pdf' && (
            <div className="bg-slate-200/80 p-3 sm:p-8 rounded-2xl border border-gray-300 flex justify-center overflow-x-auto print-container">
              <div className="bg-white shadow-2xl rounded-none sm:rounded-sm p-6 sm:p-12 max-w-[760px] w-full text-black font-serif leading-normal text-xs printable-official-document">
                <div className="flex items-start gap-4 pb-1">
                  <img
                    src="/logo-kelurahan.jpg"
                    alt="Logo Kota Bandung"
                    className="h-20 w-auto object-contain flex-shrink-0"
                  />
                  <div className="flex-1 text-center font-serif">
                    <h3 className="font-bold text-sm sm:text-base text-black tracking-normal leading-tight">
                      PEMERINTAH KOTA BANDUNG
                    </h3>
                    <h3 className="font-bold text-sm sm:text-base text-black tracking-normal leading-tight">
                      KECAMATAN COBLONG
                    </h3>
                    <h2 className="font-extrabold text-base sm:text-lg text-black tracking-wide leading-tight mt-0.5">
                      KELURAHAN LEBAK GEDE
                    </h2>
                    <p className="text-[10px] sm:text-[10.5px] text-black leading-tight mt-1">
                      Jl. Tubagus Ismail Bawah No.5, Lebakgede, Coblong, Kota Bandung, Jawa Barat 40132 Telp. 0222512563, Fax 0222512563
                    </p>
                    <p className="text-[10px] sm:text-[10.5px] text-black leading-tight">
                      e – mail : kelurahanlebakgede2016@gmail.com
                    </p>
                  </div>
                </div>

                <div className="border-b-[3.5px] border-black mt-2 mb-[2px]"></div>
                <div className="border-b-[1px] border-black mb-5"></div>

                <div className="flex justify-end mb-4">
                  <span className="text-xs sm:text-[13px] font-serif text-black">
                    Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="text-xs sm:text-[12.5px] font-serif text-black space-y-0.5 mb-5 max-w-lg">
                  <div className="flex">
                    <span className="w-20 sm:w-24 flex-shrink-0">Nomor</span>
                    <span className="w-4">:</span>
                    <span className="flex-1 font-mono text-xs">B/TU/148-LG/X/2026</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 sm:w-24 flex-shrink-0">Sifat</span>
                    <span className="w-4">:</span>
                    <span className="flex-1">Biasa</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 sm:w-24 flex-shrink-0">Lampiran</span>
                    <span className="w-4">:</span>
                    <span className="flex-1">1 (satu) Berkas</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-20 sm:w-24 flex-shrink-0">Hal</span>
                    <span className="w-4">:</span>
                    <span className="flex-1 font-bold">
                      Laporan Pengukuran Indeks Kepuasan Masyarakat (IKM)
                    </span>
                  </div>
                </div>

                <div className="text-xs sm:text-[12.5px] font-serif text-black space-y-0.5 mb-5">
                  <div className="flex items-start">
                    <span className="w-12 flex-shrink-0">Yth.</span>
                    <div>
                      <p>1. Camat Coblong Kota Bandung</p>
                      <p>2. Badan Kesatuan Bangsa dan Politik Kota Bandung</p>
                    </div>
                  </div>
                  <p className="pt-1">di</p>
                  <p className="font-bold">Bandung</p>
                </div>

                <p className="text-xs sm:text-[12.5px] font-serif text-black text-justify leading-relaxed indent-16 sm:indent-24 mb-4">
                  Menindaklanjuti agenda evaluasi dan pengukuran Indeks Kepuasan Masyarakat (IKM) terhadap mutu pelayanan publik di lingkungan Kelurahan Lebak Gede Kecamatan Coblong Kota Bandung pada periode <strong>{
                    exportPreset === 'tw1'
                      ? 'Triwulan I (1 Januari s/d 31 Maret)'
                      : exportPreset === 'tw2'
                        ? 'Triwulan II (1 April s/d 30 Juni)'
                        : exportPreset === 'tw3'
                          ? 'Triwulan III (1 Juli s/d 30 September)'
                          : exportPreset === 'tw4'
                            ? 'Triwulan IV (1 Oktober s/d 31 Desember)'
                            : exportPreset === '1m'
                              ? '1 Bulan Berjalan'
                              : exportPreset === '6m'
                                ? '6 Bulan (Semester)'
                                : exportPreset === '1y'
                                  ? '1 Tahun Penuh'
                                  : exportPreset === 'all'
                                    ? 'Seluruh Data Responden'
                                    : `${exportStartDate} s/d ${exportEndDate}`
                  }</strong>, bersama ini disampaikan laporan hasil evaluasi kepuasan masyarakat atas pelayanan administrasi kependudukan dan perizinan sebagai berikut :
                </p>

                <div className="mb-5 overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-600 text-xs sm:text-[12px] font-serif">
                    <thead>
                      <tr className="bg-[#dbe2ea] text-black font-bold text-center">
                        <th className="border border-gray-600 p-2 w-10 sm:w-12">NO</th>
                        <th className="border border-gray-600 p-2 text-left">UNSUR PELAYANAN</th>
                        <th className="border border-gray-600 p-2 w-20 sm:w-24">NILAI NRR</th>
                        <th className="border border-gray-600 p-2 w-24 sm:w-28">NILAI KONVERSI</th>
                        <th className="border border-gray-600 p-2 w-16 sm:w-20">MUTU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportPreviewCalc.unsurAverages.map((u, i) => (
                        <tr key={u.key || i} className="border-b border-gray-400 hover:bg-slate-50">
                          <td className="border border-gray-400 p-1.5 text-center">{i + 1}</td>
                          <td className="border border-gray-400 p-1.5">{u.label || u.name}</td>
                          <td className="border border-gray-400 p-1.5 text-center font-bold text-black">{u.nrr.toFixed(2)}</td>
                          <td className="border border-gray-400 p-1.5 text-center font-bold text-teal-900">{u.ikm.toFixed(2)}</td>
                          <td className="border border-gray-400 p-1.5 text-center font-bold">{u.mutu}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#f0f4f8] font-bold border-t-2 border-gray-700">
                        <td colSpan={2} className="border border-gray-600 p-2 text-center uppercase tracking-wide text-xs">
                          Nilai IKM Konversi (Mutu Pelayanan: {exportPreviewCalc.mutuPelayanan} - {exportPreviewCalc.kinerjaUnit})
                        </td>
                        <td className="border border-gray-600 p-2 text-center text-teal-900">{exportPreviewCalc.ikmSkala4.toFixed(4)}</td>
                        <td className="border border-gray-600 p-2 text-center text-emerald-800 text-sm">{exportPreviewCalc.ikmKonversi.toFixed(2)}</td>
                        <td className="border border-gray-600 p-2 text-center text-emerald-800">{exportPreviewCalc.mutuPelayanan}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs sm:text-[12.5px] font-serif text-black text-justify leading-relaxed indent-16 sm:indent-24 mb-4">
                  Maka Kelurahan Lebak Gede Kecamatan Coblong Kota Bandung, menyampaikan hasil pengukuran tersebut dengan capaian IKM sebesar <strong>{exportPreviewCalc.ikmKonversi.toFixed(2)} (Kategori Mutu {exportPreviewCalc.mutuPelayanan} - {exportPreviewCalc.kinerjaUnit})</strong> berdasarkan partisipasi {exportPreviewCalc.count} orang responden terdata sebagai wujud akuntabilitas kinerja pelayanan.
                </p>

                <p className="text-xs sm:text-[12.5px] font-serif text-black text-justify leading-relaxed indent-16 sm:indent-24 mb-6">
                  Demikian surat ini kami sampaikan atas perhatiannya diucapkan terima kasih.
                </p>
              </div>
            </div>
          )}

          {/* PREVIEW 2: EXCEL 5 SHEETS */}
          {exportFormat === 'excel' && (
            <div className="rounded-2xl border border-gray-300 overflow-hidden shadow-md font-sans">
              <div className="bg-[#107c41] px-4 py-2.5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs">📗 Excel Spreadsheet Preview</span>
                  <span className="text-[11px] text-emerald-100">
                    (Laporan_IKM_Lebakgede_{exportPreset}.xlsx — Persis Dokumen IKM TW 3)
                  </span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">
                  5 Sheet Standar Resmi
                </span>
              </div>

              <div className="bg-slate-100 px-3 py-2 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="font-bold text-gray-500 mr-1 text-[11px] whitespace-nowrap">Lembar:</span>
                
                <button
                  type="button"
                  onClick={() => setExcelPreviewSheet('blanko')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    excelPreviewSheet === 'blanko'
                      ? 'bg-white text-[#107c41] shadow-xs border border-gray-300'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>📄 BLANKO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExcelPreviewSheet('triwulan')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    excelPreviewSheet === 'triwulan'
                      ? 'bg-white text-[#107c41] shadow-xs border border-gray-300'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>📊 {triwulanLabel}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#107c41] text-[10px]">
                    {exportFilteredResponses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExcelPreviewSheet('baku_mutu')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    excelPreviewSheet === 'baku_mutu'
                      ? 'bg-white text-[#107c41] shadow-xs border border-gray-300'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>🏛️ {bakuMutuLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExcelPreviewSheet('mutu')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    excelPreviewSheet === 'mutu'
                      ? 'bg-white text-[#107c41] shadow-xs border border-gray-300'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>📑 NILAI MUTU PELAYANAN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExcelPreviewSheet('rekap')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    excelPreviewSheet === 'rekap'
                      ? 'bg-white text-[#107c41] shadow-xs border border-gray-300'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>📈 REKAP</span>
                </button>
              </div>

              {excelPreviewSheet === 'blanko' && <PreviewBlanko />}
              {excelPreviewSheet === 'triwulan' && (
                <PreviewTriwulan
                  triwulanLabel={triwulanLabel}
                  exportFilteredResponses={exportFilteredResponses}
                  exportPreviewCalc={exportPreviewCalc}
                />
              )}
              {excelPreviewSheet === 'baku_mutu' && (
                <PreviewBakuMutu
                  triwulanLabel={triwulanLabel}
                  exportPreviewCalc={exportPreviewCalc}
                  countL={countL}
                  countP={countP}
                  countSMA={countSMA}
                  countS1={countS1}
                  countOtherEdu={countOtherEdu}
                />
              )}
              {excelPreviewSheet === 'mutu' && (
                <PreviewMutuPelayanan mutuPelayanan={exportPreviewCalc.mutuPelayanan} />
              )}
              {excelPreviewSheet === 'rekap' && (
                <PreviewRekap
                  exportPreviewCalc={exportPreviewCalc}
                  exportFilteredResponses={exportFilteredResponses}
                />
              )}
            </div>
          )}

          {/* PREVIEW 3: CSV RAW DATA */}
          {exportFormat === 'csv' && (
            <div className="rounded-2xl border border-gray-800 bg-slate-900 text-emerald-400 p-4 font-mono text-xs overflow-x-auto shadow-inner max-h-80">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                <span>Preview Berkas Mentah: Data_SKM_Lebakgede_{exportPreset}.csv (UTF-8)</span>
                <span>{exportFilteredResponses.length + 1} Baris Teks</span>
              </div>
              <div className="space-y-1">
                <div className="text-amber-300 font-bold whitespace-nowrap">
                  1: No,Nomor Responden,ID,Waktu,Gender,Usia,Pendidikan,Layanan,U1,U2,U3,U4,U5,U6,U7,U8,U9,Rata,Mutu,Saran
                </div>
                {exportFilteredResponses.slice(0, 15).map((r, i) => (
                  <div key={r.id} className="whitespace-nowrap text-slate-300 hover:bg-slate-800/80 px-1 rounded">
                    <span className="text-slate-500 mr-2">{i + 2}:</span>
                    {i + 1},{r.no},&quot;{r.id}&quot;,&quot;{r.waktu}&quot;,&quot;{r.jenis_kelamin}&quot;,&quot;{r.usia}&quot;,&quot;{r.pendidikan}&quot;,&quot;{r.jenis_layanan}&quot;,{r.u1},{r.u2},{r.u3},{r.u4},{r.u5},{r.u6},{r.u7},{r.u8},{r.u9},{Number(r.skor_rata).toFixed(2)},&quot;{r.nilai}&quot;,&quot;{(r.saran || '').substring(0, 30)}...&quot;
                  </div>
                ))}
                {exportFilteredResponses.length > 15 && (
                  <div className="text-slate-500 italic pt-1">
                    ... dan {exportFilteredResponses.length - 15} baris data lainnya yang akan disertakan dalam berkas CSV.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LANGKAH 4: TOMBOL KONFIRMASI UNDUH */}
        <div className="pt-4 border-t border-gray-200 space-y-3 no-print">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-display flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Konfirmasi & Unduh Berkas:</span>
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Format aktif: <strong>{
                  exportFormat === 'pdf' ? 'Dokumen Laporan Resmi (PDF)' :
                    exportFormat === 'excel' ? 'Buku Kerja Excel (.xlsx)' :
                      'Data Tabular CSV (.csv)'
                }</strong>
              </p>
            </div>

            <div>
              {exportFormat === 'pdf' && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    disabled={exportFilteredResponses.length === 0}
                    className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-slate-900/20 transition flex items-center gap-2 font-display disabled:opacity-50 cursor-pointer"
                  >
                    <IconPrinter className="w-4 h-4" />
                    <span>🖨️ Cetak / Simpan PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportWord}
                    disabled={exportFilteredResponses.length === 0}
                    className="px-5 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-900/20 transition flex items-center gap-2 font-display disabled:opacity-50 cursor-pointer"
                  >
                    <span>📝 Unduh Dokumen Word (.doc)</span>
                  </button>
                </div>
              )}

              {exportFormat === 'excel' && (
                <button
                  type="button"
                  onClick={handleExportExcelWithFilter}
                  disabled={isExporting || exportFilteredResponses.length === 0}
                  className="px-6 py-3.5 rounded-xl bg-[#107c41] hover:bg-[#0d6535] active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/20 transition flex items-center gap-2 font-display disabled:opacity-50 cursor-pointer"
                >
                  <IconDownload className="w-4 h-4" />
                  <span>{isExporting ? 'Mengekspor Berkas...' : '📥 Unduh Berkas Excel (.xlsx) Sekarang'}</span>
                </button>
              )}

              {exportFormat === 'csv' && (
                <button
                  type="button"
                  onClick={handleExportCSVWithFilter}
                  disabled={exportFilteredResponses.length === 0}
                  className="px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-teal-900/20 transition flex items-center gap-2 font-display disabled:opacity-50 cursor-pointer"
                >
                  <IconDownload className="w-4 h-4" />
                  <span>📥 Unduh Berkas CSV (.csv) Sekarang</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

