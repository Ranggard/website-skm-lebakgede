/**
 * Database Seed & Baseline Data dari dokumen resmi:
 * "Data/IKM TW 3 2026.xlsx"
 * 
 * Pengolahan Indeks Kepuasan Masyarakat (IKM)
 * Unit Pelayanan: Kantor Kelurahan Lebakgede, Kecamatan Coblong, Kota Bandung
 * Periode: Triwulan III Tahun 2026 (1 Juli 2026 s/d 30 September 2026)
 * Disahkan oleh: Lurah Lebakgede, Usman Adireja, S.Sos (Penata Tk.I / NIP. 19721209 199901 1 001)
 */

export interface IKMRespondentData {
  no: number
  id: string
  waktu: string
  timestamp: string // ISO string
  jenis_kelamin: 'Laki-laki' | 'Perempuan'
  usia: string
  pendidikan: 'SD' | 'SMP' | 'SMA' | 'D1-D3' | 'S1' | 'S2' | 'S3'
  jenis_layanan: string
  u1: number // 1. Persyaratan Pelayanan
  u2: number // 2. Prosedur Pelayanan
  u3: number // 3. Waktu Pelayanan
  u4: number // 4. Biaya / Tarif Pelayanan
  u5: number // 5. Produk Spesifikasi Jenis Pelayanan
  u6: number // 6. Kompetensi Pelaksana
  u7: number // 7. Perilaku Pelaksana (Sopan & Ramah)
  u8: number // 8. Penanganan Pengaduan, Saran dan Masukan
  u9: number // 9. Kualitas Sarana dan Prasarana
  saran: string
  skor_rata: number
  nilai: 'A' | 'B' | 'C' | 'D'
}

export const IKM_TW3_RESPONDENTS: IKMRespondentData[] = [
  {
    no: 1,
    id: "RESP-2026-0702-001",
    waktu: "02/07/2026 09:13",
    timestamp: "2026-07-02T09:13:19.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "41 Tahun",
    pendidikan: "S1",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 3, u2: 4, u3: 4, u4: 4, u5: 3, u6: 3, u7: 3, u8: 4, u9: 4,
    saran: "Pelayanan sudah cukup responsif dan ramah, pertahankan.",
    skor_rata: 3.56,
    nilai: "B"
  },
  {
    no: 2,
    id: "RESP-2026-0706-002",
    waktu: "06/07/2026 11:34",
    timestamp: "2026-07-06T11:34:09.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "55 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Kartu Keluarga (KK)",
    u1: 3, u2: 3, u3: 3, u4: 4, u5: 3, u6: 4, u7: 4, u8: 3, u9: 4,
    saran: "Pengurusan KK cepat dan tidak dipungut biaya apapun.",
    skor_rata: 3.44,
    nilai: "B"
  },
  {
    no: 3,
    id: "RESP-2026-0706-003",
    waktu: "06/07/2026 14:54",
    timestamp: "2026-07-06T14:54:38.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "50 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 4, u2: 4, u3: 3, u4: 4, u5: 3, u6: 4, u7: 3, u8: 3, u9: 4,
    saran: "Petugas sangat membantu mengarahkan alur berkas.",
    skor_rata: 3.56,
    nilai: "B"
  },
  {
    no: 4,
    id: "RESP-2026-0707-004",
    waktu: "07/07/2026 10:16",
    timestamp: "2026-07-07T10:16:42.000Z",
    jenis_kelamin: "Perempuan",
    usia: "51 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Domisili",
    u1: 3, u2: 3, u3: 3, u4: 4, u5: 3, u6: 3, u7: 3, u8: 3, u9: 4,
    saran: "Surat domisili langsung jadi dalam waktu singkat.",
    skor_rata: 3.22,
    nilai: "B"
  },
  {
    no: 5,
    id: "RESP-2026-0707-005",
    waktu: "07/07/2026 10:40",
    timestamp: "2026-07-07T10:40:38.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "36 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 3, u2: 3, u3: 4, u4: 4, u5: 4, u6: 3, u7: 4, u8: 3, u9: 4,
    saran: "Ruang tunggu bersih dan nyaman.",
    skor_rata: 3.56,
    nilai: "B"
  },
  {
    no: 6,
    id: "RESP-2026-0707-006",
    waktu: "07/07/2026 10:59",
    timestamp: "2026-07-07T10:59:08.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "58 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 4, u2: 3, u3: 3, u4: 4, u5: 3, u6: 3, u7: 3, u8: 4, u9: 4,
    saran: "Pelayanan sangat baik dan sopan santun petugas terjaga.",
    skor_rata: 3.44,
    nilai: "B"
  },
  {
    no: 7,
    id: "RESP-2026-0715-007",
    waktu: "15/07/2026 09:18",
    timestamp: "2026-07-15T09:18:12.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "31 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Tidak Mampu (SKTM)",
    u1: 3, u2: 3, u3: 3, u4: 4, u5: 3, u6: 3, u7: 4, u8: 3, u9: 4,
    saran: "Pengurusan SKTM dipermudah tanpa syarat yang berbelit.",
    skor_rata: 3.33,
    nilai: "B"
  },
  {
    no: 8,
    id: "RESP-2026-0720-008",
    waktu: "20/07/2026 13:52",
    timestamp: "2026-07-20T13:52:53.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "50 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 3, u2: 3, u3: 3, u4: 4, u5: 3, u6: 3, u7: 3, u8: 3, u9: 4,
    saran: "Semoga ke depannya antrean digital bisa diterapkan.",
    skor_rata: 3.22,
    nilai: "B"
  },
  {
    no: 9,
    id: "RESP-2026-0723-009",
    waktu: "23/07/2026 10:06",
    timestamp: "2026-07-23T10:06:42.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "26 Tahun",
    pendidikan: "D1-D3",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 4, u2: 4, u3: 4, u4: 4, u5: 4, u6: 4, u7: 4, u8: 4, u9: 4,
    saran: "Sangat puas! Seluruh tahapan berjalan transparan dan prima.",
    skor_rata: 4.00,
    nilai: "A"
  },
  {
    no: 10,
    id: "RESP-2026-0729-010",
    waktu: "29/07/2026 11:53",
    timestamp: "2026-07-29T11:53:23.000Z",
    jenis_kelamin: "Perempuan",
    usia: "34 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 3, u2: 3, u3: 4, u4: 4, u5: 3, u6: 3, u7: 3, u8: 3, u9: 4,
    saran: "Petugas loket sangat ramah dan sabar menjawab pertanyaan.",
    skor_rata: 3.33,
    nilai: "B"
  },
  {
    no: 11,
    id: "RESP-2026-0808-011",
    waktu: "08/08/2026 15:23",
    timestamp: "2026-08-08T15:23:54.000Z",
    jenis_kelamin: "Perempuan",
    usia: "21 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 4, u2: 3, u3: 3, u4: 4, u5: 3, u6: 3, u7: 3, u8: 3, u9: 4,
    saran: "Prosedur jelas dan mudah dipahami anak muda.",
    skor_rata: 3.33,
    nilai: "B"
  },
  {
    no: 12,
    id: "RESP-2026-0812-012",
    waktu: "12/08/2026 13:34",
    timestamp: "2026-08-12T13:34:09.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "29 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 4, u2: 4, u3: 4, u4: 4, u5: 4, u6: 4, u7: 4, u8: 4, u9: 4,
    saran: "Layanan sangat cepat, selesai kurang dari 15 menit.",
    skor_rata: 4.00,
    nilai: "A"
  },
  {
    no: 13,
    id: "RESP-2026-0818-013",
    waktu: "18/08/2026 09:02",
    timestamp: "2026-08-18T09:02:33.000Z",
    jenis_kelamin: "Perempuan",
    usia: "25 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 4, u2: 4, u3: 4, u4: 4, u5: 3, u6: 3, u7: 4, u8: 3, u9: 4,
    saran: "Informasi persyaratan di papan pengumuman sangat jelas.",
    skor_rata: 3.67,
    nilai: "A"
  },
  {
    no: 14,
    id: "RESP-2026-0818-014",
    waktu: "18/08/2026 09:03",
    timestamp: "2026-08-18T09:03:43.000Z",
    jenis_kelamin: "Perempuan",
    usia: "67 Tahun",
    pendidikan: "D1-D3",
    jenis_layanan: "Surat Keterangan Tidak Mampu (SKTM)",
    u1: 3, u2: 3, u3: 3, u4: 4, u5: 3, u6: 3, u7: 3, u8: 4, u9: 4,
    saran: "Petugas sangat santun dan peduli kepada lansia.",
    skor_rata: 3.33,
    nilai: "B"
  },
  {
    no: 15,
    id: "RESP-2026-0820-015",
    waktu: "20/08/2026 10:13",
    timestamp: "2026-08-20T10:13:48.000Z",
    jenis_kelamin: "Perempuan",
    usia: "53 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Akta Kelahiran",
    u1: 3, u2: 3, u3: 3, u4: 4, u5: 3, u6: 4, u7: 3, u8: 4, u9: 4,
    saran: "Layanan pencatatan akta sangat akurat dan teratur.",
    skor_rata: 3.44,
    nilai: "B"
  },
  {
    no: 16,
    id: "RESP-2026-0820-016",
    waktu: "20/08/2026 10:14",
    timestamp: "2026-08-20T10:14:56.000Z",
    jenis_kelamin: "Perempuan",
    usia: "62 Tahun",
    pendidikan: "SD",
    jenis_layanan: "Akta Kelahiran",
    u1: 4, u2: 3, u3: 3, u4: 4, u5: 4, u6: 3, u7: 3, u8: 3, u9: 4,
    saran: "Terima kasih banyak, saya dibantu sampai selesai berkasnya.",
    skor_rata: 3.44,
    nilai: "B"
  },
  {
    no: 17,
    id: "RESP-2026-0820-017",
    waktu: "20/08/2026 11:13",
    timestamp: "2026-08-20T11:13:58.000Z",
    jenis_kelamin: "Perempuan",
    usia: "40 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 3, u2: 3, u3: 4, u4: 4, u5: 3, u6: 4, u7: 4, u8: 4, u9: 4,
    saran: "Pelayanan profesional dan sarana ruangan sejuk ber-AC.",
    skor_rata: 3.67,
    nilai: "A"
  },
  {
    no: 18,
    id: "RESP-2026-0826-018",
    waktu: "26/08/2026 11:00",
    timestamp: "2026-08-26T11:00:55.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "28 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Tidak Mampu (SKTM)",
    u1: 4, u2: 3, u3: 3, u4: 4, u5: 3, u6: 3, u7: 3, u8: 3, u9: 4,
    saran: "Bebas dari pungutan liar, mantap sekali Kelurahan Lebakgede.",
    skor_rata: 3.33,
    nilai: "B"
  },
  {
    no: 19,
    id: "RESP-2026-0826-019",
    waktu: "26/08/2026 11:14",
    timestamp: "2026-08-26T11:14:17.000Z",
    jenis_kelamin: "Perempuan",
    usia: "44 Tahun",
    pendidikan: "S1",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 4, u2: 3, u3: 3, u4: 4, u5: 3, u6: 3, u7: 4, u8: 3, u9: 3,
    saran: "Mohon sediakan formulir online untuk mempercepat pengisian data.",
    skor_rata: 3.33,
    nilai: "B"
  },
  {
    no: 20,
    id: "RESP-2026-0826-020",
    waktu: "26/08/2026 11:45",
    timestamp: "2026-08-26T11:45:31.000Z",
    jenis_kelamin: "Perempuan",
    usia: "44 Tahun",
    pendidikan: "S3",
    jenis_layanan: "Akta Kelahiran",
    u1: 4, u2: 4, u3: 4, u4: 4, u5: 4, u6: 4, u7: 4, u8: 4, u9: 4,
    saran: "Pelayanan prima, akuntabel, dan transparan sesuai regulasi.",
    skor_rata: 4.00,
    nilai: "A"
  },
  {
    no: 21,
    id: "RESP-2026-0909-021",
    waktu: "09/09/2026 10:15",
    timestamp: "2026-09-09T10:15:27.000Z",
    jenis_kelamin: "Perempuan",
    usia: "39 Tahun",
    pendidikan: "S1",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 3, u2: 3, u4: 4, u3: 4, u5: 4, u6: 3, u7: 4, u8: 4, u9: 4,
    saran: "Petugas sigap menanggapi pertanyaan warga.",
    skor_rata: 3.67,
    nilai: "A"
  },
  {
    no: 22,
    id: "RESP-2026-0914-022",
    waktu: "14/09/2026 11:54",
    timestamp: "2026-09-14T11:54:15.000Z",
    jenis_kelamin: "Perempuan",
    usia: "57 Tahun",
    pendidikan: "SMA",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 3, u2: 4, u3: 3, u4: 4, u5: 3, u6: 3, u7: 3, u8: 3, u9: 4,
    saran: "Pelayanan sangat memuaskan bagi warga sekitar.",
    skor_rata: 3.33,
    nilai: "B"
  },
  {
    no: 23,
    id: "RESP-2026-0922-023",
    waktu: "22/09/2026 12:08",
    timestamp: "2026-09-22T12:08:18.000Z",
    jenis_kelamin: "Laki-laki",
    usia: "22 Tahun",
    pendidikan: "S1",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 4, u2: 3, u3: 3, u4: 3, u5: 3, u6: 4, u7: 3, u8: 4, u9: 3,
    saran: "Kinerja petugas sangat cekatan dalam verifikasi dokumen.",
    skor_rata: 3.33,
    nilai: "B"
  },
  {
    no: 24,
    id: "RESP-2026-0929-024",
    waktu: "29/09/2026 11:25",
    timestamp: "2026-09-29T11:25:08.000Z",
    jenis_kelamin: "Perempuan",
    usia: "56 Tahun",
    pendidikan: "S1",
    jenis_layanan: "Surat Keterangan Lainnya",
    u1: 4, u2: 4, u3: 4, u4: 4, u5: 4, u6: 4, u7: 4, u8: 4, u9: 4,
    saran: "Layanan sangat tertib, ramah, dan memuaskan. Terus dipertahankan!",
    skor_rata: 4.00,
    nilai: "A"
  }
]

export const IKM_UNSUR_METADATA = [
  { key: 'u1', label: '1. Persyaratan Pelayanan', short: 'Persyaratan', nrr: 3.50, ikm: 87.50, mutu: 'B (Baik)' },
  { key: 'u2', label: '2. Prosedur Pelayanan', short: 'Prosedur', nrr: 3.33, ikm: 83.25, mutu: 'B (Baik)' },
  { key: 'u3', label: '3. Waktu Pelayanan', short: 'Waktu', nrr: 3.42, ikm: 85.50, mutu: 'B (Baik)' },
  { key: 'u4', label: '4. Biaya / Tarif', short: 'Biaya / Tarif', nrr: 3.96, ikm: 99.00, mutu: 'A (Sangat Baik)' },
  { key: 'u5', label: '5. Produk Spesifikasi Layanan', short: 'Produk Layanan', nrr: 3.29, ikm: 82.25, mutu: 'B (Baik)' },
  { key: 'u6', label: '6. Kompetensi Pelaksana', short: 'Kompetensi', nrr: 3.38, ikm: 84.50, mutu: 'B (Baik)' },
  { key: 'u7', label: '7. Perilaku Pelaksana (Sopan/Ramah)', short: 'Perilaku Petugas', nrr: 3.46, ikm: 86.50, mutu: 'B (Baik)' },
  { key: 'u8', label: '8. Kualitas Sarana & Prasarana', short: 'Sarana & Prasarana', nrr: 3.46, ikm: 86.50, mutu: 'B (Baik)' },
  { key: 'u9', label: '9. Penanganan Pengaduan', short: 'Pengaduan', nrr: 3.92, ikm: 98.00, mutu: 'A (Sangat Baik)' }
]

export const IKM_BAKU_MUTU_SUMMARY = {
  unitPelayanan: "Kelurahan Lebakgede Kecamatan Coblong",
  alamat: "Jl. Tubagus Ismail Bawah No. 5 Bandung",
  periode: "Triwulan III Tahun 2026 (1 Juli s/d 30 September 2026)",
  totalResponden: 24,
  ikmSkala4: 3.4879,
  ikmKonversi: 87.20,
  mutuPelayanan: "B",
  kinerjaUnit: "BAIK",
  pejabat: {
    nama: "USMAN ADIREJA, S.Sos",
    jabatan: "Lurah Lebakgede",
    pangkat: "Penata Tk.I",
    nip: "19721209 199901 1 001",
    tanggalPengesahan: "2 Oktober 2026"
  },
  demografi: {
    gender: {
      "Laki-laki": 11,
      "Perempuan": 13
    },
    pendidikan: {
      "SD": 1,
      "SMP": 0,
      "SMA": 15,
      "D1-D3": 2,
      "S1": 5,
      "S2": 0,
      "S3": 1
    },
    layanan: {
      "Surat Keterangan Lainnya": 15,
      "Surat Keterangan Tidak Mampu (SKTM)": 3,
      "Akta Kelahiran": 4,
      "Kartu Keluarga (KK)": 1,
      "Surat Domisili": 1
    }
  }
}

/**
 * Filter data responden berdasarkan rentang tanggal
 */
export function filterRespondentsByDate(
  respondents: IKMRespondentData[],
  startDate?: Date | null,
  endDate?: Date | null
): IKMRespondentData[] {
  if (!startDate && !endDate) return respondents

  return respondents.filter((r) => {
    const itemDate = new Date(r.timestamp)
    if (startDate && itemDate < startDate) return false
    if (endDate) {
      // Pastikan sampai akhir hari dari endDate
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      if (itemDate > endOfDay) return false
    }
    return true
  })
}

/**
 * Hitung kalkulasi IKM resmi dari array responden yang terfilter
 */
export function calculateIKMFromResponses(responses: IKMRespondentData[]) {
  const count = responses.length
  if (count === 0) {
    return {
      count: 0,
      ikmSkala4: 0,
      ikmKonversi: 0,
      mutuPelayanan: '-',
      kinerjaUnit: '-',
      unsurAverages: IKM_UNSUR_METADATA.map((u) => ({ ...u, nrr: 0, ikm: 0 }))
    }
  }

  const totals = { u1: 0, u2: 0, u3: 0, u4: 0, u5: 0, u6: 0, u7: 0, u8: 0, u9: 0 }
  responses.forEach((r) => {
    totals.u1 += r.u1
    totals.u2 += r.u2
    totals.u3 += r.u3
    totals.u4 += r.u4
    totals.u5 += r.u5
    totals.u6 += r.u6
    totals.u7 += r.u7
    totals.u8 += r.u8
    totals.u9 += r.u9
  })

  const bobot = 1 / 9 // 0.111111...
  let ikmSkala4 = 0

  const unsurAverages = IKM_UNSUR_METADATA.map((u) => {
    const sum = totals[u.key as keyof typeof totals] || 0
    const nrr = Number((sum / count).toFixed(2))
    const nrrTertimbang = (sum / count) * bobot
    ikmSkala4 += nrrTertimbang
    const ikm = Number((nrr * 25).toFixed(2))
    let mutu = 'B (Baik)'
    if (nrr >= 3.5324) mutu = 'A (Sangat Baik)'
    else if (nrr >= 3.0644) mutu = 'B (Baik)'
    else if (nrr >= 2.6) mutu = 'C (Kurang Baik)'
    else mutu = 'D (Tidak Baik)'

    return {
      ...u,
      nrr,
      ikm,
      mutu
    }
  })

  ikmSkala4 = Number(ikmSkala4.toFixed(4))
  const ikmKonversi = Number((ikmSkala4 * 25).toFixed(2))

  let mutuPelayanan = 'B'
  let kinerjaUnit = 'BAIK'

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
    count,
    ikmSkala4,
    ikmKonversi,
    mutuPelayanan,
    kinerjaUnit,
    unsurAverages
  }
}

/**
 * Format AnalyticsData object dari baseline database TW 3 2026
 */
export function getBaselineAnalyticsData(startDate?: Date, endDate?: Date) {
  const filtered = filterRespondentsByDate(IKM_TW3_RESPONDENTS, startDate, endDate)
  const calc = calculateIKMFromResponses(filtered)

  // Hitung distribusi demografi
  const genderMap: Record<string, number> = { 'Laki-laki': 0, 'Perempuan': 0 }
  const educationMap: Record<string, number> = { SD: 0, SMP: 0, SMA: 0, 'D1-D3': 0, S1: 0, S2: 0, S3: 0 }
  const serviceMap: Record<string, number> = {}

  filtered.forEach((r) => {
    if (r.jenis_kelamin in genderMap) genderMap[r.jenis_kelamin]++
    if (r.pendidikan in educationMap) educationMap[r.pendidikan]++
    serviceMap[r.jenis_layanan] = (serviceMap[r.jenis_layanan] || 0) + 1
  })

  // Format responses rows untuk dashboard table
  const formattedResponses = filtered.map((r) => ({
    no: r.no,
    id: r.id,
    waktu: r.waktu,
    timestamp: r.timestamp,
    jenis_kelamin: r.jenis_kelamin,
    usia: r.usia,
    pendidikan: r.pendidikan,
    jenis_layanan: r.jenis_layanan,
    q1: r.u1 >= 4 ? 'Sangat Sesuai' : r.u1 === 3 ? 'Sesuai' : r.u1 === 2 ? 'Kurang Sesuai' : 'Tidak Sesuai',
    q2: r.u2 >= 4 ? 'Sangat Mudah' : r.u2 === 3 ? 'Mudah' : r.u2 === 2 ? 'Kurang Mudah' : 'Tidak Mudah',
    q3: r.u3 >= 4 ? 'Sangat Cepat' : r.u3 === 3 ? 'Cepat' : r.u3 === 2 ? 'Kurang Cepat' : 'Tidak Cepat',
    q4: r.u4 >= 4 ? 'Gratis' : r.u4 === 3 ? 'Murah' : r.u4 === 2 ? 'Cukup Mahal' : 'Sangat Mahal',
    q5: r.u5 >= 4 ? 'Sangat Sesuai' : r.u5 === 3 ? 'Sesuai' : r.u5 === 2 ? 'Kurang Sesuai' : 'Tidak Sesuai',
    q6: r.u6 >= 4 ? 'Sangat Kompeten' : r.u6 === 3 ? 'Kompeten' : r.u6 === 2 ? 'Kurang Kompeten' : 'Tidak Kompeten',
    q7: r.u7 >= 4 ? 'Sangat Sopan' : r.u7 === 3 ? 'Sopan' : r.u7 === 2 ? 'Kurang Sopan' : 'Tidak Sopan',
    q8: r.u8 >= 4 ? 'Sangat Baik' : r.u8 === 3 ? 'Baik' : r.u8 === 2 ? 'Buruk' : 'Sangat Buruk',
    q9: r.u9 >= 4 ? 'Dikelola dengan Baik' : r.u9 === 3 ? 'Berfungsi Kurang Maksimal' : 'Tidak Ada',
    u1: r.u1,
    u2: r.u2,
    u3: r.u3,
    u4: r.u4,
    u5: r.u5,
    u6: r.u6,
    u7: r.u7,
    u8: r.u8,
    u9: r.u9,
    saran: r.saran,
    skor_rata: r.skor_rata,
    nilai: r.nilai
  }))

  const elementsObj: Record<string, { name: string; score: number }> = {}
  calc.unsurAverages.forEach((u) => {
    elementsObj[u.key] = {
      name: u.short,
      score: u.nrr
    }
  })

  return {
    totalResponses: calc.count,
    avgSatisfaction: calc.ikmSkala4,
    ikmSkala4: calc.ikmSkala4,
    ikmKonversi: calc.ikmKonversi,
    mutuPelayanan: calc.mutuPelayanan,
    kinerjaUnitPelayanan: calc.kinerjaUnit,
    satisfactionRate: 100,
    satisfactionDistribution: {
      verySatisfied: filtered.filter(f => f.nilai === 'A').length,
      satisfied: filtered.filter(f => f.nilai === 'B').length,
      neutral: filtered.filter(f => f.nilai === 'C').length,
      dissatisfied: filtered.filter(f => f.nilai === 'D').length,
      veryDissatisfied: 0
    },
    dimensionAverages: {
      accessibility: calc.unsurAverages[0]?.nrr || 3.5,
      serviceQuality: calc.unsurAverages[1]?.nrr || 3.33,
      professionalism: calc.unsurAverages[5]?.nrr || 3.38,
      courtesy: calc.unsurAverages[6]?.nrr || 3.46,
      reliability: calc.unsurAverages[4]?.nrr || 3.29,
      security: calc.unsurAverages[3]?.nrr || 3.96,
      responseTime: calc.unsurAverages[2]?.nrr || 3.42,
      facilities: calc.unsurAverages[7]?.nrr || 3.46
    },
    elements: elementsObj,
    demographics: {
      gender: genderMap,
      education: educationMap,
      serviceType: serviceMap
    },
    responses: formattedResponses,
    lastUpdated: new Date().toISOString()
  }
}


