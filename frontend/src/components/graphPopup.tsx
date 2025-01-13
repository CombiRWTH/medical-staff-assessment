import React, { useState } from 'react'
import { BarChart3, X } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface TimeRangeButtonProps {
  label: string,
  active: boolean,
  onClick: () => void,
}

interface ComparisonGraphProps {
  data: any[],
  timeRange: 'day' | 'week' | 'month',
  onTimeRangeChange: (range: 'day' | 'week' | 'month') => void,
}

const TimeRangeButton: React.FC<TimeRangeButtonProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded ${
      active
        ? 'bg-primary text-white'
        : 'bg-gray-100 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
)

export const ComparisonGraph: React.FC<ComparisonGraphProps> = ({
  data,
  timeRange,
  onTimeRangeChange
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const processedData = data.reduce((acc: any, station: any) => {
    const stationData = {
      dayData: station.dataset_day[0] || { is: 0, should: 0 },
      nightData: station.dataset_night[0] || { is: 0, should: 0 }
    }

    return [
      ...acc,
      {
        name: station.station_name,
        dayIs: stationData.dayData.is || 0,
        dayShould: stationData.dayData.should || 0,
        nightIs: stationData.nightData.is || 0,
        nightShould: stationData.nightData.should || 0
      }
    ]
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        <BarChart3 className="w-4 h-4" />
        Vergleichsdiagramm anzeigen
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Stationsvergleich - Ist- vs Soll-Werte</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={processedData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="dayIs"
                    name="Tag (Ist)"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dayShould"
                    name="Tag (Sollte)"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nightIs"
                    name="Nacht (Ist)"
                    stroke="#ffc658"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nightShould"
                    name="Nacht (Sollte)"
                    stroke="#ff7300"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-4 justify-center mt-6">
              <TimeRangeButton
                label="Tag"
                active={timeRange === 'day'}
                onClick={() => onTimeRangeChange('day')}
              />
              <TimeRangeButton
                label="Woche"
                active={timeRange === 'week'}
                onClick={() => onTimeRangeChange('week')}
              />
              <TimeRangeButton
                label="Monat"
                active={timeRange === 'month'}
                onClick={() => onTimeRangeChange('month')}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ComparisonGraph
