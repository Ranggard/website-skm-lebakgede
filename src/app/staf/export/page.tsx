'use client'

import React, { useState, useMemo } from 'react'
import { useStaffDashboard } from '@/src/features/dashboard/context/StaffDashboardContext'
import { TabExport } from '@/src/features/dashboard/components'
import { UNSUR_NAMES, parseScore } from '@/src/lib/ikm-calculator'

export default function StaffExportPage() {
  const { allResponses, token } = useStaffDashboard()

  const [exportPreset, setExportPreset] = useState<'tw1' | 'tw2' | 'tw3' | 'tw4' | '1m' | '6m' | '1y' | 'all' | 'custom'>('all')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')
  const [excelPreviewSheet, setExcelPreviewSheet] = useState<'blanko' | 'triwulan' | 'baku_mutu' | 'mutu' | 'rekap'>('triwulan')
  const [exportStartDate, setExportStartDate] = useState<string>('')
  const [exportEndDate, setExportEndDate] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  const exportFilteredResponses = useMemo(() => {
    let start: Date | null = null
    let end: Date | null = null
    const now = new Date()
    const currentYear = now.getFullYear()

    if (exportPreset === 'tw1') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0)
      end = new Date(currentYear, 2, 31, 23, 59, 59, 999)
    } else if (exportPreset === 'tw2') {
      start = new Date(currentYear, 3, 1, 0, 0, 0, 0)
      end = new Date(currentYear, 5, 30, 23, 59, 59, 999)
    } else if (exportPreset === 'tw3') {
      start = new Date(currentYear, 6, 1, 0, 0, 0, 0)
      end = new Date(currentYear, 8, 30, 23, 59, 59, 999)
    } else if (exportPreset === 'tw4') {
      start = new Date(currentYear, 9, 1, 0, 0, 0, 0)
      end = new Date(currentYear, 11, 31, 23, 59, 59, 999)
    } else if (exportPreset === '1m') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), 0, 0, 0, 0)
      end = now
    } else if (exportPreset === '6m') {
      start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate(), 0, 0, 0, 0)
      end = now
    } else if (exportPreset === '1y') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0)
      end = new Date(currentYear, 11, 31, 23, 59, 59, 999)
    } else if (exportPreset === 'custom') {
      if (exportStartDate) start = new Date(exportStartDate)
      if (exportEndDate) {
        end = new Date(exportEndDate)
        end.setHours(23, 59, 59, 999)
      }
    }

    if (!start && !end) return allResponses

    return allResponses.filter((r) => {
      const dateVal = r.timestamp || (r as any).created_at || r.waktu
      const d = dateVal ? new Date(dateVal) : null
      if (!d || isNaN(d.getTime())) return true
      if (start && d < start) return false
      if (end && d > end) return false
      return true
    })
  }, [allResponses, exportPreset, exportStartDate, exportEndDate])

  const exportPreviewCalc = useMemo(() => {
    const total = exportFilteredResponses.length
    const sums = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    exportFilteredResponses.forEach((r: any) => {
      sums[0] += parseScore(r.u1 || r.q1)
      sums[1] += parseScore(r.u2 || r.q2)
      sums[2] += parseScore(r.u3 || r.q3)
      sums[3] += parseScore(r.u4 || r.q4)
      sums[4] += parseScore(r.u5 || r.q5)
      sums[5] += parseScore(r.u6 || r.q6)
      sums[6] += parseScore(r.u7 || r.q7)
      sums[7] += parseScore(r.u8 || r.q8)
      sums[8] += parseScore(r.u9 || r.q9)
    })

    let ikmSkala4 = 0
    const unsurAverages = UNSUR_NAMES.map((u, i) => {
      const nrr = total > 0 ? sums[i] / total : 0
      ikmSkala4 += nrr * (1 / 9)
      const ikm = nrr * 25
      let mutu = 'D'
      if (total > 0) {
        if (nrr >= 3.53) mutu = 'A'
        else if (nrr >= 3.06) mutu = 'B'
        else if (nrr >= 2.60) mutu = 'C'
      }
      return { ...u, nrr, ikm, mutu }
    })

    const ikmKonversi = ikmSkala4 * 25
    let mutu = 'D'
    let kinerja = 'TIDAK BAIK'
    if (total > 0) {
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
    }

    return {
      count: total,
      ikmSkala4,
      ikmKonversi,
      mutuPelayanan: mutu,
      kinerjaUnit: kinerja,
      unsurAverages,
    }
  }, [exportFilteredResponses])

  const handleExportExcelWithFilter = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      params.set('format', 'excel')
      if (exportPreset !== 'all') {
        if (exportStartDate) params.set('start_date', new Date(exportStartDate).toISOString())
        if (exportEndDate) {
          const end = new Date(exportEndDate)
          end.setHours(23, 59, 59, 999)
          params.set('end_date', end.toISOString())
        }
      }

      const presetLabels: Record<string, string> = {
        tw1: `Triwulan I Tahun ${new Date().getFullYear()}`,
        tw2: `Triwulan II Tahun ${new Date().getFullYear()}`,
        tw3: `Triwulan III Tahun ${new Date().getFullYear()}`,
        tw4: `Triwulan IV Tahun ${new Date().getFullYear()}`,
        '1m': '1 Bulan Terakhir',
        '6m': '6 Bulan Terakhir',
        '1y': '1 Tahun Terakhir',
        all: 'Semua Data Survei',
        custom: `Periode ${exportStartDate || '-'} s/d ${exportEndDate || '-'}`,
      }
      params.set('periode', presetLabels[exportPreset] || 'Survei Kepuasan Masyarakat')

      const authToken = token || localStorage.getItem('adminToken') || 'admin-token-skm-questionnaire-default-12345678'
      params.set('token', authToken)
      const response = await fetch(`/api/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      if (!response.ok) {
        throw new Error('Gagal mengunduh file Excel dari server.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Laporan_IKM_Lebakgede_${exportPreset}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export Excel failed:', err)
      alert('Gagal mengekspor data ke Excel. Silakan coba lagi.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSVWithFilter = () => {
    if (exportFilteredResponses.length === 0) {
      alert('Tidak ada data dalam rentang waktu yang dipilih.')
      return
    }

    const headers = [
      'No', 'Nomor Responden', 'ID Responden', 'Waktu', 'Jenis Kelamin', 'Usia',
      'Pendidikan', 'Jenis Layanan', 'U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9',
      'Rata-rata', 'Mutu', 'Saran',
    ]

    const csvRows = [
      headers.join(','),
      ...exportFilteredResponses.map((r, idx) => [
        idx + 1,
        r.no,
        `"${r.id}"`,
        `"${r.waktu}"`,
        `"${r.jenis_kelamin}"`,
        `"${r.usia}"`,
        `"${r.pendidikan}"`,
        `"${r.jenis_layanan}"`,
        r.u1, r.u2, r.u3, r.u4, r.u5, r.u6, r.u7, r.u8, r.u9,
        r.skor_rata,
        `"${r.nilai}"`,
        `"${(r.saran || '').replace(/"/g, '""')}"`,
      ].join(',')),
    ]

    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Data_SKM_Lebakgede_${exportPreset}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportWord = () => {
    if (exportFilteredResponses.length === 0) {
      alert('Tidak ada data dalam rentang waktu yang dipilih.')
      return
    }
    window.print()
  }

  return (
    <TabExport
      exportPreset={exportPreset}
      setExportPreset={setExportPreset}
      exportFormat={exportFormat}
      setExportFormat={setExportFormat}
      excelPreviewSheet={excelPreviewSheet}
      setExcelPreviewSheet={setExcelPreviewSheet}
      exportStartDate={exportStartDate}
      setExportStartDate={setExportStartDate}
      exportEndDate={exportEndDate}
      setExportEndDate={setExportEndDate}
      exportFilteredResponses={exportFilteredResponses}
      exportPreviewCalc={exportPreviewCalc}
      handleExportExcelWithFilter={handleExportExcelWithFilter}
      handleExportCSVWithFilter={handleExportCSVWithFilter}
      handleExportWord={handleExportWord}
      isExporting={isExporting}
    />
  )
}
