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

  // Baca template master yang sudah tersemat secara permanen (aman untuk serverless, docker, maupun client-side bundle)
  const templateBuf = Buffer.from(IKM_MASTER_TEMPLATE_BASE64, 'base64')
  const wb = xlsx.read(templateBuf, { type: 'buffer', cellStyles: true })

  const wsTW = wb.Sheets['TRIWULAN 3']
  const count = responses.length

  // 2. Inject respondent data ke sheet 'TRIWULAN 3' (baris 9 s/d 103 = index r: 8 s/d 102)
  for (let i = 0; i < 95; i++) {
    const rowNum = 9 + i // row 9, 10, ..., 103
    if (i < count) {
      const resp = responses[i]
      
      // Kolom A: Nomor Responden (A9 = 1, A10 = A9+1, dst)
      if (i === 0) {
        wsTW[`A${rowNum}`] = { t: 'n', v: 1, z: 'General', w: '1', s: { patternType: 'none' } }
      } else {
        const prevRow = rowNum - 1
        wsTW[`A${rowNum}`] = { t: 'n', v: i + 1, f: `A${prevRow}+1`, z: 'General', w: String(i + 1), s: { patternType: 'none' } }
      }

      // Kolom B: Tanggal Survey (format m/d/yy h:mm)
      let dateSerial = 46060.384247685186
      let dateStr = '2/7/26 9:13'
      if (resp.timestamp || resp.waktu || resp.created_at) {
        const d = new Date((resp.timestamp || resp.created_at || resp.waktu) as string)
        if (!isNaN(d.getTime())) {
          dateSerial = jsDateToExcelSerial(d)
          dateStr = xlsx.SSF.format('m/d/yy h:mm', dateSerial)
        }
      }
      wsTW[`B${rowNum}`] = { t: 'n', v: dateSerial, z: 'm/d/yy h:mm', w: dateStr, s: { patternType: 'none' } }

      // Kolom C: Jenis Kelamin (Laki-laki / Perempuan)
      let jk = (resp.jenis_kelamin || 'Laki-laki').trim()
      if (jk.toLowerCase().startsWith('l')) jk = 'Laki-laki'
      else if (jk.toLowerCase().startsWith('p')) jk = 'Perempuan'
      wsTW[`C${rowNum}`] = { t: 's', v: jk, r: `<t>${jk}</t>`, h: jk, z: 'General', w: jk, s: { patternType: 'none' } }

      // Kolom D: Usia (number)
      const age = Number(resp.usia) || 30
      wsTW[`D${rowNum}`] = { t: 'n', v: age, z: 'General', w: String(age), s: { patternType: 'none' } }

      // Kolom E: Pendidikan (SD, SMP, SMA, D1-D3, S1, S2, S3)
      let edu = (resp.pendidikan || 'SMA').trim().toUpperCase()
      if (['D1', 'D2', 'D3'].includes(edu)) edu = 'D3'
      wsTW[`E${rowNum}`] = { t: 's', v: edu, r: `<t>${edu}</t>`, h: edu, z: 'General', w: edu, s: { patternType: 'none' } }

      // Kolom F: Pekerjaan / Jenis Layanan
      const svc = resp.jenis_layanan || 'Lainnya'
      wsTW[`F${rowNum}`] = { t: 's', v: svc, r: `<t>${svc}</t>`, h: svc, z: 'General', w: svc, s: { patternType: 'none' } }

      // Kolom G-O: Nilai Per Unsur Pelayanan (U1 - U9)
      const unsurs: (keyof IKMRespondentRecord)[] = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9']
      unsurs.forEach((key, uIdx) => {
        const colLetter = String.fromCharCode(71 + uIdx) // 71 = 'G'
        const score = letterToScore(resp[key] as any)
        wsTW[`${colLetter}${rowNum}`] = { t: 'n', v: score, z: 'General', w: String(score), s: { patternType: 'none' } }
      })
    } else {
      // Baris kosong filler (baris count + 9 sampai 103)
      if (i === count) {
        wsTW[`A${rowNum}`] = { t: 'e', v: 23, f: '#REF!+1', w: '#REF!', z: 'General', s: { patternType: 'none' } }
      } else {
        const prevRow = rowNum - 1
        wsTW[`A${rowNum}`] = { t: 'e', v: 23, f: `A${prevRow}+1`, w: '#REF!', z: 'General', s: { patternType: 'none' } }
      }
      wsTW[`B${rowNum}`] = { t: 'z', z: 'General', s: { patternType: 'none' } }
      wsTW[`C${rowNum}`] = { t: 'z', z: 'General', s: { patternType: 'none' } }
      wsTW[`D${rowNum}`] = { t: 'z', z: 'General', s: { patternType: 'none' } }
      wsTW[`E${rowNum}`] = { t: 'z', z: 'General', s: { patternType: 'none' } }
      wsTW[`F${rowNum}`] = { t: 'z', z: 'General', s: { patternType: 'none' } }
      for (let uIdx = 0; uIdx < 9; uIdx++) {
        const colLetter = String.fromCharCode(71 + uIdx)
        wsTW[`${colLetter}${rowNum}`] = {
          t: 'n',
          v: 0,
          z: '_-* #,##0_-;\\-* #,##0_-;_-* "-"_-;_-@_-',
          w: ' - ',
          s: { patternType: 'none' }
        }
      }
    }
  }

  // 3. Baris 105: Update "Total yang Terisi" di kolom G-O dengan jumlah responden aktual
  for (let c = 6; c <= 14; c++) {
    const addr = xlsx.utils.encode_cell({ r: 104, c })
    wsTW[addr] = { t: 'n', v: count, z: '#,##0', w: String(count), s: { patternType: 'none' } }
  }

  // 4. Update Pejabat dan NIP jika disediakan
  if (metadataInfo?.pejabat) {
    wsTW['L116'] = { t: 's', v: metadataInfo.pejabat, r: `<t>${metadataInfo.pejabat}</t>`, h: metadataInfo.pejabat, z: 'General', w: metadataInfo.pejabat, s: { patternType: 'none' } }
  }
  if (metadataInfo?.nip) {
    wsTW['L118'] = { t: 's', v: `NIP. ${metadataInfo.nip}`, r: `<t>NIP. ${metadataInfo.nip}</t>`, h: `NIP. ${metadataInfo.nip}`, z: 'General', w: `NIP. ${metadataInfo.nip}`, s: { patternType: 'none' } }
  }

  // 5. Generate buffer dengan cellStyles: true agar format visual, garis, warna persis template master
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx', cellStyles: true })
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
}
