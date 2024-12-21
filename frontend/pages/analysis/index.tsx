import type { NextPage } from 'next'
import { useState } from 'react'
import { Page } from '@/layout/Page'
import { Header } from '@/layout/Header'
import { Sidebar } from '@/layout/Sidebar'
import { LinkTiles } from '@/components/LinkTiles'
import { Card } from '@/components/Card'
import { useStationsAPI } from '@/api/stations'
import type { AnalysisFrequency } from '@/api/analysis'
import { useAnalysisAPI } from '@/api/analysis'
import type { StationMonthly, StationDaily } from '@/util/export'
import { exportMonthlyAnalysis, exportDailyAnalysis } from '@/util/export'

export const AnalysisPage: NextPage = () => {
  const [viewMode, setViewMode] = useState<AnalysisFrequency>('daily')
  const { stations } = useStationsAPI()
  const { data } = useAnalysisAPI(viewMode)
  const [selectedStations, setSelectedStations] = useState<number[]>([])

  // Special constant
  const COMBINED_STATIONS_KEY = -1

  const toggleStationSelection = (stationId: number) => {
    setSelectedStations(prev => {
      // If the station is already selected, remove it
      if (prev.includes(stationId)) {
        return prev.filter(id => id !== stationId)
      }

      // If the station is not selected, add it
      return [...prev, stationId]
    })
  }

  const exportData = async () => {
    // Filter the stations
    const filteredData = data.filter(station => selectedStations.includes(station.id))

    if (viewMode === 'daily') {
      await exportDailyAnalysis(filteredData as StationDaily[])
    } else {
      await exportMonthlyAnalysis(filteredData as StationMonthly[])
    }
  }

  const combinedValues = stations.reduce((acc, station) => ({
    patientCount: acc.patientCount + station.patientCount,
  }), { patientCount: 0 })

  return (
    <Page
      header={(
        <Header
          end={(
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('daily')}
                disabled={viewMode === 'daily'}
                className={`px-2 py-1 rounded ${
                  viewMode === 'daily'
                    ? 'bg-primary text-white'
                    : 'bg-primary/30 text-primary/50 cursor-pointer'
                }`}
              >
                Täglich
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                disabled={viewMode === 'monthly'}
                className={`px-2 py-1 rounded ${
                  viewMode === 'monthly'
                    ? 'bg-primary text-white'
                    : 'bg-primary/30 text-primary/50 cursor-pointer'
                }`}
              >
                Monatlich
              </button>
            </div>
          )}
        >
        </Header>
      )}
      sideBar={(
        <Sidebar>
          <LinkTiles links={[{
            name: 'Stationen',
            url: '/stations'
          }, {
            name: 'Analyse',
            url: '/analysis'
          }]}/>
        </Sidebar>
      )}
    >
      <div className="flex flex-wrap gap-10 p-10 content-start">
        <Card
          key="combined-stations"
          className={`flex flex-col gap-y-2 cursor-pointer transition-colors w-full
            ${selectedStations.includes(COMBINED_STATIONS_KEY)
              ? 'bg-primary/10'
              : 'bg-emerald-100 hover:bg-emerald-50'}`}
          onClick={() => toggleStationSelection(COMBINED_STATIONS_KEY)}
        >
          <div className="p-4 flex flex-col">
            <span className="text-xl font-semibold text-emerald-800">Alle Stationen</span>
            <div className="flex flex-row w-full justify-between gap-x-2 items-center mt-2">
              <span className="text-emerald-700">Gesamtpatientenanzahl:</span>
              <span className="font-semibold text-emerald-800">{combinedValues.patientCount}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data.map(value => {
            const minutes = 'minutes' in value
              ? value.minutes
              : value.data.map(v => v.minutes).reduce((pre, acc) => pre + acc, 0)

            return (
              <Card
                key={value.id}
                className={`flex flex-col gap-y-2 cursor-pointer transition-colors
                  ${selectedStations.includes(value.id)
                    ? 'bg-primary/10'
                    : 'bg-white hover:bg-gray-50'}`}
                onClick={() => toggleStationSelection(value.id)}
              >
                <div className="p-4 flex flex-col h-full">
                  <span className="text-xl font-semibold mb-auto">{value.name}</span>
                  <div className="flex flex-row w-full justify-between items-center gap-x-4 mt-2">
                    <span className="text-sm text-gray-500">Minuten</span>
                    <span className="font-semibold text-emerald-800">{minutes}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
      <button
        onClick={exportData}
        className="bg-primary/60 hover:bg-primary/80 rounded px-2 py-1"
      >
        {'Daten exportieren'}
      </button>
    </Page>
  )
}

export default AnalysisPage
