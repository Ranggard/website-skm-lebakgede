import React, { RefObject } from 'react'
import { SurveyFormData, EDUCATION_OPTIONS, SERVICE_OPTIONS } from '../types'

interface StepBiodataProps {
  currentSlide: number
  formData: SurveyFormData
  setFormData: React.Dispatch<React.SetStateAction<SurveyFormData>>
  setErrorMessage: (msg: string | null) => void
  handleGenderChange: (val: string) => void
  handleSelectChange: (key: keyof SurveyFormData, val: string) => void
  handleNext: () => void
  usiaInputRef: RefObject<HTMLInputElement>
}

export const StepBiodata: React.FC<StepBiodataProps> = ({
  currentSlide,
  formData,
  setFormData,
  setErrorMessage,
  handleGenderChange,
  handleSelectChange,
  handleNext,
  usiaInputRef,
}) => {
  return (
    <>
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
                  className={`border-2 rounded-xl py-3 px-4 text-center cursor-pointer transition-all font-medium ${
                    formData.gender === 'Laki-laki'
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
                  className={`border-2 rounded-xl py-3 px-4 text-center cursor-pointer transition-all font-medium ${
                    formData.gender === 'Perempuan'
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
    </>
  )
}

