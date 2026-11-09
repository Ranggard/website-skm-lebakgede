import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts'

interface TabDemografiProps {
  derivedStats: any
}

export const TabDemografi: React.FC<TabDemografiProps> = ({ derivedStats }) => {
  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gender Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <h4 className="text-sm font-extrabold text-gray-900 font-display mb-1">Distribusi Jenis Kelamin</h4>
          <p className="text-xs text-gray-500 mb-4">Komposisi responden warga perempuan dan laki-laki</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Perempuan', value: derivedStats.gender['Perempuan'] || 13, fill: '#ec4899' },
                    { name: 'Laki-laki', value: derivedStats.gender['Laki-laki'] || 11, fill: '#0284c7' },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} ${(((percent as number) || 0) * 100).toFixed(0)}%`}
                >
                  <Cell fill="#ec4899" />
                  <Cell fill="#0284c7" />
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-xs font-bold pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500"></span>
              <span>Perempuan: {derivedStats.gender['Perempuan'] || 13} Orang</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-600"></span>
              <span>Laki-laki: {derivedStats.gender['Laki-laki'] || 11} Orang</span>
            </div>
          </div>
        </div>

        {/* Education Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <h4 className="text-sm font-extrabold text-gray-900 font-display mb-1">Tingkat Pendidikan Responden</h4>
          <p className="text-xs text-gray-500 mb-4">Latar belakang pendidikan responden pengurus layanan</p>

          <div className="space-y-2.5 pt-2">
            {[
              { edu: 'SMA / Sederajat', count: 15, pct: 62.5 },
              { edu: 'Strata 1 (S1)', count: 5, pct: 20.8 },
              { edu: 'Diploma (D1-D3)', count: 2, pct: 8.3 },
              { edu: 'Sekolah Dasar (SD)', count: 1, pct: 4.2 },
              { edu: 'Strata 3 (S3 / Doktoral)', count: 1, pct: 4.2 },
            ].map((item) => (
              <div key={item.edu}>
                <div className="flex justify-between text-xs font-bold text-gray-800 mb-1">
                  <span>{item.edu}</span>
                  <span>{item.count} Orang ({item.pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

