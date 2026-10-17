/**
 * Application constants and configuration
 * Implements SKM (Survei Kepuasan Masyarakat) questionnaire standard
 * Based on: Kuesioner Survei Kepuasan Masyarakat - Kelurahan Lebakgede
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Answer options enum for SKM questionnaire (A, B, C, D)
 */
export enum AnswerOption {
  OptionA = 'A',
  OptionB = 'B',
  OptionC = 'C',
  OptionD = 'D',
}

/**
 * Backend type enum
 */
export enum BackendTypeEnum {
  GoogleSheets = 'google-sheets',
  Supabase = 'supabase',
}

// ============================================================================
// SKM QUESTION CONFIGURATION
// ============================================================================

/**
 * Question category/dimension definitions for SKM
 */
export const SKM_CATEGORIES = {
  REQUIREMENTS: 'requirements',
  PROCEDURE: 'procedure',
  SPEED: 'speed',
  COST: 'cost',
  QUALITY: 'quality',
  COMPETENCE: 'competence',
  BEHAVIOR: 'behavior',
  FACILITIES: 'facilities',
  COMPLAINTS: 'complaints',
} as const

export type SKMCategory = typeof SKM_CATEGORIES[keyof typeof SKM_CATEGORIES]

/**
 * Answer options with scores
 */
export const ANSWER_OPTIONS = {
  A: { value: 'A', score: 1 },
  B: { value: 'B', score: 2 },
  C: { value: 'C', score: 3 },
  D: { value: 'D', score: 4 },
} as const

/**
 * SKM Questionnaire Questions (9 questions)
 * Based on Kuesioner Survei Kepuasan Masyarakat - Kelurahan Lebakgede
 * Kecamatan Coblong, Kota Bandung
 */
export interface SKMQuestion {
  id: string
  questionNumber: number
  text: string
  indonesian: string
  category: SKMCategory
  isRequired: boolean
  options: {
    A: string
    B: string
    C: string
    D: string
  }
}

export const SKM_QUESTIONS: SKMQuestion[] = [
  {
    id: 'Q1',
    questionNumber: 1,
    text: 'How satisfied are you with the suitability of service requirements with the type of service provided?',
    indonesian: 'Bagaimana pendapat saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?',
    category: SKM_CATEGORIES.REQUIREMENTS,
    isRequired: true,
    options: {
      A: 'Tidak Sesuai',
      B: 'Kurang Sesuai',
      C: 'Sesuai',
      D: 'Sangat Sesuai',
    },
  },
  {
    id: 'Q2',
    questionNumber: 2,
    text: 'How do you understand the ease of service procedures in this unit?',
    indonesian: 'Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?',
    category: SKM_CATEGORIES.PROCEDURE,
    isRequired: true,
    options: {
      A: 'Tidak Mudah',
      B: 'Kurang Mudah',
      C: 'Mudah',
      D: 'Sangat Mudah',
    },
  },
  {
    id: 'Q3',
    questionNumber: 3,
    text: 'How do you feel about the speed of service delivery?',
    indonesian: 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?',
    category: SKM_CATEGORIES.SPEED,
    isRequired: true,
    options: {
      A: 'Tidak Cepat',
      B: 'Kurang Cepat',
      C: 'Cepat',
      D: 'Sangat Cepat',
    },
  },
  {
    id: 'Q4',
    questionNumber: 4,
    text: 'How do you feel about the reasonableness of service costs/fees?',
    indonesian: 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?',
    category: SKM_CATEGORIES.COST,
    isRequired: true,
    options: {
      A: 'Sangat Mahal',
      B: 'Cukup Mahal',
      C: 'Murah',
      D: 'GRATIS',
    },
  },
  {
    id: 'Q5',
    questionNumber: 5,
    text: 'How do you feel about the suitability of service products between the stated standards and the results provided?',
    indonesian: 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?',
    category: SKM_CATEGORIES.QUALITY,
    isRequired: true,
    options: {
      A: 'Tidak Sesuai',
      B: 'Kurang Sesuai',
      C: 'Sesuai',
      D: 'Sangat Sesuai',
    },
  },
  {
    id: 'Q6',
    questionNumber: 6,
    text: 'How do you feel about the competence/ability of officers in providing service?',
    indonesian: 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?',
    category: SKM_CATEGORIES.COMPETENCE,
    isRequired: true,
    options: {
      A: 'Tidak Kompeten',
      B: 'Kurang Kompeten',
      C: 'Kompeten',
      D: 'Sangat Kompeten',
    },
  },
  {
    id: 'Q7',
    questionNumber: 7,
    text: 'How do you feel about the conduct of officers in service relating to politeness and friendliness?',
    indonesian: 'Bagaimana pendapat Saudara perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?',
    category: SKM_CATEGORIES.BEHAVIOR,
    isRequired: true,
    options: {
      A: 'Tidak sopan dan ramah',
      B: 'Kurang sopan dan ramah',
      C: 'Sopan dan ramah',
      D: 'Sangat Sopan dan Ramah',
    },
  },
  {
    id: 'Q8',
    questionNumber: 8,
    text: 'How do you feel about the quality of facilities and infrastructure?',
    indonesian: 'Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?',
    category: SKM_CATEGORIES.FACILITIES,
    isRequired: true,
    options: {
      A: 'Buruk',
      B: 'Cukup',
      C: 'Baik',
      D: 'Sangat Baik',
    },
  },
  {
    id: 'Q9',
    questionNumber: 9,
    text: 'How do you feel about the handling of service user complaints?',
    indonesian: 'Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?',
    category: SKM_CATEGORIES.COMPLAINTS,
    isRequired: true,
    options: {
      A: 'Tidak Ada',
      B: 'Ada tetapi tidak berfungsi',
      C: 'Berfungsi kurang maksimal',
      D: 'Dikelola dengan baik',
    },
  },
]

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

export const VALIDATION = {
  MAX_TEXT_LENGTH: 500,
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 100,
  MIN_QUESTIONS_REQUIRED: 9, // All 9 SKM questions must be answered
} as const

// ============================================================================
// DEMOGRAPHIC CONFIGURATION
// ============================================================================

export const DEMOGRAPHIC_OPTIONS = {
  age: ['<18', '18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
  gender: ['Laki-laki', 'Perempuan', 'Lainnya'],
  educationLevel: ['SD', 'SMP', 'SMA', 'S1', 'S2', 'S3'],
  serviceTypes: [
    'Kesehatan',
    'Pendidikan',
    'Transportasi',
    'Administrasi',
    'Sosial',
    'Lainnya',
  ],
} as const

// ============================================================================
// API ENDPOINTS
// ============================================================================

export interface EndpointConfig {
  submit: string
  analytics: string
  export: string
}

export const API_ENDPOINTS: EndpointConfig = {
  submit: '/api/submit',
  analytics: '/api/analytics',
  export: '/api/export',
} as const

// ============================================================================
// BACKEND CONFIGURATION
// ============================================================================

export const BACKEND_TYPES = {
  GOOGLE_SHEETS: BackendTypeEnum.GoogleSheets,
  SUPABASE: BackendTypeEnum.Supabase,
} as const

// ============================================================================
// APP CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
  KELURAHAN: 'Kelurahan Lebakgede',
  KECAMATAN: 'Kecamatan Coblong',
  KOTA: 'Kota Bandung',
  SURVEY_TITLE: 'Survei Kepuasan Masyarakat',
  TOTAL_STEPS: 9, // 9 questions + demographics = 10 steps total
} as const
