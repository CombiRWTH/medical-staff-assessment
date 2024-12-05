import { useRouter } from 'next/router'
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { addDays, subDays } from 'date-fns'
import Link from 'next/link'
import { Header } from '@/layout/Header'
import { Page } from '@/layout/Page'
import { useStationsAPI } from '@/api/stations'
import { usePatientsAPI } from '@/api/patients'
import { formatDate } from '@/util/formatDate'
import { parseDateString } from '@/util/parseDateString'
import { noop } from '@/util/noop'
import { ClassificationCard } from '@/components/ClassificationCard'
import { usePatientClassification } from '@/api/classification'
import { Tooltip } from '@/components/Tooltip'

export const PatientClassification = () => {
  const router = useRouter()
  const id = router.query.id !== undefined ? parseInt(router.query.id as string) : undefined
  const patientId = router.query.patientId !== undefined ? parseInt(router.query.patientId as string) : undefined
  const dateString: string = (router.query.date as string | undefined) ?? ''
  const date = parseDateString(dateString)

  const { stations } = useStationsAPI()
  const currentStation = stations.find(value => value.id === id)
  const { patients } = usePatientsAPI(currentStation?.id)
  const currentPatient = patients.find(value => value.id === patientId)
  const {
    classification,
    update
  } = usePatientClassification(id, patientId, formatDate(date))

  const nextUnclassifiedPatient = useMemo(() => {
    // Start searching from the current patient's index
    const currentIndex = patients.findIndex(p => p.id === currentPatient?.id)
    const patientsLength = patients.length

    for (let i = 1; i < patientsLength; i++) {
      const nextIndex = (currentIndex + i) % patientsLength
      const nextPatient = patients[nextIndex]

      if (nextPatient.lastClassification) {
        return nextPatient
      }
    }

    // If all patients are classified, return undefined
    return undefined
  }, [patients, currentPatient])

  const allPatientsClassified = useMemo(() =>
    patients.every(patient => !!patient.lastClassification),
  [patients]
  )

  useEffect(noop, [router.query.date]) // reload once the date can be parsed

  return (
    <Page
      header={(
        <Header
          start={(
            <div className="flex flex-row items-center gap-x-4 flex-shrink-0">
              <button onClick={() => router.push(`/stations/${id}`)}><ArrowLeft/></button>
              <h2 className="text-2xl whitespace-nowrap overflow-hidden text-ellipsis">
                {currentPatient?.name}, {formatDate(date)}
              </h2>
            </div>
          )}
          end={(
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex flex-row gap-x-4 items-center mx-auto">
                <label className="flex flex-row gap-x-1 items-center">
                  <input type="checkbox" checked={false /* TODO get from classification */} readOnly={true}/>
                  <span>Tag der Aufnahme</span>
                </label>
                <label className="flex flex-row gap-x-1 items-center">
                  <input type="checkbox" checked={false /* TODO get from classification */} readOnly={true}/>
                  <span>Tag der Entlassung</span>
                </label>
                <label className="flex flex-row gap-x-1 items-center">
                  <input type="checkbox" checked={classification?.is_in_isolation} readOnly={true}/>
                  <span>In Isolation</span>
                </label>
              </div>
              <div className="flex flex-row gap-x-4 items-center flex-shrink-0">
                <Link className="text-primary hover:text-primary/90"
                      href={`/stations/${id}/${patientId}/${formatDate()}`}>Heute</Link>
                <div className="flex flex-col gap-y-1">
                  <a href={`/stations/${id}/${patientId}/${formatDate(addDays(date, 1))}`}
                     className="arrow">
                    <Tooltip tooltip="Morgen" position="left">
                      <ChevronUp/>
                    </Tooltip>
                  </a>
                  <a href={`/stations/${id}/${patientId}/${formatDate(subDays(date, 1))}`}
                     className="arrow">
                    <Tooltip tooltip="Gestern" position="left">
                      <ChevronDown/>
                    </Tooltip>
                  </a>
                </div>
                {nextUnclassifiedPatient ? (
                  <a href={`/stations/${id}/${nextUnclassifiedPatient.id}/${formatDate(date)}`}>
                    <button className="flex flex-row gap-x-2 items-center">
                      Nächsten <ArrowRight size={20}/>
                    </button>
                  </a>
                ) : (
                  <Tooltip
                    position="left"
                    tooltip={
                      allPatientsClassified
                        ? 'Alle Patienten sind klassifiziert'
                        : 'Kein unklassifizierter Patient gefunden'
                    }
                  >
                    <button
                      disabled={true}
                      className="flex flex-row gap-x-2 items-center opacity-50 cursor-not-allowed text-primary hover:text-primary/90"
                    >
                      Nächsten <ArrowRight size={20}/>
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
        />
      )}
    >
      <div className="flex flex-col p-8 gap-y-6 w-full">
        <div className="bg-primary/30 rounded-2xl px-4 py-2 flex flex-row items-center justify-between w-full">
          <h2 className="font-bold text-xl">Ergebnis:</h2>
          <div className="flex flex-row gap-x-6 items-center">
            <div className="flex flex-row items-center gap-x-2">
              Kategorie:
              <strong className="bg-white rounded-full px-2 py-1">
                { /* TODO fix hardcoding of A and S  */}
                A{classification?.result?.category1 ?? '-'}/S{classification?.result?.category2 ?? ''}
              </strong>
            </div>
            <div className="flex flex-row items-center gap-x-2">
              Minutenzahl:
              <strong className="bg-white rounded-full px-2 py-1">
                {classification?.result?.minutes ?? 0}min
              </strong>
            </div>
          </div>
        </div>

        {classification.careServices.map((list, index) => (
          <ClassificationCard key={index} classification={list} onUpdate={update}/>
        ))}
      </div>
    </Page>
  )
}

export default PatientClassification
