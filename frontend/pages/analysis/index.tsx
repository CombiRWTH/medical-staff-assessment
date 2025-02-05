import type { NextPage } from 'next'
import React, { useRef, useState, useEffect } from 'react'
import { Upload, CheckCircle, XCircle, Download } from 'lucide-react'
import { Page } from '@/layout/Page'
import { Header } from '@/layout/Header'
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
import { ComparisonGraph } from '@/components/GraphPopup'
import { Menu } from '@/components/Menu'
import { Select } from '@/components/Select'
import { Tooltip } from '@/components/Tooltip'

/*
*  Page for the analysis of data
*/
export const AnalysisPage: NextPage = () => {
  // Show daily or monthly data for the stations
  const [viewMode, setViewMode] = useState<AnalysisFrequency>('daily')
  const { stations } = useStationsAPI()
  const { data } = useAnalysisAPI(viewMode)
  const {
    data: graphData,
    date,
    setDate
  } = useGraphAPI()
  const [selectedStations, setSelectedStations] = useState<number[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showNotification, setShowNotification] = useState(false)
  const monthlyInputRef = useRef<HTMLInputElement>(null)
  const dailyInputRef = useRef<HTMLInputElement>(null)

  // Special constant for the data of all stations combined
  const COMBINED_STATIONS_KEY = -1

  const canExport = selectedStations.length > 0

  // Hide notification for import/export after 10 seconds
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

  // Upload excel file to the backend
  // that is used to make the further analysis for the shifts
  const handleFileUpload = async (file: File, type: 'caregiver' | 'patient') => {
    const validExcelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet'
    ]

    if (!validExcelTypes.includes(file.type)) {
      setError('Bitte nur Excel-Dateien hochladen (.xls oder .xlsx)')
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
      const response = await fetch(`${apiURL}/import/${type}/`, {
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

      setSuccess(`${type === 'caregiver' ? 'Schichtplan' : 'Patientendaten'} erfolgreich hochgeladen`)

      if (type === 'caregiver' && monthlyInputRef.current) {
        monthlyInputRef.current.value = ''
      } else if (type === 'patient' && dailyInputRef.current) {
        dailyInputRef.current.value = ''
      }
    } catch (err) {
      setError('Datei-Upload fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setIsUploading(false)
      setShowNotification(true)
    }
  }

  // Toggle the selection of a station for export
  // by adding or removing it from the selected stations
  const toggleStationSelection = (stationId: number) => {
    setSelectedStations(prev => {
      if (prev.includes(stationId)) {
        return prev.filter(id => id !== stationId)
      }
      return [...prev, stationId]
    })
  }

  // Use the hooks to export data for the station in an excel file
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
          className="!justify-start gap-x-8"
          end={(
            <div className="flex justify-end w-full items-center gap-x-6">
              <ComparisonGraph
                data={graphData}
                date={date}
                onDateChange={setDate}
                dates={[]}
              />
              {showNotification && (error || success) && (
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded ${
                    error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {error ? (
                    <XCircle className="w-4 h-4 text-red-500"/>
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500"/>
                  )}
                  <span className="text-sm">{error || success}</span>
                </div>
              )}
              <input
                ref={monthlyInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                id="monthly-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'caregiver')
                }}
              />
              <Menu
                display={({
                  isDisabled,
                  toggleOpen
                }) => (
                  <button
                    className={`flex flex-row gap-x-2 items-center ${isDisabled ? 'button-full-disabled' : 'button-full-primary'}`}
                    onClick={toggleOpen} disabled={isDisabled}>
                    <Download size={24}/>
                    Importieren
                  </button>
                )}
                isDisabled={isUploading}
                menuContainerClassName="!bg-gray-100"
              >
                {({ toggleOpen }) => (
                  <>
                    <button
                      onClick={() => {
                        toggleOpen()
                        monthlyInputRef.current?.click()
                      }}
                      disabled={isUploading}
                      className="button-padding bg-gray-200 card-hover whitespace-nowrap"
                    >
                      Schichtplan
                    </button>
                    <button
                      onClick={() => {
                        toggleOpen()
                        dailyInputRef.current?.click()
                      }}
                      disabled={isUploading}
                      className="button-padding bg-gray-200 card-hover whitespace-nowrap"
                    >
                      Patientendaten
                    </button>
                  </>
                )}
              </Menu>
              <input
                ref={dailyInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                id="daily-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'patient')
                }}
              />
              <Tooltip tooltip={!canExport ? 'Stationen müssen vor dem Export durch ausgewählt werden' : 'Ausgewählte Daten exportieren'} position="bottom" containerClassName="!w-auto">
                <button
                  onClick={exportData}
                  disabled={!canExport}
                  className={`flex flex-row gap-x-2 items-center ${!canExport ? 'button-full-disabled' : 'button-full-primary'}`}
                >
                  <Upload size={24}/>
                  Exportieren
                </button>
              </Tooltip>

              <Select<AnalysisFrequency>
                selected={viewMode}
                items={[{
                  value: 'daily',
                  label: 'Täglich',
                },
                {
                  value: 'monthly',
                  label: 'Monatlich',
                },
                {
                  value: 'quarterly',
                  label: 'Quartalsweise',
                },
                ]}
                onChange={value => setViewMode(value)}
              />
            </div>
          )}
        >
          <div className="bg-gray-200 w-1 h-10 rounded"/>
          <LinkTiles links={[{
            name: 'Stationen',
            url: '/stations'
          }, {
            name: 'Analyse',
            url: '/analysis'
          }]}/>
        </Header>
      )}
    >
      <div className="flex flex-col w-full p-10 gap-y-10 content-start">
        <Card
          key="combined-stations"
          className={`flex flex-col gap-y-2 cursor-pointer transition-colors w-full hover:bg-primary/40 max-w-[500px]
            ${selectedStations.includes(COMBINED_STATIONS_KEY)
            ? 'bg-primary/30'
            : 'bg-white'}`}
          onClick={() => toggleStationSelection(COMBINED_STATIONS_KEY)}
        >
          <div className="p-4 flex flex-col">
            <span className="text-2xl font-semibold">Alle Stationen</span>
            <div className="flex flex-row w-full justify-between gap-x-2 items-center mt-2">
              <span className="text-primary/90">Gesamtpatientenanzahl:</span>
              <span className="font-semibold text-primary">{combinedValues.patientCount}</span>
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
                className={`flex flex-col gap-y-2 cursor-pointer transition-colors hover:bg-primary/40
                  ${selectedStations.includes(value.id)
                  ? 'bg-primary/30'
                  : 'bg-white'}`}
                onClick={() => toggleStationSelection(value.id)}
              >
                <div className="p-4 flex flex-col h-full">
                  <span className="text-xl font-semibold mb-auto">{value.name}</span>
                  <div className="flex flex-row w-full justify-between items-center gap-x-4 mt-2">
                    <span className="text-sm text-gray-500">Minuten</span>
                    <span className="font-semibold text-primary">{minutes}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </Page>
  )
}

export default AnalysisPage
