import { useRouter } from 'next/router'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, LucideArrowDown, LucideArrowUp } from 'lucide-react'
import { Header } from '@/layout/Header'
import { Card } from '@/components/Card'
import { Page } from '@/layout/Page'
import { useStationsAPI } from '@/api/stations'
import { usePatientsAPI } from '@/api/patients'
import { formatDate } from '@/util/formatDate'

type SortingState = {
  nameAscending: boolean,
  hasClassificationAscending: boolean,
  last: 'name' | 'classification'
}

export const StationPatientList = () => {
  const router = useRouter()
  const id = router.query.id !== undefined ? parseInt(router.query.id as string) : undefined
  const [sortingState, setSortingState] = useState<SortingState>({
    hasClassificationAscending: true,
    nameAscending: true,
    last: 'name',
  })
  const { stations } = useStationsAPI()
  const currentStation = stations.find(value => value.id === id)
  const { patients } = usePatientsAPI(currentStation?.id)
  const sortedPatients = patients.sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name) * (sortingState.nameAscending ? 1 : -1)
    const aHasClassification = !!a.lastClassification
    const bHasClassification = !!b.lastClassification
    const classificationCompare = (aHasClassification ? 1 : (bHasClassification ? -1 : 1)) * (sortingState.hasClassificationAscending ? 1 : -1)

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
    return 1 // no sorting
  })

  return (
    <Page
      header={(
        <Header start={(
          <div className="flex flex-row gap-x-4 items-center">
            <ArrowLeft size={32} onClick={() => router.push('/stations')} className="cursor-pointer"/>
            <h2 className="text-2xl bold">{currentStation?.name}</h2>
          </div>
        )}/>
      )}
    >
      <div className="flex flex-col gap-10 p-10 content-start max-w-[1200px] w-full">
        <Card>
          <h3 className="pl-2 pb-3 text-2xl font-bold">Patientenliste</h3>
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
                    {sortingState.nameAscending ? <LucideArrowDown size={18}/> : <LucideArrowUp size={18}/>}
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
            {sortedPatients.map(patient => {
              const hasClassification = !!patient.lastClassification
              return (
                  <tr
                      key={patient.id}
                      onClick={() => router.push(`/stations/${id}/${patient.id}/${formatDate()}`)}
                      className="cursor-pointer hover:bg-gray-200 rounded-xl"
                  >
                    <td className="rounded-l-xl pl-2">{patient.name}</td>
                    <td className="flex flex-col items-center py-1">
                      <div
                          className={`rounded-xl w-32 text-center px-2 py-1 border-2 ${hasClassification ? 'border-green-500' : 'border-amber-400'}`}>
                        {hasClassification ? 'Heute' : 'Gestern'}
                      </div>
                    </td>
                    <td className="rounded-r-xl">
                      <button className="flex flex-row gap-x-2 rounded px-2 py-1 items-center float-end">
                        <span>Auswählen</span>
                        <ArrowRight size={20}/>
                      </button>
                    </td>
                  </tr>
              )
            })}
            </tbody>
          </table>
        </Card>
      </div>
    </Page>
  )
}

export default StationPatientList
