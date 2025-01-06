import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowRight, LucideArrowDown, LucideArrowUp, Search } from 'lucide-react'
import { Header } from '@/layout/Header'
import { Card } from '@/components/Card'
import { Page } from '@/layout/Page'
import { useStationsAPI } from '@/api/stations'
import { usePatientsAPI } from '@/api/patients'
import { LastClassifiedBadge } from '@/components/LastClassifiedBadge'
import { formatDateFrontendURL, parseDateString } from '@/util/date'

type SortingState = {
  nameAscending: boolean,
  hasClassificationAscending: boolean,
  last: 'name' | 'classification'
}

export const StationPatientList = () => {
  const router = useRouter()
  const id = router.query.id !== undefined ? parseInt(router.query.id as string) : undefined
  const [searchTerm, setSearchTerm] = useState('')
  const [sortingState, setSortingState] = useState<SortingState>({
    hasClassificationAscending: true,
    nameAscending: true,
    last: 'name',
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
      if (!!a.lastClassification && !!b.lastClassification) {
        classificationCompare = classificationCompare * (parseDateString(a.lastClassification).getTime() - parseDateString(b.lastClassification).getTime())
      } else if (b.lastClassification) {
        classificationCompare *= -1
      }

      if (sortingState.last === 'name') {
        if (nameCompare !== 0) {
          return nameCompare
        }
        return classificationCompare
      }
      if (sortingState.last === 'classification') {
        if (classificationCompare !== 0) {
          return classificationCompare
        }
        return nameCompare
      }
      return 1
    })
  }, [patients, searchTerm, sortingState])

  return (
    <Page
      header={(
        <Header start={(
          <div className="flex flex-col gap-y-4">
          <div className="flex flex-row gap-x-2 items-center cursor-pointer" onClick={() => router.push('/')}>
              <div className="rounded-full min-w-[25px] min-h-[25px] bg-primary" />
              <span className="text-[15px] font-medium cursor-pointer hover:text-purple-600 hover:underline">Go back to homepage</span>
            </div>
            <div className="flex flex-row gap-x-4 items-center">
              <ArrowLeft size={32} onClick={() => router.push('/stations')} className="cursor-pointer" />
              <h2 className="text-2xl bold">{currentStation?.name}</h2>
            </div>
          </div>
        )}/>
      )}
    >
      <div className="flex flex-col gap-10 p-10 content-start max-w-[1200px] w-full">
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
                  last: 'name'
                })}>
                  <div className="flex flex-row gap-x-1 items-center">
                    <span className="text-lg">Name</span>
                    {sortingState.nameAscending ? <LucideArrowDown size={18}/> :
                      <LucideArrowUp size={18}/>}
                  </div>
                </button>
              </th>
              <th className="text-center">
                <button onClick={() => setSortingState({
                  ...sortingState,
                  hasClassificationAscending: !sortingState.hasClassificationAscending,
                  last: 'classification'
                })}>
                  <div className="flex flex-row gap-x-1 items-center">
                    <span className="text-lg">Letzter Eintrag</span>
                    {sortingState.hasClassificationAscending ? <LucideArrowDown size={18}/> :
                      <LucideArrowUp size={18}/>}
                  </div>
                </button>
              </th>
              <th/>
            </tr>
            </thead>
            <tbody>
            {sortedAndFilteredPatients.map(patient => (
              <tr
                key={patient.id}
                onClick={() => router.push(`/stations/${id}/${patient.id}/${formatDateFrontendURL()}`)}
                className="cursor-pointer hover:bg-gray-200 rounded-xl"
              >
                <td className="rounded-l-xl pl-2">{patient.name}</td>
                <td className="flex flex-col items-center py-1">
                  <LastClassifiedBadge dateString={patient.lastClassification}/>
                </td>
                <td className="rounded-r-xl">
                  <button
                    className="flex flex-row gap-x-2 rounded px-2 py-1 items-center float-end">
                    <span>Auswählen</span>
                    <ArrowRight size={20}/>
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Page>
  )
}

export default StationPatientList
