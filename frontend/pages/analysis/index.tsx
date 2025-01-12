import type { NextPage } from 'next'
import React, { useRef, useState, useEffect } from 'react'
import { Upload, CheckCircle, XCircle } from 'lucide-react'
import { Page } from '@/layout/Page'
import { Header } from '@/layout/Header'
import { Sidebar } from '@/layout/Sidebar'
import { LinkTiles } from '@/components/LinkTiles'
import { Card } from '@/components/Card'
import { useStationsAPI } from '@/api/stations'
import type { AnalysisFrequency } from '@/api/analysis'
import { useAnalysisAPI } from '@/api/analysis'
import { useGraphAPI } from '@/api/graph'
import type { StationMonthly, StationDaily } from '@/util/export'
import { exportMonthlyAnalysis, exportDailyAnalysis } from '@/util/export'
import { apiURL } from '@/config'
import { getCookie } from '@/util/getCookie'
import { ComparisonGraph } from '@/components/graphPopup'

export const AnalysisPage: NextPage = () => {
  const [viewMode, setViewMode] = useState<AnalysisFrequency>('daily')
  const { stations } = useStationsAPI()
  const { data } = useAnalysisAPI(viewMode)
  const { data: graphData } = useGraphAPI()
  const [selectedStations, setSelectedStations] = useState<number[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showNotification, setShowNotification] = useState(false)
  const monthlyInputRef = useRef<HTMLInputElement>(null)
  const dailyInputRef = useRef<HTMLInputElement>(null)

  // Special constant
  const COMBINED_STATIONS_KEY = -1

  const exampleData: any[] = [
    {
      station_id: 1,
      station_name: 'Station 3',
      dataset_night: [
        {
          date: '2025-01-03',
          should: 0,
          is: 1.4500000000000002
        }
      ],
      dataset_day: [
        {
          date: '2025-01-03',
          should: null,
          is: 3.32
        }
      ]
    },
    {
      station_id: 2,
      station_name: 'Station 5',
      dataset_night: [
        {
          date: '2025-01-03',
          should: 0,
          is: 1.82
        }
      ],
      dataset_day: [
        {
          date: '2025-01-03',
          should: null,
          is: 3.67
        }
      ]
    },
    {
      station_id: 3,
      station_name: 'Station 1A',
      dataset_night: [
        {
          date: '2025-01-03',
          should: 0,
          is: 1.02
        }
      ],
      dataset_day: [
        {
          date: '2025-01-03',
          should: null,
          is: 1.45
        }
      ]
    },
    {
      station_id: 4,
      station_name: 'Station 1C',
      dataset_night: [
        {
          date: '2025-01-03',
          should: 0,
          is: 1.11
        }
      ],
      dataset_day: [
        {
          date: '2025-01-03',
          should: null,
          is: 3.08
        }
      ]
    },
    {
      station_id: 5,
      station_name: 'Station 2A',
      dataset_night: [
        {
          date: '2025-01-03',
          should: 0,
          is: 1.4000000000000001
        }
      ],
      dataset_day: [
        {
          date: '2025-01-03',
          should: null,
          is: 2.9
        }
      ]
    },
    {
      station_id: 6,
      station_name: 'Station 2C',
      dataset_night: [
        {
          date: '2025-01-03',
          should: 0,
          is: 1.55
        }
      ],
      dataset_day: [
        {
          date: '2025-01-03',
          should: null,
          is: 3.15
        }
      ]
    },
    {
      station_id: 7,
      station_name: 'Station E1',
      dataset_night: [
        {
          date: '2025-01-03',
          should: 0,
          is: 1.48
        }
      ],
      dataset_day: [
        {
          date: '2025-01-03',
          should: null,
          is: 3.58
        }
      ]
    },
    {
      station_id: 8,
      station_name: 'Station K1',
      dataset_night: [],
      dataset_day: []
    },
    {
      station_id: 9,
      station_name: 'Station K3',
      dataset_night: [],
      dataset_day: []
    }
  ]

  // Hide notification after 10 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false)
        setError('')
        setSuccess('')
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [showNotification])

  const handleFileUpload = async (file: File, type: 'monthly' | 'daily') => {
    const validExcelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet'
    ]

    if (!validExcelTypes.includes(file.type)) {
      setError('Bitte nur Excel-Dateien hochladen (.xls, .xlsx oder .ods)')
      setShowNotification(true)
      return
    }

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append(type, file)

      const cookie = getCookie('csrftoken')
      const response = await fetch(`${apiURL}/import/caregiver/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': cookie ?? '',
        },
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen')
      }

      setSuccess(`${type === 'monthly' ? 'Monatliche' : 'Tägliche'} Daten erfolgreich hochgeladen`)

      if (type === 'monthly' && monthlyInputRef.current) {
        monthlyInputRef.current.value = ''
      } else if (type === 'daily' && dailyInputRef.current) {
        dailyInputRef.current.value = ''
      }
    } catch (err) {
      setError('Datei-Upload fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setIsUploading(false)
      setShowNotification(true)
    }
  }

  const toggleStationSelection = (stationId: number) => {
    setSelectedStations(prev => {
      if (prev.includes(stationId)) {
        return prev.filter(id => id !== stationId)
      }
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
            <div className="flex items-center gap-2">
              <ComparisonGraph data={exampleData} />
              {showNotification && (error || success) && (
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded ${
                    error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {error ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm">{error || success}</span>
                </div>
              )}
              <input
                ref={monthlyInputRef}
                type="file"
                accept=".xlsx,.xls,.ods"
                className="hidden"
                id="monthly-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'monthly')
                }}
              />
              <button
                onClick={() => monthlyInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center px-2 py-1 rounded bg-primary/30 text-primary/50 hover:bg-primary/40"
              >
                <Upload className="w-4 h-4 mr-2" />
                Monatliche Daten hochladen
              </button>
              <input
                ref={dailyInputRef}
                type="file"
                accept=".xlsx,.xls,.ods"
                className="hidden"
                id="daily-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'daily')
                }}
              />
              <button
                onClick={() => dailyInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center px-2 py-1 rounded bg-primary/30 text-primary/50 hover:bg-primary/40"
              >
                <Upload className="w-4 h-4 mr-2" />
                Tägliche Daten hochladen
              </button>
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
