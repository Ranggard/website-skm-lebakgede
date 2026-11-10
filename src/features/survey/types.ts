export interface SurveyFormData {
  jenis_kelamin: string
  usia: string
  pendidikan: string
  jenis_layanan: string
  u1_persyaratan: string
  u2_prosedur: string
  u3_waktu: string
  u4_biaya: string
  u5_produk: string
  u6_kompetensi: string
  u7_keramahan: string
  u8_sarana: string
  u9_pengaduan: string
  saran: string
}

export const INITIAL_FORM_DATA: SurveyFormData = {
  jenis_kelamin: '',
  usia: '',
  pendidikan: '',
  jenis_layanan: '',
  u1_persyaratan: '',
  u2_prosedur: '',
  u3_waktu: '',
  u4_biaya: '',
  u5_produk: '',
  u6_kompetensi: '',
  u7_keramahan: '',
  u8_sarana: '',
  u9_pengaduan: '',
  saran: '',
}

export const TOTAL_SLIDES = 14

export const SERVICE_OPTIONS = [
  'Pelayanan Kartu Keluarga',
  'Pelayanan E-KTP',
  'Pelayanan Pindah Keluar',
  'Pelayanan Akta Surat Keterangan Kematian',
  'Pelayanan Surat Keterangan Kelahiran',
  'Pelayanan Surat Keterangan Ahli Waris',
  'Pelayanan Surat Keterangan Usaha',
  'Pelayanan SKTM',
  'Pelayanan Perubahan data DTSEN',
  'Pelayanan Surat Keterangan Domisili Penduduk',
  'Pelayanan Surat Keterangan Domisili Perusahaan/Yayasan',
  'Pelayanan Surat Keterangan Pemekaran Wilayah',
  'Pelayanan Surat Keterangan Orang Yang Sama',
  'Pelayanan Lainnya',
]

export const EDUCATION_OPTIONS = [
  { value: 'SD', label: 'SD / Sederajat' },
  { value: 'SMP', label: 'SMP / Sederajat' },
  { value: 'SMA', label: 'SMA / Sederajat' },
  { value: 'D1-D3', label: 'D1 - D3' },
  { value: 'S1', label: 'S1 / D4' },
  { value: 'S2', label: 'S2' },
  { value: 'S3', label: 'S3' },
]

// Convert string to number (keep as numeric 1-4, no A-B-C-D conversion)
export const numToOption = (val: string): number => {
  const num = parseInt(val, 10)
  if (isNaN(num) || num < 1 || num > 4) return 4
  return num
}

