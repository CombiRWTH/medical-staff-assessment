import type { NextPage } from 'next'
import { useState } from 'react'
import { Page } from '@/layout/Page'
import { Header } from '@/layout/Header'
import { Sidebar } from '@/layout/Sidebar'
import { LinkTiles } from '@/components/LinkTiles'
import { Card } from '@/components/Card'
import { useStationsAPI } from '@/api/stations'

export const AnalysisPage: NextPage = () => {
  const { stations } = useStationsAPI()
  const [selectedStations, setSelectedStations] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')

  const toggleStationSelection = (stationId: number) => {
    setSelectedStations(prev =>
      prev.includes(stationId)
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    )
  }

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'daily' ? 'monthly' : 'daily')
  }

  const { combinedPatientCount } = stations.reduce((acc, station) => ({
    combinedPatientCount: acc.combinedPatientCount + station.patientCount,
  }), { combinedPatientCount: 0 })

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
                    className="flex flex-col gap-y-2 bg-emerald-100 border-emerald-300 w-full cursor-pointer"
                >
                    <span className="text-xl font-semibold text-emerald-800">Alle Stationen</span>
                    <div className="flex flex-row w-full justify-between gap-x-2 items-center">
                        <span className="text-emerald-700">Gesamtpatientenanzahl:</span>
                        <span className="font-semibold text-emerald-800">{combinedPatientCount}</span>
                    </div>
                </Card>

                {stations.map(value => (
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
                        </div>
                    </Card>
                ))}
            </div>
        </Page>
  )
}

export default AnalysisPage
