export interface SurveyFormData {
  jenis_kelamin: string
  usia: string
  pendidikan: string
  jenis_layanan: string
  q1_persyaratan: string
  q2_prosedur: string
  q3_waktu: string
  q4_biaya: string
  q5_produk: string
  q6_kompetensi: string
  q7_keramahan: string
  q8_sarana: string
  q9_pengaduan: string
  saran: string
}

export const INITIAL_FORM_DATA: SurveyFormData = {
  jenis_kelamin: '',
  usia: '',
  pendidikan: '',
  jenis_layanan: '',
  q1_persyaratan: '',
  q2_prosedur: '',
  q3_waktu: '',
  q4_biaya: '',
  q5_produk: '',
  q6_kompetensi: '',
  q7_keramahan: '',
  q8_sarana: '',
  q9_pengaduan: '',
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

export const numToOption = (val: string): 'A' | 'B' | 'C' | 'D' => {
  switch (val) {
    case '1':
      return 'A'
    case '2':
      return 'B'
    case '3':
      return 'C'
    case '4':
    default:
      return 'D'
  }
}

