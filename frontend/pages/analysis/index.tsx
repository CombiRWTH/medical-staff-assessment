import type { NextPage } from 'next'
import { useState } from 'react'
import { Page } from '@/layout/Page'
import { Header } from '@/layout/Header'
import { Sidebar } from '@/layout/Sidebar'
import { LinkTiles } from '@/components/LinkTiles'
import { Card } from '@/components/Card'
import { useStationsAPI } from '@/api/stations'
import { useAnalysisAPI } from '@/api/analysis'
import { exportMonthlyAnalysis } from '@/util/export2'
import type { StationMonthly } from '@/util/export2'

export const AnalysisPage: NextPage = () => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')
  const { stations } = useStationsAPI()
  const { data } = useAnalysisAPI(viewMode)
  const [selectedStations, setSelectedStations] = useState<number[]>([])

  /*
  const dailyStations: StationDaily[] = [
    { id: '1', name: 'Station A', minutes: 42 },
    { id: '2', name: 'Station B', minutes: 35 },
  ]
   */

  const monthlyStations: StationMonthly[] = [
    {
      id: 1,
      name: 'Station A',
      data: [
        { day: 1, minutes: 42 },
        { day: 2, minutes: 38 },
        { day: 3, minutes: 40 }
      ]
    },
    {
      id: 2,
      name: 'Station B',
      data: [
        { day: 1, minutes: 30 },
        { day: 2, minutes: 28 },
        { day: 3, minutes: 29 }
      ]
    }
  ]

  const toggleStationSelection = (stationId: number) => {
    setSelectedStations(prev =>
      prev.includes(stationId)
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    )
  }
  // const exportData = async () => exportDailyAnalysis(dailyStations)

  const exportData2 = async () => exportMonthlyAnalysis(monthlyStations)

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

        {data.map(value => (
          <Card
            key={value.id}
            className={`flex flex-col gap-y-2 cursor-pointer
              ${selectedStations.includes(value.id)
                ? 'border-2 border-primary bg-primary/10'
                : 'border-gray-200'}`}
            onClick={() => toggleStationSelection(value.id)}
          >
            <span className="text-xl font-semibold">{value.name}</span>
            <div className="flex flex-row w-full justify-between items-center">
              <span className="text-sm text-gray-500">Minuten</span>
              <span className="font-semibold text-emerald-800">100</span>
            </div>
          </Card>
        ))}
      </div>
      <button
        onClick={exportData2}
        className="bg-primary/60 hover:bg-primary/80 rounded px-2 py-1"
      >
        {'Daten exportieren'}
      </button>
    </Page>
  )
}

export default AnalysisPage
