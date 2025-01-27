import React, { useRef, useState } from 'react'
import { BarChart3, X, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { addDays, subDays } from 'date-fns'
import type { CurveType } from 'recharts/types/shape/Curve'
import { Tooltip as TooltipCustom } from '@/components/Tooltip'
import { DatePickerButton } from '@/components/DatePicker/DatePickerButton'
import { useOutsideClick } from '@/util/hooks/useOutsideClick'

interface ComparisonGraphProps {
  data: any[],
  date: Date,
  onDateChange: (date: Date) => void,
  dates: Date[]
}

/*
  The ComparisonGraph component is a popup that displays a comparison graph of the data provided.
  It uses the recharts library to display the data in a line chart. The data is processed to
  display the day and night data for each station in the provided data. The component also
  provides a date picker to change the date of the data displayed in the graph.
*/
export const ComparisonGraph = ({
  data,
  date,
  onDateChange,
  dates,
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

  const lineProps = {
    type: 'monotone' as CurveType,
    dot: { r: 4 },
    activeDot: { r: 7 },
    strokeWidth: 4,
  }

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
          <div ref={ref} className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Stationsvergleich - Ist- vs Soll-Werte</h2>
              <div className="flex flex-row items-center gap-x-4">
                <div className="flex flex-row gap-x-2 items-center flex-1 justify-center">
                  <button
                    onClick={() => onDateChange(subDays(date, 1))}
                    className="flex flex-col items-center"
                  >
                    <TooltipCustom tooltip="Vorheriger Tag" position="bottom">
                      <ChevronLeft size={32}/>
                    </TooltipCustom>
                  </button>
                  <DatePickerButton
                    date={date}
                    eventList={{
                      events: dates.map(date => ({
                        date,
                        color: 'green'
                      }))
                    }}
                    onDateClick={(_, selectedDate) => onDateChange(selectedDate)}
                  />
                  <button
                    onClick={() => onDateChange(addDays(date, 1))}
                    className="flex flex-col items-center"
                  >
                    <TooltipCustom tooltip="Nächster Tag" position="bottom">
                      <ChevronRight size={32}/>
                    </TooltipCustom>
                  </button>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  <X size={20}/>
                </button>
              </div>
            </div>

            {
              // x-axis: stations
              // y-axis: values for the should and is data
            }
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
                    {...lineProps}
                    dataKey="dayIs"
                    name="Tag (Ist)"
                    stroke="#8884d8"
                  />
                  <Line
                    {...lineProps}
                    dataKey="dayShould"
                    name="Tag (Sollte)"
                    stroke="#82ca9d"
                  />
                  <Line
                    {...lineProps}
                    dataKey="nightIs"
                    name="Nacht (Ist)"
                    stroke="#ffc658"
                  />
                  <Line
                    {...lineProps}
                    dataKey="nightShould"
                    name="Nacht (Sollte)"
                    stroke="#ff7300"
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
