import React from 'react'
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
import type { CurveType } from 'recharts/types/shape/Curve'

interface ComparisonGraphProps {
  data: any[]
}

/*
  The ComparisonGraph component is a popup that displays a comparison graph of the data provided.
  It uses the recharts library to display the data in a line chart. The data is processed to
  display the day and night data for each station in the provided data. The component also
  provides a date picker to change the date of the data displayed in the graph.
*/
export const ComparisonGraph = ({ data }: ComparisonGraphProps) => {
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

  // Define common line properties
  const baseLineProps = {
    type: 'monotone' as CurveType,
    dot: { r: 4 },
    activeDot: { r: 7 },
    strokeWidth: 4,
  }

  // Colors for Ist and Soll
  const colors = {
    night: '#8884d8', // Purple for "Ist"
    day: '#82ca9d' // Green for "Soll"
  }

  return (
    <div className="h-96 w-full mb-4">
      <h2 className="text-xl font-bold mb-4">{'Vollzeitäquivalente: Ist- vs. Soll-Werte'}</h2>
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
            {...baseLineProps}
            dataKey="dayIs"
            name="Tag (Ist)"
            stroke={colors.day}
            strokeWidth={3}
            legendType="plainline"
          />
          <Line
            {...baseLineProps}
            dataKey="dayShould"
            name="Tag (Soll)"
            stroke={colors.day}
            strokeDasharray="5 5"
            strokeWidth={3}
            legendType="plainline"
          />
          <Line
            {...baseLineProps}
            dataKey="nightIs"
            name="Nacht (Ist)"
            stroke={colors.night}
            strokeWidth={3}
            legendType="plainline"
          />
          <Line
            {...baseLineProps}
            dataKey="nightShould"
            name="Nacht (Soll)"
            stroke={colors.night}
            strokeDasharray="5 5"
            strokeWidth={3}
            legendType="plainline"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ComparisonGraph
