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
import type { StationMonthly } from '@/util/export'
import { exportMonthlyAnalysis } from '@/util/export'

export const AnalysisPage: NextPage = () => {
  const [viewMode, setViewMode] = useState<AnalysisFrequency>('daily')
  const { stations } = useStationsAPI()
  const { data } = useAnalysisAPI(viewMode)
  const [selectedStations, setSelectedStations] = useState<number[]>([])

  const toggleStationSelection = (stationId: number) => {
    setSelectedStations(prev =>
      prev.includes(stationId)
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    )
  }

  const exportData = async () => exportMonthlyAnalysis(data as StationMonthly[])

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'daily' ? 'monthly' : 'daily')
  }

  const combinedValues = stations.reduce((acc, station) => ({
    patientCount: acc.patientCount + station.patientCount,
  }), { patientCount: 0 })

  const combinedKey = NaN // TODO use a cleaner solution here

  return (
    <Page
      header={(
        <Header
          end={(
            <button
              onClick={toggleViewMode}
              className="bg-primary/60 hover:bg-primary/80 rounded px-2 py-1"
            >
              {viewMode === 'daily' ? 'Monatlich' : 'Täglich'}
            </button>
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
          className={`flex flex-col gap-y-2 bg-emerald-100 border-emerald-300 w-full cursor-pointer
                    ${selectedStations.includes(combinedKey)
            ? 'border-2 border-primary bg-primary/10'
            : ''}`}
          onClick={() => toggleStationSelection(combinedKey)}
        >
          <span className="text-xl font-semibold text-emerald-800">Alle Stationen</span>
          <div className="flex flex-row w-full justify-between gap-x-2 items-center">
            <span className="text-emerald-700">Gesamtpatientenanzahl:</span>
            <span className="font-semibold text-emerald-800">{combinedValues.patientCount}</span>
          </div>
        </Card>

        {data.map(value => {
          let minutes: number
          if ('minutes' in value) {
            minutes = value.minutes
          } else {
            minutes = value.data.map(value => value.minutes).reduce((pre, acc) => pre + acc, 0)
          }
          return (
            <Card
              key={value.id}
              className={`flex flex-col gap-y-2 cursor-pointer
              ${selectedStations.includes(value.id)
                ? 'border-2 border-primary bg-primary/10'
                : 'border-gray-200'}`}
              onClick={() => toggleStationSelection(value.id)}
            >
              <span className="text-xl font-semibold">{value.name}</span>
              <div className="flex flex-row w-full justify-between items-center gap-x-4">
                <span className="text-sm text-gray-500">Minuten</span>
                <span className="font-semibold text-emerald-800">{minutes}</span>
              </div>
            </Card>
          )
        })}
      </div>
      <button
        onClick={exportData}
        className="bg-primary/60 hover:bg-primary/80 rounded px-2 py-1"
        disabled={viewMode === 'daily'}
      >
        {'Daten exportieren'}
      </button>
    </Page>
  )
}

export default AnalysisPage
