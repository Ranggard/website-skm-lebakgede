import React from 'react'
import { SurveyFormData } from '../types'

interface StepSuggestionsProps {
  formData: SurveyFormData
  setFormData: React.Dispatch<React.SetStateAction<SurveyFormData>>
}

export const StepSuggestions: React.FC<StepSuggestionsProps> = ({
  formData,
  setFormData,
}) => {
  return (
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
  )
}

