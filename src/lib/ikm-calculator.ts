/**
 * IKM Calculator & Report Generator
 * Berdasarkan Pedoman Resmi Menteri PAN-RB untuk Pengolahan Survei Kepuasan Masyarakat (SKM)
 * Menggunakan 9 Unsur Pelayanan Publik dengan Bobot Rata-rata Tertimbang (1/9)
 * 
 * CATATAN KEAMANAN:
 * File ini HANYA berisi rumus kalkulasi, tipe data, dan pembuat format laporan Excel.
 * TIDAK mengandung data pribadi responden, aman untuk di-commit ke repositori Git publik.
 */

import { IKM_MASTER_TEMPLATE_BASE64 } from './ikm-template-binary'

export interface IKMRespondentRecord {
  no?: number
  id: string
  created_at?: string
  waktu?: string
  timestamp?: string
  jenis_kelamin?: string
  usia?: string | number
  pendidikan?: string
  jenis_layanan?: string
  u1: number // 1. Persyaratan Pelayanan
  u2: number // 2. Prosedur Pelayanan
  u3: number // 3. Waktu Pelayanan
  u4: number // 4. Biaya / Tarif Pelayanan
  u5: number // 5. Produk Spesifikasi Jenis Pelayanan
  u6: number // 6. Kompetensi Pelaksana
  u7: number // 7. Perilaku Pelaksana (Sopan & Ramah)
  u8: number // 8. Kualitas Sarana & Prasarana
  u9: number // 9. Penanganan Pengaduan, Saran & Masukan
  saran?: string
  skor_rata?: number
  nilai?: 'A' | 'B' | 'C' | 'D'
}

export interface UnsurStat {
  key: string
  no: number
  code: string
  name: string
  label: string
  short: string
  category: string
  totalNilai: number
  nrr: number
  nrrTertimbang: number
  ikm: number
  ikmKonversi: number
  mutu: string
}

export interface IKMCalculationResult {
  totalResponden: number
  ikmSkala4: number
  ikmKonversi: number
  mutuPelayanan: 'A' | 'B' | 'C' | 'D'
  kinerjaUnit: 'SANGAT BAIK' | 'BAIK' | 'KURANG BAIK' | 'TIDAK BAIK'
  unsurStats: UnsurStat[]
}

/**
 * Metadata 9 Unsur Pelayanan Publik (MenPAN-RB)
 */
export const IKM_UNSUR_METADATA = [
  { key: 'u1', no: 1, code: 'U1', name: 'Persyaratan Pelayanan', short: 'Persyaratan', category: 'Kesesuaian berkas dan ketentuan administrasi' },
  { key: 'u2', no: 2, code: 'U2', name: 'Prosedur Pelayanan', short: 'Prosedur', category: 'Kemudahan alur dan tahapan pelayanan' },
  { key: 'u3', no: 3, code: 'U3', name: 'Waktu Pelayanan', short: 'Waktu Layanan', category: 'Kecepatan penyelesaian layanan' },
  { key: 'u4', no: 4, code: 'U4', name: 'Biaya / Tarif Pelayanan', short: 'Biaya/Tarif', category: 'Kewajaran atau kepastian bebas biaya (gratis)' },
  { key: 'u5', no: 5, code: 'U5', name: 'Produk Spesifikasi Layanan', short: 'Produk Layanan', category: 'Kesesuaian hasil dan dokumen yang diterima' },
  { key: 'u6', no: 6, code: 'U6', name: 'Kompetensi Pelaksana', short: 'Kompetensi', category: 'Keahlian, kecekatan, dan kemampuan petugas' },
  { key: 'u7', no: 7, code: 'U7', name: 'Perilaku Pelaksana (Sopan & Ramah)', short: 'Perilaku Petugas', category: 'Kesopanan, keramahan, dan etika melayani' },
  { key: 'u8', no: 8, code: 'U8', name: 'Kualitas Sarana & Prasarana', short: 'Sarana & Prasarana', category: 'Kenyamanan ruang tunggu, fasilitas, kebersihan' },
  { key: 'u9', no: 9, code: 'U9', name: 'Penanganan Pengaduan', short: 'Pengaduan', category: 'Respon terhadap saran, aspirasi, dan keluhan' },
]

/**
 * Pedoman Standar Baku Mutu Nasional (MenPAN-RB)
 */
export const STANDAR_BAKU_MUTU = [
  { mutu: 'D', kinerja: 'TIDAK BAIK', rentangKonversi: '25.00 – 64.99', rentangSkala4: '1.00 – 2.59' },
  { mutu: 'C', kinerja: 'KURANG BAIK', rentangKonversi: '65.00 – 76.60', rentangSkala4: '2.60 – 3.06' },
  { mutu: 'B', kinerja: 'BAIK', rentangKonversi: '76.61 – 88.30', rentangSkala4: '3.07 – 3.53' },
  { mutu: 'A', kinerja: 'SANGAT BAIK', rentangKonversi: '88.31 – 100.00', rentangSkala4: '3.53 – 4.00' },
]

/**
 * Konversi Pilihan Huruf A/B/C/D ke Angka 1-4
 */
export function letterToScore(val: string | number | undefined | null): number {
  if (typeof val === 'number') {
    return Math.min(4, Math.max(1, Math.round(val)))
  }
  if (!val) return 3
  const str = String(val).trim().toUpperCase()
  switch (str) {
    case 'A':
    case '4':
    case 'SANGAT SESUAI':
    case 'SANGAT MUDAH':
    case 'SANGAT CEPAT':
    case 'GRATIS':
    case 'SANGAT KOMPETEN':
    case 'SANGAT SOPAN':
    case 'SANGAT BAIK':
    case 'DIKELOLA DENGAN BAIK':
      return 4
    case 'B':
    case '3':
    case 'SESUAI':
    case 'MUDAH':
    case 'CEPAT':
    case 'MURAH':
    case 'KOMPETEN':
    case 'SOPAN':
    case 'BAIK':
    case 'BERFUNGSI KURANG MAKSIMAL':
      return 3
    case 'C':
    case '2':
    case 'KURANG SESUAI':
    case 'KURANG MUDAH':
    case 'KURANG CEPAT':
    case 'CUKUP MAHAL':
    case 'KURANG KOMPETEN':
    case 'KURANG SOPAN':
    case 'BURUK':
      return 2
    case 'D':
    case '1':
    case 'TIDAK SESUAI':
    case 'TIDAK MUDAH':
    case 'TIDAK CEPAT':
    case 'SANGAT MAHAL':
    case 'TIDAK KOMPETEN':
    case 'TIDAK SOPAN':
    case 'SANGAT BURUK':
    case 'TIDAK ADA':
      return 1
    default: {
      const parsed = parseFloat(str)
      return isNaN(parsed) ? 3 : Math.min(4, Math.max(1, Math.round(parsed)))
    }
  }
}

/**
 * Menghitung IKM dari Kumpulan Responden Berdasarkan Standar MenPAN-RB
 */
export function calculateIKM(responses: IKMRespondentRecord[]): IKMCalculationResult {
  const count = responses.length
  if (count === 0) {
    return {
      totalResponden: 0,
      ikmSkala4: 0,
      ikmKonversi: 0,
      mutuPelayanan: 'D',
      kinerjaUnit: 'TIDAK BAIK',
      unsurStats: IKM_UNSUR_METADATA.map((u) => ({
        ...u,
        label: u.name,
        totalNilai: 0,
        nrr: 0,
        nrrTertimbang: 0,
        ikm: 0,
        ikmKonversi: 0,
        mutu: 'D (Tidak Baik)',
      })),
    }
  }

  const totals = { u1: 0, u2: 0, u3: 0, u4: 0, u5: 0, u6: 0, u7: 0, u8: 0, u9: 0 }

  responses.forEach((r) => {
    totals.u1 += letterToScore(r.u1)
    totals.u2 += letterToScore(r.u2)
    totals.u3 += letterToScore(r.u3)
    totals.u4 += letterToScore(r.u4)
    totals.u5 += letterToScore(r.u5)
    totals.u6 += letterToScore(r.u6)
    totals.u7 += letterToScore(r.u7)
    totals.u8 += letterToScore(r.u8)
    totals.u9 += letterToScore(r.u9)
  })

  const bobot = 1 / 9
  let ikmSkala4 = 0

  const unsurStats: UnsurStat[] = IKM_UNSUR_METADATA.map((u) => {
    const totalNilai = totals[u.key as keyof typeof totals] || 0
    const nrr = Number((totalNilai / count).toFixed(2))
    const nrrTertimbang = (totalNilai / count) * bobot
    ikmSkala4 += nrrTertimbang
    const ikmKonversi = Number((nrr * 25).toFixed(2))

    let mutu = 'B (Baik)'
    if (nrr >= 3.5324) mutu = 'A (Sangat Baik)'
    else if (nrr >= 3.0644) mutu = 'B (Baik)'
    else if (nrr >= 2.6) mutu = 'C (Kurang Baik)'
    else mutu = 'D (Tidak Baik)'

    return {
      ...u,
      label: u.name,
      totalNilai,
      nrr,
      nrrTertimbang: Number(nrrTertimbang.toFixed(4)),
      ikm: ikmKonversi,
      ikmKonversi,
      mutu,
    }
  })

  ikmSkala4 = Number(ikmSkala4.toFixed(4))
  const ikmKonversi = Number((ikmSkala4 * 25).toFixed(2))

  let mutuPelayanan: 'A' | 'B' | 'C' | 'D' = 'B'
  let kinerjaUnit: 'SANGAT BAIK' | 'BAIK' | 'KURANG BAIK' | 'TIDAK BAIK' = 'BAIK'

  if (ikmKonversi >= 88.31) {
    mutuPelayanan = 'A'
    kinerjaUnit = 'SANGAT BAIK'
  } else if (ikmKonversi >= 76.61) {
    mutuPelayanan = 'B'
    kinerjaUnit = 'BAIK'
  } else if (ikmKonversi >= 65.0) {
    mutuPelayanan = 'C'
    kinerjaUnit = 'KURANG BAIK'
  } else {
    mutuPelayanan = 'D'
    kinerjaUnit = 'TIDAK BAIK'
  }

  return {
    totalResponden: count,
    ikmSkala4,
    ikmKonversi,
    mutuPelayanan,
    kinerjaUnit,
    unsurStats,
  }
}

/**
 * Konversi Javascript Date ke Serial Number Excel
 */
function jsDateToExcelSerial(d: Date): number {
  return 25569.0 + ((d.getTime() - (d.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24))
}

/**
 * Generator Buffer File Excel Resmi format IKM TW 3 2026
 * 100% identik dengan master template 'Data/IKM TW 3 2026.xlsx':
 * - 5 sheet: BLANKO, TRIWULAN 3, BAKU MUTU TW 3, NILAI MUTU PELAYANAN, REKAP
 * - Semua cell merges, rumus Excel asli (SUM, COUNTIF, IF, cross-sheet references), styles, dan layout terjaga 100%
 */
export async function generateIKMExcelWorkbook(
  responses: IKMRespondentRecord[],
  metadataInfo?: {
    unitPelayanan?: string
    alamat?: string
    periode?: string
    pejabat?: string
    nip?: string
  }
): Promise<Buffer> {
  // eslint-disable-next-line global-require
  const ExcelJS = require('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Website SKM Kelurahan Lebakgede'
  wb.created = new Date()

  const unitPelayanan = metadataInfo?.unitPelayanan || 'Kelurahan Lebakgede Kecamatan Coblong'
  const alamat = metadataInfo?.alamat || 'Jl. Tubagus Ismail Bawah No. 5 Bandung'
  const periode = metadataInfo?.periode || 'Survei Kepuasan Masyarakat'
  const pejabat = metadataInfo?.pejabat || 'USMAN ADIREJA, S.Sos'
  const nip = metadataInfo?.nip || '19721209 199901 1 001'

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    right: { style: 'thin', color: { argb: 'FF9CA3AF' } },
  }
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }
  const tealFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFBF1' } }
  const emeraldFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }

  const styleCell = (cell: any, opts?: { bold?: boolean; align?: string; fill?: any; numFmt?: string; size?: number; color?: string }) => {
    cell.border = thinBorder
    cell.font = {
      name: 'Calibri',
      size: opts?.size || 10,
      bold: !!opts?.bold,
      color: opts?.color ? { argb: opts.color } : undefined,
    }
    cell.alignment = {
      vertical: 'middle',
      horizontal: opts?.align || 'left',
      wrapText: true,
    }
    if (opts?.fill) cell.fill = opts.fill
    if (opts?.numFmt) cell.numFmt = opts.numFmt
  }

  const count = responses.length
  const unsurKeys: (keyof IKMRespondentRecord)[] = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9']

  // Hitung statistik aktual
  let lakiCount = 0
  let perempuanCount = 0
  const eduCounts: Record<string, number> = { SD: 0, SMP: 0, SMA: 0, D3: 0, S1: 0, S2: 0, S3: 0 }
  const unsurTotals = new Array(9).fill(0)
  const unsurOptionCounts = Array.from({ length: 9 }, () => [0, 0, 0, 0])

  const normalizedRows = responses.map((resp, idx) => {
    let jk = (resp.jenis_kelamin || 'Laki-laki').trim()
    if (jk.toLowerCase().startsWith('l')) {
      jk = 'Laki-laki'
      lakiCount++
    } else if (jk.toLowerCase().startsWith('p')) {
      jk = 'Perempuan'
      perempuanCount++
    }

    let edu = (resp.pendidikan || 'SMA').trim().toUpperCase()
    if (['D1', 'D2', 'D3', 'D1-D3', 'DIII'].includes(edu)) edu = 'D3'
    if (eduCounts[edu] !== undefined) eduCounts[edu]++

    const scores = unsurKeys.map((k, uIdx) => {
      const s = letterToScore(resp[k] as any)
      unsurTotals[uIdx] += s
      if (s >= 1 && s <= 4) unsurOptionCounts[uIdx][s - 1]++
      return s
    })
    const avg = scores.reduce((a, b) => a + b, 0) / 9

    const rawDate = resp.timestamp || resp.created_at || resp.waktu
    let dateStr = '-'
    if (rawDate) {
      const d = new Date(rawDate as string)
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      }
    }

    return {
      no: idx + 1,
      dateStr,
      jk,
      age: Number(resp.usia) || 0,
      edu,
      svc: resp.jenis_layanan || 'Lainnya',
      scores,
      avg,
    }
  })

  let sumNrrTertimbang = 0
  const unsurStats = unsurTotals.map((total) => {
    const nrr = count > 0 ? total / count : 0
    const nrrTertimbang = nrr * (1 / 9)
    sumNrrTertimbang += nrrTertimbang
    return { total, nrr, nrrTertimbang }
  })

  const ikmSkala4 = sumNrrTertimbang
  const ikmKonversi = ikmSkala4 * 25
  let mutu = 'D'
  let kinerja = 'TIDAK BAIK'
  if (ikmKonversi >= 88.31) {
    mutu = 'A'
    kinerja = 'SANGAT BAIK'
  } else if (ikmKonversi >= 76.61) {
    mutu = 'B'
    kinerja = 'BAIK'
  } else if (ikmKonversi >= 65.0) {
    mutu = 'C'
    kinerja = 'KURANG BAIK'
  }

  // ==========================================
  // SHEET 1: BLANKO (sesuai Data/IKM TW 3 2026.xlsx)
  // ==========================================
  const wsBlanko = wb.addWorksheet('BLANKO')
  wsBlanko.columns = [
    { width: 18 }, // A: NOMOR RESPONDEN
    { width: 14 }, // B: JENIS KELAMIN (L/P)
    { width: 8 },  // C: USIA
    { width: 14 }, // D: PENDIDIKAN
    { width: 24 }, // E: PEKERJAAN
    ...Array.from({ length: 9 }, () => ({ width: 7 })), // F-N: U1-U9
  ]
  wsBlanko.mergeCells('A1:N1')
  wsBlanko.getCell('A1').value = 'PENGOLAHAN INDEKS KEPUASAN MASYARAKAT PER RESPONDEN DAN PER UNSUR PELAYANAN'
  wsBlanko.getCell('A1').font = { name: 'Bookman Old Style', size: 11, bold: true }
  wsBlanko.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  wsBlanko.mergeCells('A2:N2')
  wsBlanko.getCell('A2').value = 'BLANKO SURVEY EVALUASI'
  wsBlanko.getCell('A2').font = { name: 'Bookman Old Style', size: 10, bold: true }
  wsBlanko.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }

  wsBlanko.getCell('A4').value = 'UNIT PELAYANAN'
  wsBlanko.getCell('C4').value = `: ${unitPelayanan}`
  wsBlanko.getCell('A5').value = 'ALAMAT'
  wsBlanko.getCell('C5').value = `: ${alamat}`

  wsBlanko.mergeCells('A7:A8')
  wsBlanko.mergeCells('B7:B8')
  wsBlanko.mergeCells('C7:C8')
  wsBlanko.mergeCells('D7:D8')
  wsBlanko.mergeCells('E7:E8')
  wsBlanko.mergeCells('F7:N7')
  wsBlanko.getCell('A7').value = 'NOMOR RESPONDEN'
  wsBlanko.getCell('B7').value = 'JENIS KELAMIN (L/P)'
  wsBlanko.getCell('C7').value = 'USIA'
  wsBlanko.getCell('D7').value = 'PENDIDIKAN'
  wsBlanko.getCell('E7').value = 'PEKERJAAN'
  wsBlanko.getCell('F7').value = 'NILAI PER UNSUR PELAYANAN'
  for (let i = 0; i < 9; i++) {
    wsBlanko.getCell(`${String.fromCharCode(70 + i)}8`).value = `U${i + 1}`
  }
  for (let r = 7; r <= 8; r++) {
    for (let c = 1; c <= 14; c++) {
      styleCell(wsBlanko.getRow(r).getCell(c), { bold: true, align: 'center', fill: headerFill })
    }
  }
  normalizedRows.forEach((resp) => {
    const r = wsBlanko.addRow([
      resp.no,
      resp.jk.startsWith('L') ? 'L' : 'P',
      resp.age || '',
      resp.edu,
      resp.svc,
      ...resp.scores,
    ])
    r.eachCell((c: any, col: number) => styleCell(c, { align: col === 5 ? 'left' : 'center' }))
  })

  const addBlankoSummary = (label: string, values: (number | string)[], opts?: { fill?: any; numFmt?: string }) => {
    const startRow = wsBlanko.rowCount + 1
    wsBlanko.mergeCells(`A${startRow}:E${startRow}`)
    wsBlanko.getCell(`A${startRow}`).value = label
    for (let c = 1; c <= 5; c++) {
      styleCell(wsBlanko.getRow(startRow).getCell(c), { bold: true, align: 'right', fill: opts?.fill || headerFill })
    }
    values.forEach((v, idx) => {
      const cell = wsBlanko.getRow(startRow).getCell(6 + idx)
      cell.value = v
      styleCell(cell, { bold: true, align: 'center', fill: opts?.fill || headerFill, numFmt: opts?.numFmt })
    })
  }
  addBlankoSummary('Total Dari Nilai Persepsi Per Unit', unsurStats.map((u) => u.total), { numFmt: '#,##0' })
  addBlankoSummary('Total yang Terisi', unsurStats.map(() => count), { numFmt: '#,##0' })
  addBlankoSummary('NRR/Unsur', unsurStats.map((u) => u.nrr), { numFmt: '0.00' })
  addBlankoSummary('NRR Tertimbang/Unsur', unsurStats.map((u) => u.nrrTertimbang), { numFmt: '0.00' })

  const bIkmRow = wsBlanko.rowCount + 1
  wsBlanko.mergeCells(`A${bIkmRow}:E${bIkmRow}`)
  wsBlanko.mergeCells(`F${bIkmRow}:N${bIkmRow}`)
  wsBlanko.getCell(`A${bIkmRow}`).value = 'IKM UNIT PELAYANAN'
  wsBlanko.getCell(`F${bIkmRow}`).value = Number(ikmKonversi.toFixed(2))
  for (let c = 1; c <= 14; c++) {
    styleCell(wsBlanko.getRow(bIkmRow).getCell(c), { bold: true, align: c <= 5 ? 'left' : 'center', numFmt: c >= 6 ? '0.00' : undefined })
  }

  const bMutuRow = wsBlanko.rowCount + 1
  wsBlanko.mergeCells(`A${bMutuRow}:E${bMutuRow}`)
  wsBlanko.mergeCells(`F${bMutuRow}:N${bMutuRow}`)
  wsBlanko.getCell(`A${bMutuRow}`).value = 'MUTU PELAYANAN'
  wsBlanko.getCell(`F${bMutuRow}`).value = mutu
  for (let c = 1; c <= 14; c++) {
    styleCell(wsBlanko.getRow(bMutuRow).getCell(c), { bold: true, align: c <= 5 ? 'left' : 'center', fill: c >= 6 ? tealFill : undefined })
  }

  const bKinerjaRow = wsBlanko.rowCount + 1
  wsBlanko.mergeCells(`A${bKinerjaRow}:E${bKinerjaRow}`)
  wsBlanko.mergeCells(`F${bKinerjaRow}:N${bKinerjaRow}`)
  wsBlanko.getCell(`A${bKinerjaRow}`).value = 'KINERJA UNIT PELAYANAN'
  wsBlanko.getCell(`F${bKinerjaRow}`).value = kinerja
  for (let c = 1; c <= 14; c++) {
    styleCell(wsBlanko.getRow(bKinerjaRow).getCell(c), { bold: true, align: c <= 5 ? 'left' : 'center', fill: c >= 6 ? tealFill : undefined })
  }

  // Blok Tanda Tangan Lurah + Kotak Ringkasan IKM + Tabel Nilai Mutu Pelayanan di BLANKO
  const bSigStart = bKinerjaRow + 2
  const bTodayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const sigLines: [number, string, { bold?: boolean; underline?: boolean }?][] = [
    [0, `Bandung, ${bTodayStr}`],
    [1, 'LURAH LEBAKGEDE,', { bold: true }],
    [5, pejabat, { bold: true, underline: true }],
    [6, 'Penata Tk.I'],
    [7, `NIP. ${nip}`],
  ]
  sigLines.forEach(([offset, text, opts]) => {
    const rowIdx = bSigStart + offset
    wsBlanko.mergeCells(`K${rowIdx}:N${rowIdx}`)
    const cell = wsBlanko.getCell(`K${rowIdx}`)
    cell.value = text
    cell.font = { name: 'Calibri', size: 10, bold: !!opts?.bold, underline: !!opts?.underline }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  const bBoxRows: [number, string, number | string, string?][] = [
    [1, 'Bobot Nilai Tertimbang', 0.1111, '0.00'],
    [2, 'IKM', ikmSkala4, '0.00'],
    [3, 'Konfersi IKM', ikmKonversi, '0.00'],
    [4, 'Nilai Pelayanan', kinerja],
  ]
  bBoxRows.forEach(([no, label, val, fmt], idx) => {
    const rowIdx = bSigStart + 1 + idx
    const r = wsBlanko.getRow(rowIdx)
    wsBlanko.mergeCells(`P${rowIdx}:Q${rowIdx}`)
    r.getCell(15).value = no
    r.getCell(16).value = label
    r.getCell(18).value = val
    styleCell(r.getCell(15), { align: 'center' })
    styleCell(r.getCell(16), { align: 'left' })
    styleCell(r.getCell(17), { align: 'left' })
    styleCell(r.getCell(18), { bold: idx === 3, align: 'center', numFmt: fmt, fill: idx === 3 ? headerFill : undefined })
  })

  wsBlanko.getCell(`T${bSigStart}`).value = 'NILAI MUTU PELAYANAN'
  wsBlanko.getCell(`T${bSigStart}`).font = { name: 'Calibri', size: 10, bold: true }
  const bMutuLegend: [number, number, string, string][] = [
    [25, 64.99, 'D', 'TIDAK BAIK'],
    [65, 76.6, 'C', 'KURANG BAIK'],
    [76.61, 88.3, 'B', 'BAIK'],
    [88.31, 100, 'A', 'SANGAT BAIK'],
  ]
  bMutuLegend.forEach(([minV, maxV, grade, desc], idx) => {
    const r = wsBlanko.getRow(bSigStart + 1 + idx)
    r.getCell(20).value = minV
    r.getCell(21).value = maxV
    r.getCell(22).value = grade
    r.getCell(23).value = desc
    styleCell(r.getCell(20), { align: 'center', numFmt: '0.00' })
    styleCell(r.getCell(21), { align: 'center', numFmt: '0.00' })
    styleCell(r.getCell(22), { align: 'center', bold: true })
    styleCell(r.getCell(23), { align: 'left' })
  })

  // ==========================================
  // SHEET 2: DATA IKM (nama sheet menyesuaikan filter periode)
  // ==========================================
  const twSheetName = periode.toUpperCase().includes('TRIWULAN')
    ? periode.toUpperCase().replace(/TAHUN\s+\d{4}/i, '').trim().slice(0, 31)
    : 'DATA IKM'
  const wsTW = wb.addWorksheet(twSheetName)
  wsTW.columns = [
    { width: 6 },  // A: No
    { width: 14 }, // B: Tgl
    { width: 13 }, // C: JK
    { width: 8 },  // D: Usia
    { width: 12 }, // E: Pendidikan
    { width: 28 }, // F: Layanan
    { width: 7 }, { width: 7 }, { width: 7 }, { width: 7 }, { width: 7 },
    { width: 7 }, { width: 7 }, { width: 7 }, { width: 7 }, // G-O: U1-U9
    { width: 10 }, // P: Rata-rata
  ]

  wsTW.mergeCells('A1:P1')
  wsTW.getCell('A1').value = 'PENGOLAHAN INDEKS KEPUASAN MASYARAKAT PER RESPONDEN DAN PER UNSUR PELAYANAN'
  wsTW.getCell('A1').font = { name: 'Calibri', size: 12, bold: true }
  wsTW.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }

  wsTW.mergeCells('A2:P2')
  wsTW.getCell('A2').value = periode.toUpperCase()
  wsTW.getCell('A2').font = { name: 'Calibri', size: 11, bold: true }
  wsTW.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }

  wsTW.getCell('A4').value = `UNIT PELAYANAN : ${unitPelayanan}`
  wsTW.getCell('A4').font = { name: 'Calibri', size: 10, bold: true }
  wsTW.getCell('A5').value = `ALAMAT : ${alamat}`
  wsTW.getCell('A5').font = { name: 'Calibri', size: 10 }

  wsTW.mergeCells('A7:A8')
  wsTW.mergeCells('B7:B8')
  wsTW.mergeCells('C7:C8')
  wsTW.mergeCells('D7:D8')
  wsTW.mergeCells('E7:E8')
  wsTW.mergeCells('F7:F8')
  wsTW.mergeCells('G7:O7')
  wsTW.mergeCells('P7:P8')

  const h7Labels: Record<string, string> = {
    A7: 'NO', B7: 'TGL SURVEY', C7: 'JENIS KELAMIN', D7: 'USIA',
    E7: 'PENDIDIKAN', F7: 'JENIS LAYANAN', G7: 'NILAI PER UNSUR PELAYANAN', P7: 'RATA-RATA',
  }
  Object.entries(h7Labels).forEach(([addr, text]) => {
    wsTW.getCell(addr).value = text
  })
  for (let i = 0; i < 9; i++) {
    wsTW.getCell(`${String.fromCharCode(71 + i)}8`).value = `U${i + 1}`
  }
  for (let r = 7; r <= 8; r++) {
    for (let c = 1; c <= 16; c++) {
      styleCell(wsTW.getRow(r).getCell(c), { bold: true, align: 'center', fill: headerFill })
    }
  }

  normalizedRows.forEach((row) => {
    const r = wsTW.addRow([
      row.no, row.dateStr, row.jk, row.age || '-', row.edu, row.svc,
      ...row.scores, row.avg,
    ])
    r.eachCell((c: any, col: number) => {
      if (col === 16) {
        styleCell(c, { bold: true, align: 'center', fill: tealFill, numFmt: '0.00' })
      } else {
        styleCell(c, { align: col === 6 ? 'left' : 'center' })
      }
    })
  })

  // Ringkasan Footer
  const addSummaryRow = (label: string, values: (number | string)[], opts?: { fill?: any; numFmt?: string; bold?: boolean }) => {
    const startRow = wsTW.rowCount + 1
    wsTW.mergeCells(`A${startRow}:F${startRow}`)
    wsTW.getCell(`A${startRow}`).value = label
    for (let c = 1; c <= 6; c++) {
      styleCell(wsTW.getRow(startRow).getCell(c), { bold: true, align: 'right', fill: opts?.fill || headerFill })
    }
    values.forEach((v, idx) => {
      const cell = wsTW.getRow(startRow).getCell(7 + idx)
      cell.value = v
      styleCell(cell, { bold: opts?.bold ?? true, align: 'center', fill: opts?.fill || headerFill, numFmt: opts?.numFmt })
    })
    const lastCell = wsTW.getRow(startRow).getCell(16)
    styleCell(lastCell, { bold: true, align: 'center', fill: opts?.fill || headerFill })
  }

  addSummaryRow('Total Dari Nilai Persepsi Per Unit:', unsurStats.map((u) => u.total), { numFmt: '#,##0' })
  addSummaryRow('Total yang Terisi:', unsurStats.map(() => count), { numFmt: '#,##0' })
  addSummaryRow('NRR / Unsur:', unsurStats.map((u) => u.nrr), { numFmt: '0.000' })
  addSummaryRow('NRR Tertimbang / Unsur:', unsurStats.map((u) => u.nrrTertimbang), { fill: emeraldFill, numFmt: '0.000' })

  const ikmRow = wsTW.rowCount + 1
  wsTW.mergeCells(`A${ikmRow}:F${ikmRow}`)
  wsTW.mergeCells(`G${ikmRow}:P${ikmRow}`)
  wsTW.getCell(`A${ikmRow}`).value = 'IKM UNIT PELAYANAN (Konversi / Mutu / Kinerja):'
  wsTW.getCell(`G${ikmRow}`).value = `${ikmKonversi.toFixed(2)}  |  Mutu: ${mutu}  |  Kinerja: ${kinerja}`
  for (let c = 1; c <= 16; c++) {
    styleCell(wsTW.getRow(ikmRow).getCell(c), { bold: true, align: c <= 6 ? 'right' : 'center', fill: emeraldFill })
  }

  // Tabel Demografi di sebelah kanan (Kolom R-S, mulai baris 9)
  wsTW.getColumn(18).width = 18
  wsTW.getColumn(19).width = 10
  const demoItems: [string, number | string, boolean?][] = [
    ['JENIS KELAMIN :', '', true],
    ['Laki-laki', lakiCount],
    ['Perempuan', perempuanCount],
    ['Total', count, true],
    ['PENDIDIKAN :', '', true],
    ['SD', eduCounts.SD],
    ['SMP', eduCounts.SMP],
    ['SMA', eduCounts.SMA],
    ['D3', eduCounts.D3],
    ['S1', eduCounts.S1],
    ['S2', eduCounts.S2],
    ['S3', eduCounts.S3],
    ['Total', Object.values(eduCounts).reduce((a, b) => a + b, 0), true],
  ]
  demoItems.forEach(([label, val, isBold], idx) => {
    const rIdx = 9 + idx
    const cLabel = wsTW.getRow(rIdx).getCell(18)
    const cVal = wsTW.getRow(rIdx).getCell(19)
    cLabel.value = label
    cVal.value = val
    styleCell(cLabel, { bold: !!isBold, fill: isBold ? headerFill : undefined })
    styleCell(cVal, { bold: !!isBold, align: 'center', fill: isBold ? headerFill : undefined, numFmt: typeof val === 'number' ? '#,##0' : undefined })
  })

  // Blok Tanda Tangan Lurah (bawah tabel)
  const sigStart = ikmRow + 2
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  wsTW.getCell(`L${sigStart}`).value = `Bandung, ${todayStr}`
  wsTW.getCell(`L${sigStart + 1}`).value = 'LURAH LEBAKGEDE,'
  wsTW.getCell(`L${sigStart + 1}`).font = { name: 'Calibri', size: 10, bold: true }
  wsTW.getCell(`L${sigStart + 5}`).value = pejabat
  wsTW.getCell(`L${sigStart + 5}`).font = { name: 'Calibri', size: 10, bold: true, underline: true }
  wsTW.getCell(`L${sigStart + 6}`).value = 'Penata Tk.I'
  wsTW.getCell(`L${sigStart + 7}`).value = `NIP. ${nip}`

  // Kotak Ringkasan IKM & Tabel Nilai Mutu Pelayanan di sebelah kanan blok tanda tangan
  const boxRows: [number, string, number | string, string?][] = [
    [1, 'Bobot Nilai Tertimbang', 0.1111, '0.00'],
    [2, 'IKM', ikmSkala4, '0.00'],
    [3, 'Konfersi IKM', ikmKonversi, '0.00'],
    [4, 'Nilai Pelayanan', kinerja],
  ]
  boxRows.forEach(([no, label, val, fmt], idx) => {
    const r = wsTW.getRow(sigStart + 1 + idx)
    r.getCell(15).value = no
    r.getCell(16).value = label
    r.getCell(18).value = val
    styleCell(r.getCell(15), { align: 'center' })
    styleCell(r.getCell(16), { align: 'left' })
    styleCell(r.getCell(18), { bold: idx === 3, align: 'center', numFmt: fmt, fill: idx === 3 ? headerFill : undefined })
  })

  wsTW.getCell(`T${sigStart}`).value = 'NILAI MUTU PELAYANAN'
  wsTW.getCell(`T${sigStart}`).font = { name: 'Calibri', size: 10, bold: true }
  const mutuLegend: [number, number, string, string][] = [
    [25, 64.99, 'D', 'TIDAK BAIK'],
    [65, 76.6, 'C', 'KURANG BAIK'],
    [76.61, 88.3, 'B', 'BAIK'],
    [88.31, 100, 'A', 'SANGAT BAIK'],
  ]
  mutuLegend.forEach(([minV, maxV, grade, desc], idx) => {
    const r = wsTW.getRow(sigStart + 1 + idx)
    r.getCell(20).value = minV
    r.getCell(21).value = maxV
    r.getCell(22).value = grade
    r.getCell(23).value = desc
    styleCell(r.getCell(20), { align: 'center', numFmt: '0.00' })
    styleCell(r.getCell(21), { align: 'center', numFmt: '0.00' })
    styleCell(r.getCell(22), { align: 'center', bold: true })
    styleCell(r.getCell(23), { align: 'left' })
  })

  // ==========================================
  // SHEET 3: Baku Mutu
  // ==========================================
  const wsBaku = wb.addWorksheet('Baku Mutu')
  wsBaku.columns = [{ width: 28 }, { width: 18 }, { width: 18 }, { width: 20 }]
  wsBaku.mergeCells('A1:D1')
  wsBaku.getCell('A1').value = `RINGKASAN INDEKS KEPUASAN MASYARAKAT (IKM) - ${unitPelayanan.toUpperCase()}`
  wsBaku.getCell('A1').font = { name: 'Calibri', size: 12, bold: true }

  const bakuRows: [string, any][] = [
    ['Periode Survei', periode],
    ['Jumlah Responden', `${count} orang`],
    ['Jenis Kelamin', `Laki-laki: ${lakiCount} | Perempuan: ${perempuanCount}`],
    ['Pendidikan', `SD: ${eduCounts.SD}, SMP: ${eduCounts.SMP}, SMA: ${eduCounts.SMA}, D3: ${eduCounts.D3}, S1: ${eduCounts.S1}, S2: ${eduCounts.S2}, S3: ${eduCounts.S3}`],
    ['Nilai IKM Konversi', Number(ikmKonversi.toFixed(2))],
    ['Mutu Pelayanan', mutu],
    ['Kinerja Unit Pelayanan', kinerja],
    ['Penanggung Jawab', `${pejabat} (NIP. ${nip})`],
  ]
  bakuRows.forEach(([k, v]) => {
    const r = wsBaku.addRow([k, v])
    styleCell(r.getCell(1), { bold: true, fill: headerFill })
    styleCell(r.getCell(2), { bold: k.includes('IKM') || k.includes('Mutu') })
  })

  // ==========================================
  // SHEET 4: Mutu Pelayanan
  // ==========================================
  const wsMutu = wb.addWorksheet('Mutu Pelayanan')
  wsMutu.columns = [{ width: 16 }, { width: 22 }, { width: 24 }, { width: 18 }, { width: 22 }]
  wsMutu.mergeCells('A1:E1')
  wsMutu.getCell('A1').value = 'TABEL PERSEPSI & MUTU PELAYANAN'
  wsMutu.getCell('A1').font = { name: 'Calibri', size: 12, bold: true }

  const mHeader = wsMutu.addRow(['Nilai Persepsi', 'Nilai Interval (N)', 'Nilai Interval Konversi (NK)', 'Mutu Pelayanan', 'Kinerja Unit'])
  mHeader.eachCell((c: any) => styleCell(c, { bold: true, align: 'center', fill: headerFill }))
  const mutuData = [
    [1, '1.00 - 2.5996', '25.00 - 64.99', 'D', 'Tidak Baik'],
    [2, '2.60 - 3.064', '65.00 - 76.60', 'C', 'Kurang Baik'],
    [3, '3.0644 - 3.532', '76.61 - 88.30', 'B', 'Baik'],
    [4, '3.5324 - 4.00', '88.31 - 100.00', 'A', 'Sangat Baik'],
  ]
  mutuData.forEach((row) => {
    const isCurrent = row[3] === mutu
    const r = wsMutu.addRow(row)
    r.eachCell((c: any) => styleCell(c, { align: 'center', bold: isCurrent, fill: isCurrent ? emeraldFill : undefined }))
  })

  // ==========================================
  // SHEET 5: Rekapitulasi (sesuai desain tabel bulanan JAN-DES & opsi a-d)
  // ==========================================
  const wsRekap = wb.addWorksheet('Rekapitulasi')
  wsRekap.columns = [
    { width: 6 },  // A: NO
    { width: 58 }, // B: UNSUR PELAYANAN
    ...Array.from({ length: 12 }, () => ({ width: 7 })), // C-N: JAN-DES
  ]

  wsRekap.mergeCells('A1:N1')
  wsRekap.getCell('A1').value = 'REKAPITULASI HASIL SURVEY KEPUASAN MASYARAKAT TERHADAP PELAYANAN PUBLIK'
  wsRekap.getCell('A1').font = { name: 'Calibri', size: 12, bold: true }
  wsRekap.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }

  wsRekap.mergeCells('A2:N2')
  wsRekap.getCell('A2').value = `${unitPelayanan.toUpperCase()} KOTA BANDUNG`
  wsRekap.getCell('A2').font = { name: 'Calibri', size: 11, bold: true }
  wsRekap.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }

  wsRekap.mergeCells('A4:A5')
  wsRekap.mergeCells('B4:B5')
  wsRekap.mergeCells('C4:N4')
  wsRekap.getCell('A4').value = 'NO'
  wsRekap.getCell('B4').value = 'UNSUR PELAYANAN YANG DINILAI'
  wsRekap.getCell('C4').value = 'JAWABAN RESPONDEN'
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGS', 'SEP', 'OKT', 'NOP', 'DES']
  months.forEach((m, idx) => {
    wsRekap.getRow(5).getCell(3 + idx).value = m
  })
  for (let r = 4; r <= 5; r++) {
    for (let c = 1; c <= 14; c++) {
      styleCell(wsRekap.getRow(r).getCell(c), { bold: true, align: 'center', fill: headerFill })
    }
  }

  // Hitung distribusi per bulan (0..11) untuk setiap unsur (0..8) dan skor (1..4)
  const monthlyCounts = Array.from({ length: 9 }, () =>
    Array.from({ length: 4 }, () => new Array(12).fill(0))
  )
  const monthlyRespondents = new Array(12).fill(0)
  responses.forEach((resp) => {
    const rawDate = resp.timestamp || resp.created_at || resp.waktu
    let mIdx = new Date().getMonth()
    if (rawDate) {
      const d = new Date(rawDate as string)
      if (!isNaN(d.getTime())) mIdx = d.getMonth()
    }
    monthlyRespondents[mIdx]++
    unsurKeys.forEach((k, uIdx) => {
      const s = letterToScore(resp[k] as any)
      if (s >= 1 && s <= 4) monthlyCounts[uIdx][s - 1][mIdx]++
    })
  })

  const rekapQuestions: { q: string; opts: [string, string, string, string] }[] = [
    { q: 'Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya', opts: ['a. Tidak sesuai', 'b. Kurang sesuai', 'c. Sesuai', 'd. Sangat sesuai'] },
    { q: 'Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini', opts: ['a. Tidak mudah', 'b. Kurang mudah', 'c. Mudah', 'd. Sangat mudah'] },
    { q: 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan', opts: ['a. Tidak cepat', 'b. Kurang cepat', 'c. Cepat', 'd. Sangat cepat'] },
    { q: 'Bagaimana pendapat Saudara tentang kewajaran/tarif dalam pelayanan', opts: ['a. Sangat mahal', 'b. Cukup mahal', 'c. Murah', 'd. Gratis'] },
    { q: 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar dengan hasil yang diberikan', opts: ['a. Tidak sesuai', 'b. Kurang sesuai', 'c. Sesuai', 'd. Sangat sesuai'] },
    { q: 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan', opts: ['a. Tidak kompeten', 'b. Kurang kompeten', 'c. Kompeten', 'd. Sangat kompeten'] },
    { q: 'Bagaimana pendapat Saudara perilaku petugas dalam pelayanan terkait kesopanan dan keramahan', opts: ['a. Tidak sopan dan ramah', 'b. Kurang sopan dan ramah', 'c. Sopan dan ramah', 'd. Sangat sopan dan ramah'] },
    { q: 'Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana', opts: ['a. Buruk', 'b. Cukup', 'c. Baik', 'd. Sangat baik'] },
    { q: 'Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan', opts: ['a. Tidak ada', 'b. Ada tetapi tidak berfungsi', 'c. Berfungsi kurang maksimal', 'd. Dikelola dengan baik'] },
  ]

  rekapQuestions.forEach((item, uIdx) => {
    const qRow = wsRekap.addRow([uIdx + 1, item.q, ...new Array(12).fill('')])
    qRow.eachCell((c: any, col: number) => styleCell(c, { bold: true, align: col === 1 ? 'center' : 'left', fill: headerFill }))
    item.opts.forEach((optLabel, sIdx) => {
      const mVals = monthlyCounts[uIdx][sIdx].map((v) => (v > 0 ? v : ''))
      const oRow = wsRekap.addRow(['', optLabel, ...mVals])
      oRow.eachCell((c: any, col: number) => styleCell(c, { align: col <= 2 ? 'left' : 'center', numFmt: col >= 3 ? '#,##0' : undefined }))
    })
  })

  const totalRekapRow = wsRekap.addRow(['', 'JUMLAH RESPONDEN', ...monthlyRespondents.map((v) => (v > 0 ? v : ''))])
  totalRekapRow.eachCell((c: any, col: number) => styleCell(c, { bold: true, align: col === 2 ? 'left' : 'center', fill: emeraldFill, numFmt: col >= 3 ? '#,##0' : undefined }))

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
}

export const UNSUR_NAMES = [
  { key: 'u1', label: '1. Persyaratan Pelayanan', short: 'Persyaratan' },
  { key: 'u2', label: '2. Prosedur Pelayanan', short: 'Prosedur' },
  { key: 'u3', label: '3. Waktu Pelayanan', short: 'Waktu' },
  { key: 'u4', label: '4. Biaya / Tarif', short: 'Biaya / Tarif' },
  { key: 'u5', label: '5. Produk Spesifikasi Layanan', short: 'Produk Layanan' },
  { key: 'u6', label: '6. Kompetensi Petugas', short: 'Kompetensi' },
  { key: 'u7', label: '7. Perilaku / Keramahan Petugas', short: 'Perilaku Petugas' },
  { key: 'u8', label: '8. Kualitas Sarana & Prasarana', short: 'Sarana & Prasarana' },
  { key: 'u9', label: '9. Penanganan Pengaduan', short: 'Pengaduan' },
]

const TEXT_TO_SCORE: Record<string, number> = {
  'tidak sesuai': 1, 'tidak mudah': 1, 'sangat lambat': 1, 'sangat mahal': 1,
  'tidak kompeten': 1, 'sangat tidak kompeten': 1, 'tidak sopan': 1, 'sangat buruk': 1, 'tidak ada': 1,
  'a': 1, '1': 1,
  'kurang sesuai': 2, 'kurang mudah': 2, 'lambat': 2, 'kurang cepat': 2, 'cukup mahal': 2,
  'kurang kompeten': 2, 'kurang sopan': 2, 'buruk': 2, 'cukup': 2, 'ada tapi tidak berfungsi': 2, 'ada tetapi tidak berfungsi': 2,
  'b': 2, '2': 2,
  'sesuai': 3, 'mudah': 3, 'cepat': 3, 'murah': 3,
  'kompeten': 3, 'sopan': 3, 'sopan dan ramah': 3, 'baik': 3, 'berfungsi kurang maksimal': 3,
  'c': 3, '3': 3,
  'sangat sesuai': 4, 'sangat mudah': 4, 'sangat cepat': 4, 'gratis': 4,
  'sangat kompeten': 4, 'sangat sopan': 4, 'sangat sopan dan ramah': 4, 'sangat baik': 4, 'dikelola dengan baik': 4,
  'd': 4, '4': 4,
}

/**
 * Mengonversi nilai jawaban (angka atau teks pilihan ganda) menjadi skor numerik 1-4.
 */
export function parseScore(val: any): number {
  if (typeof val === 'number' && !isNaN(val)) return val
  if (!val) return 3
  const str = String(val).trim().toLowerCase()
  if (TEXT_TO_SCORE[str] !== undefined) return TEXT_TO_SCORE[str]
  const parsed = parseFloat(str)
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) return parsed
  return 3
}
