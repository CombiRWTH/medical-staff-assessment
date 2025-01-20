import { useRouter } from 'next/router'
import { useCallback, useState, useMemo, useEffect } from 'react'
import { ArrowRight, LucideArrowDown, LucideArrowUp, Search, X } from 'lucide-react'
import { DefaultHeader, Header } from '@/layout/Header'
import { Card } from '@/components/Card'
import { Page } from '@/layout/Page'
import { useStationsAPI } from '@/api/stations'
import { usePatientsAPI } from '@/api/patients'
import { usePatientClassification } from '@/api/classification'
import { useClassificationAPI } from '@/api/directClassification'
import { LastClassifiedBadge } from '@/components/LastClassifiedBadge'
import { formatDateFrontendURL, formatDateBackend } from '@/util/date'
import type { SelectItem } from '@/components/Select'
import { Select } from '@/components/Select'
import type { Patient } from '@/data-models/patient'

type SortingOptions = 'name' | 'classification' | 'location'

type SortingState = {
  nameAscending: boolean,
  hasClassificationAscending: boolean,
  hasLocationAscending: boolean,
  last: SortingOptions[]
}

const classificationOptions: SelectItem<number>[] = [
  {
    value: 1,
    label: '1'
  },
  {
    value: 2,
    label: '2'
  },
  {
    value: 3,
    label: '3'
  },
  {
    value: 4,
    label: '4'
  },
]

const bedRoom = (patient: Patient) => {
  if (!patient.currentRoom || !patient.currentBed) {
    return '-'
  }
  return `${patient.currentRoom}-${patient.currentBed}`
}

type PatientRowProps = {
  patient: Patient,
  stationId?: number,
  onSelect: () => void
}

const PatientRow = ({
  patient,
  stationId,
  onSelect
}: PatientRowProps) => {
  const today = new Date()
  const { classification, reload } = usePatientClassification(
    stationId,
    patient.id,
    formatDateBackend(today)
  )
  const { addClassification } = useClassificationAPI()
  const [category1, setCategory1] = useState(classification?.result?.category1)
  const [category2, setCategory2] = useState(classification?.result?.category2)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasValidValuesForClassification = category1 !== undefined && category2 !== undefined

  const handleClassificationUpdate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!stationId || isSubmitting || !hasValidValuesForClassification || category1 === undefined || category2 === undefined) return

    setIsSubmitting(true)
    await addClassification(
      stationId,
      patient.id,
      formatDateBackend(today),
      category1,
      category2
    ).then(
      reload
    )
    setIsSubmitting(false)
  }

  useEffect(() => {
    setCategory1(classification?.result?.category1)
    setCategory2(classification?.result?.category2)
  }, [classification?.result?.category1, classification?.result?.category2])

  return (
    <tr
      onClick={onSelect}
      className="cursor-pointer hover:bg-gray-200 rounded-xl"
    >
      <td className="rounded-l-xl pl-2 font-semibold">{patient.name}</td>
      <td className="py-1">{bedRoom(patient)}</td>
      <td className="py-1">
        <LastClassifiedBadge date={patient.lastClassification}/>
      </td>
      <td className="text-center">
        <strong className="bg-white rounded-full px-2 py-1">
          A{classification?.result?.category1 ?? '-'}/S{classification?.result?.category2 ?? '-'}
        </strong>
      </td>
      <td className="py-1 px-2 min-w-[250px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            selected={category1}
            onChange={setCategory1}
            items={classificationOptions.map(value => ({
              ...value,
              label: `A${value.label}`
            }))}
            isDisabled={isSubmitting}
            noneLabel="A-"
            buttonClassName="!min-w-[85px]"
          />
          <Select
            selected={category2}
            onChange={setCategory2}
            items={classificationOptions.map(value => ({
              ...value,
              label: `S${value.label}`
            }))}
            isDisabled={isSubmitting}
            noneLabel="S-"
            buttonClassName="!min-w-[85px]"
          />
          <button
            onClick={handleClassificationUpdate}
            disabled={isSubmitting}
            className={`${hasValidValuesForClassification ? 'button-full-primary' : 'button-full-disabled'}`}
          >
            {isSubmitting ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </td>

      <td className="rounded-r-xl">
        <button
          className="flex flex-row gap-x-2 rounded px-2 py-1 items-center float-end"
        >
          <span>Auswählen</span>
          <ArrowRight size={16}/>
        </button>
      </td>
    </tr>
  )
}

export const StationPatientList = () => {
  const router = useRouter()
  const id = router.query.id !== undefined ? parseInt(router.query.id as string) : undefined
  const [hasDismissedMissingEntries, setHasDismissedMissingEntries] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortingState, setSortingState] = useState<SortingState>({
    hasClassificationAscending: true,
    nameAscending: true,
    hasLocationAscending: true,
    last: ['classification', 'name', 'location'],
  })
  const { stations } = useStationsAPI()
  const currentStation = stations.find(value => value.id === id)
  const { patients } = usePatientsAPI(currentStation?.id)

  const sortedAndFilteredPatients = useMemo(() => {
    // First filter by search term
    const filteredPatients = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort the filtered patients
    return filteredPatients.sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name) * (sortingState.nameAscending ? 1 : -1)
      let classificationCompare = sortingState.hasClassificationAscending ? 1 : -1
      const locationCompare = bedRoom(a).localeCompare(bedRoom(b)) * (sortingState.hasLocationAscending ? 1 : -1)
      if (!!a.lastClassification && !!b.lastClassification) {
        classificationCompare = classificationCompare * (a.lastClassification.getTime() - b.lastClassification.getTime())
      } else if (b.lastClassification) {
        classificationCompare *= -1
      }

      for (const sortingType of sortingState.last) {
        if (sortingType === 'name') {
          if (nameCompare !== 0) {
            return nameCompare
          }
        }
        if (sortingType === 'classification') {
          if (classificationCompare !== 0) {
            return classificationCompare
          }
        }
        if (sortingType === 'location') {
          if (locationCompare !== 0) {
            return locationCompare
          }
        }
      }
      return 1
    })
  }, [patients, searchTerm, sortingState])

  const handleSelectPatient = useCallback((patientId: number) => {
    router.push(`/stations/${id}/${patientId}/${formatDateFrontendURL()}`)
  }, [router, id])

  const missingEntriesCount = patients.filter(patient => !patient.lastClassification).length
  const missingEntriesWeek = patients.reduce((cur, patient) => (patient.missingClassificationsLastWeek ?? []).length + cur, 0)
  const shouldShowMissingEntries = (missingEntriesCount > 0 || missingEntriesWeek > 0) && !hasDismissedMissingEntries

  return (
    <Page
      header={(
        <Header start={(<></>)}>
          <div className="grid grid-cols-3 w-full">
            <DefaultHeader/>
            <div className="flex flex-row justify-center items-center">
              <h2 className="text-4xl bold">{currentStation?.name}</h2>
            </div>
            <div/>
          </div>
        </Header>
      )}
    >
      <div className="flex flex-col gap-10 p-10 content-start max-w-[1200px] w-full">
        {shouldShowMissingEntries && (
          <Card className="bg-warning/70">
            <div className="flex flex-row gap-x-2 justify-between">
              <h3 className="font-bold text-lg">Fehlende Einträge</h3>
              <div onClick={() => setHasDismissedMissingEntries(true)}
                   className="bg-white hover:bg-gray-100 p-1 rounded-md">
                <X size={20}/>
              </div>
            </div>
            {missingEntriesCount > 0 && (
              <div className="flex flex-row gap-x-2">
                Heute:
                <span className="font-bold">{missingEntriesCount}</span>
              </div>
            )}
            {missingEntriesWeek > 0 && (
              <div className="flex flex-row gap-x-2">
                In den letzten 7 Tagen:
                <span className="font-bold">{missingEntriesWeek}</span>
              </div>
            )}
            { /* TODO add indication for missing entries today */}
          </Card>
        )}

        <Card>
          <h3 className="pl-2 pb-3 text-2xl font-bold">Patientenliste</h3>
          <div className="px-2 pb-4">
            <div className="relative flex items-center">
              <Search size={20} className="absolute left-3 text-gray-400 pointer-events-none"/>
              <input
                type="text"
                placeholder="Suche nach Patienten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {searchTerm && (
              <div className="text-sm text-gray-600 mt-1 pl-2">
                {sortedAndFilteredPatients.length} Ergebnis{sortedAndFilteredPatients.length !== 1 ? 'se' : ''}
              </div>
            )}
          </div>

          <table className="w-full table-auto border-collapse">
            <thead>
            <tr className="text-left">
              <th className="pl-2">
                <button onClick={() => setSortingState({
                  ...sortingState,
                  nameAscending: !sortingState.nameAscending,
                  last: ['name', ...sortingState.last.filter(value => value !== 'name')]
                })}>
                  <div className="flex flex-row gap-x-1 items-center">
                    <span className="text-lg">Name</span>
                    {sortingState.nameAscending ? <LucideArrowDown size={18}/> : <LucideArrowUp size={18}/>}
                  </div>
                </button>
              </th>
              <th>
                <button onClick={() => setSortingState({
                  ...sortingState,
                  hasLocationAscending: !sortingState.hasLocationAscending,
                  last: ['location', ...sortingState.last.filter(value => value !== 'location')]
                })}>
                  <div className="flex flex-row gap-x-1 items-center">
                    <span className="text-lg">Raum & Bett</span>
                    {sortingState.hasLocationAscending ? <LucideArrowDown size={18}/> : <LucideArrowUp size={18}/>}
                  </div>
                </button>
              </th>
              <th>
                <button onClick={() => setSortingState({
                  ...sortingState,
                  hasClassificationAscending: !sortingState.hasClassificationAscending,
                  last: ['classification', ...sortingState.last.filter(value => value !== 'classification')]
                })}>
                  <div className="flex flex-row gap-x-1 items-center">
                    <span className="text-lg">Letzter Eintrag</span>
                    {sortingState.hasClassificationAscending ? <LucideArrowDown size={18}/> :
                      <LucideArrowUp size={18}/>}
                  </div>
                </button>
              </th>
              <th className="text-center">
                <span className="text-lg">Kategorien</span>
              </th>
              <th className="text-center">
                <span className="text-lg">Klassifikation setzen</span>
              </th>
              <th/>
            </tr>
            </thead>
            <tbody>
            {sortedAndFilteredPatients.map(patient => (
              <PatientRow
                key={patient.id}
                patient={patient}
                stationId={id}
                onSelect={() => handleSelectPatient(patient.id)}
              />
            ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Page>
  )
}

export default StationPatientList
