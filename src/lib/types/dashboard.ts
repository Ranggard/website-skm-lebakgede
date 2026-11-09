export interface ResponseRow {
  no: number
  id: string
  waktu: string
  timestamp?: string
  jenis_kelamin: string
  usia: string
  pendidikan: string
  jenis_layanan: string
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
  q8: string
  q9: string
  saran: string
  nilai: string
  skor_rata: number
  u1?: number
  u2?: number
  u3?: number
  u4?: number
  u5?: number
  u6?: number
  u7?: number
  u8?: number
  u9?: number
}

export interface AnalyticsData {
  totalResponses: number
  avgSatisfaction: number
  ikmSkala4?: number
  ikmKonversi?: number
  mutuPelayanan?: string
  kinerjaUnitPelayanan?: string
  satisfactionRate: number
  satisfactionDistribution: {
    verySatisfied: number
    satisfied: number
    neutral: number
    dissatisfied: number
    veryDissatisfied: number
  }
  dimensionAverages: {
    accessibility: number
    serviceQuality: number
    professionalism: number
    courtesy: number
    reliability: number
    security: number
    responseTime: number
    facilities: number
  }
  elements?: Record<string, { name: string; score: number }>
  demographics?: {
    gender?: Record<string, number>
    age?: Record<string, number>
    education?: Record<string, number>
    serviceType?: Record<string, number>
  }
  responses?: ResponseRow[]
  lastUpdated?: string
}

