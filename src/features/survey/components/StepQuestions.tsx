import React from 'react'
import { SurveyFormData } from '../types'

interface StepQuestionsProps {
  currentSlide: number
  formData: SurveyFormData
  handleRatingSelect: (key: keyof SurveyFormData, val: string) => void
}

export const StepQuestions: React.FC<StepQuestionsProps> = ({
  currentSlide,
  formData,
  handleRatingSelect,
}) => {
  return (
    <>
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
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q1_persyaratan === '1'
                  ? 'selected'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <span className="rating-emoji">😞</span> Tidak sesuai
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q1_persyaratan', '2')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q1_persyaratan === '2'
                  ? 'selected'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <span className="rating-emoji">😐</span> Kurang sesuai
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q1_persyaratan', '3')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q1_persyaratan === '3'
                  ? 'selected'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="rating-emoji">😊</span> Sesuai
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q1_persyaratan', '4')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q1_persyaratan === '4'
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
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q2_prosedur === '1'
                  ? 'selected'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <span className="rating-emoji">😞</span> Tidak mudah
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q2_prosedur', '2')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q2_prosedur === '2'
                  ? 'selected'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <span className="rating-emoji">😐</span> Kurang mudah
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q2_prosedur', '3')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q2_prosedur === '3'
                  ? 'selected'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="rating-emoji">😊</span> Mudah
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q2_prosedur', '4')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q2_prosedur === '4'
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
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q3_waktu === '1'
                  ? 'selected'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <span className="rating-emoji">😞</span> Tidak cepat
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q3_waktu', '2')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q3_waktu === '2'
                  ? 'selected'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <span className="rating-emoji">😐</span> Kurang cepat
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q3_waktu', '3')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q3_waktu === '3'
                  ? 'selected'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="rating-emoji">😊</span> Cepat
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q3_waktu', '4')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q3_waktu === '4'
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
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q4_biaya === '1'
                  ? 'selected'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <span className="rating-emoji">😞</span> Sangat mahal
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q4_biaya', '2')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q4_biaya === '2'
                  ? 'selected'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <span className="rating-emoji">😐</span> Cukup mahal
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q4_biaya', '3')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q4_biaya === '3'
                  ? 'selected'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="rating-emoji">😊</span> Murah
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q4_biaya', '4')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-bold border-2 ${
                formData.q4_biaya === '4'
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
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q5_produk === '1'
                  ? 'selected'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <span className="rating-emoji">😞</span> Tidak sesuai
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q5_produk', '2')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q5_produk === '2'
                  ? 'selected'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <span className="rating-emoji">😐</span> Kurang sesuai
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q5_produk', '3')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q5_produk === '3'
                  ? 'selected'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="rating-emoji">😊</span> Sesuai
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q5_produk', '4')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q5_produk === '4'
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
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q6_kompetensi === '1'
                  ? 'selected'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <span className="rating-emoji">😞</span> Tidak kompeten
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q6_kompetensi', '2')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q6_kompetensi === '2'
                  ? 'selected'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <span className="rating-emoji">😐</span> Kurang kompeten
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q6_kompetensi', '3')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q6_kompetensi === '3'
                  ? 'selected'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="rating-emoji">😊</span> Kompeten
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q6_kompetensi', '4')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q6_kompetensi === '4'
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
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q7_keramahan === '1'
                  ? 'selected'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <span className="rating-emoji">😞</span> Tidak sopan
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q7_keramahan', '2')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q7_keramahan === '2'
                  ? 'selected'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <span className="rating-emoji">😐</span> Kurang sopan
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q7_keramahan', '3')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q7_keramahan === '3'
                  ? 'selected'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="rating-emoji">😊</span> Sopan
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q7_keramahan', '4')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q7_keramahan === '4'
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
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q8_sarana === '1'
                  ? 'selected'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <span className="rating-emoji">😞</span> Buruk
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q8_sarana', '2')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q8_sarana === '2'
                  ? 'selected'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <span className="rating-emoji">😐</span> Cukup
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q8_sarana', '3')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q8_sarana === '3'
                  ? 'selected'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="rating-emoji">😊</span> Baik
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q8_sarana', '4')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q8_sarana === '4'
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
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q9_pengaduan === '1'
                  ? 'selected'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <span className="rating-emoji">😞</span> Tidak ada
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q9_pengaduan', '2')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q9_pengaduan === '2'
                  ? 'selected'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              <span className="rating-emoji">😐</span> Ada tapi tidak berfungsi
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q9_pengaduan', '3')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q9_pengaduan === '3'
                  ? 'selected'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="rating-emoji">😊</span> Kurang maksimal
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('q9_pengaduan', '4')}
              className={`rating-btn rounded-xl py-2 px-3 text-sm font-medium border-2 ${
                formData.q9_pengaduan === '4'
                  ? 'selected'
                  : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
              }`}
            >
              <span className="rating-emoji">😄</span> Dikelola baik
            </button>
          </div>
        </div>
      )}
    </>
  )
}

