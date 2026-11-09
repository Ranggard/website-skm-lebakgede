import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Cell,
  LabelList,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'

const CustomElementTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 z-50">
        <p className="font-extrabold text-emerald-400 text-sm border-b border-slate-800 pb-1 font-display">{data.label || data.name}</p>
        <p className="text-slate-300">Skor Rata-rata: <strong className="text-white">{Number(data.score).toFixed(2)}</strong> / 4.00</p>
        <p className="text-slate-300">Nilai IKM: <strong className="text-white">{Number(data.ikm || (data.score * 25)).toFixed(1)}</strong></p>
        <p className="text-slate-300">Mutu: <strong className="text-emerald-300">{data.mutu}</strong></p>
      </div>
    )
  }
  return null
}

interface TabGrafikProps {
  derivedStats: any
  activeChartView: 'bar' | 'radar'
  setActiveChartView: (v: 'bar' | 'radar') => void
  isMounted: boolean
}

export const TabGrafik: React.FC<TabGrafikProps> = ({
  derivedStats,
  activeChartView,
  setActiveChartView,
  isMounted,
}) => {
  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 font-display">Grafik Evaluasi 9 Unsur SKM</h3>
            <p className="text-xs text-gray-500">Perbandingan nilai rata-rata persepsi masyarakat per unsur pelayanan</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveChartView('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-display cursor-pointer ${
                activeChartView === 'bar' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Diagram Batang
            </button>
            <button
              onClick={() => setActiveChartView('radar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-display cursor-pointer ${
                activeChartView === 'radar' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Radar Spider
            </button>
          </div>
        </div>

        {isMounted && (
          <div className="h-80 sm:h-96 w-full">
            {activeChartView === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={derivedStats.elements} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="short"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 11, fill: '#475569' }}
                  />
                  <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 11, fill: '#475569' }} />
                  <RechartsTooltip content={<CustomElementTooltip />} />
                  <ReferenceLine y={3.53} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Sangat Baik (3.53)', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={3.06} stroke="#0284c7" strokeDasharray="3 3" label={{ value: 'Baik (3.06)', fill: '#0284c7', fontSize: 10 }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {derivedStats.elements.map((entry: any, idx: number) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={entry.score >= 3.53 ? '#10b981' : entry.score >= 3.06 ? '#0d9488' : '#f59e0b'}
                      />
                    ))}
                    <LabelList dataKey="score" position="top" formatter={(val: any) => Number(val).toFixed(2)} style={{ fontSize: 11, fontWeight: 'bold', fill: '#0f172a' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={derivedStats.elements}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="short" tick={{ fontSize: 11, fill: '#334155' }} />
                  <PolarRadiusAxis domain={[0, 4]} />
                  <Radar name="Skor Unsur" dataKey="score" stroke="#0d9488" fill="#14b8a6" fillOpacity={0.4} />
                  <RechartsTooltip content={<CustomElementTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

