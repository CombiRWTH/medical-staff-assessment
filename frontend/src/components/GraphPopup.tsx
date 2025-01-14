import React, { useRef, useState } from 'react'
import { BarChart3, X } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Tooltip as TooltipCustom } from '@/components/Tooltip'
import { Select } from '@/components/Select'
import { useOutsideClick } from '@/util/hooks/useOutsideClick'

type Frequency = 'day' | 'week' | 'month'

interface ComparisonGraphProps {
  data: any[],
  timeRange: Frequency,
  onTimeRangeChange: (range: Frequency) => void
}

export const ComparisonGraph = ({
  data,
  timeRange,
  onTimeRangeChange
}: ComparisonGraphProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick([ref], () => setIsOpen(false))

  const processedData = data.reduce((acc: any, station: any) => {
    const stationData = {
      dayData: station.dataset_day[0] || {
        is: 0,
        should: 0
      },
      nightData: station.dataset_night[0] || {
        is: 0,
        should: 0
      }
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
      <TooltipCustom tooltip="Vergleichsdiagramm" containerClassName="!w-auto" position="bottom">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-2 button-full-primary"
        >
          <BarChart3 size={24}/>
        </button>
      </TooltipCustom>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div ref={ref} className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Stationsvergleich - Ist- vs Soll-Werte</h2>
              <div className="flex flex-row items-center gap-x-4">
                <div className="flex flex-row items-center gap-x-4">
                  <Select<Frequency>
                    selected={timeRange}
                    items={[{
                      value: 'day',
                      label: 'Tag',
                    },
                    {
                      value: 'week',
                      label: 'Woche',
                    },
                    {
                      value: 'month',
                      label: 'Monat',
                    },
                    ]}
                    onChange={value => onTimeRangeChange(value)}
                  />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  <X size={20}/>
                </button>
              </div>
            </div>

            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={processedData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
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
          </div>
        </div>
      )}
    </>
  )
}

export default ComparisonGraph
