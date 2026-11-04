/**
 * IKM Calculator & Report Generator
 * Berdasarkan Pedoman Resmi Menteri PAN-RB untuk Pengolahan Survei Kepuasan Masyarakat (SKM)
 * Menggunakan 9 Unsur Pelayanan Publik dengan Bobot Rata-rata Tertimbang (1/9)
 * 
 * CATATAN KEAMANAN:
 * File ini HANYA berisi rumus kalkulasi, tipe data, dan pembuat format laporan Excel.
 * TIDAK mengandung data pribadi responden, aman untuk di-commit ke repositori Git publik.
 */

export interface IKMRespondentRecord {
  no?: number
  id: string
  created_at?: string
  waktu?: string
  timestamp?: string
  jenis_kelamin?: string
  usia?: string
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

  const bobot = 1 / 9 // 0.111111...
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
 * Generator Buffer File Excel Resmi format IKM TW 3
 * Menghasilkan workbook dengan 2 Sheet:
 * 1. DATA_RESPONDEN: Daftar responden dan skor 9 unsur
 * 2. BAKU_MUTU: Ringkasan Nilai IKM, Mutu, dan Kinerja Unit
 */
export function generateIKMExcelWorkbook(
  responses: IKMRespondentRecord[],
  metadataInfo?: {
    unitPelayanan?: string
    alamat?: string
    periode?: string
    pejabat?: string
    nip?: string
  }
): Buffer {
  // eslint-disable-next-line global-require
  const xlsx = require('xlsx')

  const calc = calculateIKM(responses)

  // Sheet 1: DATA_RESPONDEN
  const dataRows = responses.map((r, idx) => {
    const u1 = letterToScore(r.u1)
    const u2 = letterToScore(r.u2)
    const u3 = letterToScore(r.u3)
    const u4 = letterToScore(r.u4)
    const u5 = letterToScore(r.u5)
    const u6 = letterToScore(r.u6)
    const u7 = letterToScore(r.u7)
    const u8 = letterToScore(r.u8)
    const u9 = letterToScore(r.u9)
    const avg = Number(((u1 + u2 + u3 + u4 + u5 + u6 + u7 + u8 + u9) / 9).toFixed(2))

    let nilaiHuruf = 'B'
    if (avg >= 3.53) nilaiHuruf = 'A'
    else if (avg >= 3.07) nilaiHuruf = 'B'
    else if (avg >= 2.6) nilaiHuruf = 'C'
    else nilaiHuruf = 'D'

    return {
      'NO': idx + 1,
      'NOMOR RESPONDEN': r.no || idx + 1,
      'ID RESPONDEN': r.id,
      'WAKTU': r.waktu || r.created_at || new Date().toISOString(),
      'JENIS KELAMIN': r.jenis_kelamin || '-',
      'USIA': r.usia || '-',
      'PENDIDIKAN': r.pendidikan || '-',
      'JENIS LAYANAN': r.jenis_layanan || '-',
      'U1 - Persyaratan': u1,
      'U2 - Prosedur': u2,
      'U3 - Waktu': u3,
      'U4 - Biaya/Tarif': u4,
      'U5 - Produk Layanan': u5,
      'U6 - Kompetensi': u6,
      'U7 - Perilaku/Keramahan': u7,
      'U8 - Sarana & Prasarana': u8,
      'U9 - Pengaduan': u9,
      'RATA-RATA': avg,
      'MUTU': nilaiHuruf,
      'SARAN & MASUKAN': r.saran || '',
    }
  })

  const wb = xlsx.utils.book_new()
  const wsData = xlsx.utils.json_to_sheet(dataRows)
  xlsx.utils.book_append_sheet(wb, wsData, 'DATA_RESPONDEN')

  // Sheet 2: BAKU_MUTU & PENGOLAHAN
  const summaryRows = [
    { 'INDIKATOR': 'Unit Pelayanan', 'NILAI': metadataInfo?.unitPelayanan || 'Kelurahan Lebakgede Kecamatan Coblong' },
    { 'INDIKATOR': 'Alamat', 'NILAI': metadataInfo?.alamat || 'Jl. Tubagus Ismail Bawah No. 5 Bandung' },
    { 'INDIKATOR': 'Periode Evaluasi', 'NILAI': metadataInfo?.periode || 'Triwulan Evaluasi Pelayanan Publik' },
    { 'INDIKATOR': 'Jumlah Responden', 'NILAI': calc.totalResponden },
    { 'INDIKATOR': 'Nilai IKM (Skala 4)', 'NILAI': calc.ikmSkala4 },
    { 'INDIKATOR': 'Nilai Konversi IKM (0-100)', 'NILAI': calc.ikmKonversi },
    { 'INDIKATOR': 'Mutu Pelayanan', 'NILAI': calc.mutuPelayanan },
    { 'INDIKATOR': 'Kinerja Unit Pelayanan', 'NILAI': calc.kinerjaUnit },
    { 'INDIKATOR': 'Pejabat Pengesah', 'NILAI': metadataInfo?.pejabat || 'Lurah Lebakgede' },
    { 'INDIKATOR': 'NIP', 'NILAI': metadataInfo?.nip || '-' },
  ]

  calc.unsurStats.forEach((u) => {
    summaryRows.push({
      'INDIKATOR': `Nilai Rata-rata ${u.code} (${u.name})`,
      'NILAI': `${u.nrr} | Konversi: ${u.ikmKonversi} (${u.mutu})` as any,
    })
  })

  const wsSummary = xlsx.utils.json_to_sheet(summaryRows)
  xlsx.utils.book_append_sheet(wb, wsSummary, 'BAKU_MUTU')

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
}
