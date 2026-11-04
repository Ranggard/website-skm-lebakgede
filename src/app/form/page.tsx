'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface SurveyFormData {
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

const INITIAL_FORM_DATA: SurveyFormData = {
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

const TOTAL_SLIDES = 14

const SERVICE_OPTIONS = [
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

const EDUCATION_OPTIONS = [
  { value: 'SD', label: 'SD / Sederajat' },
  { value: 'SMP', label: 'SMP / Sederajat' },
  { value: 'SMA', label: 'SMA / Sederajat' },
  { value: 'D1-D3', label: 'D1 - D3' },
  { value: 'S1', label: 'S1 / D4' },
  { value: 'S2', label: 'S2' },
  { value: 'S3', label: 'S3' },
]

// Convert rating number ('1','2','3','4') to Option ('A','B','C','D')
const numToOption = (val: string): 'A' | 'B' | 'C' | 'D' => {
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

export default function FormPage() {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [formData, setFormData] = useState<SurveyFormData>(INITIAL_FORM_DATA)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)

  const usiaInputRef = useRef<HTMLInputElement>(null)

  // Focus age input on slide 2
  useEffect(() => {
    if (currentSlide === 2 && usiaInputRef.current) {
      usiaInputRef.current.focus()
    }
  }, [currentSlide])

  const progressPercent = Math.round((currentSlide / TOTAL_SLIDES) * 100)

  // Auto-advance helper with 300ms delay like in the Apps Script
  const triggerAutoAdvance = () => {
    setTimeout(() => {
      setCurrentSlide((prev) => {
        if (prev < TOTAL_SLIDES) {
          return prev + 1
        }
        return prev
      })
    }, 300)
  }

  const validateCurrentSlide = (slideNum: number = currentSlide): boolean => {
    if (slideNum === 1) {
      if (!formData.jenis_kelamin) {
        setErrorMessage('Mohon pilih jenis kelamin Anda terlebih dahulu.')
        return false
      }
    } else if (slideNum === 2) {
      const usiaNum = parseInt(formData.usia, 10)
      if (!formData.usia || isNaN(usiaNum) || usiaNum < 1 || usiaNum > 120) {
        setErrorMessage('Mohon isi usia Anda dengan benar.')
        return false
      }
    } else if (slideNum === 3) {
      if (!formData.pendidikan) {
        setErrorMessage('Mohon pilih opsi yang tersedia.')
        return false
      }
    } else if (slideNum === 4) {
      if (!formData.jenis_layanan) {
        setErrorMessage('Mohon pilih opsi yang tersedia.')
        return false
      }
    } else if (slideNum === 5) {
      if (!formData.q1_persyaratan) {
        setErrorMessage('Mohon berikan penilaian/klik salah satu emoji.')
        return false
      }
    } else if (slideNum === 6) {
      if (!formData.q2_prosedur) {
        setErrorMessage('Mohon berikan penilaian/klik salah satu emoji.')
        return false
      }
    } else if (slideNum === 7) {
      if (!formData.q3_waktu) {
        setErrorMessage('Mohon berikan penilaian/klik salah satu emoji.')
        return false
      }
    } else if (slideNum === 8) {
      if (!formData.q4_biaya) {
        setErrorMessage('Mohon berikan penilaian/klik salah satu emoji.')
        return false
      }
    } else if (slideNum === 9) {
      if (!formData.q5_produk) {
        setErrorMessage('Mohon berikan penilaian/klik salah satu emoji.')
        return false
      }
    } else if (slideNum === 10) {
      if (!formData.q6_kompetensi) {
        setErrorMessage('Mohon berikan penilaian/klik salah satu emoji.')
        return false
      }
    } else if (slideNum === 11) {
      if (!formData.q7_keramahan) {
        setErrorMessage('Mohon berikan penilaian/klik salah satu emoji.')
        return false
      }
    } else if (slideNum === 12) {
      if (!formData.q8_sarana) {
        setErrorMessage('Mohon berikan penilaian/klik salah satu emoji.')
        return false
      }
    } else if (slideNum === 13) {
      if (!formData.q9_pengaduan) {
        setErrorMessage('Mohon berikan penilaian/klik salah satu emoji.')
        return false
      }
    }

    setErrorMessage(null)
    return true
  }

  const handleNext = () => {
    if (validateCurrentSlide()) {
      if (currentSlide < TOTAL_SLIDES) {
        setCurrentSlide(currentSlide + 1)
      }
    }
  }

  const handlePrev = () => {
    setErrorMessage(null)
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleGenderChange = (val: string) => {
    setFormData((prev) => ({ ...prev, jenis_kelamin: val }))
    setErrorMessage(null)
    triggerAutoAdvance()
  }

  const handleSelectChange = (key: keyof SurveyFormData, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }))
    if (val !== '') {
      setErrorMessage(null)
      triggerAutoAdvance()
    }
  }

  const handleRatingSelect = (key: keyof SurveyFormData, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }))
    setErrorMessage(null)
    triggerAutoAdvance()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCurrentSlide()) return

    setIsSubmitting(true)
    setErrorMessage(null)

    // Prepare payload for backend API
    const payload = {
      gender: formData.jenis_kelamin,
      age: formData.usia,
      education: formData.pendidikan,
      service_type: formData.jenis_layanan,
      Q1: numToOption(formData.q1_persyaratan),
      Q2: numToOption(formData.q2_prosedur),
      Q3: numToOption(formData.q3_waktu),
      Q4: numToOption(formData.q4_biaya),
      Q5: numToOption(formData.q5_produk),
      Q6: numToOption(formData.q6_kompetensi),
      Q7: numToOption(formData.q7_keramahan),
      Q8: numToOption(formData.q8_sarana),
      Q9: numToOption(formData.q9_pengaduan),
      saran: formData.saran,
      Q21: formData.saran,
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error?.message || data.message || 'Gagal menyimpan respons.')
      }

      setSubmittedId(data.data?.id || null)
      setShowSuccessModal(true)
    } catch (err: any) {
      console.error('Error submitting survey:', err)
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat mengirim data.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetSurvey = () => {
    setShowSuccessModal(false)
    setSubmittedId(null)
    setFormData(INITIAL_FORM_DATA)
    setCurrentSlide(1)
    setErrorMessage(null)
  }

  return (
    <div className="w-full min-h-screen py-8 px-4 font-sans">
      <div id="app-wrapper" className="w-full max-w-3xl mx-auto">
        {/* Header matching original Web App */}
        <div className="text-center mb-8 fade-in">
          <div className="flex justify-center mb-4">
            <img
              src="/logo-kelurahan.jpg"
              alt="Logo Kelurahan"
              className="h-20 w-auto drop-shadow-lg object-contain"
              loading="lazy"
            />
          </div>
          <h1 id="form-title" className="text-2xl md:text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
            Survei Kepuasan Masyarakat
          </h1>
          <p className="text-white/90 text-lg font-medium">Kelurahan Lebakgede, Kecamatan Coblong</p>
          <p className="text-white/80 text-sm mt-1">Kota Bandung</p>
        </div>

        {/* Progress Bar matching original Web App */}
        <div className="mb-6 fade-in">
          <div className="bg-white/30 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              id="progress-bar"
              className="progress-bar h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2 text-white/90 text-sm font-medium">
            <span id="progress-text">
              Langkah {currentSlide} dari {TOTAL_SLIDES}
            </span>
            <span id="progress-percent">{progressPercent}%</span>
          </div>
        </div>

        {/* Glass Card Container */}
        <div className="glass-card rounded-3xl shadow-2xl overflow-hidden fade-in">
          <form id="survey-form" onSubmit={handleSubmit} className="p-6 md:p-8">
            <div id="slide-container">
              {/* SLIDE 1: Jenis Kelamin */}
              {currentSlide === 1 && (
                <div className="survey-slide fade-in" data-slide="1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-lg">
                      👤
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Jenis Kelamin Anda?</h2>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Pilih jenis kelamin
                    </label>
                    <div className="flex gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="jenis_kelamin"
                          value="Laki-laki"
                          checked={formData.jenis_kelamin === 'Laki-laki'}
                          onChange={() => handleGenderChange('Laki-laki')}
                          className="peer hidden"
                        />
                        <div
                          className={`border-2 rounded-xl py-3 px-4 text-center cursor-pointer transition-all font-medium ${formData.jenis_kelamin === 'Laki-laki'
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-[1.02]'
                              : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-emerald-300'
                            }`}
                        >
                          👨 Laki-laki
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="jenis_kelamin"
                          value="Perempuan"
                          checked={formData.jenis_kelamin === 'Perempuan'}
                          onChange={() => handleGenderChange('Perempuan')}
                          className="peer hidden"
                        />
                        <div
                          className={`border-2 rounded-xl py-3 px-4 text-center cursor-pointer transition-all font-medium ${formData.jenis_kelamin === 'Perempuan'
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-[1.02]'
                              : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-emerald-300'
                            }`}
                        >
                          👩 Perempuan
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: Usia */}
              {currentSlide === 2 && (
                <div className="survey-slide fade-in" data-slide="2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-lg">
                      📅
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Berapa Usia Anda?</h2>
                  </div>
                  <div>
                    <label htmlFor="usia" className="block text-sm font-semibold text-gray-700 mb-3">
                      Masukkan usia dalam tahun (Tekan Enter untuk lanjut)
                    </label>
                    <input
                      ref={usiaInputRef}
                      type="number"
                      id="usia"
                      name="usia"
                      min="1"
                      max="120"
                      value={formData.usia}
                      onChange={(e) => {
                        setFormData({ ...formData, usia: e.target.value })
                        setErrorMessage(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleNext()
                        }
                      }}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium text-gray-800"
                      placeholder="Masukkan usia Anda dan tekan Enter"
                    />
                  </div>
                </div>
              )}

              {/* SLIDE 3: Pendidikan Terakhir */}
              {currentSlide === 3 && (
                <div className="survey-slide fade-in" data-slide="3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-lg">
                      🎓
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Pendidikan Terakhir?</h2>
                  </div>
                  <div>
                    <label htmlFor="pendidikan" className="block text-sm font-semibold text-gray-700 mb-3">
                      Pilih pendidikan terakhir Anda
                    </label>
                    <select
                      id="pendidikan"
                      name="pendidikan"
                      value={formData.pendidikan}
                      onChange={(e) => handleSelectChange('pendidikan', e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium cursor-pointer text-gray-800"
                    >
                      <option value="">Pilih pendidikan</option>
                      {EDUCATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* SLIDE 4: Jenis Layanan */}
              {currentSlide === 4 && (
                <div className="survey-slide fade-in" data-slide="4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-lg">
                      💼
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Jenis Layanan?</h2>
                  </div>
                  <div>
                    <label htmlFor="jenis_layanan" className="block text-sm font-semibold text-gray-700 mb-3">
                      Pilih layanan yang Anda terima
                    </label>
                    <select
                      id="jenis_layanan"
                      name="jenis_layanan"
                      value={formData.jenis_layanan}
                      onChange={(e) => handleSelectChange('jenis_layanan', e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium cursor-pointer text-gray-800"
                    >
                      <option value="">Pilih jenis layanan</option>
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* SLIDE 5: Q1 Persyaratan */}
              {currentSlide === 5 && (
                <div className="survey-slide fade-in question-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-sky-500">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-lg">1</span>{' '}
                    Kesesuaian persyaratan pelayanan
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rating-group">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q1_persyaratan', '1')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q1_persyaratan === '1'
                          ? 'selected'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                      <span className="rating-emoji">😞</span> Tidak sesuai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q1_persyaratan', '2')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q1_persyaratan === '2'
                          ? 'selected'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                    >
                      <span className="rating-emoji">😐</span> Kurang sesuai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q1_persyaratan', '3')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q1_persyaratan === '3'
                          ? 'selected'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      <span className="rating-emoji">😊</span> Sesuai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q1_persyaratan', '4')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q1_persyaratan === '4'
                          ? 'selected'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="rating-emoji">😄</span> Sangat Sesuai
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 6: Q2 Prosedur */}
              {currentSlide === 6 && (
                <div className="survey-slide fade-in question-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-cyan-500">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-lg">2</span>{' '}
                    Kemudahan prosedur
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rating-group">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q2_prosedur', '1')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q2_prosedur === '1'
                          ? 'selected'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                      <span className="rating-emoji">😞</span> Tidak mudah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q2_prosedur', '2')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q2_prosedur === '2'
                          ? 'selected'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                    >
                      <span className="rating-emoji">😐</span> Kurang mudah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q2_prosedur', '3')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q2_prosedur === '3'
                          ? 'selected'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      <span className="rating-emoji">😊</span> Mudah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q2_prosedur', '4')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q2_prosedur === '4'
                          ? 'selected'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="rating-emoji">😄</span> Sangat mudah
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 7: Q3 Waktu */}
              {currentSlide === 7 && (
                <div className="survey-slide fade-in question-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-teal-500">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-lg">3</span>{' '}
                    Kecepatan waktu pelayanan
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rating-group">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q3_waktu', '1')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q3_waktu === '1'
                          ? 'selected'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                      <span className="rating-emoji">😞</span> Tidak cepat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q3_waktu', '2')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q3_waktu === '2'
                          ? 'selected'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                    >
                      <span className="rating-emoji">😐</span> Kurang cepat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q3_waktu', '3')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q3_waktu === '3'
                          ? 'selected'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      <span className="rating-emoji">😊</span> Cepat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q3_waktu', '4')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q3_waktu === '4'
                          ? 'selected'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="rating-emoji">😄</span> Sangat cepat
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 8: Q4 Biaya */}
              {currentSlide === 8 && (
                <div className="survey-slide fade-in question-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-emerald-500">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg">4</span>{' '}
                    Kewajaran biaya/tarif
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rating-group">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q4_biaya', '1')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q4_biaya === '1'
                          ? 'selected'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                      <span className="rating-emoji">😞</span> Sangat mahal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q4_biaya', '2')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q4_biaya === '2'
                          ? 'selected'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                    >
                      <span className="rating-emoji">😐</span> Cukup mahal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q4_biaya', '3')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q4_biaya === '3'
                          ? 'selected'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      <span className="rating-emoji">😊</span> Murah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q4_biaya', '4')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-bold border-2 ${formData.q4_biaya === '4'
                          ? 'selected'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="rating-emoji">😄</span> Gratis
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 9: Q5 Produk Pelayanan */}
              {currentSlide === 9 && (
                <div className="survey-slide fade-in question-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-green-500">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">5</span>{' '}
                    Kesesuaian produk pelayanan
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rating-group">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q5_produk', '1')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q5_produk === '1'
                          ? 'selected'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                      <span className="rating-emoji">😞</span> Tidak sesuai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q5_produk', '2')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q5_produk === '2'
                          ? 'selected'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                    >
                      <span className="rating-emoji">😐</span> Kurang sesuai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q5_produk', '3')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q5_produk === '3'
                          ? 'selected'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      <span className="rating-emoji">😊</span> Sesuai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q5_produk', '4')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q5_produk === '4'
                          ? 'selected'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="rating-emoji">😄</span> Sangat sesuai
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 10: Q6 Kompetensi */}
              {currentSlide === 10 && (
                <div className="survey-slide fade-in question-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-lime-500">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-lime-500 text-white text-xs font-bold px-2 py-1 rounded-lg">6</span>{' '}
                    Kompetensi petugas
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rating-group">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q6_kompetensi', '1')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q6_kompetensi === '1'
                          ? 'selected'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                      <span className="rating-emoji">😞</span> Tidak kompeten
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q6_kompetensi', '2')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q6_kompetensi === '2'
                          ? 'selected'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                    >
                      <span className="rating-emoji">😐</span> Kurang kompeten
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q6_kompetensi', '3')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q6_kompetensi === '3'
                          ? 'selected'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      <span className="rating-emoji">😊</span> Kompeten
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q6_kompetensi', '4')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q6_kompetensi === '4'
                          ? 'selected'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="rating-emoji">😄</span> Sangat kompeten
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 11: Q7 Keramahan */}
              {currentSlide === 11 && (
                <div className="survey-slide fade-in question-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-yellow-500">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-lg">7</span>{' '}
                    Perilaku/keramahan petugas
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rating-group">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q7_keramahan', '1')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q7_keramahan === '1'
                          ? 'selected'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                      <span className="rating-emoji">😞</span> Tidak sopan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q7_keramahan', '2')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q7_keramahan === '2'
                          ? 'selected'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                    >
                      <span className="rating-emoji">😐</span> Kurang sopan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q7_keramahan', '3')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q7_keramahan === '3'
                          ? 'selected'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      <span className="rating-emoji">😊</span> Sopan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q7_keramahan', '4')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q7_keramahan === '4'
                          ? 'selected'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="rating-emoji">😄</span> Sangat sopan
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 12: Q8 Sarana Prasarana */}
              {currentSlide === 12 && (
                <div className="survey-slide fade-in question-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-amber-500">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg">8</span>{' '}
                    Kualitas sarana prasarana
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rating-group">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q8_sarana', '1')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q8_sarana === '1'
                          ? 'selected'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                      <span className="rating-emoji">😞</span> Buruk
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q8_sarana', '2')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q8_sarana === '2'
                          ? 'selected'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                    >
                      <span className="rating-emoji">😐</span> Cukup
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q8_sarana', '3')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q8_sarana === '3'
                          ? 'selected'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      <span className="rating-emoji">😊</span> Baik
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q8_sarana', '4')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q8_sarana === '4'
                          ? 'selected'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="rating-emoji">😄</span> Sangat Baik
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 13: Q9 Penanganan Pengaduan */}
              {currentSlide === 13 && (
                <div className="survey-slide fade-in question-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-orange-500">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">9</span>{' '}
                    Penanganan pengaduan
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rating-group">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q9_pengaduan', '1')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q9_pengaduan === '1'
                          ? 'selected'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                      <span className="rating-emoji">😞</span> Tidak ada
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q9_pengaduan', '2')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q9_pengaduan === '2'
                          ? 'selected'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                    >
                      <span className="rating-emoji">😐</span> Ada tapi tidak berfungsi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q9_pengaduan', '3')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q9_pengaduan === '3'
                          ? 'selected'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      <span className="rating-emoji">😊</span> Kurang maksimal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect('q9_pengaduan', '4')}
                      className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${formData.q9_pengaduan === '4'
                          ? 'selected'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="rating-emoji">😄</span> Dikelola baik
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 14: Saran & Masukan */}
              {currentSlide === 14 && (
                <div className="survey-slide fade-in" data-slide="14">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-lg">
                      ✍️
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Saran & Masukan</h2>
                  </div>
                  <textarea
                    id="saran"
                    name="saran"
                    rows={4}
                    value={formData.saran}
                    onChange={(e) => setFormData({ ...formData, saran: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 px-5 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none font-medium text-gray-800"
                    placeholder="Tuliskan saran atau masukan Anda untuk meningkatkan kualitas pelayanan kami..."
                  ></textarea>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div
                id="error-message"
                className="my-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-center font-medium fade-in"
              >
                <span id="error-text">{errorMessage}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div id="navigation-buttons" className="flex gap-3 mt-8 border-t border-gray-100 pt-6">
              {currentSlide > 1 && (
                <button
                  type="button"
                  id="btn-prev"
                  onClick={handlePrev}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Kembali
                </button>
              )}

              {currentSlide < TOTAL_SLIDES && (
                <button
                  type="button"
                  id="btn-next"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
                >
                  Lanjutkan
                </button>
              )}

              {currentSlide === TOTAL_SLIDES && (
                <button
                  type="submit"
                  id="btn-submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengirim data...' : 'Kirim Survei'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Link back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/80 hover:text-white text-xs transition-colors underline font-medium">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Success Modal matching original Web App */}
      {showSuccessModal && (
        <div
          id="success-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center transform scale-100 transition-transform duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-script text-4xl text-teal-800 mb-1 font-normal tracking-wide">
              Hatur Nuhun!
            </h3>
            <h4 className="text-base font-bold text-emerald-700 mb-3 font-display">Terima Kasih Banyak Atas Partisipasi Anda</h4>
            {submittedId && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl py-2 px-4 mb-4 text-xs font-semibold inline-block">
                Nomor Responden: <span className="font-mono text-emerald-900 font-bold">{submittedId}</span>
              </div>
            )}
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
              Data kuesioner Anda telah berhasil masuk ke database{' '}
              <strong>Kelurahan Lebakgede</strong> secara aman. Partisipasi Anda sangat berharga bagi
              kami untuk terus meningkatkan kualitas pelayanan publik masyarakat Kecamatan Coblong.
            </p>
            <button
              type="button"
              id="btn-modal-close"
              onClick={handleResetSurvey}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all transform active:scale-95"
            >
              Isi Survei Baru
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
