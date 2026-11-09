import { ResponseRow, AnalyticsData } from '@/src/lib/types/dashboard'
import { IKMCalculationResult } from '@/src/lib/ikm-calculator'

export interface TabProps {
  analytics: AnalyticsData | null
  allResponses: ResponseRow[]
  derivedStats: any
  loading?: boolean
}

export interface TabRespondenProps extends TabProps {
  searchQuery: string
  setSearchQuery: (v: string) => void
  filterService: string
  setFilterService: (v: string) => void
  filterGender: string
  setFilterGender: (v: string) => void
  uniqueServices: string[]
  paginatedResponses: ResponseRow[]
  filteredResponses: ResponseRow[]
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  setSelectedRespondent: (r: ResponseRow) => void
}

export interface TabExportProps {
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

