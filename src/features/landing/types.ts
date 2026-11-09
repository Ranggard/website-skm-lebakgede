export interface HomeSummary {
  mutuPelayanan: string
  kinerjaUnit: string
  ikmKonversi: number | null
  ikmSkala4: number | null
  totalResponden: number
  elements: Record<string, { name: string; score: number }>
  demographics: {
    gender?: Record<string, number>
  }
}

export const INITIAL_HOME_SUMMARY: HomeSummary = {
  mutuPelayanan: '-',
  kinerjaUnit: 'Belum Ada Data',
  ikmKonversi: null,
  ikmSkala4: null,
  totalResponden: 0,
  elements: {},
  demographics: {},
}

