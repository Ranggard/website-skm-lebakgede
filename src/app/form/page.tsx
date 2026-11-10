'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  SurveyFormData,
  INITIAL_FORM_DATA,
  TOTAL_SLIDES,
  numToOption,
} from '@/src/features/survey/types'
import {
  StepBiodata,
  StepQuestions,
  StepSuggestions,
  SurveySuccessModal,
} from '@/src/features/survey/components'

export default function FormPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(1)
  const [formData, setFormData] = useState<SurveyFormData>(INITIAL_FORM_DATA)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState(5)

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
      setRedirectCountdown(5)
      setShowSuccessModal(true)
    } catch (err: any) {
      console.error('Error submitting survey:', err)
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat mengirim data.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto redirect to /dashboard after 5 seconds when success modal is shown
  useEffect(() => {
    if (!showSuccessModal) return

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showSuccessModal, router])

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
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="flex justify-center mb-4">
            <img
              src="/logo-kelurahan.jpg"
              alt="Logo Kelurahan"
              className="h-20 w-auto drop-shadow-lg object-contain logo-float"
              loading="lazy"
            />
          </div>
          <h1 id="form-title" className="text-2xl md:text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
            Survei Kepuasan Masyarakat
          </h1>
          <p className="text-white/90 text-lg font-medium">Kelurahan Lebakgede, Kecamatan Coblong</p>
          <p className="text-white/80 text-sm mt-1">Kota Bandung</p>
        </div>

        {/* Progress Bar */}
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
              {/* Slides 1-4: Biodata */}
              {currentSlide >= 1 && currentSlide <= 4 && (
                <StepBiodata
                  currentSlide={currentSlide}
                  formData={formData}
                  setFormData={setFormData}
                  setErrorMessage={setErrorMessage}
                  handleGenderChange={handleGenderChange}
                  handleSelectChange={handleSelectChange}
                  handleNext={handleNext}
                  usiaInputRef={usiaInputRef}
                />
              )}

              {/* Slides 5-13: 9 Unsur Evaluasi */}
              {currentSlide >= 5 && currentSlide <= 13 && (
                <StepQuestions
                  currentSlide={currentSlide}
                  formData={formData}
                  handleRatingSelect={handleRatingSelect}
                />
              )}

              {/* Slide 14: Saran & Masukan */}
              {currentSlide === 14 && (
                <StepSuggestions
                  formData={formData}
                  setFormData={setFormData}
                />
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

      {/* Success Modal */}
      <SurveySuccessModal
        isOpen={showSuccessModal}
        redirectCountdown={redirectCountdown}
        onReset={handleResetSurvey}
        onGoToDashboard={() => router.push('/dashboard')}
        respondentCode={submittedId}
      />
    </div>
  )
}
